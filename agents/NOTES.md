# Architecture & Implementation Notes: MakeCode Simulator Extension

This document records critical architectural discoveries, findings, and decisions made during the design and development of the custom simulator extensions for micro:bit and Yahboom Module-World. Future agents modifying or extending this codebase must consult and update this document.

---

## 1. MakeCode / PXT Simulator Internals

### 1.1 How PXT Discovers and Instantiates Parts
* **Block Annotations**: PXT compiler scans TypeScript AST for comments containing `//% parts="<part_name>"` and `//% trackArgs=<arg_indices>`.
* **Part Manifest (`pxtparts.json`)**: When bundled in an extension package (`libs/<ext>/pxtparts.json`), PXT loads `PartDefinition` metadata into the simulator message: `msg.parts` (array of part IDs), `msg.partDefinitions` (dict of definitions), and `msg.fnArgs` (arguments extracted at callsites).
* **Simulator Lifecycle**: In `sim/dalboard.ts`, `DalBoard.initAsync(msg)` initializes `BoardHost`, which coordinates all parts and wires before appending the root SVG element to `document.body`.
* **Builtin Registries**:
  - `DalBoard.builtinParts["<name>"]`: Stores virtual hardware state instances (under `namespace pxsim`).
  - `DalBoard.builtinVisuals["<name>"]`: Factory function returning an `IBoardPart<T>` instance.
  - `DalBoard.builtinPartVisuals["<name>"]`: Optional SVG icon thumbnail for assembly tutorials.

### 1.2 Limitations of PXT's Default Breadboard Allocator
* The default `pxsim.allocateDefinitions` in `pxt-core` is hardcoded for placing components onto a standard 30-column breadboard (`BREADBOARD_MID_COLS = 30`).
* Parts are allocated horizontally in a single row (`placeParts` uses only breadboard rows 1–4). If multiple wide modules are connected, column space runs out (`"Not enough breadboard space!"`), leading to overlapping or clipping.
* Module-World / Yahboom breakout boards are standalone PCB modules with cables, **not** DIP breadboard components.
* Therefore, a dedicated **2D Flexible Grid Module Layout Manager** (`WomLayoutManager`) is required to place modules in multiple rows and columns below the micro:bit and route dynamic Bezier wires directly from the edge connector.

### 1.3 Pin Coordinates and Edge Connector
* In `sim/visuals/microbit.ts`, `MicrobitBoardSvg.getCoord(pinNm)` maps pin names (`"P0"`, `"P1"`, `"P2"`, `"3V"`, `"GND"`, etc.) to exact `[x, y]` SVG coordinates at the bottom edge of the board (`y ≈ 396.7`).
* Use `board().viewHost.boardView.getCoord(pinName)` or `MicrobitBoardSvg.getCoord(pinName)` to determine wire start coordinates.

---

## 2. Sensor & Actuator Interception Patterns

### 2.1 Hardware Code Execution vs. Simulator Shims
* When user code runs in the simulator VM, functions in `libs/Module-World/Module-World.ts` execute their TypeScript bodies.
* For **Actuators** (e.g. RGB, Buzzer, Vibration Motor):
  Functions already write via `pins.analogWritePin` or `pins.digitalWritePin`. These functions mutate `EdgeConnectorState` and trigger `runtime.queueDisplayUpdate()`. The module visual reads these pin states directly from `board().edgeConnectorState`.
* For **Sensors** (e.g. Ultrasonic, DHT11, Light):
  In hardware, Ultrasonic triggers a pulse and calls `pins.pulseIn(Echo, High, maxDuration)`. In `sim/state/misc.ts`, `pulseIn` returns a static default (5000). To support interactive sliders:
  - **Approach A (Pin/Pulse Interception)**: Enhance `pxsim.pins.pulseIn` to look up active sensor state on that pin and return `distance * 58` microseconds.
  - **Approach B (Simulator Shims)**: Add `//% shim=wom::getUltrasonic` to the block. If defined in `sim/`, the simulator runs the C++/JS shim directly; on physical hardware, MakeCode compiles the TypeScript body.
  - **Decision**: Use **Approach B (Shim with TS Fallback)** as primary for complex protocols (Ultrasonic, DHT11) to eliminate timing glitches in the JS event loop, while supporting pin-level synchronization for simple analog/digital pins.

---

## 3. UI and Interactive Controls in Simulator SVG
* The MakeCode simulator host is an SVG canvas.
* To render interactive controls (sliders, switches, text inputs) on top of module images:
  - **Option 1 (SVG `<foreignObject>`)**: Allows embedding HTML `<input type="range">`, styled buttons, and HTML5 canvas directly inside SVG. Fully supported across modern browsers.
  - **Option 2 (Pure SVG Drag Handlers)**: Use `pxsim.svg.buttonEvents` to build custom draggable knobs/thumbs.
  - **Decision**: Standardize on SVG `<foreignObject>` containing semantic HTML5 controls (`<input type="range">`, `<button>`) styled cleanly. It gives native mobile/desktop touch responsiveness, keyboard accessibility, and rapid implementation.

---

## 4. Yahboom Port & Cable Conventions (`mwDigitalNum`)
Each Yahboom digital port bundles:
1. Signal Pin 1 (e.g. P0, P2, P3...)
2. Signal Pin 2 (e.g. P1, P3, P4...)
3. VCC (3.3V)
4. GND

When wiring in the simulator, standard cable colors are:
- `VCC`: Red (`#e74c3c`)
- `GND`: Black / Dark Gray (`#2c3e50`)
- `Signal 1`: Yellow (`#f1c40f`) or Orange (`#e67e22`)
- `Signal 2`: Green (`#2ecc71`) or Blue (`#3498db`)


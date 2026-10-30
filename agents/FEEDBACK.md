# Documentation Feedback & Audit Log

This file records untruthful, misleading, or broken guidance discovered in `AGENTS.md`, `agents/ARCH.md`, and `agents/NOTES.md` during architectural verification against the actual PXT compiler (`node_modules/pxt-core/built/pxt.js`) and simulator runtime (`node_modules/pxt-core/built/pxtsim.js`).

---

## 1. Critical Flaw in Original `ARCH.md` (Step 4) & `NOTES.md` (Section 2.1): `//% shim=...` on Functions with a TypeScript Body

- **Original Claim**:
  > *"Add `//% shim=ModuleWorld_Digital::Ultrasonic` to `export function Ultrasonic(value_DNum: mwDigitalNum): number { ... }`. Hardware implementation runs on micro:bit; simulator executes the shim."*
- **Why This Is False & Breaks Compilation**:
  1. **Ignored in Simulator (`isNative = false`)**: In `node_modules/pxt-core/built/pxt.js` (`hasShimDummy`, line 136745), when compiling for the simulator (`!opts.target.isNative`), `hasShimDummy(decl)` returns `true` for any function that has a non-empty TypeScript body (`f.body && f.body.statements.length > 0`). At the callsite emitter (line 136044: `if (attrs.shim && !hasShimDummy(decl)) return emitShim(...); return emitPlain();`), the compiler **ignores `//% shim=...`** and executes the TypeScript body instead.
  2. **Fatal Build Error on Hardware (`isNative = true`)**: When compiling a `.hex` binary for micro:bit hardware, `pxtc.hexfile.validateShim` (line 140680) validates every `//% shim=...` against the precompiled C++ DAL image. Because `ModuleWorld_Digital::Ultrasonic` does not exist in C++, `pxt build` fails with `function not found: ... (shim=ModuleWorld_Digital::Ultrasonic)`.
- **Resolution**:
  - Updated `ARCH.md` and `NOTES.md` to forbid adding fake `//% shim=...` annotations to pure TypeScript functions.
  - Replaced with two verified approaches:
    1. **Simulator-Only Helper Shim** (a bodyless TS function `function _simNotify(msg: string): void` with `//% shim=pxsim.wom.notify` or calling the built-in `control.dmesg(...)` C++ no-op shim) combined with `pxsim.pins` state hooks (`pulseIn`, `digitalReadPin`, `analogReadPin`, `servoSetPulse`, `i2cWriteBuffer`), OR
    2. **Intercepting at the `pxsim.pins.*` layer** alongside `control.dmesg("wom:...")` (which compiles cleanly on both micro:bit V1/V2 hardware as a C++ no-op and triggers `pxsim.control.dmesg` in the simulator).

---

## 2. Critical Flaw in Original `ARCH.md` (Step 5) & `AGENTS.md` (Section 3): `pxtparts.json` + `//% parts="..."` Static Breadboard Allocator

- **Original Claim**:
  > *"Create `libs/Module-World/pxtparts.json` with `numberOfColumns: 4`, `pinInstantiationIdx: 1`, `pinDefinitions: [{ targetPin: 'VCC' ...}]` and annotate blocks with `//% parts="wom_ultrasonic" trackArgs=0`."*
- **Why This Is False & Fails at Runtime**:
  1. **Triggers Built-in 1D Breadboard**: When a part is defined in `pxtparts.json` and referenced via `//% parts="..."`, `pxsim.BoardHost` (`node_modules/pxt-core/built/pxtsim.js`, lines 776–805) automatically activates `this.breadboard` (a fixed 30-column 1D solderless breadboard) and runs `pxsim.Allocator.allocateDefinitions`.
  2. **`readPin` Fails on Composite Port Enums**: `pxsim.readPin("ModuleWorld_Digital.mwDigitalNum.P0P1")` extracts `"P0P1"`, which is not a valid micro:bit pin name on `MicrobitBoardSvg`. `allocWire` returns `undefined` and drops the part/wires.
  3. **`pinInstantiationIdx: 1` Throws a Compiler Error**: `Ultrasonic(value_DNum)` only has 1 argument (index `0`). Setting `pinInstantiationIdx: 1` causes `pxt.js` (`line 125537`) to fail with `error: parts no pin found for PinInstantiationIdx: 1`.
  4. **Cannot Deduplicate or Detect Conflicts Across Different Blocks**: Static `trackArgs` only tracks calls per part name and cannot deduplicate or warn when two different blocks (e.g. `dht11value(TempC, P0P1)` vs `dht11value(Humidity, P0P1)`, or `Ultrasonic(P0P1)` vs `PIR(P0P1)`) share or conflict on pins.
- **Resolution**:
  - Updated `ARCH.md` and `NOTES.md` to instruct agents **not** to use `pxtparts.json` or `//% parts="..."` for World of Modules / TM1650 extensions. Instead, all module spawning, strict pin-set deduplication, cross-module pin conflict warnings, 2D grid layout, and Bezier wiring are handled dynamically at runtime by `WomModuleManager`.

---

## 3. Wrong 3.3V Pin Name in Original `ARCH.md` (`"3V"` vs `"+3v3"`)

- **Original Claim**:
  > Original `ARCH.md` (lines 57, 184) called `boardSvg.getCoord("3V")` to wire the module's VCC pad.
- **Why This Is False**:
  - In [sim/visuals/microbit.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/microbit.ts#L216), `pinNames` registers `"+3v3"`, `"GND"`, `"GND0"`, `"GND1"`, and `"P0"`..`"P20"`. `getCoord("3V")` returns `undefined`, causing power wires not to render.
- **Resolution**:
  - Updated `ARCH.md` and `NOTES.md` to use `"+3v3"` (and normalized `"3V"` / `"VCC"` → `"+3v3"` inside `WireRouter`).

---

## 4. Missing 2D Grid Bin-Packing & Outdated Visual Specifications in Original `ARCH.md`

- **Original Claim**:
  > Original `ARCH.md` assumed all modules were uniform `120x120` hand-drawn SVG rects in a 1D wrap grid (`col = index % 3`, `row = Math.floor(index / 3)`) and predated `sim/public/sprites/README.md`.
- **Why This Was Incomplete**:
  - Modules in `sim/public/sprites/` have three distinct aspect ratios:
    - Square `1x1` (`colSpan: 1, rowSpan: 1`): Button, Buzzer, Color Recognition, DHT11, IR, Joystick, Photoresistor, PIR, Potentiometer, RGB.
    - Horizontal `2x1` (`colSpan: 2, rowSpan: 1`, ~2x wider than tall): Ultrasonic (`297x203`), TM1650 (`1255x848`).
    - Vertical `1x2` (`colSpan: 1, rowSpan: 2`, ~2x taller than wide): Positional Servo (`445x758`), Continuous Servo (`386x625`).
  - Simple `index % 3` indexing causes `2x1` and `1x2` modules to overlap neighboring cells.
- **Resolution**:
  - Replaced with a 2D occupancy grid bin-packer (`occupied[row][col]`) in `ARCH.md` that places `1x1`, `2x1`, and `1x2` modules without overlap and references [sim/public/sprites/README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/public/sprites/README.md) for exact sprite assets, pad locations, rotor pivots, and overlay patterns.

---

## 5. Undocumented Infinite Loop & Unimplemented Simulator Stubs (`dht11value`, `servoSetPulse`, `i2cWriteBuffer`)

- **Findings**:
  1. `ModuleWorld_Digital.dht11value` in [libs/Module-World/Module-World.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/Module-World/Module-World.ts#L106-L152) uses tight `while (pins.digitalReadPin(dht11pin) == 1);` and `while (pins.digitalReadPin(dht11pin) == 0);` bit-banging loops. In the simulator, if `digitalReadPin` returns a static `0` or `1`, the browser tab hangs in an infinite loop.
  2. `pxsim.pins.servoSetPulse` in [sim/state/edgeconnector.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/edgeconnector.ts#L93-L95) is a `// TODO` no-op, even though `ModuleWorld_PWM.Servo` and `Servo2` rely exclusively on `pins.servoSetPulse(pin, v_us)`.
  3. `pxsim.pins.i2cWriteBuffer` in [sim/state/misc.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/misc.ts#L109-L111) is a no-op, which is required by `libs/tm1650/tm1650.ts`.
- **Resolution**:
  - Explicitly documented all three in `ARCH.md` and `NOTES.md` with exact code solutions.


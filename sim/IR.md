# Active Infrared (IR) Obstacle Sensor Simulator Integration

This document describes how the **Module-World IR Obstacle Sensor** (`ModuleWorld_Digital.IR`) is integrated into the MakeCode micro:bit simulator.

---

## 1. Overview & Files Involved

| Layer | File | Role |
| :--- | :--- | :--- |
| **Extension Block** | [libs/Module-World/Module-World.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/Module-World/Module-World.ts#L210-L230) | Defines `ModuleWorld_Digital.IR(value_DNum: mwDigitalNum, value: enObstacle): boolean` and emits `control.dmesg("wom:ir:" + value_DNum)`. |
| **Shared Manager & Base Class** | [sim/visuals/womManager.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/womManager.ts) | Provides `WomModuleBase` and `WomModuleManager`. Installs runtime hooks (`dmesg`, `digitalReadPin`, `analogReadPin`, `pulseIn`, `servoSetPulse`, `i2cWriteBuffer`/`i2cReadBuffer`), enforces strict pin-set deduplication and cross-module conflict warnings, allocates `1x1` / `2x1` / `1x2` slots in the 2D grid below the micro:bit, and draws signal-only Bezier wires with a unique color per micro:bit pin (`PIN_WIRE_COLORS`). |
| **IR Module Visual** | [sim/visuals/womIr.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/womIr.ts) | Subclasses `WomModuleBase` (`1x1` square footprint) using `/sim/sprites/wom_ir.png`, binds hover events (`bindHover`), toggles the semi-transparent red circle overlay (`addCircleOverlay`), and updates the signal pin via `setDigitalInput`. |
| **Board Integration** | [sim/dalboard.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/dalboard.ts#L184) | Single-line call `visuals.WomModuleManager.initBoard(this);` in `DalBoard.initAsync`. |

---

## 2. How It Works

### 2.1 Block Execution & Hardware-Safe Signalling
When a user's MakeCode program calls `ModuleWorld_Digital.IR(value_DNum, value)`:
1. `control.dmesg("wom:ir:" + value_DNum)` is called at the start of `IR(...)`.
   - On physical micro:bit hardware, `control.dmesg` is a built-in C++ no-op, preserving hardware compatibility.
   - In the simulator, `WomModuleManager` intercepts `control.dmesg("wom:ir:<port>")` and maps `value_DNum` (`1..10`) to its 2-pin port pair (`P0P1` → `["P0", "P1"]`, `P2P3` → `["P2", "P3"]`, ..., `P1P10` → `["P1", "P10"]`).
2. `WomModuleManager.ensureModule("ir", pins)` checks the strict pin-set registry:
   - If an `"ir"` module is already spawned on those pins, it reuses the existing instance.
   - If any of those pins is already claimed by another module (or overlapping port), it blocks spawning and shows a `⚠️ Pin conflict` warning banner in the simulator.
   - Otherwise, it spawns a new `WomIrModule` (`1x1` square cell) below the micro:bit and draws a Bezier wire from the module's top signal pad to the primary port pin (`P0`, `P2`, etc.) using that pin's unique color from `PIN_WIRE_COLORS` (no `GND` or `3v3` wires are drawn).

### 2.2 Mouse Hover Interaction & Active-Low Polarity
In `Module-World.ts`, the `enObstacle` enum defines active-low logic matching the physical IR sensor hardware:
- `enObstacle.Obstacle = 0` (obstacle detected)
- `enObstacle.NoObstacle = 1` (no obstacle detected)

`WomIrModule` uses `this.bindHover(...)` and `this.setDigitalInput(this.pins[0], ...)`:
- **Mouse Hovering Over Module (`True` — Obstacle Detected)**:
  - `obstacleDetected` becomes `true`.
  - A semi-transparent red circle (`fill="#ef4444"`, `fill-opacity="0.4"`) is displayed over the sensor center, and the bottom badge updates to `IR (<port>): True`.
  - `setDigitalInput(this.pins[0], 0)` sets `pin.womDigitalValue = 0` (`enObstacle.Obstacle`), so `ModuleWorld_Digital.IR(port, enObstacle.Obstacle)` evaluates `0 == 0` → `true` (and `IR(port, enObstacle.NoObstacle)` evaluates to `false`).
- **Mouse Not Hovering / Moves Away (`False` — No Obstacle Detected)**:
  - `obstacleDetected` becomes `false`.
  - The semi-transparent red circle is hidden (`opacity="0"`), and the bottom badge updates to `IR (<port>): False`.
  - `setDigitalInput(this.pins[0], 1)` sets `pin.womDigitalValue = 1` (`enObstacle.NoObstacle`), so `ModuleWorld_Digital.IR(port, enObstacle.Obstacle)` evaluates `1 == 0` → `false` (and `IR(port, enObstacle.NoObstacle)` evaluates to `true`).

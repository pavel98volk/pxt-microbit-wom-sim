# Architecture & Implementation Guide: World of Modules (WoM) Simulator Extensions

This guide is the authoritative blueprint for adding interactive simulator modules to **MakeCode for micro:bit** (`libs/Module-World` and `libs/tm1650`). Follow these instructions step-by-step whenever you are tasked with adding or updating a simulator extension.

---

## 1. Files You MUST Read First

Before writing any code, inspect these files to understand the existing foundation, sprites, and reference module:

1. **[sim/visuals/womManager.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/womManager.ts)** *(Mandatory — Already Implemented)*
   - Provides the complete shared infrastructure: `WomModuleBase`, `WomModuleManager`, port enum decoders (`decodeDigitalPort`, `decodeAnalogPort`, `decodeServoPort`), per-pin wire colors (`PIN_WIRE_COLORS`), 2D grid bin-packing (`1x1`, `2x1`, `1x2`), strict pin-set deduplication, cross-module pin conflict warnings, and all runtime hooks (`dmesg`, `digitalReadPin`, `analogReadPin`, `pulseIn`, `servoSetPulse`, `i2cWriteBuffer`/`i2cReadBuffer`).
2. **[sim/visuals/womIr.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/womIr.ts)** *(Mandatory — Working Reference Module)*
   - Complete 45-line reference implementation of the Active IR Obstacle Sensor extending `WomModuleBase`.
3. **[sim/public/sprites/README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/public/sprites/README.md)** *(Mandatory)*
   - Lists every pre-made PCB image (`wom_*.png`) and vector overlay (`*_rotor.svg`, `joystick_stick.svg`) in `sim/public/sprites/`, served at runtime under `/sim/sprites/<filename>`.
   - Gives exact pixel dimensions, aspect ratios, rotation pivot points, and visual overlay rules (e.g., RGB alpha formula, servo horn pivot `(60, 60)`).
4. **[libs/Module-World/Module-World.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/Module-World/Module-World.ts)** & **[libs/tm1650/tm1650.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/tm1650/tm1650.ts)**
   - Contains the MakeCode blocks, port enums (`mwDigitalNum`, `mwAnalogNum`, `mwServoNum`), and hardware pin logic.
5. **[agents/NOTES.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/agents/NOTES.md)**
   - Compiler internals, port enum lookup tables, and hardware compatibility notes.

---

## 2. Core Design Rules (Read Carefully — Avoid Common Traps!)

### Rule 1: DO NOT Modify `sim/dalboard.ts` or `sim/state/*` Files!
- **Why**: `WomModuleManager.initBoard(this)` is **already wired into [sim/dalboard.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/dalboard.ts#L184)**, and `WomModuleManager.installHooks()` in [sim/visuals/womManager.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/womManager.ts) already hooks `pxsim.control.dmesg`, `pxsim.pins.digitalReadPin`, `pxsim.pins.analogReadPin`, `pxsim.pins.pulseIn`, `pxsim.pins.servoSetPulse`, `pxsim.pins.i2cWriteBuffer`, and `pxsim.pins.i2cReadBuffer` at runtime.
- Keeping `sim/state/*` untouched ensures the repository can be cleanly rebased onto newer versions of `pxt-microbit` without merge conflicts.
- **What you should edit when adding a module**:
  1. Create **one new file** `sim/visuals/wom<ModuleName>.ts` subclassing `WomModuleBase` and calling `WomModuleManager.registerFactory(...)`.
  2. Add **one line** `control.dmesg("wom:<moduleType>:" + ...)` at the top of the block function in `libs/Module-World/Module-World.ts`.

### Rule 2: Always Put `/// <reference path="./womManager.ts" />` on Line 1 of `sim/visuals/wom*.ts`
- **Why**: `sim/tsconfig.json` compiles `"visuals/*.ts"` into a single `outFile` (`../built/sim.js`) in alphabetical order. Files like `womButton.ts`, `womDht11.ts`, or `womIr.ts` alphabetically precede `womManager.ts` and will fail with `TS2449: Class 'WomModuleBase' used before its declaration` unless `/// <reference path="./womManager.ts" />` is on line 1.

### Rule 3: DO NOT Put Custom `//% shim=...` on Functions with TypeScript Bodies, and DO NOT Use `pxtparts.json`
- **Why `//% shim=...` fails**: In PXT (`node_modules/pxt-core/built/pxt.js`), any function with a non-empty TypeScript body has `hasShimDummy(decl) === true` in the simulator, causing the compiler to **ignore `//% shim=...`** in the simulator, while failing hardware `.hex` builds (`validateShim` error: `function not found`).
- **Why `pxtparts.json` fails**: `pxtparts.json` activates PXT's 1D 30-column breadboard allocator, fails on composite port enums (`P0P1`), and cannot detect cross-block pin conflicts.
- **What to do instead**: Keep the TypeScript body intact in `Module-World.ts` / `tm1650.ts` and call `control.dmesg("wom:<moduleType>:<args>")` at the start of the function. `control.dmesg` is a built-in C++ no-op on micro:bit hardware and triggers `WomModuleManager.handleDmesg` in the simulator.

### Rule 4: Wire Rules — NO `GND` or `3v3` Wires, and Every Pin Has a Distinct Wire Color
- **Never draw `GND` or `3v3`/`VCC` wires**: Power and ground wires must never be returned in `getWirePads()` or drawn in the simulator. Only draw signal wires (`P0`..`P20`).
- **Distinct color per micro:bit pin**: `PIN_WIRE_COLORS` in [sim/visuals/womManager.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/womManager.ts) assigns a unique, high-contrast color to each pin from `P0` through `P20`. `WomModuleBase` automatically colors every signal wire according to its target pin (`getPinWireColor(pinName)`).

### Rule 5: Strict Pin-Set Keying & Conflict Warning Across All Modules
- `WomModuleManager.ensureModule(moduleType, pins, args)` keys all spawned modules **strictly by their canonical sorted set of port pins** (e.g. `["P0", "P1"]` → `"P0,P1"`).
- **Same Module Type + Same Pin Set → Reuse**: Calling a command repeatedly in `basic.forever` (or calling related blocks for the same module on the same port, like `dht11value(TempC, P0P1)` and `dht11value(Humidity, P0P1)`, or `RGB` and `RGB2`) automatically reuses the existing module instance.
- **Different Module Type (or Overlapping Pin) → Warn & Block**: If any requested pin is already claimed by a different module type (or overlapping port like `P0P1` vs `P1P10`), `WomModuleManager` blocks spawning and renders a red `⚠️ Pin conflict` warning banner in the simulator SVG.

---

## 3. Using `WomModuleBase` (`sim/visuals/womManager.ts`)

Every module visual in `sim/visuals/wom<Name>.ts` should extend `WomModuleBase`.

### 3.1 `WomModuleOptions` Constructor Configuration
```typescript
interface WomModuleOptions {
    moduleType: string;      // e.g. "ir", "ultrasonic", "dht11", "servo"
    displayName: string;     // Short label for badge & conflict warnings, e.g. "IR", "Ultrasonic"
    pins: string[];          // Full pin set claimed by this module port, e.g. ["P0", "P1"]
    colSpan?: 1 | 2;         // 1 (148px) for square/vertical, 2 (312px) for horizontal (default: 1)
    rowSpan?: 1 | 2;         // 1 (148px) for square/horizontal, 2 (312px) for vertical (default: 1)
    sprite?: string;         // Relative URL, e.g. "sprites/wom_ir.png" (always avoid absolute "/sim/" prefixes for GitHub Pages compatibility)
    spriteBounds?: { x: number; y: number; width: number; height: number };
    padEdge?: "top" | "bottom" | "left" | "right"; // Edge where signal wire(s) attach (default: "top")
    wiredPins?: string[];    // Signal pins to draw wires for (default: [pins[0]]; pass `pins` for 2-wire modules)
    showCardBackground?: boolean; // Draw dark card behind module (default: true for 2x1, false for 1x1 sprite)
}
```

### 3.2 Built-in Helper Methods on `WomModuleBase`

| Helper Method | Purpose |
| :--- | :--- |
| `this.setBadgeText(status?: string, color?: string)` | Updates the bottom label badge: `"{displayName} ({pins}): {status}"`. |
| `this.addCircleOverlay(cx?, cy?, r?, fill?, fillOpacity?)` | Adds a `<circle>` in `this.overlayGroup` (initially `opacity="0"`) for hover, press, or LED glow indicators. |
| `this.addSvgOverlay(href, x, y, width, height)` | Adds a `<g>` + `<image>` in `this.overlayGroup` for rotatable/draggable SVG parts (`servo_rotor.svg`, `potentiometer_rotor.svg`, `joystick_stick.svg`). |
| `this.addControlForeignObject(x, y, width, height)` | Adds a `<foreignObject>` + `<div>` that automatically stops `pointerdown`/`mousedown`/`touchstart` propagation so HTML `<input>` sliders/color pickers work smoothly. |
| `this.bindHover((hovering: boolean) => void)` | Attaches `mouseenter`/`mouseleave`/`pointerenter`/`pointerleave` listeners and queues a display update on change. |
| `this.bindPress(targetEl, (pressed: boolean) => void)` | Attaches pointer/mouse press-and-hold listeners and queues a display update on change. |
| `this.setDigitalInput(pinName, value: 0 \| 1)` | Sets `pin.womDigitalValue` so `pins.digitalReadPin` returns `value` even if `pins.setPull` is called by the block. |
| `this.setAnalogInput(pinName, value: number)` | Sets `pin.womAnalogValue` (`0..1023`) so `pins.analogReadPin` returns `value`. |
| `this.setPulseMicros(pinName, micros: number)` | Sets `pin.womPulseMicros` so `pins.pulseIn` returns `micros` (e.g. `distanceCm * 58`). |

---

## 4. Complete Worked Examples

### 4.1 Example 1: Square `1x1` Module — Active IR Sensor ([sim/visuals/womIr.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/womIr.ts))

1. **`sim/visuals/womIr.ts`**:
```typescript
/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomIrModule extends WomModuleBase {
        private obstacleDetected = false;
        private indicatorCircle: SVGCircleElement;

        constructor(pins: string[]) {
            super({
                moduleType: "ir",
                displayName: "IR",
                pins,
                colSpan: 1,
                rowSpan: 1,
                sprite: "sprites/wom_ir.png",
                padEdge: "top",
                wiredPins: [pins[0]] // Only wire the active signal pin (no GND/3v3)
            });

            this.indicatorCircle = this.addCircleOverlay(74, 72, 46, "#ef4444", 0.4);
            this.setBadgeText("False", "#64748b");

            this.bindHover((hovering) => {
                this.obstacleDetected = hovering;
                this.indicatorCircle.setAttribute("opacity", hovering ? "1" : "0");
                this.setBadgeText(hovering ? "True" : "False", hovering ? "#ef4444" : "#64748b");
                this.syncPinState();
            });

            this.syncPinState();
        }

        private syncPinState(): void {
            // enObstacle.Obstacle = 0, enObstacle.NoObstacle = 1
            this.setDigitalInput(this.pins[0], this.obstacleDetected ? 0 : 1);
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory("ir", (pins) => new WomIrModule(pins));
}
```

2. **`libs/Module-World/Module-World.ts`**:
```typescript
    export function IR(value_DNum: mwDigitalNum, value: enObstacle): boolean {
        control.dmesg("wom:ir:" + value_DNum);
        let pin;
        ...
```

---

### 4.2 Example 2: Horizontal `2x1` Module with Slider — Ultrasonic Sensor (`sim/visuals/womUltrasonic.ts`)

1. **`sim/visuals/womUltrasonic.ts`**:
```typescript
/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomUltrasonicModule extends WomModuleBase {
        private distanceCm = 25;

        constructor(pins: string[]) {
            super({
                moduleType: "ultrasonic",
                displayName: "Ultrasonic",
                pins,
                colSpan: 2,
                rowSpan: 1,
                sprite: "sprites/wom_ultrasonic.png",
                padEdge: "top",
                wiredPins: pins, // Wire both Trig (pins[0]) and Echo (pins[1]) with distinct pin colors
                showCardBackground: true
            });

            const { container } = this.addControlForeignObject(168, 18, 136, 105);

            const title = document.createElement("div");
            title.style.cssText = "font-weight:bold;color:#38bdf8;font-size:12px;";
            title.textContent = "Distance";

            const readout = document.createElement("div");
            readout.style.cssText = "font-size:16px;font-weight:bold;color:#ffffff;";
            readout.textContent = `${this.distanceCm} cm`;

            const slider = document.createElement("input");
            slider.type = "range";
            slider.min = "0";
            slider.max = "300";
            slider.value = String(this.distanceCm);
            slider.style.cssText = "width:100%;cursor:pointer;";

            slider.addEventListener("input", () => {
                this.distanceCm = parseInt(slider.value, 10) || 0;
                readout.textContent = `${this.distanceCm} cm`;
                this.setBadgeText(`${this.distanceCm}cm`, "#38bdf8");
                this.syncPinState();
            });

            container.appendChild(title);
            container.appendChild(readout);
            container.appendChild(slider);

            this.setBadgeText(`${this.distanceCm}cm`, "#38bdf8");
            this.syncPinState();
        }

        private syncPinState(): void {
            // Ultrasonic reads pulseIn on Echo (pins[1]) and divides by 58
            this.setPulseMicros(this.pins[1], this.distanceCm * 58);
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory("ultrasonic", (pins) => new WomUltrasonicModule(pins));
}
```

2. **`libs/Module-World/Module-World.ts`**:
```typescript
    export function Ultrasonic(value_DNum: mwDigitalNum): number {
        control.dmesg("wom:ultrasonic:" + value_DNum);
        //send pulse
        let Trig, Echo;
        ...
```

---

## 5. Implementation Blueprints for Every Module Category

Whenever you are asked to implement another module from `libs/Module-World` or `libs/tm1650`, use the exact specification for that module below.

---

### 5.1 DHT11 Temperature & Humidity (`wom_dht11`)
- **Block**: `ModuleWorld_Digital.dht11value(dht11type: DHT11Type, value_DNum: mwDigitalNum): number`
- **Footprint & Options**: `colSpan: 1, rowSpan: 1`, `sprite: "/sim/sprites/wom_dht11.png"`, `padEdge: "left"`, `wiredPins: [pins[0]]`
- **Interactive UI**: Use `this.addControlForeignObject(...)` with two compact sliders:
  - Temperature: `0..50 °C` (default `25 °C`; when `DHT11Type.DHT11_temperature_F` (`1`) is requested, return `Math.round(tempC * 1.8 + 32)`).
  - Humidity: `0..100 %` (default `60 %`).
- **CRITICAL INFINITE-LOOP TRAP in `Module-World.ts`**:
  - `dht11value` in [libs/Module-World/Module-World.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/Module-World/Module-World.ts#L106-L152) contains tight bit-banging `while (pins.digitalReadPin(dht11pin) == 1);` and `while (pins.digitalReadPin(dht11pin) == 0);` loops that will freeze the browser tab if `digitalReadPin` returns a static `0` or `1`!
  - **Hardware + Simulator Safe Solution**:
    1. On real micro:bit hardware, `pins.digitalReadPin(dht11pin)` only ever returns `0` or `1`.
    2. In `Module-World.ts`, right after `let i = pins.digitalReadPin(dht11pin)` (line 98):
       ```typescript
       control.dmesg("wom:dht11:" + value_DNum + ":" + dht11type);
       let simVal = pins.digitalReadPin(dht11pin);
       if (simVal < 0) return -(simVal + 1000);
       ```
    3. In your `womDht11.ts` handler, set `this.setDigitalInput(this.pins[0], -(result + 1000))` (e.g. `-1025` for `25°C`). In the simulator, `pins.digitalReadPin(dht11pin)` returns `-1025` (`< 0`), and `dht11value` immediately returns `25` without entering the bit-banging `while` loops!

---

### 5.2 Digital Input Sensors: Button, IR, PIR, Collision (`wom_button`, `wom_ir`, `wom_pir`, `wom_collision`)
- **Blocks in `ModuleWorld_Digital`**:
  - `Button(value_DNum: mwDigitalNum, value: enButton): boolean`
  - `IR(value_DNum: mwDigitalNum, value: enObstacle): boolean` *(Already implemented in `sim/visuals/womIr.ts`)*
  - `PIR(value_DNum: mwDigitalNum, value: enPIR): boolean`
  - `Collision(value_DNum: mwDigitalNum, value: enCollision): boolean`
- **Footprint & Sprites**:
  | Module | Sprite | `padEdge` | Active State (`0` or `1`) | Idle State (`0` or `1`) | Interaction |
  | :--- | :--- | :---: | :---: | :---: | :--- |
  | **Button** (`enButton`) | `/sim/sprites/wom_button.png` | `"right"` | `Press = 0` | `Realse = 1` | `bindPress` + `addCircleOverlay` shadow |
  | **IR** (`enObstacle`) | `/sim/sprites/wom_ir.png` | `"top"` | `Obstacle = 0` | `NoObstacle = 1` | `bindHover` + `addCircleOverlay` red |
  | **PIR** (`enPIR`) | `/sim/sprites/wom_pir.png` | `"left"` | `OPIR = 1` | `NoPIR = 0` | `bindHover` or toggle + `addCircleOverlay` |
  | **Collision** (`enCollision`) | Custom SVG switch | `"left"` | `OCollision = 1` (or `0`) | `NoCollision = 0` | `bindPress` / toggle |
- **State Hook**: Call `this.setDigitalInput(this.pins[0], currentVal)` inside your interaction callback and `updateState()`.

---

### 5.3 Vibration Sensor (`wom_vibration`)
- **Block**: `ModuleWorld_Digital.Vibration(value_DNum: mwDigitalNum, handle: () => void): void`
- **How `Vibration` Works**: Registers `control.onEvent(VbPin, DAL.MICROBIT_PIN_EVT_FALL, handle)` (`MICROBIT_PIN_EVT_FALL = 2`).
- **Simulator Hook**:
  - Add `control.dmesg("wom:vibration:" + value_DNum);` at the start of `Vibration(...)`.
  - Extend `WomModuleBase` (`1x1`). When clicked/pressed via `this.bindPress(...)`, queue the fall event on `this.pins[0]`:
    ```typescript
    const pinId = pinNameToId(this.pins[0]);
    runtime.board.bus.queue(pinId, DAL.MICROBIT_PIN_EVT_FALL);
    ```

---

### 5.4 Analog Sensors: Photoresistor (`wom_photoresistor`), Sound (`wom_sound`), Potentiometer (`wom_potentiometer`), Joystick (`wom_joystick`)
- **Port Decoder**: Register a custom `dmesgHandler` in `WomModuleManager.registerFactory(type, factory, (b, args) => { const pins = decodeAnalogPort(parseInt(args[0], 10)); WomModuleManager.get(b)?.ensureModule(type, pins, args); })`.
- **Blocks in `ModuleWorld_Analog`**:
  - `Light(value_ANum: mwAnalogNum): number`:
    - Sprite: `/sim/sprites/wom_photoresistor.png`, `padEdge: "right"`, `wiredPins: [pins[0]]`.
    - **Note**: `Module-World.ts` computes `1024 - pins.analogReadPin(lightpin)`! So for a slider `lightLevel` (`0..1023`), call `this.setAnalogInput(this.pins[0], 1024 - lightLevel)`.
  - `Sound(value_ANum: mwAnalogNum): number`:
    - Slider `0..1023` calling `this.setAnalogInput(this.pins[0], soundLevel)`.
  - `Potentiometer(value_ANum: mwAnalogNum): number`:
    - Sprite: `/sim/sprites/wom_potentiometer.png`, `padEdge: "right"`, `wiredPins: [pins[0]]`.
    - Overlay `/sim/sprites/potentiometer_rotor.svg` (`24 x 24`) using `this.addSvgOverlay(...)` centered on the shaft and rotate from `-135°` (`0`) to `+135°` (`1023`), calling `this.setAnalogInput(this.pins[0], val)`.
  - `Rocker(value_ANum: mwAnalogNum, value: enRocker): number`:
    - Sprite: `/sim/sprites/wom_joystick_base.png`, `padEdge: "right"`, `wiredPins: pins` (wires both `X = pins[0]` and `Y = pins[1]`).
    - Overlay `/sim/sprites/joystick_stick.svg` (`24 x 24`) in the center. Dragging within a `24 px` radius updates `this.setAnalogInput(this.pins[0], xVal)` and `this.setAnalogInput(this.pins[1], yVal)`; releasing springs back to `(512, 512)`.

---

### 5.5 PWM & Actuators: RGB LED (`wom_rgb`), Vibration Motor (`wom_vibmot`)
- **RGB LED (`ModuleWorld_PWM.RGB` and `ModuleWorld_PWM.RGB2`)**:
  - Hardcoded to `P12` (Red), `P13` (Green), `P14` (Blue).
  - Add `control.dmesg("wom:rgb:P12,P13,P14");` to **both** `RGB` and `RGB2`.
  - Options: `sprite: "/sim/sprites/wom_rgb.png"`, `padEdge: "right"`, `wiredPins: ["P12", "P13", "P14"]`.
  - In `updateState()`, read `getPinInstance("P12")?.value`, `"P13"`, `"P14"` (`0..1023`), convert to `0..255`, and update `this.addCircleOverlay(...)` with `fill = rgb(R, G, B)` and `opacity = Math.min(1, (R + G + B) / 255)`.
- **Vibration Motor (`ModuleWorld_PWM.VibrationMot`)**:
  - Add `control.dmesg("wom:vibmot:" + pin + ":" + speed);` in `VibrationMot`.

---

### 5.6 Servos: 360° & 270° Positional (`wom_servo`) and Continuous (`wom_servo_continuous`)
- **Blocks in `ModuleWorld_PWM`**: `Servo(pin: mwServoNum, value: number)` (`0..360°`) and `Servo2(pin: mwServoNum, value: number)` (`0..270°`).
- **Footprint & Options**: `colSpan: 1, rowSpan: 2` (`148 x 312 px` vertical), `sprite: "/sim/sprites/wom_servo.png"`, `padEdge: "top"`, `wiredPins: [pins[0]]`.
- **Rotor Overlay**:
  - `/sim/sprites/servo_rotor.svg` (`400 x 120`, **rotation pivot at `(60, 60)`**).
  - In `updateState()`, read `(getPinInstance(this.pins[0]) as any)?.womServoPulse` (`500..2500 us`, automatically captured by `WomModuleManager.installHooks()`) and rotate the horn around `(60, 60)`:
    ```typescript
    this.rotorGroup.setAttribute(
        "transform",
        `translate(${shaftX}, ${shaftY}) scale(0.32) rotate(${angleDeg}) translate(-60, -60)`
    );
    ```

---

### 5.7 I2C Modules: Color Recognition (`wom_color`) & TM1650 4-Digit Display (`wom_tm1650`)
- **Pins**: Both use I2C pins `["P19", "P20"]` (`SCL = P19`, `SDA = P20`), `wiredPins: ["P19", "P20"]`.
- **TM1650 (`libs/tm1650/tm1650.ts`)**:
  - Footprint: `colSpan: 2, rowSpan: 1` (`312 x 148 px` horizontal), `sprite: "/sim/sprites/wom_tm1650.png"`.
  - Register an I2C handler via `WomModuleManager.registerI2cHandler([0x24, 0x34, 0x35, 0x36, 0x37], { onWrite(b, addr, buf) { ... } })`.
  - Requires **zero changes** to `libs/tm1650/tm1650.ts`!

---

## 6. Verification Checklist Before Finishing Your Task

1. **Scoped Package Build**:
   ```bash
   cd libs/Module-World && pxt build
   ```
   *(or `cd libs/tm1650 && pxt build` if modifying `tm1650`)* — must succeed with exit code `0`.
2. **Full Target & Simulator Build**:
   ```bash
   pxt buildtarget
   ```
   Must compile `built/sim.js` and all bundled packages with zero errors.
3. **Git Diff Hygiene Check**:
   - Verify via `git status` that `sim/state/*` and `sim/dalboard.ts` were not dirtied; your changes should only be your new `sim/visuals/wom<Name>.ts` file, `libs/Module-World/Module-World.ts`, and any requested documentation file.

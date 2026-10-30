# Architecture & Implementation Guide: World of Modules (WoM) Simulator Extensions

This guide is the authoritative blueprint for adding interactive simulator modules to **MakeCode for micro:bit** (`libs/Module-World` and `libs/tm1650`). Follow these instructions step-by-step whenever you are tasked with adding or updating a simulator extension.

---

## 1. Files You MUST Read First

Before writing any code, inspect these files to understand the existing assets, pin mappings, and simulator hooks:

1. **[sim/public/sprites/README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/public/sprites/README.md)** *(Mandatory)*
   - Lists every pre-made PCB image (`wom_*.png`) and vector overlay (`*_rotor.svg`, `joystick_stick.svg`) in `sim/public/sprites/`, served at runtime under `/sim/sprites/<filename>`.
   - Gives exact pixel dimensions, aspect ratios, rotation pivot points, and visual overlay rules (e.g., RGB alpha formula, servo horn pivot `(60, 60)`).
2. **[libs/Module-World/Module-World.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/Module-World/Module-World.ts)** & **[libs/tm1650/tm1650.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/tm1650/tm1650.ts)**
   - Contains the MakeCode blocks, port enums (`mwDigitalNum`, `mwAnalogNum`, `mwServoNum`), and hardware pin logic.
3. **[sim/dalboard.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/dalboard.ts)**
   - Central `DalBoard` class representing the virtual micro:bit and its attached state/visuals.
4. **[sim/state/misc.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/misc.ts)** & **[sim/state/edgeconnector.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/edgeconnector.ts)**
   - Where `pxsim.control.dmesg`, `pxsim.pins.pulseIn`, `pxsim.pins.digitalReadPin`, `pxsim.pins.analogReadPin`, `pxsim.pins.servoSetPulse`, and `pxsim.pins.i2cWriteBuffer` are implemented.
5. **[sim/visuals/microbit.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/microbit.ts)**
   - `MicrobitBoardSvg` (`viewBox="0 0 500 430"`), which provides `boardSvg.getCoord(pinName)` for signal wire endpoints (`"P0"`..`"P20"`).
6. **[agents/NOTES.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/agents/NOTES.md)**
   - Compiler internals, port enum lookup tables, and hardware compatibility notes.

---

## 2. Core Design Rules (Read Carefully — Avoid Common Traps!)

### Rule 1: DO NOT Put Custom `//% shim=...` on Functions with TypeScript Bodies
- **Why**: In PXT (`node_modules/pxt-core/built/pxt.js`), any function with a non-empty TypeScript body has `hasShimDummy(decl) === true` in the simulator, which causes the compiler to **ignore `//% shim=...`** in the simulator! Worse, on hardware builds (`isNative = true`), `validateShim` checks `//% shim=...` against the C++ firmware and **fails the build** (`function not found`).
- **What to do instead**: Keep the TypeScript body intact in `Module-World.ts` / `tm1650.ts`. At the top of the function, call `control.dmesg("wom:<moduleType>:<args>")`.
  - `control.dmesg` is a built-in C++ no-op on micro:bit hardware, and invokes `pxsim.control.dmesg(s)` in `sim/state/misc.ts` in the simulator!
  - In the simulator, `pxsim.control.dmesg` spawns/reuses the module visual and primes the virtual pin state (`pxsim.pins.*`) so the TypeScript body computes the exact simulated value.

### Rule 2: DO NOT Use `pxtparts.json` or `//% parts="..."` for WoM Modules
- **Why**: `pxtparts.json` activates PXT's built-in 1D 30-column solderless breadboard (`BoardHost.breadboard`), fails to parse composite port enums like `P0P1`, and cannot detect cross-block pin conflicts.
- **What to do instead**: All WoM modules are spawned, laid out in 2D, and wired dynamically at runtime by `WomModuleManager` (Section 3).

### Rule 3: Strict Pin-Set Keying & Conflict Warning Across All Modules
- Every spawned module is registered **strictly by its canonical sorted set of signal pins** (e.g. `["P0", "P1"]` → key `"P0,P1"`).
- **Same Module Type + Same Pin Set → Reuse**:
  - Calling a block repeatedly in `basic.forever` (e.g. `Ultrasonic(P0P1)`), or calling two blocks for the same hardware module on the same port (e.g. `dht11value(TempC, P0P1)` and `dht11value(Humidity, P0P1)`, or `RGB(...)` and `RGB2(...)`), **reuses** the already-spawned module instance.
- **Different Module Type (or Overlapping Pin) → Show Warning & Do Not Spawn**:
  - If a command requests any pin that is already claimed by a **different** module type (or a different port sharing a pin, such as `P0P1` and `P1P10` both using `P1`), `WomModuleManager` **must not** spawn a second module. Instead, it displays a visible warning banner in the simulator SVG (`⚠️ Pin conflict on P0, P1: already used by ...`) and logs `console.warn`.

### Rule 4: 2D Grid Layout for `1x1`, `2x1`, and `1x2` Modules + Bezier Wires
- All modules are drawn in a `<g class="wom-board-area">` **below the micro:bit** (`y >= 445`).
- Modules have three possible grid footprints (`colSpan x rowSpan` on a 3-column grid):
  - **`1x1` (Square, `148 x 148 px`)**: Button, Buzzer, Color Sensor, DHT11, IR, Joystick, Photoresistor, PIR, Potentiometer, RGB, Sound, Collision, Vibration, Vibration Motor.
  - **`2x1` (Horizontal — ~2x wider than tall, `312 x 148 px`)**: Ultrasonic (`wom_ultrasonic.png`), TM1650 7-segment display (`wom_tm1650.png`).
  - **`1x2` (Vertical — ~2x taller than wide, `148 x 312 px`)**: Positional Servo (`wom_servo.png`), Continuous Servo (`wom_servo_continuous.png`).
- Each module connects **only its signal pads (`P0`..`P20`)** to the micro:bit's edge connector via smooth cubic Bezier curves.
- **Important — Do NOT Draw `3v3` or `GND` Wires**: Power (`+3v3` / `3V` / `VCC`) and ground (`GND`) wires **must not** be drawn in the simulator (neither returned in `getWirePads()` nor rendered by `WomModuleManager.drawWiresForModule`), as drawing power/ground wires for every module clutters the board. Only draw signal wires (`P0`..`P20`).

---

## 3. Shared Simulator Infrastructure (`sim/visuals/womManager.ts`)

> **Check First**: Before implementing your assigned module, check if `sim/visuals/womManager.ts` already exists in the repo.
> - **If `sim/visuals/womManager.ts` does NOT exist yet**: Create it using the code in **Section 3.1** and add the board hooks in **Section 3.2**.
> - **If `sim/visuals/womManager.ts` ALREADY exists**: Do not overwrite existing modules! Just register your new module factory in `WomModuleManager.registerFactory(...)` or inside `createModuleVisual(...)`.

### 3.1 Creating `sim/visuals/womManager.ts`

Because `sim/tsconfig.json` includes `"visuals/*.ts"`, any `.ts` file placed in `sim/visuals/` is compiled automatically into `namespace pxsim.visuals`.

```typescript
namespace pxsim.visuals {
    export interface WomWirePad {
        /** Label on module for signal pad, e.g. "Trig", "Echo", "SIG", "SCL", "SDA" (do NOT include 3v3/VCC or GND) */
        label: string;
        /** Target signal pin on micro:bit edge connector: "P0".."P20" (do NOT draw 3v3 or GND wires) */
        targetPin: string;
        /** Local X coordinate inside the module's <g> container */
        x: number;
        /** Local Y coordinate inside the module's <g> container */
        y: number;
        /** Wire color (CSS hex) */
        color: string;
    }

    export interface IWomModule {
        readonly moduleType: string;
        readonly displayName: string;
        readonly pinKey: string;
        readonly pins: string[];
        readonly colSpan: 1 | 2;
        readonly rowSpan: 1 | 2;
        readonly element: SVGGElement;
        /** Return wire pads in local module coordinates */
        getWirePads(): WomWirePad[];
        /** Called whenever board state updates or dmesg arrives */
        updateState?(): void;
    }

    export type WomModuleFactory = (pins: string[], args: string[]) => IWomModule;

    /** Port enum decoders matching libs/Module-World/Module-World.ts */
    export function decodeDigitalPort(val: number): string[] {
        // mwDigitalNum: P0P1=1, P2P3=2, P3P4=3, P4P5=4, P6P7=5, P8P9=6, P10P11=7, P12P13=8, P14P15=9, P1P10=10
        const map: { [k: number]: string[] } = {
            1: ["P0", "P1"],
            2: ["P2", "P3"],
            3: ["P3", "P4"],
            4: ["P4", "P5"],
            5: ["P6", "P7"],
            6: ["P8", "P9"],
            7: ["P10", "P11"],
            8: ["P12", "P13"],
            9: ["P14", "P15"],
            10: ["P1", "P10"]
        };
        return map[val] || ["P0", "P1"];
    }

    export function decodeAnalogPort(val: number): string[] {
        // mwAnalogNum: AP0P1=1, AP2P3=2, AP3P4=3
        const map: { [k: number]: string[] } = {
            1: ["P0", "P1"],
            2: ["P2", "P3"],
            3: ["P3", "P4"]
        };
        return map[val] || ["P0", "P1"];
    }

    export function decodeServoPort(val: number): string[] {
        // mwServoNum: P1=1 (port P1P10), P2=2 (port P2P3), P3=3 (port P3P4), P4=4 (port P4P5), P10=5 (port P10P11)
        const map: { [k: number]: string[] } = {
            1: ["P1", "P10"],
            2: ["P2", "P3"],
            3: ["P3", "P4"],
            4: ["P4", "P5"],
            5: ["P10", "P11"]
        };
        return map[val] || ["P1", "P10"];
    }

    export function pinNameToId(pinName: string): number {
        const b = board();
        if (!b || !b.edgeConnectorState) return -1;
        const p = b.edgeConnectorState.pins.filter(pin => {
            // Match DAL pin IDs via MicrobitBoardSvg pin index or standard DAL table
            return false;
        });
        // Standard micro:bit DAL pin IDs (MICROBIT_ID_IO_P0 = 7 .. P20 = 27)
        const idx = parseInt(pinName.replace(/^P/, ""), 10);
        if (!isNaN(idx) && idx >= 0 && idx <= 20) {
            return 7 + idx; // DAL.MICROBIT_ID_IO_P0 is 7
        }
        return -1;
    }

    export function getPinInstance(pinName: string): Pin | undefined {
        const b = board();
        if (!b || !b.edgeConnectorState) return undefined;
        const id = pinNameToId(pinName);
        return b.edgeConnectorState.getPin(id);
    }

    export class WomModuleManager {
        private static factories: { [moduleType: string]: WomModuleFactory } = {};

        public static registerFactory(moduleType: string, factory: WomModuleFactory) {
            WomModuleManager.factories[moduleType] = factory;
        }

        private rootGroup: SVGGElement | null = null;
        private wiresGroup: SVGGElement | null = null;
        private modulesGroup: SVGGElement | null = null;
        private warningGroup: SVGGElement | null = null;

        /** Canonical pinKey (e.g. "P0,P1") -> spawned module */
        private modulesByPinKey: { [pinKey: string]: IWomModule } = {};
        /** Individual pin name (e.g. "P0") -> spawned module owning that pin */
        private pinOwner: { [pinName: string]: IWomModule } = {};
        /** 2D occupancy grid: occupied[row][col] */
        private occupied: boolean[][] = [];
        private warningsShown: { [msg: string]: boolean } = {};

        public static readonly GRID_COLS = 3;
        public static readonly CELL_W = 148;
        public static readonly CELL_H = 148;
        public static readonly GAP_X = 16;
        public static readonly GAP_Y = 20;
        public static readonly START_X = 12;
        public static readonly START_Y = 450;

        /** Compute pixel width for a given colSpan (1 -> 148, 2 -> 312) */
        public static getModuleWidth(colSpan: 1 | 2): number {
            return colSpan * WomModuleManager.CELL_W + (colSpan - 1) * WomModuleManager.GAP_X;
        }

        /** Compute pixel height for a given rowSpan (1 -> 148, 2 -> 312) */
        public static getModuleHeight(rowSpan: 1 | 2): number {
            return rowSpan * WomModuleManager.CELL_H + (rowSpan - 1) * WomModuleManager.GAP_Y;
        }

        public static canonicalPinKey(pins: string[]): string {
            return pins.slice().sort().join(",");
        }

        private ensureContainers(): boolean {
            const b = board();
            if (!b || !b.view) return false;
            const svgEl = b.view.element;
            if (!svgEl) return false;

            if (!this.rootGroup || !svgEl.contains(this.rootGroup)) {
                this.rootGroup = <SVGGElement>svg.child(svgEl, "g", { class: "wom-board-area" });
                this.wiresGroup = <SVGGElement>svg.child(this.rootGroup, "g", { class: "wom-wires-layer" });
                this.modulesGroup = <SVGGElement>svg.child(this.rootGroup, "g", { class: "wom-modules-layer" });
                this.warningGroup = <SVGGElement>svg.child(this.rootGroup, "g", { class: "wom-warning-layer" });
            }
            return true;
        }

        /**
         * Retrieve an already-spawned module by its pins, or spawn a new one.
         * Enforces strict pin-set ownership and shows a warning on cross-module pin conflicts.
         */
        public ensureModule<T extends IWomModule = IWomModule>(
            moduleType: string,
            pins: string[],
            args: string[] = []
        ): T | null {
            if (!this.ensureContainers()) return null;

            const pinKey = WomModuleManager.canonicalPinKey(pins);

            // 1. Exact pin-set match: reuse if same moduleType, otherwise warn conflict!
            const existingExact = this.modulesByPinKey[pinKey];
            if (existingExact) {
                if (existingExact.moduleType === moduleType) {
                    if (existingExact.updateState) existingExact.updateState();
                    return existingExact as T;
                } else {
                    this.showPinConflictWarning(moduleType, pins, existingExact);
                    return null;
                }
            }

            // 2. Partial pin overlap check across all individual pins
            for (const pin of pins) {
                const owner = this.pinOwner[pin];
                if (owner) {
                    this.showPinConflictWarning(moduleType, pins, owner, pin);
                    return null;
                }
            }

            // 3. Instantiate the new module via registered factory
            const factory = WomModuleManager.factories[moduleType];
            if (!factory) {
                console.warn(`[WoM Sim] No factory registered for module type "${moduleType}"`);
                return null;
            }

            const mod = factory(pins, args);
            this.modulesByPinKey[pinKey] = mod;
            for (const pin of pins) {
                this.pinOwner[pin] = mod;
            }

            // 4. Allocate 2D grid slot and position module
            const slot = this.allocateGridSlot(mod.colSpan, mod.rowSpan);
            const modX = WomModuleManager.START_X + slot.col * (WomModuleManager.CELL_W + WomModuleManager.GAP_X);
            const modY = WomModuleManager.START_Y + slot.row * (WomModuleManager.CELL_H + WomModuleManager.GAP_Y);

            mod.element.setAttribute("transform", `translate(${modX}, ${modY})`);
            this.modulesGroup!.appendChild(mod.element);

            // 5. Draw Bezier wires from module pads to micro:bit edge connector
            this.drawWiresForModule(mod, modX, modY);

            // 6. Expand SVG viewBox to fit all rows
            this.updateViewBox();

            if (mod.updateState) mod.updateState();
            return mod as T;
        }

        public getModuleByPins<T extends IWomModule = IWomModule>(pins: string[]): T | undefined {
            const key = WomModuleManager.canonicalPinKey(pins);
            return this.modulesByPinKey[key] as T | undefined;
        }

        public updateAllModules(): void {
            for (const key of Object.keys(this.modulesByPinKey)) {
                const mod = this.modulesByPinKey[key];
                if (mod && mod.updateState) {
                    mod.updateState();
                }
            }
        }

        private allocateGridSlot(colSpan: 1 | 2, rowSpan: 1 | 2): { row: number; col: number } {
            for (let r = 0; r < 50; r++) {
                if (!this.occupied[r]) this.occupied[r] = [false, false, false];
                if (rowSpan === 2 && !this.occupied[r + 1]) this.occupied[r + 1] = [false, false, false];

                for (let c = 0; c <= WomModuleManager.GRID_COLS - colSpan; c++) {
                    let fits = true;
                    for (let dr = 0; dr < rowSpan; dr++) {
                        for (let dc = 0; dc < colSpan; dc++) {
                            if (this.occupied[r + dr][c + dc]) {
                                fits = false;
                                break;
                            }
                        }
                        if (!fits) break;
                    }
                    if (fits) {
                        for (let dr = 0; dr < rowSpan; dr++) {
                            for (let dc = 0; dc < colSpan; dc++) {
                                this.occupied[r + dr][c + dc] = true;
                            }
                        }
                        return { row: r, col: c };
                    }
                }
            }
            return { row: 0, col: 0 };
        }

        private drawWiresForModule(mod: IWomModule, modX: number, modY: number): void {
            const b = board();
            if (!b || !b.view || !this.wiresGroup) return;

            const pads = mod.getWirePads();
            pads.forEach((pad, idx) => {
                // Never draw 3v3/VCC or GND wires in the simulator; only draw signal wires (P0..P20)
                const pinName = pad.targetPin;
                if (
                    !pinName ||
                    pinName === "+3v3" ||
                    pinName === "3v3" ||
                    pinName === "3V" ||
                    pinName === "VCC" ||
                    pinName === "GND"
                ) {
                    return;
                }
                const boardCoord = b.view.getCoord(pinName);
                if (!boardCoord) return;

                const x1 = modX + pad.x;
                const y1 = modY + pad.y;
                const x2 = boardCoord[0];
                const y2 = boardCoord[1];

                const dy = Math.max(40, Math.abs(y1 - y2) * 0.45);
                const jitter = (idx - 0.5) * 6;
                const d = `M ${x1} ${y1} C ${x1 + jitter} ${y1 - dy}, ${x2 + jitter} ${y2 + dy}, ${x2} ${y2}`;

                // Subtle shadow under wire for readability
                svg.child(this.wiresGroup!, "path", {
                    d,
                    fill: "none",
                    stroke: "rgba(0,0,0,0.35)",
                    "stroke-width": 4.5,
                    "stroke-linecap": "round"
                });
                svg.child(this.wiresGroup!, "path", {
                    d,
                    fill: "none",
                    stroke: pad.color,
                    "stroke-width": 3,
                    "stroke-linecap": "round",
                    opacity: 0.92
                });
            });
        }

        private showPinConflictWarning(
            attemptedType: string,
            attemptedPins: string[],
            existingOwner: IWomModule,
            conflictPin?: string
        ): void {
            const pinDesc = conflictPin ? conflictPin : attemptedPins.join(", ");
            const msg = `Pin conflict on ${pinDesc}: already used by ${existingOwner.displayName} (${existingOwner.pins.join(",")}), cannot attach ${attemptedType}.`;
            if (this.warningsShown[msg]) return;
            this.warningsShown[msg] = true;

            console.warn(`[WoM Sim] ${msg}`);
            if (!this.warningGroup) return;

            const bannerIndex = Object.keys(this.warningsShown).length - 1;
            const yOffset = 412 + bannerIndex * 26;
            const g = svg.child(this.warningGroup, "g", {
                transform: `translate(10, ${yOffset})`
            });
            svg.child(g, "rect", {
                x: 0,
                y: 0,
                width: 480,
                height: 22,
                rx: 4,
                fill: "#b91c1c",
                stroke: "#fca5a5",
                "stroke-width": 1
            });
            const t = svg.child(g, "text", {
                x: 8,
                y: 15,
                fill: "#ffffff",
                "font-family": "monospace, sans-serif",
                "font-size": "10.5px",
                "font-weight": "bold"
            });
            t.textContent = `⚠️ ${msg}`;
            this.updateViewBox();
        }

        private updateViewBox(): void {
            const b = board();
            if (!b || !b.view || !b.view.element) return;
            const numRows = Math.max(1, this.occupied.length);
            const requiredHeight =
                WomModuleManager.START_Y +
                numRows * (WomModuleManager.CELL_H + WomModuleManager.GAP_Y) +
                20;
            b.view.element.setAttribute("viewBox", `0 0 500 ${Math.max(430, requiredHeight)}`);
        }
    }
}
```

### 3.2 Hooking `WomModuleManager` into `sim/dalboard.ts` and `sim/state/misc.ts`

1. In **[sim/dalboard.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/dalboard.ts)**:
   - Add a property `womManager: visuals.WomModuleManager;` to `class DalBoard`.
   - Initialize it in the `DalBoard` constructor: `this.womManager = new visuals.WomModuleManager();`
   - Inside `DalBoard.updateView()` (around line 142), call `this.womManager.updateAllModules();`.

2. In **[sim/state/misc.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/misc.ts)**:
   - Update `pxsim.control.dmesg(s: string)` (lines 68–71) to route any `"wom:..."` message to `WomModuleManager`:
   ```typescript
   export function dmesg(s: string) {
       if (s && s.indexOf("wom:") === 0) {
           const b = board();
           if (b && b.womManager) {
               const parts = s.split(":");
               // Format: "wom:<moduleType>:<portOrPin>:<extraArg>"
               const moduleType = parts[1];
               const portVal = parseInt(parts[2], 10);
               // Dispatch to module-specific handler or ensureModule
               handleWomDmesg(b, moduleType, portVal, parts.slice(2));
           }
           return;
       }
       // console.log(`DMESG: ${s}`);
   }
   ```

---

## 4. Complete Worked Example: Ultrasonic Sensor (`wom_ultrasonic`)

Let's walk through adding the **Ultrasonic Sensor** (`ModuleWorld_Digital.Ultrasonic`) from start to finish.

### Step 1: Check the Sprite & Hardware Specs
1. Read [sim/public/sprites/README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/public/sprites/README.md):
   - Sprite path: `/sim/sprites/wom_ultrasonic.png`
   - Native size: `297 x 203 px` (~1.46:1 horizontal rectangle) → **Grid footprint is `colSpan = 2, rowSpan = 1`** (`312 x 148 px`).
2. Read `Ultrasonic` in [libs/Module-World/Module-World.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/Module-World/Module-World.ts#L53-L99):
   - Takes `value_DNum: mwDigitalNum` (`P0P1`..`P1P10`).
   - Sends a pulse on `Trig` (`pinA`) and calls `let d = pins.pulseIn(Echo, PulseValue.High, 500 * 58)` on `Echo` (`pinB`), returning `Math.idiv(d, 58)`.
   - Therefore, if `pxsim.pins.pulseIn` returns `distanceCm * 58`, `Math.idiv(d, 58)` in `Module-World.ts` will return `distanceCm`!

### Step 2: Create `sim/visuals/womUltrasonic.ts`

Create `sim/visuals/womUltrasonic.ts` (auto-included by `sim/tsconfig.json`).
> **IMPORTANT**: Always put `/// <reference path="./womManager.ts" />` on line 1 of every `sim/visuals/wom*.ts` file! Because `sim/tsconfig.json` compiles to a single `outFile` (`../built/sim.js`) in alphabetical order, files like `womButton.ts`, `womDht11.ts`, `womIr.ts` alphabetically precede `womManager.ts` and will fail with `TS2449: Class 'WomModuleManager' used before its declaration` without the reference tag.

```typescript
/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomUltrasonicModule implements IWomModule {
        public readonly moduleType = "ultrasonic";
        public readonly displayName = "Ultrasonic";
        public readonly pinKey: string;
        public readonly pins: string[];
        public readonly colSpan = 2;
        public readonly rowSpan = 1;
        public readonly element: SVGGElement;

        /** User-selected distance in cm (0 .. 300) */
        public distanceCm: number = 25;

        private readonly width = WomModuleManager.getModuleWidth(2);  // 312
        private readonly height = WomModuleManager.getModuleHeight(1); // 148

        constructor(pins: string[]) {
            this.pins = pins;
            this.pinKey = WomModuleManager.canonicalPinKey(pins);
            this.element = <SVGGElement>svg.elt("g", { class: "wom-module wom-ultrasonic" });
            this.buildDom();
        }

        private buildDom(): void {
            // 1. Card background
            svg.child(this.element, "rect", {
                x: 0,
                y: 0,
                width: this.width,
                height: this.height,
                rx: 8,
                fill: "#1e293b",
                stroke: "#475569",
                "stroke-width": 1.5
            });

            // 2. Ultrasonic PCB sprite (/sim/sprites/wom_ultrasonic.png, 297x203)
            const imgEl = <SVGImageElement>svg.child(this.element, "image", {
                x: 8,
                y: 6,
                width: 155,
                height: 106
            });
            imgEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", "/sim/sprites/wom_ultrasonic.png");
            imgEl.setAttribute("href", "/sim/sprites/wom_ultrasonic.png");

            // 3. Pin badge
            const badge = svg.child(this.element, "text", {
                x: 12,
                y: 132,
                fill: "#94a3b8",
                "font-family": "monospace, sans-serif",
                "font-size": "11px",
                "font-weight": "bold"
            });
            badge.textContent = `Trig:${this.pins[0]} Echo:${this.pins[1]}`;

            // 4. Interactive HTML slider via <foreignObject> on the right half of the 2x1 card
            const fo = svg.child(this.element, "foreignObject", {
                x: 168,
                y: 18,
                width: 136,
                height: 115
            });
            const container = document.createElement("div");
            container.style.cssText =
                "color:#f8fafc;font-family:sans-serif;font-size:12px;display:flex;flex-direction:column;gap:6px;padding:4px;user-select:none;";

            const title = document.createElement("div");
            title.style.cssText = "font-weight:bold;color:#38bdf8;font-size:12px;";
            title.textContent = "Ultrasonic Distance";

            const readout = document.createElement("div");
            readout.style.cssText = "font-size:16px;font-weight:bold;color:#ffffff;";
            readout.textContent = `${this.distanceCm} cm`;

            const slider = document.createElement("input");
            slider.type = "range";
            slider.min = "0";
            slider.max = "300";
            slider.value = String(this.distanceCm);
            slider.style.cssText = "width:100%;cursor:pointer;";

            // Prevent pointer events on the slider from dragging/panning the simulator SVG
            const stopProp = (e: Event) => e.stopPropagation();
            slider.addEventListener("pointerdown", stopProp);
            slider.addEventListener("mousedown", stopProp);
            slider.addEventListener("touchstart", stopProp);
            slider.addEventListener("input", (e) => {
                e.stopPropagation();
                this.distanceCm = parseInt(slider.value, 10) || 0;
                readout.textContent = `${this.distanceCm} cm`;
            });

            container.appendChild(title);
            container.appendChild(readout);
            container.appendChild(slider);
            fo.appendChild(container);
        }

        public getWirePads(): WomWirePad[] {
            return [
                { label: "Trig", targetPin: this.pins[0], x: 60, y: 6, color: "#eab308" },
                { label: "Echo", targetPin: this.pins[1], x: 75, y: 6, color: "#3b82f6" }
            ];
        }
    }

    WomModuleManager.registerFactory("ultrasonic", (pins) => new WomUltrasonicModule(pins));
}
```

### Step 3: Hook `pulseIn` and `dmesg` in `sim/state/misc.ts`

In [sim/state/misc.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/misc.ts):
1. When `dmesg("wom:ultrasonic:<value_DNum>")` arrives:
   ```typescript
   const pins = visuals.decodeDigitalPort(portVal);
   b.womManager.ensureModule("ultrasonic", pins);
   ```
2. In `pxsim.pins.pulseIn(name: number, value: number, maxDuration: number)` (line 86 of `sim/state/misc.ts`):
   ```typescript
   export function pulseIn(name: number, value: number, maxDuration: number): number {
       const b = board();
       if (b && b.womManager) {
           // Find which pin name corresponds to `name` (DAL pin ID = 7 + pinIndex)
           const pinIndex = name - 7;
           const echoPinName = `P${pinIndex}`;
           // Check if an ultrasonic module is registered with Echo = echoPinName
           for (let portVal = 0; portVal <= 9; portVal++) {
               const pair = visuals.decodeDigitalPort(portVal);
               if (pair[1] === echoPinName) {
                   const mod = b.womManager.getModuleByPins<visuals.WomUltrasonicModule>(pair);
                   if (mod && mod.moduleType === "ultrasonic") {
                       return Math.round(mod.distanceCm * 58);
                   }
               }
           }
       }
       return 0;
   }
   ```

### Step 4: Add the 1-Line `control.dmesg` Notification in `libs/Module-World/Module-World.ts`

In [libs/Module-World/Module-World.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/Module-World/Module-World.ts#L53), add `control.dmesg("wom:ultrasonic:" + value_DNum);` as the first line of `Ultrasonic`:

```typescript
    //% blockId=ModuleWorld_Digital_Ultrasonic block="Ultrasonic|pin %value_DNum"
    //% weight=97
    //% blockGap=20
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=5
    export function Ultrasonic(value_DNum: mwDigitalNum): number {
        control.dmesg("wom:ultrasonic:" + value_DNum);
        //send pulse
        let Trig, Echo;
        ...
```

### Step 5: Verify Build
Run both commands to confirm zero TypeScript or shim errors:
```bash
cd libs/Module-World && pxt build
cd ../.. && pxt buildtarget
```

---

## 5. Implementation Blueprints for Every Module Category

Whenever you are asked to implement another module from `libs/Module-World` or `libs/tm1650`, use the exact specification for that module below.

---

### 5.1 DHT11 Temperature & Humidity (`wom_dht11`)
- **Block**: `ModuleWorld_Digital.dht11value(dht11type: DHT11Type, value_DNum: mwDigitalNum): number`
- **Grid Footprint**: `1x1` (`colSpan: 1, rowSpan: 1`, `148 x 148 px`)
- **Sprite**: `/sim/sprites/wom_dht11.png` (`241 x 243 px`, gold pads on left edge)
- **Interactive UI**: Two compact range sliders in `<foreignObject>`:
  - Temperature: `0..50 °C` (default `25 °C`; when `DHT11Type.DHT11_temperature_F` (`1`) is requested, return `Math.round(tempC * 1.8 + 32)`).
  - Humidity: `0..100 %` (default `60 %`).
- **CRITICAL INFINITE-LOOP TRAP in `Module-World.ts`**:
  - `dht11value` in [libs/Module-World/Module-World.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/Module-World/Module-World.ts#L106-L152) contains tight bit-banging `while (pins.digitalReadPin(dht11pin) == 1);` and `while (pins.digitalReadPin(dht11pin) == 0);` loops!
  - In the simulator, if `digitalReadPin` returns a static `0` or `1`, `dht11value` **hangs the browser tab in an infinite loop**.
  - **How to solve cleanly (Hardware + Simulator Safe)**:
    1. On real micro:bit hardware, `pins.digitalReadPin(dht11pin)` only ever returns `0` or `1`.
    2. In `Module-World.ts`, at the top of `dht11value` (after resolving `dht11pin`):
       ```typescript
       control.dmesg("wom:dht11:" + value_DNum + ":" + dht11type);
       let simVal = pins.digitalReadPin(dht11pin);
       if (simVal < 0) return -(simVal + 1000);
       ```
    3. In the simulator, when `dmesg("wom:dht11:" + value_DNum + ":" + dht11type)` runs, set `pin.value = -(result + 1000)` on `dht11pin` (e.g. for `25°C`, `pin.value = -1025`). Then `pins.digitalReadPin(dht11pin)` returns `-1025` (`< 0`), and `dht11value` immediately returns `-(-1025 + 1000) = 25` without entering the bit-banging `while` loops! On real hardware, `digitalReadPin` is `0` or `1` (`>= 0`), so hardware executes the normal DHT11 bit-banging protocol unchanged.

---

### 5.2 Digital Input Sensors: Button, IR, PIR, Collision (`wom_button`, `wom_ir`, `wom_pir`, `wom_collision`)
- **Blocks in `ModuleWorld_Digital`**:
  - `Button(value_DNum: mwDigitalNum, value: enButton): boolean`
  - `IR(value_DNum: mwDigitalNum, value: enObstacle): boolean`
  - `PIR(value_DNum: mwDigitalNum, value: enPIR): boolean`
  - `Collision(value_DNum: mwDigitalNum, value: enCollision): boolean`
- **Grid Footprint**: `1x1` (`colSpan: 1, rowSpan: 1`)
- **Sprites**:
  - Button: `/sim/sprites/wom_button.png` (`235 x 235`, pads on right edge)
  - IR: `/sim/sprites/wom_ir.png` (`254 x 254`, pads on top edge)
  - PIR: `/sim/sprites/wom_pir.png` (`255 x 254`, pads on left edge)
  - Collision: Custom SVG micro-switch with lever arm
- **Active Polarity (from enums in `Module-World.ts`)**:
  | Module | Active State Enum (`0` or `1`) | Idle State Enum (`0` or `1`) | Default `pin.value` |
  | :--- | :---: | :---: | :---: |
  | **Button** (`enButton`) | `Press = 0` (Active-Low) | `Release = 1` | `1` |
  | **IR** (`enObstacle`) | `Obstacle = 0` (Active-Low) | `NoObstacle = 1` | `1` |
  | **PIR** (`enPIR`) | `OPIR = 1` (Active-High) | `NPIR = 0` | `0` |
  | **Collision** (`enCollision`) | `OCollision = 0` (Active-Low) | `NCollision = 1` | `1` |
- **State Hook**:
  - All four blocks call `pins.setPull(...)` (or `pins.digitalWritePin(pin, 1)` in `PIR`) followed by `pins.digitalReadPin(pin) == value` on `pinA` (`decodeDigitalPort(value_DNum)[0]`).
  - Because `Pin.setPull()` in `sim/state/edgeconnectorsim.ts` overwrites `pin.value`, `class Pin` provides `pin.womDigitalValue: number` which takes precedence in `pxsim.pins.digitalReadPin(pinId)`.
  - Whenever your digital sensor module is created or toggled/hovered by the user, set `pin.womDigitalValue = currentDigitalValue` (`0` or `1`) on `getPinInstance(this.pins[0])` (and refresh it inside `updateState()`). See [sim/visuals/womIr.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/womIr.ts) for a complete working example.

---

### 5.3 Vibration Sensor (`wom_vibration`)
- **Block**: `ModuleWorld_Digital.Vibration(value_DNum: mwDigitalNum, handle: () => void): void`
- **Grid Footprint**: `1x1` (`colSpan: 1, rowSpan: 1`)
- **How `Vibration` Works in `Module-World.ts`**:
  - Configures `pins.setEvents( VbPin, PinEventType.Pulse )` and registers `control.onEvent( VbPin, DAL.MICROBIT_PIN_EVT_FALL, handle )` (`MICROBIT_PIN_EVT_FALL = 2`).
- **Simulator Hook**:
  - Add `control.dmesg("wom:vibration:" + value_DNum);` at the start of `Vibration(...)`.
  - Render a `1x1` card with a **"Shake!"** button.
  - When the user clicks **"Shake!"**, fire the micro:bit event bus on `pinA`:
    ```typescript
    const pinId = pinNameToId(this.pins[0]); // e.g. P0 -> 7
    runtime.board.bus.queue(pinId, 2); // DAL.MICROBIT_PIN_EVT_FALL = 2
    ```

---

### 5.4 Analog Sensors: Photoresistor (`wom_photoresistor`), Sound (`wom_sound`), Potentiometer (`wom_potentiometer`), Joystick (`wom_joystick`)
- **Blocks in `ModuleWorld_Analog`**:
  - `Light(value_ANum: mwAnalogNum): number` — **NOTE**: `Module-World.ts` computes `1024 - pins.analogReadPin(lightpin)`! So if the user sets the UI slider to `lightLevel` (`0..1023`), set the underlying `pin.value = 1024 - lightLevel` so `Light()` returns `lightLevel`!
  - `Sound(value_ANum: mwAnalogNum): number` — returns `pins.analogReadPin(soundpin)` directly (`0..1023`).
  - `Potentiometer(value_ANum: mwAnalogNum): number` — returns `pins.analogReadPin(pin)` (`0..1023`).
    - Use `/sim/sprites/wom_potentiometer.png` (`245 x 245`) as the base and overlay `/sim/sprites/potentiometer_rotor.svg` (`24 x 24`) centered on the gray shaft. Rotate the rotor from `-135°` (`0`) to `+135°` (`1023`) via `<g transform="translate(cx, cy) rotate(deg)">`.
  - `Rocker(value_ANum: mwAnalogNum, value: enRocker): number` — reads `pinA` for `Rocker_X` (`1`) and `pinB` for `Rocker_Y` (`2`).
    - Use `/sim/sprites/wom_joystick_base.png` (`362 x 364`) as the base and overlay `/sim/sprites/joystick_stick.svg` (`24 x 24`) in the center.
    - Allow 2D pointer dragging within a radius of `24 px` around center, mapping `(dx, dy)` to `X: 0..1023` (`pinA.value`) and `Y: 0..1023` (`pinB.value`). On `pointerup`, spring back to `(512, 512)`.

---

### 5.5 PWM & Actuators: RGB LED (`wom_rgb`), Buzzer (`wom_buzzer`), Vibration Motor (`wom_vibmot`)
- **RGB LED (`ModuleWorld_PWM.RGB` and `ModuleWorld_PWM.RGB2`)**:
  - Both functions hardcode pins `P12` (Red), `P13` (Green), `P14` (Blue).
  - Call `control.dmesg("wom:rgb:P12,P13,P14");` in **both** `RGB` and `RGB2`. Because both pass moduleType `"rgb"` and pins `["P12", "P13", "P14"]`, `WomModuleManager` automatically reuses the single `wom_rgb` module!
  - **Visual**: `1x1` card with `/sim/sprites/wom_rgb.png` (`234 x 234`). Overlay a `<circle>` on the central white LED package.
  - Read `P12`, `P13`, `P14` values (`0..1023`) from `EdgeConnectorState`, convert to `R, G, B` in `0..255` (`Math.round(val * 255 / 1023)`), and per [sim/public/sprites/README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/public/sprites/README.md), set:
    - `fill = rgb(${R}, ${G}, ${B})`
    - `fill-opacity = Math.min(1, (R + G + B) / (3 * 255))` (transparent when `0,0,0`).
- **Buzzer (`ModuleWorld_PWM.BuzzerPin`)**:
  - `BuzzerPin(pin: mwDigitalNumBuzzer): AnalogPin` returns `AnalogPin.P0..P10` (`100 + pinIndex`), which the user passes to `music.ringTone(...)` or `music.playTone(...)`.
  - Call `control.dmesg("wom:buzzer:" + pin);` inside `BuzzerPin`.
  - Note: `mwDigitalNumBuzzer` has 1-based enum values (`P0 = 1`, `P1 = 2`, `P2 = 3`, `P3 = 4`, `P4 = 5`, `P6 = 6`, `P8 = 7`, `P9 = 8`, `P10 = 9`).
  - **Visual**: `1x1` card with `/sim/sprites/wom_buzzer.png` (`240 x 240`). Show animated sound rings when `board().audioState.isPlaying()` is true.
- **Vibration Motor (`ModuleWorld_PWM.VibrationMot`)**:
  - `VibrationMot(pin: mwAnalogNum2, speed: number)` writes `pins.analogWritePin(pin, speed)` (`0..1023`) on `P1` (`1`), `P2` (`2`), or `P3` (`3`).
  - Call `control.dmesg("wom:vibmot:" + pin + ":" + speed);`.

---

### 5.6 Servos: 360° & 270° Positional (`wom_servo`) and Continuous (`wom_servo_continuous`)
- **Blocks in `ModuleWorld_PWM`**:
  - `Servo(pin: mwServoNum, value: number)` — maps `0..360°` to `500..2500 us` and calls `pins.servoSetPulse(Pin, v_us)`.
  - `Servo2(pin: mwServoNum, value: number)` — maps `0..270°` to `500..2500 us` and calls `pins.servoSetPulse(Pin, v_us)`.
- **Grid Footprint**: **`1x2` Vertical** (`colSpan: 1, rowSpan: 2`, `148 x 312 px`).
- **Sprites (from [sim/public/sprites/README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/public/sprites/README.md))**:
  - Base body: `/sim/sprites/wom_servo.png` (`445 x 758`) or `/sim/sprites/wom_servo_continuous.png` (`386 x 625`).
  - Rotor horn: `/sim/sprites/servo_rotor.svg` (`viewBox="0 0 400 120"`, **rotation pivot is at `(60, 60)`**, NOT the geometric center `(200, 60)`!).
  - To rotate the horn around `(60, 60)` at shaft position `(shaftX, shaftY)` on the servo body:
    ```xml
    <g transform="translate(shaftX, shaftY) scale(0.32) rotate(angleDeg) translate(-60, -60)">
        <image href="/sim/sprites/servo_rotor.svg" width="400" height="120" />
    </g>
    ```
- **CRITICAL Simulator Hook in [sim/state/edgeconnector.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/edgeconnector.ts#L93-L95)**:
  - `pxsim.pins.servoSetPulse(name: number, micros: number)` in `sim/state/edgeconnector.ts` is currently a `// TODO` stub!
  - Implement it by adding `servoPulse: number = 1500;` to `class Pin` in `sim/state/edgeconnector.ts` and updating `servoSetPulse`:
    ```typescript
    export function servoSetPulse(name: number, micros: number) {
        let pin = getPin(name);
        if (!pin) return;
        pin.servoPulse = micros;
        runtime.queueDisplayUpdate();
    }
    ```

---

### 5.7 Color Recognition Sensor (`wom_color`)
- **Blocks in `ModuleWorld_Color`**:
  - `GetRGBValue(value: enGetRGB): number` (`GetValueR = 0`, `GetValueG = 1`, `GetValueB = 2`, `GetValueH = 3`, hardcoded to I2C pins `P19` SCL, `P20` SDA).
- **Grid Footprint**: `1x1` (`colSpan: 1, rowSpan: 1`)
- **Sprite**: `/sim/sprites/wom_color_recognition.png` (`243 x 243`)
- **Simulator Hook**:
  - Add `control.dmesg("wom:color:P19,P20:" + value);` at the start of `GetRGBValue(value: enGetRGB)`.
  - Since `GetRGBValue` reads I2C via `pins.i2cReadNumber(0x29, NumberFormat.UInt16BE)` or returns `R/G/B/H`, you can either feed the color picker's `R, G, B` into `pxsim.pins.i2cReadNumber` in `sim/state/misc.ts` OR use the same hardware-safe `dmesg` + `i2cReadNumber` hook so `GetRGBValue` returns the exact `R` (`0..255`), `G` (`0..255`), `B` (`0..255`), or `H` (`0..360`) chosen in `<input type="color">`.

---

### 5.8 TM1650 4-Digit 7-Segment Display (`wom_tm1650`)
- **Package**: [libs/tm1650/tm1650.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/tm1650/tm1650.ts)
- **Grid Footprint**: **`2x1` Horizontal** (`colSpan: 2, rowSpan: 1`, `312 x 148 px`)
- **Sprite**: `/sim/sprites/wom_tm1650.png` (`1255 x 848`, ~1.48:1 horizontal)
- **Pins**: I2C bus `["P19", "P20"]` (`SCL = P19`, `SDA = P20`).
- **How `tm1650.ts` Communicates**:
  - Every command in `tm1650.ts` calls `pins.i2cWriteBuffer(addr, buf)`:
    - `addr = 0x24` (`COMMAND_I2C_ADDRESS`): `buf.data[0]` holds brightness (`bits 4..6`) and on/off state (`bit 0`: `1 = on`, `0 = off`).
    - `addr = 0x34, 0x35, 0x36, 0x37` (`DISPLAY_I2C_ADDRESS + digitIndex`): `buf.data[0]` holds the 8-bit 7-segment bitmask (`bit 0 = seg A`, `bit 1 = seg B`, `bit 2 = seg C`, `bit 3 = seg D`, `bit 4 = seg E`, `bit 5 = seg F`, `bit 6 = seg G`, `bit 7 = DP`).
- **Simulator Hook in [sim/state/misc.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/misc.ts#L109-L111)**:
  - Implement `pxsim.pins.i2cWriteBuffer(address: number, buf: RefBuffer, repeat: boolean)`:
    ```typescript
    export function i2cWriteBuffer(address: number, buf: RefBuffer, repeat: boolean) {
        const b = board();
        if (!b || !b.womManager || !buf || !buf.data || buf.data.length === 0) return;
        if (address === 0x24 || (address >= 0x34 && address <= 0x37)) {
            const mod = b.womManager.ensureModule<visuals.WomTm1650Module>("tm1650", ["P19", "P20"]);
            if (mod) {
                mod.onI2cWrite(address, buf.data[0]);
            }
        }
    }
    ```
  - Notice that hooking `i2cWriteBuffer` in `sim/state/misc.ts` requires **zero modifications** to `libs/tm1650/tm1650.ts` and supports `showNumber`, `showString`, `showHex`, `toggleDp`, `clear`, `on`, `off`, and `setIntensity` automatically!

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
   Must compile `sim/built/sim.js` and all bundled packages with zero errors.
3. **Behavioral Checks**:
   - Calling the same module block in a `forever` loop reuses the single spawned module instance.
   - Calling two different module types on overlapping pins shows the red `⚠️ Pin conflict` warning banner in the simulator and does not spawn the conflicting module.
   - `1x1`, `2x1`, and `1x2` modules pack cleanly into the 2D grid below the micro:bit without overlapping, and their Bezier wires connect only signal pins (`"P0"`..`"P20"`) to the micro:bit edge connector (`3v3` and `GND` wires must not be drawn).

# Architectural Notes & Codebase Findings: World of Modules (WoM) Simulator

This document records verified architectural findings, PXT compiler/simulator internals, and extension details for `libs/Module-World` and `libs/tm1650`. Always read [agents/ARCH.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/agents/ARCH.md) and [sim/public/sprites/README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/public/sprites/README.md) alongside this file.

---

## 1. PXT Simulator & Compiler Internals (Verified in `pxt.js` & `pxtsim.js`)

### 1.1 Why Custom `//% shim=...` on Functions with TypeScript Bodies Fails
In `node_modules/pxt-core/built/pxt.js`:
- **Simulator compilation (`isNative === false`)**: `hasShimDummy(decl)` (line 136745) returns `true` whenever a function has a non-empty TypeScript body (`f.body && f.body.statements.length > 0`). When emitting calls (line 136044), `if (attrs.shim && !hasShimDummy(decl)) return emitShim(...); return emitPlain();` means **any function with a TS body ignores `//% shim=...` in the simulator** and executes its TypeScript body instead.
- **Hardware compilation (`isNative === true`)**: `pxtc.hexfile.validateShim` (line 140680) checks every `//% shim=...` against the precompiled C++ firmware jump table. If you put a fake shim name (such as `//% shim=ModuleWorld_Digital::Ultrasonic`) on a function, hardware `.hex` compilation throws `function not found: ...`.
- **Correct Hardware + Simulator Bridge**:
  - Keep the original TypeScript bodies in `libs/Module-World/Module-World.ts` and `libs/tm1650/tm1650.ts` so micro:bit hardware continues to work natively.
  - At the start of each exported block function in `Module-World.ts` (or `tm1650.ts`), call `control.dmesg("wom:<moduleType>:<pinArg>")`.
  - `control.dmesg(s: string)` is a built-in C++ shim in `libs/core/shims.d.ts` (`//% shim=control::dmesg`) that is a harmless no-op on micro:bit hardware (`CODAL_DMESG` disabled in production) and calls `pxsim.control.dmesg(s)` in `sim/state/misc.ts` in the simulator!
  - Inside `pxsim.control.dmesg`, parse `"wom:<moduleType>:<pinArg>"` to:
    1. Spawn or reuse the visual module in `WomModuleManager` (strictly keyed by pin set, or show a warning if any pin is already claimed by a different module type).
    2. Prime or synchronize the virtual pin state (`EdgeConnectorState` / `WomSensorState`) so the TypeScript body's `pins.pulseIn`, `pins.digitalReadPin`, `pins.analogReadPin`, `pins.analogWritePin`, `pins.servoSetPulse`, or `pins.i2cWriteBuffer` reads/writes the exact interactive simulator values.

### 1.2 Why `pxtparts.json` and `//% parts="..."` Must NOT Be Used for WoM Modules
In `node_modules/pxt-core/built/pxtsim.js` (`BoardHost` lines 776–805 and `Allocator` lines 213–700):
- Defining a part in `pxtparts.json` and annotating a block with `//% parts="..."` forces `BoardHost` to display a 30-column 1D solderless breadboard (`this.breadboard`) and run `Allocator.allocateDefinitions`.
- `pxsim.readPin` fails to parse composite port enums like `ModuleWorld_Digital.mwDigitalNum.P0P1` (`"P0P1"` is not a micro:bit pin), causing `allocWire` to return `undefined` and silently drop the part.
- Static `trackArgs` in `pxt.js` only deduplicates within a single block's part name and cannot enforce cross-block or cross-module pin ownership or display pin conflict warnings.
- **Solution**: Do **not** add WoM or TM1650 modules to `pxtparts.json` and do **not** add `//% parts="..."` to their blocks. Manage all WoM module visuals, 2D layout, strict pin-set registration, conflict warnings, and Bezier wiring dynamically via `WomModuleManager` attached to `DalBoard`.

### 1.3 Micro:bit Board Coordinate System (`sim/visuals/microbit.ts`)
- `MicrobitBoardSvg` sets initial SVG `viewBox="0 0 500 430"`.
- `boardSvg.getCoord(pinName)` returns `[centerX, centerY]` of any edge connector pad in SVG coordinates (`y` is around `370–400`).
- **Exact Pin Names in `sim/visuals/microbit.ts` (line 216)**:
  - Power: `"+3v3"` (NOT `"3V"` or `"VCC"`!)
  - Ground: `"GND"`, `"GND0"`, `"GND1"`
  - GPIO: `"P0"`, `"P1"`, `"P2"`, `"P3"`, `"P4"`, `"P5"`, `"P6"`, `"P7"`, `"P8"`, `"P9"`, `"P10"`, `"P11"`, `"P12"`, `"P13"`, `"P14"`, `"P15"`, `"P16"`, `"P19"`, `"P20"`
- Always place the WoM module container `<g class="wom-board-area">` starting at `y = 445` (below the micro:bit) and dynamically expand `boardSvg.element.setAttribute("viewBox", "0 0 500 " + totalHeight)` whenever modules or warning banners are added.
- **Alphabetical `outFile` Ordering (`/// <reference path="./womManager.ts" />`)**:
  - `sim/tsconfig.json` uses `"outFile": "../built/sim.js"` with `"visuals/*.ts"`. TypeScript orders matched glob files alphabetically unless directed by `/// <reference path="..." />`.
  - Any module file whose name alphabetically precedes `womManager.ts` (e.g. `womButton.ts`, `womBuzzer.ts`, `womColor.ts`, `womDht11.ts`, `womIr.ts`, `womJoystick.ts`) **must** begin with `/// <reference path="./womManager.ts" />` so `WomModuleManager` is emitted before `WomModuleManager.registerFactory(...)` runs.

### 1.4 Unimplemented Simulator Stubs in Base Repo That Must Be Hooked
1. **`pxsim.pins.servoSetPulse(name: number, micros: number)`** in [sim/state/edgeconnector.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/edgeconnector.ts#L93-L95):
   - Currently has `// TODO` and does nothing!
   - `ModuleWorld_PWM.Servo` and `ModuleWorld_PWM.Servo2` use `pins.servoSetPulse(pin, v_us)` (NOT `pins.servoWritePin`).
   - Must be updated to store `pin.servoPulse = micros` on the `Pin` object (and notify `WomModuleManager` / `runtime.queueDisplayUpdate()`).
2. **`pxsim.pins.i2cWriteBuffer(address: number, buf: RefBuffer, repeat: boolean)`** in [sim/state/misc.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/state/misc.ts#L109-L111):
   - Currently a no-op.
   - `libs/tm1650/tm1650.ts` writes 1-byte buffers (`buf.data[0]`) to I2C address `0x24` (`COMMAND_I2C_ADDRESS`) and `0x34..0x37` (`DISPLAY_I2C_ADDRESS + 0..3`).
   - Hooking `i2cWriteBuffer` for addresses `0x24` and `0x34..0x37` lets TM1650 work automatically on I2C pins `P19` (SCL) and `P20` (SDA).
3. **`ModuleWorld_Digital.dht11value` Infinite Loop Hazard** in [libs/Module-World/Module-World.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/libs/Module-World/Module-World.ts#L106-L152):
   - `dht11value` bit-bangs DHT11 using `while (pins.digitalReadPin(dht11pin) == 1);` and `while (pins.digitalReadPin(dht11pin) == 0);`.
   - In the simulator, if `digitalReadPin` returns a static `0` or `1`, the first or second `while` loop spins forever and freezes the browser tab!
   - Solution: When `control.dmesg("wom:dht11:" + value_DNum + ":" + dht11type)` is called, if `pins.digitalReadPin(dht11pin)` is hooked or if `dht11value` checks a simulator fast-path (or `digitalReadPin` toggles through the 40-bit frame), it returns the exact temperature/humidity from the DHT11 module slider without hanging. (Even simpler and faster: in `dht11value`, right after `control.dmesg(...)`, if `pxsim` sets a virtual state or if `digitalReadPin` returns a simulated value, see Section 5.2 of `ARCH.md` for the exact 3-line hardware-safe fast-path).

---

## 2. Strict Pin-Set Registry & Conflict Detection Rule

Per project requirements:
1. **Strict Pin-Set Keying Across All Modules**:
   - Every module instance claims a canonical sorted set of micro:bit signal pins (e.g. `["P0", "P1"]` → key `"P0,P1"`, or `["P1"]` → key `"P1"`).
2. **Reuse on Same Module Type + Same Pin Set**:
   - If a block is called with a pin set that is already registered to a module of the **same `moduleType`** (for example, `Ultrasonic(P0P1)` called in a `forever` loop, or `dht11value(TempC, P0P1)` followed by `dht11value(Humidity, P0P1)`, or `RGB(...)` followed by `RGB2(...)` on `P12,P13,P14`), `WomModuleManager` **reuses** the existing module instance.
3. **Warn & Reject on Pin Conflict Across Different Modules**:
   - If a block attempts to use **any pin** that is already owned by a **different `moduleType`** (or a partially overlapping pin set, e.g., `Ultrasonic` on `P0,P1` followed by `PIR` on `P0,P1` or `Button` on `P1,P10`), `WomModuleManager`:
     - Does **not** spawn the conflicting module.
     - Displays a prominent visual warning banner in the simulator SVG (e.g. `⚠️ Pin Conflict: Pin(s) P0, P1 already used by Ultrasonic (wom_ultrasonic); cannot attach PIR (wom_pir)`) and logs `console.warn(...)`.
4. **Reset on Simulator Restart**:
   - When the user stops/restarts the simulator or changes code (`DalBoard` constructor / `initAsync`), all module instances, pin registrations, and warnings are cleared cleanly.

---

## 3. Complete Extension Catalog (`libs/Module-World` & `libs/tm1650`)

### 3.1 Port Enum Values & Pin Mappings in `libs/Module-World/Module-World.ts`

#### `ModuleWorld_Digital.mwDigitalNum` (Dual-Pin Digital Port)
| Enum Member | Numeric Value | Primary Signal Pin (`pinA`) | Secondary Signal Pin (`pinB`) |
| :--- | :---: | :---: | :---: |
| `P0P1` | `1` | `P0` | `P1` |
| `P2P3` | `2` | `P2` | `P3` |
| `P3P4` | `3` | `P3` | `P4` |
| `P4P5` | `4` | `P4` | `P5` |
| `P6P7` | `5` | `P6` | `P7` |
| `P8P9` | `6` | `P8` | `P9` |
| `P10P11` | `7` | `P10` | `P11` |
| `P12P13` | `8` | `P12` | `P13` |
| `P14P15` | `9` | `P14` | `P15` |
| `P1P10` | `10` | `P1` | `P10` |

> **Important Note on Single-Wire Digital Modules**:
> In `Module-World.ts`, `Ultrasonic` uses both pins (`Trig = pinA`, `Echo = pinB`), whereas `dht11value`, `IR`, `PIR`, `Collision`, `Button`, and `Vibration` only read `pinA` (`P0`, `P2`, `P3`, `P4`, `P6`, `P8`, `P10`, `P12`, `P14`, or `P1`). However, because the physical 4-pin Grove/PH2.0 cable plugs into the 2-pin port (`value_DNum`), keying by the port's pin pair `["P0", "P1"]` (or `pinA` + `pinB`) accurately reflects the physical connector!

#### `ModuleWorld_Analog.mwAnalogNum` (Dual-Pin Analog Port)
| Enum Member | Numeric Value | Primary Pin (`pinA`) | Secondary Pin (`pinB`) |
| :--- | :---: | :---: | :---: |
| `AP0P1` | `1` | `P0` | `P1` |
| `AP2P3` | `2` | `P2` | `P3` |
| `AP3P4` | `3` | `P3` | `P4` |

- `Light`, `Sound`, `Potentiometer` read `pinA` (`P0`, `P2`, or `P3`).
- `Rocker` (Joystick) reads `pinA` for `X` (`Rocker_X`) and `pinB` for `Y` (`Rocker_Y`).

#### `ModuleWorld_PWM.mwServoNum` (Dual-Pin PWM/Servo Port)
| Enum Member | Numeric Value | Primary Pin (`pinA`) | Secondary Pin (`pinB`) |
| :--- | :---: | :---: | :---: |
| `P1` | `1` | `P1` | `P10` (on physical port `P1P10`, or single pin `P1`) |
| `P2` | `2` | `P2` | `P3` |
| `P3` | `3` | `P3` | `P4` |
| `P4` | `4` | `P4` | `P5` |
| `P10` | `5` | `P10` | `P11` |

#### Fixed-Pin & I2C Modules
- **`ModuleWorld_PWM.RGB` & `RGB2`**: Hardcoded to `P12` (Red), `P13` (Green), `P14` (Blue).
- **`ModuleWorld_Color` (Color Recognition Sensor)**: Hardcoded to I2C bus `P19` (SCL) and `P20` (SDA) (`i2cAddr = 0x29`).
- **`tm1650` (4-Digit 7-Segment Display)**: Uses I2C bus `P19` (SCL) and `P20` (SDA) (`COMMAND_I2C_ADDRESS = 0x24`, `DISPLAY_I2C_ADDRESS = 0x34..0x37`).

---

## 4. Sprite Assets & Grid Footprints (`sim/public/sprites/`)

All module visuals should render the PNG/SVG sprites in `/sim/sprites/<filename>` (served from `sim/public/sprites/`). See [sim/public/sprites/README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/public/sprites/README.md) for full details:

| Module ID | Sprite File(s) | Native Size | Grid Span (`colSpan x rowSpan`) | Interactive / Dynamic Overlay |
| :--- | :--- | :---: | :---: | :--- |
| `wom_ultrasonic` | `wom_ultrasonic.png` | `297x203` | **`2x1`** (Horizontal) | Distance slider (`0–300 cm`) |
| `wom_tm1650` | `wom_tm1650.png` | `1255x848` | **`2x1`** (Horizontal) | 4-digit 7-segment SVG overlay |
| `wom_servo` | `wom_servo.png` + `servo_rotor.svg` | `445x758` | **`1x2`** (Vertical) | Rotating horn (`0°–270°` or `0°–360°`, pivot `(60,60)`) |
| `wom_servo_continuous` | `wom_servo_continuous.png` + `servo_rotor.svg` | `386x625` | **`1x2`** (Vertical) | Rotating/spinning horn (pivot `(60,60)`) |
| `wom_dht11` | `wom_dht11.png` | `241x243` | **`1x1`** (Square) | Temp (`0–50°C` / `32–122°F`) & Humidity (`0–100%`) sliders |
| `wom_button` | `wom_button.png` | `235x235` | **`1x1`** (Square) | Click/hold red cap on PCB (`active-low`: pressed=`0`, released=`1`) |
| `wom_ir` | `wom_ir.png` | `254x254` | **`1x1`** (Square) | Obstacle toggle switch (`obstacle=0`, `clear=1`) |
| `wom_pir` | `wom_pir.png` | `255x254` | **`1x1`** (Square) | Motion toggle switch (`motion=1`, `idle=0`) |
| `wom_photoresistor` | `wom_photoresistor.png` | `245x245` | **`1x1`** (Square) | Light slider (`0–1023`; note `Light()` returns `1024 - analogReadPin`) |
| `wom_potentiometer` | `wom_potentiometer.png` + `potentiometer_rotor.svg` | `245x245` | **`1x1`** (Square) | Draggable rotary knob (`0–1023`, `-135°` to `+135°`) |
| `wom_joystick` | `wom_joystick_base.png` + `joystick_stick.svg` | `362x364` | **`1x1`** (Square) | 2D draggable thumbstick (`X: 0–1023`, `Y: 0–1023`, springs back to `512,512`) |
| `wom_rgb` | `wom_rgb.png` | `234x234` | **`1x1`** (Square) | Glowing `<circle>` over central LED (`opacity = (R+G+B)/255`) |
| `wom_buzzer` | `wom_buzzer.png` | `240x240` | **`1x1`** (Square) | Animated sound waves + frequency readout when active |
| `wom_color` | `wom_color_recognition.png` | `243x243` | **`1x1`** (Square) | Color picker (`<input type="color">`) feeding R/G/B/H |
| `wom_sound` | Custom PCB or shared sensor card | — | **`1x1`** (Square) | Sound level slider (`0–1023`) |
| `wom_collision` | Custom PCB or switch card | — | **`1x1`** (Square) | Micro-lever toggle/momentary button (`collision=0`, `normal=1`) |
| `wom_vibration` | Custom PCB or shake card | — | **`1x1`** (Square) | "Shake!" button firing `DAL.MICROBIT_PIN_EVT_FALL` + pulse |
| `wom_vibmot` | Custom PCB or motor card | — | **`1x1`** (Square) | Vibrating motor animation when PWM/digital output > 0 |

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
  - Any module file whose name alphabetically precedes `womManager.ts` (e.g. `womButton.ts`, `womColor.ts`, `womDht11.ts`, `womIr.ts`, `womJoystick.ts`) **must** begin with `/// <reference path="./womManager.ts" />` so `WomModuleManager` is emitted before `WomModuleManager.registerFactory(...)` runs.

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

### 1.5 `pxsim.control.dmesg` Overwriting Hazard & Centralized Runtime Hooks
- In `sim/tsconfig.json`, `pxt-common-packages/libs/base/sim/control.ts` is compiled **after** `sim/visuals/*.ts`.
- If `pxsim.control.dmesg` is hooked at top-level module load time (or defined in `sim/state/misc.ts`), `control.ts` executes later in `built/sim.js` and overwrites `control.dmesg = dmesg`.
- **Solution (Already Implemented in [sim/visuals/womManager.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/visuals/womManager.ts))**:
  - `WomModuleManager.installHooks()` wraps `pxsim.control.dmesg`, `pxsim.pins.digitalReadPin`, `pxsim.pins.analogReadPin`, `pxsim.pins.pulseIn`, `pxsim.pins.servoSetPulse`, `pxsim.pins.i2cWriteBuffer`, and `pxsim.pins.i2cReadBuffer` at runtime when `WomModuleManager.initBoard(this)` runs in `DalBoard.initAsync` ([sim/dalboard.ts](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/dalboard.ts#L184)).
  - Each wrapped function is tagged with `(fn as any)._womHook = true` rather than a static boolean flag, guaranteeing idempotency and survival across script load order.
  - Because all pin hooks live inside `sim/visuals/womManager.ts`, **core simulator files (`sim/state/edgeconnector.ts`, `sim/state/edgeconnectorsim.ts`, `sim/state/misc.ts`) remain 100% unmodified** and agents adding new modules never need to edit `sim/dalboard.ts` or `sim/state/*`.

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
5. **LED Matrix & Light Sensor Shared Pin Warning (Orange Banner)**:
   - Pins `P3`, `P4`, `P6`, `P7`, `P9`, and `P10` (`LED_SHARED_PINS`) are multiplexed with the 5x5 LED matrix columns/rows and light sensing on micro:bit V2.
   - On hardware, `uBit.display.enable()` runs at boot, requiring `led.enable(false)` to free these pins for GPIO/analog use.
   - The warning is checked **only on module initialization** when the module is first started/spawned in `ensureModule`, avoiding repeated checks or overhead on subsequent command calls.
   - If these pins are used by an external module upon initialization before `led.enable(false)` is invoked (or while `led.enable(true)` is set), `WomModuleManager` shows an orange banner (`fill="#c2410c"`, `stroke="#fdba74"`): `⚠️ Pin conflict on <pins>: pin(s) shared with micro:bit LED screen; call led.enable(false) to use for <module>.`
   - If `defaultLedState` is `false`, the warning only triggers when the LED module is active in photosensitive mode (`input.lightLevel()`) or LED showing mode (`basic.showLeds`, `showNumber`, `showString`, `showIcon`, `led.plot`, `animationQ`, or non-zero pixel data).
   - Unlike red pin conflicts (which block module spawning due to two external devices colliding), orange warnings permit module spawning so visual wiring to the edge connector remains visible while alerting the developer.

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

#### `ModuleWorld_PWM.mwServoNum` (Servo Signal Pins)
| Enum Member | Numeric Value | Signal Pin |
| :--- | :---: | :---: |
| `P1` | `1` | `P1` |
| `P4` | `2` | `P4` |
| `P2` | `3` | `P2` |
| `P10` | `4` | `P10` |

- A servo only connects to a single signal pin (`P1`, `P4`, `P2`, or `P10`). `decodeServoPort` maps each enum strictly to its single pin `["P1"]`, `["P4"]`, `["P2"]`, or `["P10"]`.
- **Positional Servo Animation & Interactive Controls**:
  - **Upward 0° Default**: The rotor arm faces upward at 0° (`visualDeg = angleDeg - 90`), rotating clockwise as positive angles increase.
  - **Occlusion of Mode Label**: The "360" / "270" mode label is positioned higher (`y: 165`), allowing the rotor arm (which reaches $y \approx 203.2$ pointing downwards at 180°) to sweep directly across and visually occlude it.
  - **"Geekservo" Branding**: Unselectable darkened string (`opacity: 0.22`, `font-size: 19px`, `font-weight: 900`, `letter-spacing: 1.5px`) across the servo at $y = 228$. Displayed exclusively on the front ('f') side.
  - **Front/Back (`'f'` / `'b'`) Toggle**: Circular button (`cx: 25, cy: 246, r: 14.3`) positioned inside the servo housing at the bottom-left. Toggling between front (`'f'`, tooltip "front") and back (`'b'`, tooltip "back") reflects state across the vertical axis: `angleFromUp = (360 - normFront) % 360` (and continuous rotation direction is inverted: `targetRpm = -targetRpm`). The "Geekservo" text is hidden in back mode.
  - **0 Degree Position Selection & Default Rotation Button**: White circular button on the bottom-right (`cx: 123, cy: 246, r: 14.3`, fill `#ffffff`, stroke `#94a3b8`) with tooltip "0 degree position" containing a miniature rotor horn centered at the circle's rotational center. Available strictly for positional servos (hidden in continuous mode). Clicking it cycles the default 0° position by +90° ($0^\circ \to 90^\circ \to 180^\circ \to 270^\circ \to 0^\circ$). Because the rotation relative to upwards is applied before back mode reflection, switching to back mode reflects the visible default rotation both on the button and the main horn: $0^\circ \leftrightarrow 0^\circ$ (unchanged), $180^\circ \leftrightarrow 180^\circ$ (unchanged), $90^\circ \leftrightarrow 270^\circ$ (reflected).
  - Positional modes (`"360"` and `"270"`) interpolate from `currentAngle` to `targetAngle` at `POSITIONAL_SPEED_DEG_PER_SEC` degrees per second.
  - If a new pulse command arrives while transitioning, `targetAngle` is retargeted immediately, and the animation continues seamlessly towards the new goal without snapping or restarting from 0.
  - The badge text dynamically updates with `Math.round(currentAngle) + "°"` as the shaft turns. Continuous mode uses `targetRpm` with infinite loop rotation.

#### Fixed-Pin & I2C Modules
- **`ModuleWorld_PWM.RGB` & `RGB2`**: Hardcoded to `P12` (Red), `P13` (Green), `P14` (Blue).
- **`Module_World_Color` (Color Recognition Sensor)**: Hardcoded to I2C bus `P19` (SCL) and `P20` (SDA) (`COLOR_ADD = 0x53`, registers `COLOR_R = 0x10`, `COLOR_G = 0x0D`, `COLOR_B = 0x13`).
- **`tm1650` (4-Digit 7-Segment Display)**: Uses I2C bus `P19` (SCL) and `P20` (SDA) (`COMMAND_I2C_ADDRESS = 0x24`, `DISPLAY_I2C_ADDRESS = 0x34..0x37`).

---

## 4. Sprite Assets & Grid Footprints (`sim/public/sprites/`)

All module visuals render PNG/SVG sprites located in `sim/public/sprites/`. Always specify them using relative paths (e.g. `sprites/<filename>` or through `WomModuleManager.resolveAssetUrl(url)` / `this.setImageHref(el, url)`):

> **Static Deployment & URL Resolution**:
> When deploying MakeCode via `pxt staticpkg --githubpages --route <repo-name>`, the app is hosted under `https://<user>.github.io/<repo-name>/`.
> The simulator iframe runs at `https://<user>.github.io/<repo-name>/simulator.html`.
> Assets in `sim/public/sprites/` are packaged alongside `simulator.html` at `https://<user>.github.io/<repo-name>/sprites/`.
> - If code uses an absolute path `"/sim/sprites/..."`, the browser attempts to fetch `https://<user>.github.io/sim/sprites/...` (root domain + non-existent `/sim/` folder), causing a **404 Not Found**.
> - Relative paths `"sprites/..."` resolve relative to `simulator.html` seamlessly in both `pxt serve` (`/sim/simulator.html` -> `/sim/sprites/...`) and GitHub Pages (`/<repo>/simulator.html` -> `/<repo>/sprites/...`).
> - `WomModuleManager.resolveAssetUrl(url)` automatically strips leading `/sim/` or `/` so any legacy or absolute URLs are safely normalized.
> - Offline caching: Both `sim/public/sim.manifest` and `sim/public/workerConfig.js` list all sprite assets so PXT's service worker caches them for offline use.

See [sim/public/sprites/README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/sim/public/sprites/README.md) for full details:

| Module ID | Sprite File(s) | Native Size | Grid Span (`colSpan x rowSpan`) | Interactive / Dynamic Overlay |
| :--- | :--- | :---: | :---: | :--- |
| `wom_ultrasonic` | `wom_ultrasonic.png` | `297x203` | **`2x1`** (Horizontal) | Distance slider (`0–300 cm`) |
| `wom_tm1650` | `wom_tm1650.png` | `1255x848` | **`2x1`** (Horizontal) | 4-digit 7-segment SVG red `<line>` overlay (`SEGMENTS_D0` in `1255x848` space, `DIGIT_STEP_X = 198.15`, `showCardBackground: false`, `spriteBounds = { x: 55.37, y: 1, width: 201.26, height: 136 }`; lazy `on()` init in `libs/tm1650/tm1650.ts` so unused projects do not emit I2C `0x24` writes at boot) |
| `wom_servo` | `wom_servo.png` + `servo_rotor.svg` | `445x758` | **`1x2`** (Vertical) | Rotating horn (`0°–270°` or `0°–360°`, pivot `(60,60)`, shaft `(74, 108)`). Positional transition is animated smoothly at 720°/s (2 full rotations per second); goal changes in flight immediately retarget the transition from the current in-flight angle. Front/back view toggle button (`f`/`b`) at `(30, 238)` translates angle to `(180 - angle)`. 0° position selection button at `(118, 238)` cycles default visual orientation by +90° increments with live miniature horn preview. Ukrainian tooltip localization supported ("Передня сторона", "Задня сторона", "Позиція в стані 0") via MakeCode internal language detection (`PXT_LANG` cookie, `window.parent.pxt.Util.userLanguage()`). Status text is placed at `y = 275` directly below the sprite, eliminating the ~48px gap from the 1x2 grid cell. |
| `wom_servo_continuous` | `wom_servo_continuous.png` + `servo_rotor.svg` | `386x625` | **`1x2`** (Vertical) | Rotating/spinning horn (pivot `(60,60)`, shaft `(74, 108)`). Front/back view toggle button (`f`/`b`) at `(30, 238)` reverses RPM direction and updates CW/CCW badge text. Ukrainian tooltip localization supported ("Передня сторона", "Задня сторона") via MakeCode internal language detection. Status text at `y = 275`. |
| `wom_dht11` | `wom_dht11.png` + `dht_*.svg` | `241x243` | **`1x1`** (Square) | Dual vertical sliders: Left retro thermometer (0–50°C, blue->red) & Right humidity (0–100%, grey->blue, text blue->white, weather icons). Changing temp dynamically modulates RH per Magnus formula; water capped at 100% saturation and excess discarded upon cooling |
| `wom_button` | `wom_button.png` | `235x235` | **`1x1`** (Square) | Click/hold red cap on PCB (`active-low`: pressed=`0`, released=`1`) |
| `wom_ir` | `wom_ir.png` | `254x254` | **`1x1`** (Square) | Obstacle toggle switch (`obstacle=0`, `clear=1`) |
| `wom_pir` | `wom_pir.png` + `pir_hand.svg` + `pir_robot.svg` | `255x254` | **`1x1`** (Square) | Draggable warm hand & cold robot circles; red ray arrow to sensor center obstructed by robot; kinematic energy model (0–1023) with ~2s decay |
| `wom_photoresistor` | `wom_photoresistor.png` | `245x245` | **`1x1`** (Square) | Light slider (`0–1023`; note `Light()` returns `1024 - analogReadPin`) |
| `wom_potentiometer` | `wom_potentiometer.png` + `potentiometer_rotor.svg` | `245x245` | **`1x1`** (Square) | Draggable rotary knob (`0–1023`, `-135°` to `+135°`) |
| `wom_joystick` | `wom_joystick_base.png` + `joystick_stick.svg` | `362x364` | **`1x1`** (Square) | 2D draggable thumbstick (`X: 0–1023`, `Y: 0–1023`, springs back to `512,512`, `maxRadius = 12`, pointer sensitivity scaled by `0.5`) |
| `wom_rgb` | `wom_rgb.png` | `234x234` | **`1x1`** (Square) | Glowing `<circle>` over central LED (`opacity = (R+G+B)/255`) |
| `wom_color` | `wom_color_recognition.png` | `243x243` | **`1x1`** (Square) | 4 draggable colored circles (Red, Green, Blue, Yellow) with gravity (`floorY = 123`); proximity model around `(74, 72)` (`detectRadius = 42`, `deadCenterRadius = 3.5`) interpolating from `(100,100,100)` + noise (`0..10`, median `5`) to pure target RGB at dead center with 0 noise |
| `wom_sound` | Custom PCB or shared sensor card | — | **`1x1`** (Square) | Sound level slider (`0–1023`) |
| `wom_collision` | Custom PCB or switch card | — | **`1x1`** (Square) | Micro-lever toggle/momentary button (`collision=0`, `normal=1`) |
| `wom_vibration` | Custom PCB or shake card | — | **`1x1`** (Square) | "Shake!" button firing `DAL.MICROBIT_PIN_EVT_FALL` + pulse |
| `wom_vibmot` | Custom PCB or motor card | — | **`1x1`** (Square) | Vibrating motor animation when PWM/digital output > 0 |

---

## 4. Editor Signature Theme & Background Grid Customization

- **Signature Orange Theme & Site Icon**:
  - The signature theme has been customized to micro:bit orange (`#ff8b27`) in `theme/color-themes/microbit-light.json`, `theme/site/globals/site.variables`, `theme/style.less`, and `pxtarget.json` (`appTheme.accentColor: "#ff8b27"`).
  - In `microbit-light.json`: `pxt-header-background`, `pxt-secondary-background`, and `pxt-tertiary-background` are set to `#ff8b27`, with foreground `#FFFFFF`, hover `#e67613`, and stencil `#cc6600`.
  - In `theme/site/globals/site.variables`: `@mainMenuInvertedBackground: @orange;`, `@tutorialSelectedMenuColor: @orange;`, `@cloudCardBackground: @orange;`, `@cloudStatusColor: @orange;`, and `@teachingBubbleBackgroundColor: @orange;`.
  - In `theme/style.less`: `.time-machine-header { background-color: @orange; color: #fff; }`.
  - In `theme/color-themes/overrides/microbit-light-overrides.css`: `#mainmenu.ui.inverted.menu` items and icons use `color: var(--pxt-header-foreground) !important;`.
  - **Site Favicon & App Icons**: All site icons (`docs/static/icons/apple-touch-icon*.png`, `android-chrome*.png`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon.ico`, `docs/favicon.ico`, and `docs/static/favicon.png`) have been regenerated with the vibrant `#ff8b27` orange background and clean centered white micro:bit logo. `faviconDescription.json` and `pxtarget.json` reflect the updated orange background color and theme color.
- **Dotted Background with Bigger, Pale Dots**:
  - In `pxtarget.json`: `blocklyOptions.grid` is configured as `{ "spacing": 28, "length": 2, "colour": "rgba(255, 139, 39, 0.22)", "snap": false }`.
  - In `theme/color-themes/overrides/microbit-light-overrides.css`: Applied a repeating pale radial dot pattern (`radial-gradient(circle, rgba(255, 139, 39, 0.22) 2.5px, transparent 2.5px)` with `background-size: 28px 28px`) across `svg.blocklySvg`, `#blocksArea`, `.injectionDiv`, `.monaco-editor`, `#filelist, #editortools`, `#simulator .editor-sidebar`, and `#boardview`. Set `.blocklyMainBackground { fill: transparent !important; }` so the CSS dotted pattern shines cleanly through the Blockly SVG layer.


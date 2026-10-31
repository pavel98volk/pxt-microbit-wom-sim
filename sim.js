/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../libs/core/dal.d.ts"/>
/// <reference path="../libs/core/enums.d.ts"/>
var pxsim;
(function (pxsim) {
    class DalBoard extends pxsim.CoreBoard {
        constructor() {
            super();
            this.speakerEnabled = true;
            // board hardware version
            this.hardwareVersion = 1;
            // components
            this.lightState = {};
            this.fileSystem = new pxsim.FileSystemState();
            this.controlMessageState = new pxsim.ControlMessageState(this);
            this.builtinParts["ledmatrix"] = this.ledMatrixState = new pxsim.LedMatrixState(pxsim.runtime);
            this.builtinParts["buttonpair"] = this.buttonPairState = new pxsim.ButtonPairState({
                ID_BUTTON_A: 1 /* DAL.MICROBIT_ID_BUTTON_A */,
                ID_BUTTON_B: 2 /* DAL.MICROBIT_ID_BUTTON_B */,
                ID_BUTTON_AB: 3 /* DAL.MICROBIT_ID_BUTTON_AB */,
                BUTTON_EVT_UP: 2 /* DAL.MICROBIT_BUTTON_EVT_UP */,
                BUTTON_EVT_CLICK: 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */
            });
            this.builtinParts["edgeconnector"] = this.edgeConnectorState = new pxsim.EdgeConnectorState({
                pins: [
                    100 /* DAL.MICROBIT_ID_IO_P0 */,
                    101 /* DAL.MICROBIT_ID_IO_P1 */,
                    102 /* DAL.MICROBIT_ID_IO_P2 */,
                    103 /* DAL.MICROBIT_ID_IO_P3 */,
                    104 /* DAL.MICROBIT_ID_IO_P4 */,
                    105 /* DAL.MICROBIT_ID_IO_P5 */,
                    106 /* DAL.MICROBIT_ID_IO_P6 */,
                    107 /* DAL.MICROBIT_ID_IO_P7 */,
                    108 /* DAL.MICROBIT_ID_IO_P8 */,
                    109 /* DAL.MICROBIT_ID_IO_P9 */,
                    110 /* DAL.MICROBIT_ID_IO_P10 */,
                    111 /* DAL.MICROBIT_ID_IO_P11 */,
                    112 /* DAL.MICROBIT_ID_IO_P12 */,
                    113 /* DAL.MICROBIT_ID_IO_P13 */,
                    114 /* DAL.MICROBIT_ID_IO_P14 */,
                    115 /* DAL.MICROBIT_ID_IO_P15 */,
                    116 /* DAL.MICROBIT_ID_IO_P16 */,
                    0,
                    0,
                    119 /* DAL.MICROBIT_ID_IO_P19 */,
                    120 /* DAL.MICROBIT_ID_IO_P20 */
                ],
                servos: {
                    "P0": 100 /* DAL.MICROBIT_ID_IO_P0 */,
                    "P1": 101 /* DAL.MICROBIT_ID_IO_P1 */,
                    "P2": 102 /* DAL.MICROBIT_ID_IO_P2 */,
                    "P3": 103 /* DAL.MICROBIT_ID_IO_P3 */,
                    "P4": 104 /* DAL.MICROBIT_ID_IO_P4 */,
                    "P5": 105 /* DAL.MICROBIT_ID_IO_P5 */,
                    "P6": 106 /* DAL.MICROBIT_ID_IO_P6 */,
                    "P7": 107 /* DAL.MICROBIT_ID_IO_P7 */,
                    "P8": 108 /* DAL.MICROBIT_ID_IO_P8 */,
                    "P9": 109 /* DAL.MICROBIT_ID_IO_P9 */,
                    "P10": 110 /* DAL.MICROBIT_ID_IO_P10 */,
                    "P11": 111 /* DAL.MICROBIT_ID_IO_P11 */,
                    "P12": 112 /* DAL.MICROBIT_ID_IO_P12 */,
                    "P13": 113 /* DAL.MICROBIT_ID_IO_P13 */,
                    "P14": 114 /* DAL.MICROBIT_ID_IO_P14 */,
                    "P15": 115 /* DAL.MICROBIT_ID_IO_P15 */,
                    "P16": 116 /* DAL.MICROBIT_ID_IO_P16 */,
                    "P19": 119 /* DAL.MICROBIT_ID_IO_P19 */
                }
            });
            this.builtinParts["radio"] = this.radioState = new pxsim.RadioState(pxsim.runtime, this, {
                ID_RADIO: 9 /* DAL.MICROBIT_ID_RADIO */,
                RADIO_EVT_DATAGRAM: 1 /* DAL.MICROBIT_RADIO_EVT_DATAGRAM */
            });
            this.builtinParts["microphone"] = this.microphoneState = new pxsim.MicrophoneState(3001 /* DAL.DEVICE_ID_MICROPHONE */, 0, 255, 86, 165);
            this.builtinParts["recording"] = this.recordingState = new pxsim.RecordingState();
            this.builtinParts["accelerometer"] = this.accelerometerState = new pxsim.AccelerometerState(pxsim.runtime);
            this.builtinParts["serial"] = this.serialState = new pxsim.SerialState(pxsim.runtime, this);
            this.builtinParts["thermometer"] = this.thermometerState = new pxsim.ThermometerState();
            this.builtinParts["lightsensor"] = this.lightSensorState = new pxsim.LightSensorState();
            this.builtinParts["compass"] = this.compassState = new pxsim.CompassState();
            this.builtinParts["microservo"] = this.edgeConnectorState;
            this.builtinParts["logotouch"] = this.logoTouch = new pxsim.Button(121 /* DAL.MICROBIT_ID_LOGO */);
            this.builtinVisuals["buttonpair"] = () => new pxsim.visuals.ButtonPairView();
            this.builtinVisuals["ledmatrix"] = () => new pxsim.visuals.LedMatrixView();
            this.builtinVisuals["microservo"] = () => new pxsim.visuals.MicroServoView();
            this.builtinParts["neopixel"] = (pin) => { return this.neopixelState(pin.id); };
            this.builtinVisuals["neopixel"] = () => new pxsim.visuals.NeoPixelView(pxsim.parsePinString);
            this.builtinPartVisuals["neopixel"] = (xy) => pxsim.visuals.mkNeoPixelPart(xy);
            this.builtinPartVisuals["buttonpair"] = (xy) => pxsim.visuals.mkBtnSvg(xy);
            this.builtinPartVisuals["ledmatrix"] = (xy) => pxsim.visuals.mkLedMatrixSvg(xy, 8, 8);
            this.builtinPartVisuals["microservo"] = (xy) => pxsim.visuals.mkMicroServoPart(xy);
            this.samplesState = new pxsim.samples.SamplesState();
        }
        ensureHardwareVersion(version) {
            if (version > this.hardwareVersion) {
                this.hardwareVersion = version;
                this.updateView();
            }
        }
        initAsync(msg) {
            super.initAsync(msg);
            const boardDef = msg.boardDefinition;
            const cmpsList = msg.parts;
            const cmpDefs = msg.partDefinitions || {};
            const fnArgs = msg.fnArgs;
            const v2Parts = {
                "microphone": true,
                "logotouch": true,
                "builtinspeaker": true,
                "flashlog": true,
                "v2": true
            };
            if (msg.builtinParts) {
                const v2PartsUsed = msg.builtinParts.filter(k => v2Parts[k]);
                if (v2PartsUsed.length) {
                    console.log(`detected v2 feature`, v2PartsUsed);
                    cmpsList.push(...v2PartsUsed);
                    this.hardwareVersion = 2;
                }
            }
            const opts = {
                state: this,
                boardDef: boardDef,
                partsList: cmpsList,
                partDefs: cmpDefs,
                fnArgs: fnArgs,
                maxWidth: "100%",
                maxHeight: "100%",
                highContrast: msg.highContrast
            };
            this.viewHost = new pxsim.visuals.BoardHost(pxsim.visuals.mkBoardView({
                visual: boardDef.visual,
                boardDef: boardDef,
                highContrast: msg.highContrast
            }), opts);
            document.body.innerHTML = ""; // clear children
            if (pxsim.shouldShowMute()) {
                document.body.appendChild(pxsim.createMuteButton());
                pxsim.AudioContextManager.mute(true);
                pxsim.setParentMuteState("disabled");
            }
            document.body.appendChild(this.view = this.viewHost.getView());
            pxsim.visuals.WomModuleManager.initBoard(this);
            if (msg.theme === "mbcodal") {
                this.ensureHardwareVersion(2);
            }
            return Promise.resolve();
        }
        tryGetNeopixelState(pinId) {
            return this.lightState[pinId];
        }
        neopixelState(pinId) {
            if (pinId === undefined) {
                pinId = 100 /* DAL.MICROBIT_ID_IO_P0 */;
            }
            let state = this.lightState[pinId];
            if (!state)
                state = this.lightState[pinId] = new pxsim.CommonNeoPixelState();
            return state;
        }
        screenshotAsync(width) {
            return this.viewHost.screenshotAsync(width);
        }
        kill() {
            super.kill();
            this.viewHost.removeEventListeners();
        }
    }
    pxsim.DalBoard = DalBoard;
    function initRuntimeWithDalBoard() {
        pxsim.U.assert(!pxsim.runtime.board);
        let b = new DalBoard();
        pxsim.runtime.board = b;
        pxsim.runtime.postError = (e) => {
            pxsim.led.setBrightness(255);
            let img = board().ledMatrixState.image;
            img.clear();
            img.set(0, 4, 255);
            img.set(1, 3, 255);
            img.set(2, 3, 255);
            img.set(3, 3, 255);
            img.set(4, 4, 255);
            img.set(0, 0, 255);
            img.set(1, 0, 255);
            img.set(0, 1, 255);
            img.set(1, 1, 255);
            img.set(3, 0, 255);
            img.set(4, 0, 255);
            img.set(3, 1, 255);
            img.set(4, 1, 255);
            pxsim.runtime.updateDisplay();
        };
    }
    pxsim.initRuntimeWithDalBoard = initRuntimeWithDalBoard;
    if (!pxsim.initCurrentRuntime) {
        pxsim.initCurrentRuntime = initRuntimeWithDalBoard;
    }
    function board() {
        return pxsim.runtime.board;
    }
    pxsim.board = board;
    function parsePinString(gpioPin) {
        if (gpioPin == "*")
            return board().edgeConnectorState.getPin(100 /* DAL.MICROBIT_ID_IO_P0 */);
        const m = /^(Analog|Digital)Pin\.P(\d)+/.exec(gpioPin);
        if (!m)
            return undefined;
        const pinNum = parseInt(m[2]);
        return board().edgeConnectorState.pins[pinNum];
    }
    pxsim.parsePinString = parsePinString;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function accForGesture(gesture) {
            let b = pxsim.board().accelerometerState;
            b.accelerometer.activate();
            if (gesture == 11 && !b.useShake) { // SHAKE
                b.useShake = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            return b;
        }
        function onGesture(gesture, handler) {
            const b = accForGesture(gesture);
            pxsim.pxtcore.registerWithDal(13 /* DAL.MICROBIT_ID_GESTURE */, gesture, handler);
        }
        input.onGesture = onGesture;
        function isGesture(gesture) {
            const b = accForGesture(gesture);
            b.accelerometer.activate();
            return b.accelerometer.getGesture() == gesture;
        }
        input.isGesture = isGesture;
        function acceleration(dimension) {
            let b = pxsim.board().accelerometerState;
            let acc = b.accelerometer;
            switch (dimension) {
                case 0:
                    acc.activate(pxsim.AccelerometerFlag.X);
                    return acc.getX();
                case 1:
                    acc.activate(pxsim.AccelerometerFlag.Y);
                    return acc.getY();
                case 2:
                    acc.activate(pxsim.AccelerometerFlag.Z);
                    return acc.getZ();
                default:
                    acc.activate(pxsim.AccelerometerFlag.Strength);
                    return acc.getStrength();
            }
        }
        input.acceleration = acceleration;
        function rotation(kind) {
            const b = pxsim.board().accelerometerState;
            const acc = b.accelerometer;
            switch (kind) {
                case 0: {
                    acc.activate(pxsim.AccelerometerFlag.Pitch);
                    return acc.getPitch();
                }
                case 1: {
                    acc.activate(pxsim.AccelerometerFlag.Roll);
                    return acc.getRoll();
                }
                default: return 0;
            }
        }
        input.rotation = rotation;
        function setAccelerometerRange(range) {
            let b = pxsim.board().accelerometerState;
            b.accelerometer.setSampleRange(range);
        }
        input.setAccelerometerRange = setAccelerometerRange;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    /**
      * Co-ordinate systems that can be used.
      * RAW: Unaltered data. Data will be returned directly from the accelerometer.
      *
      * SIMPLE_CARTESIAN: Data will be returned based on an easy to understand alignment, consistent with the cartesian system taught in schools.
      * When held upright, facing the user:
      *
      *                            /
      *    +--------------------+ z
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * y  +--------------------+  x-->
      *
      *
      * NORTH_EAST_DOWN: Data will be returned based on the industry convention of the North East Down (NED) system.
      * When held upright, facing the user:
      *
      *                            z
      *    +--------------------+ /
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * x  +--------------------+  y-->
      *
      */
    let MicroBitCoordinateSystem;
    (function (MicroBitCoordinateSystem) {
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["RAW"] = 0] = "RAW";
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["SIMPLE_CARTESIAN"] = 1] = "SIMPLE_CARTESIAN";
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["NORTH_EAST_DOWN"] = 2] = "NORTH_EAST_DOWN";
    })(MicroBitCoordinateSystem = pxsim.MicroBitCoordinateSystem || (pxsim.MicroBitCoordinateSystem = {}));
    let AccelerometerFlag;
    (function (AccelerometerFlag) {
        AccelerometerFlag[AccelerometerFlag["X"] = 1] = "X";
        AccelerometerFlag[AccelerometerFlag["Y"] = 2] = "Y";
        AccelerometerFlag[AccelerometerFlag["Z"] = 4] = "Z";
        AccelerometerFlag[AccelerometerFlag["Strength"] = 8] = "Strength";
        AccelerometerFlag[AccelerometerFlag["Pitch"] = 16] = "Pitch";
        AccelerometerFlag[AccelerometerFlag["Roll"] = 32] = "Roll";
    })(AccelerometerFlag = pxsim.AccelerometerFlag || (pxsim.AccelerometerFlag = {}));
    class Accelerometer {
        constructor(runtime) {
            this.runtime = runtime;
            this.sigma = 0; // the number of ticks that the instantaneous gesture has been stable.
            this.lastGesture = 0; // the last, stable gesture recorded.
            this.currentGesture = 0; // the instantaneous, unfiltered gesture detected.
            this.sample = { x: 0, y: 0, z: -1023 };
            this.shake = { x: false, y: false, z: false, count: 0, shaken: 0, timer: 0 }; // State information needed to detect shake events.
            this.isActive = false;
            this.sampleRange = 2;
            this.flags = 0;
            this.id = 5 /* DAL.MICROBIT_ID_ACCELEROMETER */;
        }
        setSampleRange(range) {
            this.activate();
            this.sampleRange = Math.max(1, Math.min(8, range));
        }
        activate(flags) {
            if (!this.isActive) {
                this.isActive = true;
                this.runtime.queueDisplayUpdate();
            }
            if (!!flags)
                this.flags |= flags;
        }
        /**
         * Reads the acceleration data from the accelerometer, and stores it in our buffer.
         * This is called by the tick() member function, if the interrupt is set!
         */
        update(x, y, z) {
            // read MSB values...
            this.sample.x = Math.floor(x);
            this.sample.y = Math.floor(y);
            this.sample.z = Math.floor(z);
            // Update gesture tracking
            this.updateGesture();
            // Indicate that a new sample is available
            pxsim.board().bus.queue(this.id, 1 /* DAL.MICROBIT_ACCELEROMETER_EVT_DATA_UPDATE */);
        }
        getStrength() {
            return Math.floor(Math.sqrt(this.instantaneousAccelerationSquared()));
        }
        updateEnvironmentGlobals() {
            // update debugger
            if (this.isActive) {
                if (this.flags & AccelerometerFlag.X)
                    this.runtime.environmentGlobals[pxsim.localization.lf("acceleration.x")] = this.sample.x;
                if (this.flags & AccelerometerFlag.Y)
                    this.runtime.environmentGlobals[pxsim.localization.lf("acceleration.y")] = this.sample.y;
                if (this.flags & AccelerometerFlag.Z)
                    this.runtime.environmentGlobals[pxsim.localization.lf("acceleration.z")] = this.sample.z;
                if (this.flags & AccelerometerFlag.Strength)
                    this.runtime.environmentGlobals[pxsim.localization.lf("acceleration.strength")] = Math.sqrt(this.instantaneousAccelerationSquared());
                if (this.flags & AccelerometerFlag.Pitch)
                    this.runtime.environmentGlobals[pxsim.localization.lf("acceleration.pitch")] = this.getPitch();
                if (this.flags & AccelerometerFlag.Roll)
                    this.runtime.environmentGlobals[pxsim.localization.lf("acceleration.roll")] = this.getRoll();
            }
        }
        instantaneousAccelerationSquared() {
            // Use pythagoras theorem to determine the combined force acting on the device.
            return this.sample.x * this.sample.x + this.sample.y * this.sample.y + this.sample.z * this.sample.z;
        }
        /**
         * Service function. Determines the best guess posture of the device based on instantaneous data.
         * This makes no use of historic data (except for shake), and forms this input to the filter implemented in updateGesture().
         *
         * @return A best guess of the current posture of the device, based on instantaneous data.
         */
        instantaneousPosture() {
            let force = this.instantaneousAccelerationSquared();
            let shakeDetected = false;
            // Test for shake events.
            // We detect a shake by measuring zero crossings in each axis. In other words, if we see a strong acceleration to the left followed by
            // a string acceleration to the right, then we can infer a shake. Similarly, we can do this for each acxis (left/right, up/down, in/out).
            //
            // If we see enough zero crossings in succession (MICROBIT_ACCELEROMETER_SHAKE_COUNT_THRESHOLD), then we decide that the device
            // has been shaken.
            if ((this.getX() < -400 /* DAL.MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.x) || (this.getX() > 400 /* DAL.MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.x)) {
                shakeDetected = true;
                this.shake.x = !this.shake.x;
            }
            if ((this.getY() < -400 /* DAL.MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.y) || (this.getY() > 400 /* DAL.MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.y)) {
                shakeDetected = true;
                this.shake.y = !this.shake.y;
            }
            if ((this.getZ() < -400 /* DAL.MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.z) || (this.getZ() > 400 /* DAL.MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.z)) {
                shakeDetected = true;
                this.shake.z = !this.shake.z;
            }
            if (shakeDetected && this.shake.count < 4 /* DAL.MICROBIT_ACCELEROMETER_SHAKE_COUNT_THRESHOLD */ && ++this.shake.count == 4 /* DAL.MICROBIT_ACCELEROMETER_SHAKE_COUNT_THRESHOLD */)
                this.shake.shaken = 1;
            if (++this.shake.timer >= 10 /* DAL.MICROBIT_ACCELEROMETER_SHAKE_DAMPING */) {
                this.shake.timer = 0;
                if (this.shake.count > 0) {
                    if (--this.shake.count == 0)
                        this.shake.shaken = 0;
                }
            }
            if (this.shake.shaken)
                return 11 /* DAL.MICROBIT_ACCELEROMETER_EVT_SHAKE */;
            let sq = (n) => n * n;
            if (force < sq(400 /* DAL.MICROBIT_ACCELEROMETER_FREEFALL_TOLERANCE */))
                return 7 /* DAL.MICROBIT_ACCELEROMETER_EVT_FREEFALL */;
            if (force > sq(3072 /* DAL.MICROBIT_ACCELEROMETER_3G_TOLERANCE */))
                return 8 /* DAL.MICROBIT_ACCELEROMETER_EVT_3G */;
            if (force > sq(6144 /* DAL.MICROBIT_ACCELEROMETER_6G_TOLERANCE */))
                return 9 /* DAL.MICROBIT_ACCELEROMETER_EVT_6G */;
            if (force > sq(8192 /* DAL.MICROBIT_ACCELEROMETER_8G_TOLERANCE */))
                return 10 /* DAL.MICROBIT_ACCELEROMETER_EVT_8G */;
            // Determine our posture.
            if (this.getX() < (-1000 + 200 /* DAL.MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 3 /* DAL.MICROBIT_ACCELEROMETER_EVT_TILT_LEFT */;
            if (this.getX() > (1000 - 200 /* DAL.MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 4 /* DAL.MICROBIT_ACCELEROMETER_EVT_TILT_RIGHT */;
            if (this.getY() < (-1000 + 200 /* DAL.MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 2 /* DAL.MICROBIT_ACCELEROMETER_EVT_TILT_DOWN */;
            if (this.getY() > (1000 - 200 /* DAL.MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 1 /* DAL.MICROBIT_ACCELEROMETER_EVT_TILT_UP */;
            if (this.getZ() < (-1000 + 200 /* DAL.MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 5 /* DAL.MICROBIT_ACCELEROMETER_EVT_FACE_UP */;
            if (this.getZ() > (1000 - 200 /* DAL.MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 6 /* DAL.MICROBIT_ACCELEROMETER_EVT_FACE_DOWN */;
            return 0;
        }
        updateGesture() {
            // Determine what it looks like we're doing based on the latest sample...
            let g = this.instantaneousPosture();
            // Perform some low pass filtering to reduce jitter from any detected effects
            if (g != this.currentGesture) {
                this.currentGesture = g;
                this.sigma = 0;
            }
            else if (this.sigma < 5 /* DAL.MICROBIT_ACCELEROMETER_GESTURE_DAMPING */) {
                ++this.sigma;
            }
            if (this.currentGesture !== this.lastGesture && this.sigma >= 5 /* DAL.MICROBIT_ACCELEROMETER_GESTURE_DAMPING */) {
                this.enqueueCurrentGesture();
            }
        }
        forceGesture(gesture) {
            this.currentGesture = gesture;
            this.enqueueCurrentGesture();
        }
        enqueueCurrentGesture() {
            this.lastGesture = this.currentGesture;
            pxsim.board().bus.queue(13 /* DAL.MICROBIT_ID_GESTURE */, this.lastGesture);
        }
        /**
          * Reads the X axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the X axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getX();
          * uBit.accelerometer.getX(RAW);
          * @endcode
          */
        getX(system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN) {
            switch (system) {
                case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                    return -this.sample.x;
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    return this.sample.y;
                //case MicroBitCoordinateSystem.SIMPLE_CARTESIAN.RAW:
                default:
                    return this.sample.x;
            }
        }
        /**
          * Reads the Y axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Y axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getY();
          * uBit.accelerometer.getY(RAW);
          * @endcode
          */
        getY(system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN) {
            switch (system) {
                case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                    return -this.sample.y;
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    return -this.sample.x;
                //case RAW:
                default:
                    return this.sample.y;
            }
        }
        /**
          * Reads the Z axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Z axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getZ();
          * uBit.accelerometer.getZ(RAW);
          * @endcode
          */
        getZ(system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN) {
            switch (system) {
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    return -this.sample.z;
                //case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                //case MicroBitCoordinateSystem.RAW:
                default:
                    return this.sample.z;
            }
        }
        /**
          * Provides a rotation compensated pitch of the device, based on the latest update from the accelerometer.
          * @return The pitch of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getPitch();
          * @endcode
          */
        getPitch() {
            return Math.floor((360 * this.getPitchRadians()) / (2 * Math.PI));
        }
        getPitchRadians() {
            this.recalculatePitchRoll();
            return this.pitch;
        }
        /**
          * Provides a rotation compensated roll of the device, based on the latest update from the accelerometer.
          * @return The roll of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getRoll();
          * @endcode
          */
        getRoll() {
            return Math.floor((360 * this.getRollRadians()) / (2 * Math.PI));
        }
        getRollRadians() {
            this.recalculatePitchRoll();
            return this.roll;
        }
        getGesture() {
            return this.lastGesture;
        }
        /**
         * Recalculate roll and pitch values for the current sample.
         * We only do this at most once per sample, as the necessary trigonemteric functions are rather
         * heavyweight for a CPU without a floating point unit...
         */
        recalculatePitchRoll() {
            let x = this.getX(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            let y = this.getY(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            let z = this.getZ(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            this.roll = Math.atan2(y, z);
            this.pitch = Math.atan(-x / (y * Math.sin(this.roll) + z * Math.cos(this.roll)));
        }
    }
    pxsim.Accelerometer = Accelerometer;
    class AccelerometerState {
        constructor(runtime) {
            this.useShake = false;
            this.accelerometer = new Accelerometer(runtime);
        }
        shake() {
            this.accelerometer.forceGesture(11 /* DAL.MICROBIT_ACCELEROMETER_EVT_SHAKE */); // SHAKE == 11
        }
    }
    pxsim.AccelerometerState = AccelerometerState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function updateScreen(img) {
        }
        pxtcore.updateScreen = updateScreen;
        function updateStats(s) {
        }
        pxtcore.updateStats = updateStats;
        function setPalette(b) {
        }
        pxtcore.setPalette = setPalette;
        function setScreenBrightness(b) {
        }
        pxtcore.setScreenBrightness = setScreenBrightness;
        function displayHeight() {
            return 120;
        }
        pxtcore.displayHeight = displayHeight;
        function displayWidth() {
            return 160;
        }
        pxtcore.displayWidth = displayWidth;
        function displayPresent() {
            return true;
        }
        pxtcore.displayPresent = displayPresent;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var samples;
    (function (samples) {
        class SampleChannel {
            constructor(id) {
                this.id = id;
                this.sampleRate = 11000;
            }
            playSampleAsync(sample) {
                if (this.playing) {
                    this.playing.cancel();
                }
                this.playing = pxsim.AudioContextManager.startSamplePlayback(sample, pxsim.BufferMethods.NumberFormat.UInt8LE, 255, this.sampleRate, pxsim.music.volume() / 0xff);
                this.playing.promise.then(() => {
                    this.playing = undefined;
                });
            }
        }
        class SamplesState {
            constructor() {
                this.channels = [];
                this.enabled = false;
                this.channels = [
                    new SampleChannel(0),
                    new SampleChannel(1),
                    new SampleChannel(2),
                    new SampleChannel(3),
                ];
            }
            setEnabled(enabled) {
                this.enabled = enabled;
            }
            setSampleRate(channelId, sampleRate) {
                channelId |= 0;
                if (channelId < 0 || channelId >= this.channels.length) {
                    return;
                }
                this.channels[channelId].sampleRate = sampleRate;
            }
            playSampleAsync(channelId, sample) {
                if (!this.enabled) {
                    return;
                }
                channelId |= 0;
                if (channelId < 0 || channelId >= this.channels.length) {
                    return;
                }
                this.channels[channelId].playSampleAsync(sample);
            }
        }
        samples.SamplesState = SamplesState;
        function enable() {
            pxsim.board().samplesState.setEnabled(true);
        }
        samples.enable = enable;
        function disable() {
            pxsim.board().samplesState.setEnabled(false);
        }
        samples.disable = disable;
        function setSampleRate(src, sampleRate) {
            pxsim.board().samplesState.setSampleRate(src, sampleRate);
        }
        samples.setSampleRate = setSampleRate;
        function playAsync(src, buf) {
            pxsim.board().samplesState.playSampleAsync(src, buf);
        }
        samples.playAsync = playAsync;
    })(samples = pxsim.samples || (pxsim.samples = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    class RefImage extends pxsim.RefObject {
        constructor(w, h, bpp) {
            super();
            this.isStatic = true;
            this.revision = 0;
            this.data = new Uint8Array(w * h);
            this._width = w;
            this._height = h;
            this._bpp = bpp;
        }
        scan(mark) { }
        gcKey() { return "Image"; }
        gcSize() { return 4 + (this.data.length + 3 >> 3); }
        gcIsStatic() { return this.isStatic; }
        pix(x, y) {
            return (x | 0) + (y | 0) * this._width;
        }
        inRange(x, y) {
            return 0 <= (x | 0) && (x | 0) < this._width &&
                0 <= (y | 0) && (y | 0) < this._height;
        }
        color(c) {
            return c & 0xff;
        }
        clamp(x, y) {
            x |= 0;
            y |= 0;
            if (x < 0)
                x = 0;
            else if (x >= this._width)
                x = this._width - 1;
            if (y < 0)
                y = 0;
            else if (y >= this._height)
                y = this._height - 1;
            return [x, y];
        }
        makeWritable() {
            this.revision++;
            this.isStatic = false;
        }
        toDebugString() {
            return this._width + "x" + this._height;
        }
    }
    pxsim.RefImage = RefImage;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var BitmapMethods;
    (function (BitmapMethods) {
        function XX(x) { return (x << 16) >> 16; }
        BitmapMethods.XX = XX;
        function YY(x) { return x >> 16; }
        BitmapMethods.YY = YY;
        function __buffer(img) {
            return new pxsim.RefBuffer(img.data); // no clone for now
        }
        BitmapMethods.__buffer = __buffer;
        function width(img) { return img._width; }
        BitmapMethods.width = width;
        function height(img) { return img._height; }
        BitmapMethods.height = height;
        function isMono(img) { return img._bpp == 1; }
        BitmapMethods.isMono = isMono;
        function isStatic(img) { return img.gcIsStatic(); }
        BitmapMethods.isStatic = isStatic;
        function revision(img) { return img.revision; }
        BitmapMethods.revision = revision;
        function setPixel(img, x, y, c) {
            img.makeWritable();
            if (img.inRange(x, y))
                img.data[img.pix(x, y)] = img.color(c);
        }
        BitmapMethods.setPixel = setPixel;
        function getPixel(img, x, y) {
            if (img.inRange(x, y))
                return img.data[img.pix(x, y)];
            return 0;
        }
        BitmapMethods.getPixel = getPixel;
        function fill(img, c) {
            img.makeWritable();
            img.data.fill(img.color(c));
        }
        BitmapMethods.fill = fill;
        function fillRect(img, x, y, w, h, c) {
            if (w == 0 || h == 0 || x >= img._width || y >= img._height || x + w - 1 < 0 || y + h - 1 < 0)
                return;
            img.makeWritable();
            let [x2, y2] = img.clamp(x + w - 1, y + h - 1);
            [x, y] = img.clamp(x, y);
            let p = img.pix(x, y);
            w = x2 - x + 1;
            h = y2 - y + 1;
            let d = img._width - w;
            c = img.color(c);
            while (h-- > 0) {
                for (let i = 0; i < w; ++i)
                    img.data[p++] = c;
                p += d;
            }
        }
        BitmapMethods.fillRect = fillRect;
        function _fillRect(img, xy, wh, c) {
            fillRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
        }
        BitmapMethods._fillRect = _fillRect;
        function mapRect(img, x, y, w, h, c) {
            if (c.data.length < 16)
                return;
            img.makeWritable();
            let [x2, y2] = img.clamp(x + w - 1, y + h - 1);
            [x, y] = img.clamp(x, y);
            let p = img.pix(x, y);
            w = x2 - x + 1;
            h = y2 - y + 1;
            let d = img._width - w;
            while (h-- > 0) {
                for (let i = 0; i < w; ++i) {
                    img.data[p] = c.data[img.data[p]];
                    p++;
                }
                p += d;
            }
        }
        BitmapMethods.mapRect = mapRect;
        function _mapRect(img, xy, wh, c) {
            mapRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
        }
        BitmapMethods._mapRect = _mapRect;
        function equals(img, other) {
            if (!other || img._bpp != other._bpp || img._width != other._width || img._height != other._height) {
                return false;
            }
            let imgData = img.data;
            let otherData = other.data;
            let len = imgData.length;
            for (let i = 0; i < len; i++) {
                if (imgData[i] != otherData[i]) {
                    return false;
                }
            }
            return true;
        }
        BitmapMethods.equals = equals;
        function getRows(img, x, dst) {
            x |= 0;
            if (!img.inRange(x, 0))
                return;
            let dp = 0;
            let len = Math.min(dst.data.length, (img._width - x) * img._height);
            let sp = x;
            let hh = 0;
            while (len--) {
                if (hh++ >= img._height) {
                    hh = 1;
                    sp = ++x;
                }
                dst.data[dp++] = img.data[sp];
                sp += img._width;
            }
        }
        BitmapMethods.getRows = getRows;
        function setRows(img, x, src) {
            x |= 0;
            if (!img.inRange(x, 0))
                return;
            let sp = 0;
            let len = Math.min(src.data.length, (img._width - x) * img._height);
            let dp = x;
            let hh = 0;
            while (len--) {
                if (hh++ >= img._height) {
                    hh = 1;
                    dp = ++x;
                }
                img.data[dp] = src.data[sp++];
                dp += img._width;
            }
        }
        BitmapMethods.setRows = setRows;
        function clone(img) {
            let r = new pxsim.RefImage(img._width, img._height, img._bpp);
            r.data.set(img.data);
            return r;
        }
        BitmapMethods.clone = clone;
        function flipX(img) {
            img.makeWritable();
            const w = img._width;
            const h = img._height;
            for (let i = 0; i < h; ++i) {
                img.data.subarray(i * w, (i + 1) * w).reverse();
            }
        }
        BitmapMethods.flipX = flipX;
        function flipY(img) {
            img.makeWritable();
            const w = img._width;
            const h = img._height;
            const d = img.data;
            for (let i = 0; i < w; ++i) {
                let top = i;
                let bot = i + (h - 1) * w;
                while (top < bot) {
                    let c = d[top];
                    d[top] = d[bot];
                    d[bot] = c;
                    top += w;
                    bot -= w;
                }
            }
        }
        BitmapMethods.flipY = flipY;
        function transposed(img) {
            const w = img._width;
            const h = img._height;
            const d = img.data;
            const r = new pxsim.RefImage(h, w, img._bpp);
            const n = r.data;
            let src = 0;
            for (let i = 0; i < h; ++i) {
                let dst = i;
                for (let j = 0; j < w; ++j) {
                    n[dst] = d[src++];
                    dst += w;
                }
            }
            return r;
        }
        BitmapMethods.transposed = transposed;
        function copyFrom(img, from) {
            if (img._width != from._width || img._height != from._height ||
                img._bpp != from._bpp)
                return;
            img.data.set(from.data);
        }
        BitmapMethods.copyFrom = copyFrom;
        function scroll(img, dx, dy) {
            img.makeWritable();
            dx |= 0;
            dy |= 0;
            if (dx != 0) {
                const img2 = clone(img);
                img.data.fill(0);
                drawTransparentBitmap(img, img2, dx, dy);
            }
            else if (dy < 0) {
                dy = -dy;
                if (dy < img._height)
                    img.data.copyWithin(0, dy * img._width);
                else
                    dy = img._height;
                img.data.fill(0, (img._height - dy) * img._width);
            }
            else if (dy > 0) {
                if (dy < img._height)
                    img.data.copyWithin(dy * img._width, 0);
                else
                    dy = img._height;
                img.data.fill(0, 0, dy * img._width);
            }
            // TODO implement dx
        }
        BitmapMethods.scroll = scroll;
        function replace(img, from, to) {
            to &= 0xf;
            const d = img.data;
            for (let i = 0; i < d.length; ++i)
                if (d[i] == from)
                    d[i] = to;
        }
        BitmapMethods.replace = replace;
        function doubledX(img) {
            const w = img._width;
            const h = img._height;
            const d = img.data;
            const r = new pxsim.RefImage(w * 2, h, img._bpp);
            const n = r.data;
            let dst = 0;
            for (let src = 0; src < d.length; ++src) {
                let c = d[src];
                n[dst++] = c;
                n[dst++] = c;
            }
            return r;
        }
        BitmapMethods.doubledX = doubledX;
        function doubledY(img) {
            const w = img._width;
            const h = img._height;
            const d = img.data;
            const r = new pxsim.RefImage(w, h * 2, img._bpp);
            const n = r.data;
            let src = 0;
            let dst0 = 0;
            let dst1 = w;
            for (let i = 0; i < h; ++i) {
                for (let j = 0; j < w; ++j) {
                    let c = d[src++];
                    n[dst0++] = c;
                    n[dst1++] = c;
                }
                dst0 += w;
                dst1 += w;
            }
            return r;
        }
        BitmapMethods.doubledY = doubledY;
        function doubled(img) {
            return doubledX(doubledY(img));
        }
        BitmapMethods.doubled = doubled;
        function drawImageCore(img, from, x, y, clear, check) {
            x |= 0;
            y |= 0;
            const w = from._width;
            let h = from._height;
            const sh = img._height;
            const sw = img._width;
            if (x + w <= 0)
                return false;
            if (x >= sw)
                return false;
            if (y + h <= 0)
                return false;
            if (y >= sh)
                return false;
            if (clear)
                fillRect(img, x, y, from._width, from._height, 0);
            else if (!check)
                img.makeWritable();
            const len = x < 0 ? Math.min(sw, w + x) : Math.min(sw - x, w);
            const fdata = from.data;
            const tdata = img.data;
            for (let p = 0; h--; y++, p += w) {
                if (0 <= y && y < sh) {
                    let dst = y * sw;
                    let src = p;
                    if (x < 0)
                        src += -x;
                    else
                        dst += x;
                    for (let i = 0; i < len; ++i) {
                        const v = fdata[src++];
                        if (v) {
                            if (check) {
                                if (tdata[dst])
                                    return true;
                            }
                            else {
                                tdata[dst] = v;
                            }
                        }
                        dst++;
                    }
                }
            }
            return false;
        }
        function drawBitmap(img, from, x, y) {
            drawImageCore(img, from, x, y, true, false);
        }
        BitmapMethods.drawBitmap = drawBitmap;
        function drawTransparentBitmap(img, from, x, y) {
            drawImageCore(img, from, x, y, false, false);
        }
        BitmapMethods.drawTransparentBitmap = drawTransparentBitmap;
        function overlapsWith(img, other, x, y) {
            return drawImageCore(img, other, x, y, false, true);
        }
        BitmapMethods.overlapsWith = overlapsWith;
        function drawLineLow(img, x0, y0, x1, y1, c) {
            let dx = x1 - x0;
            let dy = y1 - y0;
            let yi = img._width;
            if (dy < 0) {
                yi = -yi;
                dy = -dy;
            }
            let D = 2 * dy - dx;
            dx <<= 1;
            dy <<= 1;
            c = img.color(c);
            let ptr = img.pix(x0, y0);
            for (let x = x0; x <= x1; ++x) {
                img.data[ptr] = c;
                if (D > 0) {
                    ptr += yi;
                    D -= dx;
                }
                D += dy;
                ptr++;
            }
        }
        function drawLineHigh(img, x0, y0, x1, y1, c) {
            let dx = x1 - x0;
            let dy = y1 - y0;
            let xi = 1;
            if (dx < 0) {
                xi = -1;
                dx = -dx;
            }
            let D = 2 * dx - dy;
            dx <<= 1;
            dy <<= 1;
            c = img.color(c);
            let ptr = img.pix(x0, y0);
            for (let y = y0; y <= y1; ++y) {
                img.data[ptr] = c;
                if (D > 0) {
                    ptr += xi;
                    D -= dy;
                }
                D += dx;
                ptr += img._width;
            }
        }
        function _drawLine(img, xy, wh, c) {
            drawLine(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
        }
        BitmapMethods._drawLine = _drawLine;
        function drawLine(img, x0, y0, x1, y1, c) {
            x0 |= 0;
            y0 |= 0;
            x1 |= 0;
            y1 |= 0;
            if (x1 < x0) {
                drawLine(img, x1, y1, x0, y0, c);
                return;
            }
            let w = x1 - x0;
            let h = y1 - y0;
            if (h == 0) {
                if (w == 0)
                    setPixel(img, x0, y0, c);
                else
                    fillRect(img, x0, y0, w + 1, 1, c);
                return;
            }
            if (w == 0) {
                if (h > 0)
                    fillRect(img, x0, y0, 1, h + 1, c);
                else
                    fillRect(img, x0, y1, 1, -h + 1, c);
                return;
            }
            if (x1 < 0 || x0 >= img._width)
                return;
            if (x0 < 0) {
                y0 -= (h * x0 / w) | 0;
                x0 = 0;
            }
            if (x1 >= img._width) {
                let d = (img._width - 1) - x1;
                y1 += (h * d / w) | 0;
                x1 = img._width - 1;
            }
            if (y0 < y1) {
                if (y0 >= img._height || y1 < 0)
                    return;
                if (y0 < 0) {
                    x0 -= (w * y0 / h) | 0;
                    y0 = 0;
                }
                if (y1 >= img._height) {
                    let d = (img._height - 1) - y1;
                    x1 += (w * d / h) | 0;
                    y1 = img._height;
                }
            }
            else {
                if (y1 >= img._height || y0 < 0)
                    return;
                if (y1 < 0) {
                    x1 -= (w * y1 / h) | 0;
                    y1 = 0;
                }
                if (y0 >= img._height) {
                    let d = (img._height - 1) - y0;
                    x0 += (w * d / h) | 0;
                    y0 = img._height;
                }
            }
            img.makeWritable();
            if (h < 0) {
                h = -h;
                if (h < w)
                    drawLineLow(img, x0, y0, x1, y1, c);
                else
                    drawLineHigh(img, x1, y1, x0, y0, c);
            }
            else {
                if (h < w)
                    drawLineLow(img, x0, y0, x1, y1, c);
                else
                    drawLineHigh(img, x0, y0, x1, y1, c);
            }
        }
        BitmapMethods.drawLine = drawLine;
        function drawIcon(img, icon, x, y, color) {
            const src = icon.data;
            if (!pxsim.bitmaps.isValidImage(icon))
                return;
            if (src[1] != 1)
                return; // only mono
            let width = pxsim.bitmaps.bufW(src);
            let height = pxsim.bitmaps.bufH(src);
            let byteH = pxsim.bitmaps.byteHeight(height, 1);
            x |= 0;
            y |= 0;
            const destHeight = img._height;
            const destWidth = img._width;
            if (x + width <= 0)
                return;
            if (x >= destWidth)
                return;
            if (y + height <= 0)
                return;
            if (y >= destHeight)
                return;
            img.makeWritable();
            let srcPointer = 8;
            color = img.color(color);
            const screen = img.data;
            for (let i = 0; i < width; ++i) {
                let destX = x + i;
                if (0 <= destX && destX < destWidth) {
                    let destIndex = destX + y * destWidth;
                    let srcIndex = srcPointer;
                    let destY = y;
                    let destEnd = Math.min(destHeight, height + y);
                    if (y < 0) {
                        srcIndex += ((-y) >> 3);
                        destY += ((-y) >> 3) * 8;
                        destIndex += (destY - y) * destWidth;
                    }
                    let mask = 0x01;
                    let srcByte = src[srcIndex++];
                    while (destY < destEnd) {
                        if (destY >= 0 && (srcByte & mask)) {
                            screen[destIndex] = color;
                        }
                        mask <<= 1;
                        if (mask == 0x100) {
                            mask = 0x01;
                            srcByte = src[srcIndex++];
                        }
                        destIndex += destWidth;
                        destY++;
                    }
                }
                srcPointer += byteH;
            }
        }
        BitmapMethods.drawIcon = drawIcon;
        function _drawIcon(img, icon, xy, color) {
            drawIcon(img, icon, XX(xy), YY(xy), color);
        }
        BitmapMethods._drawIcon = _drawIcon;
        function fillCircle(img, cx, cy, r, c) {
            let x = r - 1;
            let y = 0;
            let dx = 1;
            let dy = 1;
            let err = dx - (r << 1);
            while (x >= y) {
                fillRect(img, cx + x, cy - y, 1, 1 + (y << 1), c);
                fillRect(img, cx + y, cy - x, 1, 1 + (x << 1), c);
                fillRect(img, cx - x, cy - y, 1, 1 + (y << 1), c);
                fillRect(img, cx - y, cy - x, 1, 1 + (x << 1), c);
                if (err <= 0) {
                    y++;
                    err += dy;
                    dy += 2;
                }
                if (err > 0) {
                    x--;
                    dx += 2;
                    err += dx - (r << 1);
                }
            }
        }
        BitmapMethods.fillCircle = fillCircle;
        function _fillCircle(img, cxy, r, c) {
            fillCircle(img, XX(cxy), YY(cxy), r, c);
        }
        BitmapMethods._fillCircle = _fillCircle;
        function nextYRange_Low(x, line, yRange) {
            while (line.x === x && line.x <= line.x1 && line.x < line.W) {
                if (0 <= line.x) {
                    if (line.y < yRange.min)
                        yRange.min = line.y;
                    if (line.y > yRange.max)
                        yRange.max = line.y;
                }
                if (line.D > 0) {
                    line.y += line.yi;
                    line.D -= line.dx;
                }
                line.D += line.dy;
                ++line.x;
            }
        }
        function nextYRange_HighUp(x, line, yRange) {
            while (line.x == x && line.y >= line.y1 && line.x < line.W) {
                if (0 <= line.x) {
                    if (line.y < yRange.min)
                        yRange.min = line.y;
                    if (line.y > yRange.max)
                        yRange.max = line.y;
                }
                if (line.D > 0) {
                    line.x += line.xi;
                    line.D += line.dy;
                }
                line.D += line.dx;
                --line.y;
            }
        }
        function nextYRange_HighDown(x, line, yRange) {
            while (line.x == x && line.y <= line.y1 && line.x < line.W) {
                if (0 <= line.x) {
                    if (line.y < yRange.min)
                        yRange.min = line.y;
                    if (line.y > yRange.max)
                        yRange.max = line.y;
                }
                if (line.D > 0) {
                    line.x += line.xi;
                    line.D -= line.dy;
                }
                line.D += line.dx;
                ++line.y;
            }
        }
        function initYRangeGenerator(X0, Y0, X1, Y1) {
            const line = {
                x: X0,
                y: Y0,
                x0: X0,
                y0: Y0,
                x1: X1,
                y1: Y1,
                W: 0,
                H: 0,
                dx: X1 - X0,
                dy: Y1 - Y0,
                yi: 0,
                xi: 0,
                D: 0,
                nextFuncIndex: 0,
            };
            if ((line.dy < 0 ? -line.dy : line.dy) < line.dx) {
                line.yi = 1;
                if (line.dy < 0) {
                    line.yi = -1;
                    line.dy = -line.dy;
                }
                line.D = 2 * line.dy - line.dx;
                line.dx = line.dx << 1;
                line.dy = line.dy << 1;
                line.nextFuncIndex = 0;
                return line;
            }
            else {
                line.xi = 1;
                if (line.dy < 0) {
                    line.D = 2 * line.dx + line.dy;
                    line.dx = line.dx << 1;
                    line.dy = line.dy << 1;
                    line.nextFuncIndex = 1;
                    return line;
                }
                else {
                    line.D = 2 * line.dx - line.dy;
                    line.dx = line.dx << 1;
                    line.dy = line.dy << 1;
                    line.nextFuncIndex = 2;
                    return line;
                }
            }
        }
        function fillTriangle(img, x0, y0, x1, y1, x2, y2, c) {
            if (x1 < x0) {
                [x1, x0] = [x0, x1];
                [y1, y0] = [y0, y1];
            }
            if (x2 < x1) {
                [x2, x1] = [x1, x2];
                [y2, y1] = [y1, y2];
            }
            if (x1 < x0) {
                [x1, x0] = [x0, x1];
                [y1, y0] = [y0, y1];
            }
            const lines = [
                initYRangeGenerator(x0, y0, x2, y2),
                initYRangeGenerator(x0, y0, x1, y1),
                initYRangeGenerator(x1, y1, x2, y2)
            ];
            lines[0].W = lines[1].W = lines[2].W = width(img);
            lines[0].H = lines[1].H = lines[2].H = height(img);
            const nextFuncList = [
                nextYRange_Low,
                nextYRange_HighUp,
                nextYRange_HighDown
            ];
            const fpNext0 = nextFuncList[lines[0].nextFuncIndex];
            const fpNext1 = nextFuncList[lines[1].nextFuncIndex];
            const fpNext2 = nextFuncList[lines[2].nextFuncIndex];
            const yRange = {
                min: lines[0].H,
                max: -1
            };
            for (let x = lines[1].x0; x <= lines[1].x1; x++) {
                yRange.min = lines[0].H;
                yRange.max = -1;
                fpNext0(x, lines[0], yRange);
                fpNext1(x, lines[1], yRange);
                fillRect(img, x, yRange.min, 1, yRange.max - yRange.min + 1, c);
            }
            fpNext2(lines[2].x0, lines[2], yRange);
            for (let x = lines[2].x0 + 1; x <= lines[2].x1; x++) {
                yRange.min = lines[0].H;
                yRange.max = -1;
                fpNext0(x, lines[0], yRange);
                fpNext2(x, lines[2], yRange);
                fillRect(img, x, yRange.min, 1, yRange.max - yRange.min + 1, c);
            }
        }
        BitmapMethods.fillTriangle = fillTriangle;
        function _fillTriangle(img, args) {
            fillTriangle(img, args.getAt(0) | 0, args.getAt(1) | 0, args.getAt(2) | 0, args.getAt(3) | 0, args.getAt(4) | 0, args.getAt(5) | 0, args.getAt(6) | 0);
        }
        BitmapMethods._fillTriangle = _fillTriangle;
        function fillPolygon4(img, x0, y0, x1, y1, x2, y2, x3, y3, c) {
            const lines = [
                (x0 < x1) ? initYRangeGenerator(x0, y0, x1, y1) : initYRangeGenerator(x1, y1, x0, y0),
                (x1 < x2) ? initYRangeGenerator(x1, y1, x2, y2) : initYRangeGenerator(x2, y2, x1, y1),
                (x2 < x3) ? initYRangeGenerator(x2, y2, x3, y3) : initYRangeGenerator(x3, y3, x2, y2),
                (x0 < x3) ? initYRangeGenerator(x0, y0, x3, y3) : initYRangeGenerator(x3, y3, x0, y0)
            ];
            lines[0].W = lines[1].W = lines[2].W = lines[3].W = width(img);
            lines[0].H = lines[1].H = lines[2].H = lines[3].H = height(img);
            let minX = Math.min(Math.min(x0, x1), Math.min(x2, x3));
            let maxX = Math.min(Math.max(Math.max(x0, x1), Math.max(x2, x3)), lines[0].W - 1);
            const nextFuncList = [
                nextYRange_Low,
                nextYRange_HighUp,
                nextYRange_HighDown
            ];
            const fpNext0 = nextFuncList[lines[0].nextFuncIndex];
            const fpNext1 = nextFuncList[lines[1].nextFuncIndex];
            const fpNext2 = nextFuncList[lines[2].nextFuncIndex];
            const fpNext3 = nextFuncList[lines[3].nextFuncIndex];
            const yRange = {
                min: lines[0].H,
                max: -1
            };
            for (let x = minX; x <= maxX; x++) {
                yRange.min = lines[0].H;
                yRange.max = -1;
                fpNext0(x, lines[0], yRange);
                fpNext1(x, lines[1], yRange);
                fpNext2(x, lines[2], yRange);
                fpNext3(x, lines[3], yRange);
                fillRect(img, x, yRange.min, 1, yRange.max - yRange.min + 1, c);
            }
        }
        BitmapMethods.fillPolygon4 = fillPolygon4;
        function _fillPolygon4(img, args) {
            fillPolygon4(img, args.getAt(0) | 0, args.getAt(1) | 0, args.getAt(2) | 0, args.getAt(3) | 0, args.getAt(4) | 0, args.getAt(5) | 0, args.getAt(6) | 0, args.getAt(7) | 0, args.getAt(8) | 0);
        }
        BitmapMethods._fillPolygon4 = _fillPolygon4;
        function _blitRow(img, xy, from, xh) {
            blitRow(img, XX(xy), YY(xy), from, XX(xh), YY(xh));
        }
        BitmapMethods._blitRow = _blitRow;
        function blitRow(img, x, y, from, fromX, fromH) {
            x |= 0;
            y |= 0;
            fromX |= 0;
            fromH |= 0;
            if (!img.inRange(x, 0) || !img.inRange(fromX, 0) || fromH <= 0)
                return;
            let fy = 0;
            let stepFY = ((from._width << 16) / fromH) | 0;
            let endY = y + fromH;
            if (endY > img._height)
                endY = img._height;
            if (y < 0) {
                fy += -y * stepFY;
                y = 0;
            }
            while (y < endY) {
                img.data[img.pix(x, y)] = from.data[from.pix(fromX, fy >> 16)];
                y++;
                fy += stepFY;
            }
        }
        BitmapMethods.blitRow = blitRow;
        function _blit(img, src, args) {
            return blit(img, src, args);
        }
        BitmapMethods._blit = _blit;
        function blit(dst, src, args) {
            const xDst = args.getAt(0);
            const yDst = args.getAt(1);
            const wDst = args.getAt(2);
            const hDst = args.getAt(3);
            const xSrc = args.getAt(4);
            const ySrc = args.getAt(5);
            const wSrc = args.getAt(6);
            const hSrc = args.getAt(7);
            const transparent = args.getAt(8);
            const check = args.getAt(9);
            const xSrcStep = ((wSrc << 16) / wDst) | 0;
            const ySrcStep = ((hSrc << 16) / hDst) | 0;
            const xDstClip = Math.abs(Math.min(0, xDst));
            const yDstClip = Math.abs(Math.min(0, yDst));
            const xDstStart = xDst + xDstClip;
            const yDstStart = yDst + yDstClip;
            const xDstEnd = Math.min(dst._width, xDst + wDst);
            const yDstEnd = Math.min(dst._height, yDst + hDst);
            const xSrcStart = Math.max(0, (xSrc << 16) + xDstClip * xSrcStep);
            const ySrcStart = Math.max(0, (ySrc << 16) + yDstClip * ySrcStep);
            const xSrcEnd = Math.min(src._width, xSrc + wSrc) << 16;
            const ySrcEnd = Math.min(src._height, ySrc + hSrc) << 16;
            if (!check)
                dst.makeWritable();
            for (let yDstCur = yDstStart, ySrcCur = ySrcStart; yDstCur < yDstEnd && ySrcCur < ySrcEnd; ++yDstCur, ySrcCur += ySrcStep) {
                const ySrcCurI = ySrcCur >> 16;
                for (let xDstCur = xDstStart, xSrcCur = xSrcStart; xDstCur < xDstEnd && xSrcCur < xSrcEnd; ++xDstCur, xSrcCur += xSrcStep) {
                    const xSrcCurI = xSrcCur >> 16;
                    const cSrc = getPixel(src, xSrcCurI, ySrcCurI);
                    if (check && cSrc) {
                        const cDst = getPixel(dst, xDstCur, yDstCur);
                        if (cDst) {
                            return true;
                        }
                        continue;
                    }
                    if (!transparent || cSrc) {
                        setPixel(dst, xDstCur, yDstCur, cSrc);
                    }
                }
            }
            return false;
        }
        BitmapMethods.blit = blit;
    })(BitmapMethods = pxsim.BitmapMethods || (pxsim.BitmapMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var bitmaps;
    (function (bitmaps) {
        function byteHeight(h, bpp) {
            if (bpp == 1)
                return h * bpp + 7 >> 3;
            else
                return ((h * bpp + 31) >> 5) << 2;
        }
        bitmaps.byteHeight = byteHeight;
        function isLegacyImage(buf) {
            if (!buf || buf.data.length < 5)
                return false;
            if (buf.data[0] != 0xe1 && buf.data[0] != 0xe4)
                return false;
            const bpp = buf.data[0] & 0xf;
            const sz = buf.data[1] * byteHeight(buf.data[2], bpp);
            if (4 + sz != buf.data.length)
                return false;
            return true;
        }
        function bufW(data) {
            return data[2] | (data[3] << 8);
        }
        bitmaps.bufW = bufW;
        function bufH(data) {
            return data[4] | (data[5] << 8);
        }
        bitmaps.bufH = bufH;
        function isValidImage(buf) {
            if (!buf || buf.data.length < 5)
                return false;
            if (buf.data[0] != 0x87)
                return false;
            if (buf.data[1] != 1 && buf.data[1] != 4)
                return false;
            const bpp = buf.data[1];
            const sz = bufW(buf.data) * byteHeight(bufH(buf.data), bpp);
            if (8 + sz != buf.data.length)
                return false;
            return true;
        }
        bitmaps.isValidImage = isValidImage;
        function create(w, h) {
            // truncate decimal sizes
            w |= 0;
            h |= 0;
            return new pxsim.RefImage(w, h, 4);
        }
        bitmaps.create = create;
        function ofBuffer(buf) {
            const src = buf.data;
            let srcP = 4;
            let w = 0, h = 0, bpp = 0;
            if (isLegacyImage(buf)) {
                w = src[1];
                h = src[2];
                bpp = src[0] & 0xf;
                // console.log("using legacy image")
            }
            else if (isValidImage(buf)) {
                srcP = 8;
                w = bufW(src);
                h = bufH(src);
                bpp = src[1];
            }
            if (w == 0 || h == 0)
                return null;
            const r = new pxsim.RefImage(w, h, bpp);
            const dst = r.data;
            r.isStatic = buf.isStatic;
            if (bpp == 1) {
                for (let i = 0; i < w; ++i) {
                    let dstP = i;
                    let mask = 0x01;
                    let v = src[srcP++];
                    for (let j = 0; j < h; ++j) {
                        if (mask == 0x100) {
                            mask = 0x01;
                            v = src[srcP++];
                        }
                        if (v & mask)
                            dst[dstP] = 1;
                        dstP += w;
                        mask <<= 1;
                    }
                }
            }
            else if (bpp == 4) {
                for (let i = 0; i < w; ++i) {
                    let dstP = i;
                    for (let j = 0; j < h >> 1; ++j) {
                        const v = src[srcP++];
                        dst[dstP] = v & 0xf;
                        dstP += w;
                        dst[dstP] = v >> 4;
                        dstP += w;
                    }
                    if (h & 1)
                        dst[dstP] = src[srcP++] & 0xf;
                    srcP = (srcP + 3) & ~3;
                }
            }
            return r;
        }
        bitmaps.ofBuffer = ofBuffer;
        function toBuffer(img) {
            let col = byteHeight(img._height, img._bpp);
            let sz = 8 + img._width * col;
            let r = new Uint8Array(sz);
            r[0] = 0x87;
            r[1] = img._bpp;
            r[2] = img._width & 0xff;
            r[3] = img._width >> 8;
            r[4] = img._height & 0xff;
            r[5] = img._height >> 8;
            let dstP = 8;
            const w = img._width;
            const h = img._height;
            const data = img.data;
            for (let i = 0; i < w; ++i) {
                if (img._bpp == 4) {
                    let p = i;
                    for (let j = 0; j < h; j += 2) {
                        r[dstP++] = ((data[p + w] & 0xf) << 4) | ((data[p] || 0) & 0xf);
                        p += 2 * w;
                    }
                    dstP = (dstP + 3) & ~3;
                }
                else if (img._bpp == 1) {
                    let mask = 0x01;
                    let p = i;
                    for (let j = 0; j < h; j++) {
                        if (data[p])
                            r[dstP] |= mask;
                        mask <<= 1;
                        p += w;
                        if (mask == 0x100) {
                            mask = 0x01;
                            dstP++;
                        }
                    }
                    if (mask != 0x01)
                        dstP++;
                }
            }
            return new pxsim.RefBuffer(r);
        }
        bitmaps.toBuffer = toBuffer;
        function doubledIcon(buf) {
            let img = ofBuffer(buf);
            if (!img)
                return null;
            img = pxsim.BitmapMethods.doubled(img);
            return toBuffer(img);
        }
        bitmaps.doubledIcon = doubledIcon;
    })(bitmaps = pxsim.bitmaps || (pxsim.bitmaps = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function onButtonPressed(button, handler) {
            let b = pxsim.board().buttonPairState;
            if (button == b.props.ID_BUTTON_AB && !b.usesButtonAB) {
                b.usesButtonAB = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            pxsim.pxtcore.registerWithDal(button, 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */, handler);
        }
        input.onButtonPressed = onButtonPressed;
        function buttonIsPressed(button) {
            let b = pxsim.board().buttonPairState;
            if (button == b.abBtn.id && !b.usesButtonAB) {
                b.usesButtonAB = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            if (button == b.aBtn.id)
                return b.aBtn.pressed;
            if (button == b.bBtn.id)
                return b.bBtn.pressed;
            return b.abBtn.pressed || (b.aBtn.pressed && b.bBtn.pressed);
        }
        input.buttonIsPressed = buttonIsPressed;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        function mkBtnSvg(xy) {
            let [innerCls, outerCls] = ["sim-button", "sim-button-outer"];
            const tabSize = visuals.PIN_DIST / 2.5;
            const pegR = visuals.PIN_DIST / 5;
            const btnR = visuals.PIN_DIST * .8;
            const pegMargin = visuals.PIN_DIST / 8;
            const plateR = visuals.PIN_DIST / 12;
            const pegOffset = pegMargin + pegR;
            let [x, y] = xy;
            const left = x - tabSize / 2;
            const top = y - tabSize / 2;
            const plateH = 3 * visuals.PIN_DIST - tabSize;
            const plateW = 2 * visuals.PIN_DIST + tabSize;
            const plateL = left;
            const plateT = top + tabSize;
            const btnCX = plateL + plateW / 2;
            const btnCY = plateT + plateH / 2;
            let btng = pxsim.svg.elt("g");
            //tabs
            const mkTab = (x, y) => {
                pxsim.svg.child(btng, "rect", { class: "sim-button-tab", x: x, y: y, width: tabSize, height: tabSize });
            };
            mkTab(left, top);
            mkTab(left + 2 * visuals.PIN_DIST, top);
            mkTab(left, top + 3 * visuals.PIN_DIST);
            mkTab(left + 2 * visuals.PIN_DIST, top + 3 * visuals.PIN_DIST);
            //plate
            pxsim.svg.child(btng, "rect", { class: outerCls, x: plateL, y: plateT, rx: plateR, ry: plateR, width: plateW, height: plateH });
            //pegs
            const mkPeg = (x, y) => {
                pxsim.svg.child(btng, "circle", { class: "sim-button-nut", cx: x, cy: y, r: pegR });
            };
            mkPeg(plateL + pegOffset, plateT + pegOffset);
            mkPeg(plateL + plateW - pegOffset, plateT + pegOffset);
            mkPeg(plateL + pegOffset, plateT + plateH - pegOffset);
            mkPeg(plateL + plateW - pegOffset, plateT + plateH - pegOffset);
            //inner btn
            let innerBtn = pxsim.svg.child(btng, "circle", { class: innerCls, cx: btnCX, cy: btnCY, r: btnR });
            //return
            return { el: btng, y: top, x: left, w: plateW, h: plateH + 2 * tabSize };
        }
        visuals.mkBtnSvg = mkBtnSvg;
        visuals.BUTTON_PAIR_STYLE = `
            .sim-button {
                pointer-events: none;
                fill: #000;
            }
            .sim-button-outer:active ~ .sim-button,
            .sim-button-virtual:active {
                fill: #FFA500;
            }
            .sim-button-outer {
                cursor: pointer;
                fill: #979797;
            }
            .sim-button-outer:hover {
                stroke:gray;
                stroke-width: ${visuals.PIN_DIST / 5}px;
            }
            .sim-button-nut {
                fill:#000;
                pointer-events:none;
            }
            .sim-button-nut:hover {
                stroke:${visuals.PIN_DIST / 15}px solid #704A4A;
            }
            .sim-button-tab {
                fill:#FFF;
                pointer-events:none;
            }
            .sim-button-virtual {
                cursor: pointer;
                fill: rgba(255, 255, 255, 0.6);
                stroke: rgba(255, 255, 255, 1);
                stroke-width: ${visuals.PIN_DIST / 5}px;
            }
            .sim-button-virtual:hover {
                stroke: rgba(128, 128, 128, 1);
            }
            .sim-text-virtual {
                fill: #000;
                pointer-events:none;
            }
            `;
        class ButtonPairView {
            constructor() {
                this.style = visuals.BUTTON_PAIR_STYLE;
            }
            init(bus, state) {
                this.state = state;
                this.bus = bus;
                this.defs = [];
                this.element = this.mkBtns();
                this.updateState();
                this.attachEvents();
            }
            moveToCoord(xy) {
                let btnWidth = visuals.PIN_DIST * 3;
                let [x, y] = xy;
                visuals.translateEl(this.aBtn, [x, y]);
                visuals.translateEl(this.bBtn, [x + btnWidth, y]);
                visuals.translateEl(this.abBtn, [x + visuals.PIN_DIST * 1.5, y + visuals.PIN_DIST * 4]);
            }
            updateState() {
                let stateBtns = [this.state.aBtn, this.state.bBtn, this.state.abBtn];
                let svgBtns = [this.aBtn, this.bBtn, this.abBtn];
                if (this.state.usesButtonAB && this.abBtn.style.visibility != "visible") {
                    this.abBtn.style.visibility = "visible";
                }
            }
            updateTheme() { }
            mkBtns() {
                this.aBtn = mkBtnSvg([0, 0]).el;
                this.bBtn = mkBtnSvg([0, 0]).el;
                const mkVirtualBtn = () => {
                    const numPins = 2;
                    const w = visuals.PIN_DIST * 2.8;
                    const offset = (w - (numPins * visuals.PIN_DIST)) / 2;
                    const corner = visuals.PIN_DIST / 2;
                    const cx = 0 - offset + w / 2;
                    const cy = cx;
                    const txtSize = visuals.PIN_DIST * 1.3;
                    const x = -offset;
                    const y = -offset;
                    const txtXOff = visuals.PIN_DIST / 7;
                    const txtYOff = visuals.PIN_DIST / 10;
                    let btng = pxsim.svg.elt("g");
                    let btn = pxsim.svg.child(btng, "rect", { class: "sim-button-virtual", x: x, y: y, rx: corner, ry: corner, width: w, height: w });
                    let btnTxt = visuals.mkTxt(cx + txtXOff, cy + txtYOff, txtSize, 0, "A+B");
                    pxsim.U.addClass(btnTxt, "sim-text");
                    pxsim.U.addClass(btnTxt, "sim-text-virtual");
                    btng.appendChild(btnTxt);
                    return btng;
                };
                this.abBtn = mkVirtualBtn();
                this.abBtn.style.visibility = "hidden";
                let el = pxsim.svg.elt("g");
                pxsim.U.addClass(el, "sim-buttonpair");
                el.appendChild(this.aBtn);
                el.appendChild(this.bBtn);
                el.appendChild(this.abBtn);
                return el;
            }
            attachEvents() {
                let btnStates = [this.state.aBtn, this.state.bBtn];
                let btnSvgs = [this.aBtn, this.bBtn];
                btnSvgs.forEach((btn, index) => {
                    pxsim.pointerEvents.down.forEach(evid => btn.addEventListener(evid, ev => {
                        btnStates[index].pressed = true;
                    }));
                    btn.addEventListener(pxsim.pointerEvents.leave, ev => {
                        btnStates[index].pressed = false;
                    });
                    btn.addEventListener(pxsim.pointerEvents.up, ev => {
                        btnStates[index].pressed = false;
                        this.bus.queue(btnStates[index].id, this.state.props.BUTTON_EVT_UP);
                        this.bus.queue(btnStates[index].id, this.state.props.BUTTON_EVT_CLICK);
                    });
                });
                let updateBtns = (s) => {
                    btnStates.forEach(b => b.pressed = s);
                };
                pxsim.pointerEvents.down.forEach(evid => this.abBtn.addEventListener(evid, ev => {
                    updateBtns(true);
                }));
                this.abBtn.addEventListener(pxsim.pointerEvents.leave, ev => {
                    updateBtns(false);
                });
                this.abBtn.addEventListener(pxsim.pointerEvents.up, ev => {
                    updateBtns(false);
                    this.bus.queue(this.state.abBtn.id, this.state.props.BUTTON_EVT_UP);
                    this.bus.queue(this.state.abBtn.id, this.state.props.BUTTON_EVT_CLICK);
                });
            }
        }
        visuals.ButtonPairView = ButtonPairView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function compassHeading() {
            let b = pxsim.board().compassState;
            if (!b.usesHeading) {
                b.usesHeading = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            return b.heading;
        }
        input.compassHeading = compassHeading;
        function magneticForce() {
            // TODO
            return 0;
        }
        input.magneticForce = magneticForce;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function onPinPressed(pinId, handler) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.isTouched();
            pxsim.runtime.queueDisplayUpdate();
            pxsim.pxtcore.registerWithDal(pin.id, 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */, handler);
        }
        input.onPinPressed = onPinPressed;
        function onPinReleased(pinId, handler) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.isTouched();
            pxsim.runtime.queueDisplayUpdate();
            pxsim.pxtcore.registerWithDal(pin.id, 2 /* DAL.MICROBIT_BUTTON_EVT_UP */, handler);
        }
        input.onPinReleased = onPinReleased;
        function pinIsPressed(pinId) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return false;
            return pin.isTouched();
        }
        input.pinIsPressed = pinIsPressed;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    function getPin(id) {
        return pxsim.board().edgeConnectorState.getPin(id);
    }
    pxsim.getPin = getPin;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pins;
    (function (pins_1) {
        pins_1.edgeConnectorSoundDisabled = false;
        function digitalReadPin(pinId) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return -1;
            pin.mode = pxsim.PinFlags.Digital | pxsim.PinFlags.Input;
            return pin.value > 100 ? 1 : 0;
        }
        pins_1.digitalReadPin = digitalReadPin;
        function digitalWritePin(pinId, value) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.mode = pxsim.PinFlags.Digital | pxsim.PinFlags.Output;
            pin.value = value > 0 ? 1023 : 0;
            pxsim.runtime.queueDisplayUpdate();
        }
        pins_1.digitalWritePin = digitalWritePin;
        function setPull(pinId, pull) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.setPull(pull);
        }
        pins_1.setPull = setPull;
        function analogReadPin(pinId) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return -1;
            pin.mode = pxsim.PinFlags.Analog | pxsim.PinFlags.Input;
            return pin.value || 0;
        }
        pins_1.analogReadPin = analogReadPin;
        function analogWritePin(pinId, value) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.mode = pxsim.PinFlags.Analog | pxsim.PinFlags.Output;
            pin.value = value | 0;
            pxsim.runtime.queueDisplayUpdate();
        }
        pins_1.analogWritePin = analogWritePin;
        function analogSetPeriod(pinId, micros) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.mode = pxsim.PinFlags.Analog | pxsim.PinFlags.Output;
            pin.period = micros;
            pxsim.runtime.queueDisplayUpdate();
        }
        pins_1.analogSetPeriod = analogSetPeriod;
        function servoWritePin(pinId, value) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            analogSetPeriod(pinId, 20000);
            pin.servoAngle = value;
        }
        pins_1.servoWritePin = servoWritePin;
        function servoSetContinuous(pinId, value) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.servoSetContinuous(value);
        }
        pins_1.servoSetContinuous = servoSetContinuous;
        function servoSetPulse(pinId, micros) {
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            // TODO
        }
        pins_1.servoSetPulse = servoSetPulse;
        function analogSetPitchPin(pinId) {
            const b = pxsim.board();
            if (!b)
                return;
            let pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            const ec = b.edgeConnectorState;
            ec.pins.filter(p => !!p).forEach(p => p.pitch = false);
            pin.pitch = true;
        }
        pins_1.analogSetPitchPin = analogSetPitchPin;
        function setSoundOutputPinEnabled(enabled) {
            const b = pxsim.board();
            if (!b)
                return;
            const ec = b.edgeConnectorState;
            ec.pitchEnabled = !enabled;
        }
        pins_1.setSoundOutputPinEnabled = setSoundOutputPinEnabled;
        function analogSetPitchVolume(volume) {
            const ec = pxsim.board().edgeConnectorState;
            ec.pitchVolume = Math.max(0, Math.min(0xff, volume | 0));
            pxsim.AudioContextManager.setCurrentToneGain((ec.pitchVolume / 0xff) / 10);
        }
        pins_1.analogSetPitchVolume = analogSetPitchVolume;
        function analogPitchVolume() {
            const ec = pxsim.board().edgeConnectorState;
            return ec.pitchVolume;
        }
        pins_1.analogPitchVolume = analogPitchVolume;
        function analogPitch(frequency, ms) {
            // update analog output
            const b = pxsim.board();
            if (!b || isNaN(frequency) || isNaN(ms))
                return;
            const ec = b.edgeConnectorState;
            const pins = ec.pins;
            const pin = ec.pitchEnabled && (pins.filter(pin => !!pin && pin.pitch)[0] || pins[0]);
            const pitchVolume = ec.pitchVolume | 0;
            if (pin && !pins_1.edgeConnectorSoundDisabled) {
                pin.mode = pxsim.PinFlags.Analog | pxsim.PinFlags.Output;
                if (frequency <= 0 || pitchVolume <= 0) {
                    pin.value = 0;
                    pin.period = 0;
                }
                else {
                    const v = 1 << (pitchVolume >> 5);
                    pin.value = v;
                    pin.period = 1000000 / frequency;
                }
                pxsim.runtime.queueDisplayUpdate();
            }
            let cb = pxsim.getResume();
            if (pin) {
                const v = pitchVolume / 0xff;
                pxsim.AudioContextManager.tone(frequency, v / 10);
            }
            if (ms <= 0)
                cb();
            else {
                setTimeout(() => {
                    pxsim.AudioContextManager.stop();
                    if (pin && !pins_1.edgeConnectorSoundDisabled) {
                        pin.value = 0;
                        pin.period = 0;
                        pin.mode = pxsim.PinFlags.Unused;
                    }
                    pxsim.runtime.queueDisplayUpdate();
                    cb();
                }, ms);
            }
        }
        pins_1.analogPitch = analogPitch;
        function pushButton(pinId) {
            const b = pxsim.board();
            if (!b)
                return;
            const ec = b.edgeConnectorState;
            // TODO support buttons here
        }
        pins_1.pushButton = pushButton;
    })(pins = pxsim.pins || (pxsim.pins = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var music;
    (function (music) {
        function setVolume(volume) {
            pxsim.pins.analogSetPitchVolume(volume);
        }
        music.setVolume = setVolume;
        function volume() {
            return pxsim.pins.analogPitchVolume();
        }
        music.volume = volume;
    })(music = pxsim.music || (pxsim.music = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pins;
    (function (pins) {
        function setAudioPin(pinId) {
            pxsim.pins.analogSetPitchPin(pinId);
        }
        pins.setAudioPin = setAudioPin;
        const disabledSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <clipPath id="bounds" clipPathUnits="userSpaceOnUse">
        <circle cx="50" cy="50" r="45" />
        </clipPath>
        <circle cx="50" cy="50" r="40" stroke-width="10" stroke="red" fill="none" clip-path="url(#bounds)" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="red" stroke-width="10" clip-path="url(#bounds)" />
    </svg>
    `;
        function setAudioPinEnabled(enabled) {
            pins.edgeConnectorSoundDisabled = !enabled;
            const headphone = pxsim.board().viewHost.getView().querySelector("g.sim-headphone-cmp");
            if (headphone) {
                const existing = headphone.querySelector("#headphone-disabled");
                if (existing) {
                    if (enabled) {
                        existing.remove();
                    }
                    else {
                        return;
                    }
                }
                if (!enabled) {
                    const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
                    img.setAttribute("href", "data:image/svg+xml;utf8," + encodeURIComponent(disabledSVG));
                    img.setAttribute("id", "headphone-disabled");
                    img.style.transform = "scale(1.5) translate(-10px, -10px)";
                    headphone.appendChild(img);
                }
            }
        }
        pins.setAudioPinEnabled = setAudioPinEnabled;
    })(pins = pxsim.pins || (pxsim.pins = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    let PinFlags;
    (function (PinFlags) {
        PinFlags[PinFlags["Unused"] = 0] = "Unused";
        PinFlags[PinFlags["Digital"] = 1] = "Digital";
        PinFlags[PinFlags["Analog"] = 2] = "Analog";
        PinFlags[PinFlags["Input"] = 4] = "Input";
        PinFlags[PinFlags["Output"] = 8] = "Output";
        PinFlags[PinFlags["Touch"] = 16] = "Touch";
    })(PinFlags = pxsim.PinFlags || (pxsim.PinFlags = {}));
    class Pin {
        constructor(id) {
            this.id = id;
            this.touched = false;
            this.value = 0;
            this.period = 0;
            this.servoAngle = 0;
            this.mode = PinFlags.Unused;
            this.pitch = false;
            this.pull = 0; // PullDown
            this.servoContinuous = false;
        }
        digitalReadPin() {
            this.mode = PinFlags.Digital | PinFlags.Input;
            return this.value > 100 ? 1 : 0;
        }
        digitalWritePin(value) {
            this.mode = PinFlags.Digital | PinFlags.Output;
            this.value = value > 0 ? 200 : 0;
            pxsim.runtime.queueDisplayUpdate();
        }
        setPull(pull) {
            this.pull = pull;
            switch (pull) {
                case 0 /* PinPullMode.PullDown */:
                    this.value = 0;
                    break;
                case 1 /* PinPullMode.PullUp */:
                    this.value = 1023;
                    break;
                default:
                    this.value = pxsim.Math_.randomRange(0, 1023);
                    break;
            }
            // stop continuous servo if moving; 90 degrees represents a speed of 0
            if (this.servoContinuous && pull == 2 /* PinPullMode.PullNone */ && this.mode & PinFlags.Digital) {
                this.servoAngle = 90;
            }
        }
        analogReadPin() {
            this.mode = PinFlags.Analog | PinFlags.Input;
            return this.value || 0;
        }
        analogWritePin(value) {
            value = value >> 0;
            this.mode = PinFlags.Analog | PinFlags.Output;
            this.value = Math.max(0, Math.min(1023, value));
            pxsim.runtime.queueDisplayUpdate();
        }
        analogSetPeriod(micros) {
            micros = micros >> 0;
            this.mode = PinFlags.Analog | PinFlags.Output;
            this.period = micros;
            pxsim.runtime.queueDisplayUpdate();
        }
        servoWritePin(value) {
            value = value >> 0;
            this.analogSetPeriod(20000);
            this.servoAngle = Math.max(0, Math.min(180, value));
            pxsim.runtime.queueDisplayUpdate();
        }
        servoSetContinuous(value) {
            this.servoContinuous = !!value;
        }
        servoSetPulse(pinId, micros) {
            // TODO
        }
        isTouched() {
            this.mode = PinFlags.Touch | PinFlags.Analog | PinFlags.Input;
            return this.touched;
        }
    }
    pxsim.Pin = Pin;
    class EdgeConnectorState {
        constructor(props) {
            this.props = props;
            this.pitchEnabled = true;
            this.pins = props.pins.map(id => id != undefined ? new Pin(id) : null);
            this.pitchVolume = 0xff;
        }
        getPin(id) {
            return this.pins.filter(p => p && p.id == id)[0] || null;
        }
    }
    pxsim.EdgeConnectorState = EdgeConnectorState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var files;
    (function (files) {
        function appendLine(filename, text) {
            const b = pxsim.board();
            b.fileSystem.append(filename, text + "\r\n");
        }
        files.appendLine = appendLine;
        function appendString(filename, text) {
            const b = pxsim.board();
            b.fileSystem.append(filename, text);
        }
        files.appendString = appendString;
        function appendNumber(filename, value) {
            const b = pxsim.board();
            b.fileSystem.append(filename, value.toString());
        }
        files.appendNumber = appendNumber;
        function remove(filename) {
            const b = pxsim.board();
            b.fileSystem.remove(filename);
        }
        files.remove = remove;
        function readToSerial(filename) {
            const b = pxsim.board();
            let f = b.fileSystem.files[filename];
            if (f)
                b.serialState.writeSerial(f);
        }
        files.readToSerial = readToSerial;
    })(files = pxsim.files || (pxsim.files = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var flashlog;
    (function (flashlog) {
        let FlashLogTimeStampFormat;
        (function (FlashLogTimeStampFormat) {
            FlashLogTimeStampFormat[FlashLogTimeStampFormat["None"] = 0] = "None";
            FlashLogTimeStampFormat[FlashLogTimeStampFormat["Milliseconds"] = 1] = "Milliseconds";
            FlashLogTimeStampFormat[FlashLogTimeStampFormat["Seconds"] = 10] = "Seconds";
            FlashLogTimeStampFormat[FlashLogTimeStampFormat["Minutes"] = 600] = "Minutes";
            FlashLogTimeStampFormat[FlashLogTimeStampFormat["Hours"] = 36000] = "Hours";
            FlashLogTimeStampFormat[FlashLogTimeStampFormat["Days"] = 864000] = "Days";
        })(FlashLogTimeStampFormat || (FlashLogTimeStampFormat = {}));
        // we don't store the flash log in the runtime object, since it's persistent
        let headers = [];
        let currentRow = undefined;
        let SEPARATOR = ",";
        let timestampFormat = undefined;
        let mirrorToSerial = false;
        let logSize = 0;
        let committedCols = 0;
        /** allocated flash size **/
        const logEnd = 121852;
        let lastRunId;
        function init() {
            const b = pxsim.board();
            if (!b)
                return;
            if (b.runOptions.id !== lastRunId) {
                lastRunId = b.runOptions.id;
                erase();
            }
            b.ensureHardwareVersion(2);
        }
        function commitRow(data, type) {
            if (!pxsim.runtime)
                return;
            data += "\n";
            /** edge 18 does not support text encoder, so fall back to length **/
            logSize += typeof TextEncoder !== "undefined" ? (new TextEncoder().encode(data)).length : data.length;
            if (logSize >= logEnd) {
                pxsim.board().bus.queue(44 /* DAL.MICROBIT_ID_LOG */, 1 /* DAL.MICROBIT_LOG_EVT_LOG_FULL */);
                clear(false);
            }
            if (mirrorToSerial) {
                pxsim.board().serialState.writeSerial(data);
            }
            if (type !== "plaintext") {
                pxsim.board().serialState.writeCsv(data, type);
            }
        }
        function beginRow() {
            init();
            if (currentRow)
                return -1015 /* DAL.DEVICE_INVALID_STATE */;
            currentRow = [];
            return 0 /* DAL.DEVICE_OK */;
        }
        flashlog.beginRow = beginRow;
        function logData(key, value, prepend = false) {
            init();
            if (!currentRow)
                return -1015 /* DAL.DEVICE_INVALID_STATE */;
            // find header index
            let index = headers.indexOf(key);
            if (index < 0) {
                if (prepend) {
                    /** push timestamps up to front of uncommitted rows **/
                    headers.splice(committedCols, 0, key);
                    currentRow.splice(committedCols, 0, value);
                    index = committedCols;
                }
                else {
                    headers.push(key);
                    index = headers.length - 1;
                }
            }
            // store
            currentRow[index] = value;
            return 0 /* DAL.DEVICE_OK */;
        }
        flashlog.logData = logData;
        function endRow() {
            init();
            if (!currentRow)
                return -1015 /* DAL.DEVICE_INVALID_STATE */;
            if (!currentRow.some(el => el !== "" && el != undefined))
                return 0 /* DAL.DEVICE_OK */;
            if (timestampFormat !== FlashLogTimeStampFormat.None) {
                let unit = "";
                switch (timestampFormat) {
                    case FlashLogTimeStampFormat.Milliseconds:
                        unit = "milliseconds";
                        break;
                    case FlashLogTimeStampFormat.Minutes:
                        unit = "minutes";
                        break;
                    case FlashLogTimeStampFormat.Hours:
                        unit = "hours";
                        break;
                    case FlashLogTimeStampFormat.Days:
                        unit = "days";
                        break;
                    case FlashLogTimeStampFormat.Seconds:
                    default:
                        unit = "seconds";
                        break;
                }
                const timestamp = pxsim.runtime.runningTime();
                const timeUnit = timestampFormat > 1 ? timestampFormat * 100 : timestampFormat;
                const timeValue = timestamp / timeUnit;
                // TODO: there's a semi complicated format conversion
                // over in MicroBitLog::endRow that we might want to replicate.
                // https://github.com/lancaster-university/codal-microbit-v2/blob/master/source/MicroBitLog.cpp#L405
                logData(`time (${unit})`, "" + timeValue, true /** Prepend before new headers */);
            }
            currentRow.length = headers.length;
            const line = currentRow.join(SEPARATOR);
            if (headers.length !== committedCols) {
                commitRow(headers.join(SEPARATOR), "headers");
                committedCols = headers.length;
            }
            currentRow = undefined;
            commitRow(line, "row");
            return 0 /* DAL.DEVICE_OK */;
        }
        flashlog.endRow = endRow;
        function logString(s) {
            init();
            if (!s)
                return;
            commitRow(s, "plaintext");
        }
        flashlog.logString = logString;
        function clear(fullErase) {
            init();
            erase();
        }
        flashlog.clear = clear;
        function erase() {
            headers = [];
            logSize = 0;
            committedCols = 0;
            currentRow = undefined;
            pxsim.board().serialState.writeCsv("", "clear");
        }
        function setTimeStamp(format) {
            init();
            // this option is probably not serialized, needs to move in state
            timestampFormat = format;
        }
        flashlog.setTimeStamp = setTimeStamp;
        function setSerialMirroring(enabled) {
            init();
            mirrorToSerial = !!enabled;
        }
        flashlog.setSerialMirroring = setSerialMirroring;
        function getNumberOfRows(fromRowIndex = 0) {
            return 0; // TODO
        }
        flashlog.getNumberOfRows = getNumberOfRows;
        function getRows(fromRowIndex, nRows) {
            return ""; // TODO
        }
        flashlog.getRows = getRows;
    })(flashlog = pxsim.flashlog || (pxsim.flashlog = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    let DisplayMode;
    (function (DisplayMode) {
        DisplayMode[DisplayMode["bw"] = 0] = "bw";
        DisplayMode[DisplayMode["greyscale"] = 1] = "greyscale";
    })(DisplayMode = pxsim.DisplayMode || (pxsim.DisplayMode = {}));
    class LedMatrixState {
        constructor(runtime) {
            this.image = createInternalImage(5);
            this.brigthness = 255;
            this.displayMode = DisplayMode.bw;
            this.font = createFont();
            this.animationQ = new pxsim.AnimationQueue(runtime);
        }
    }
    pxsim.LedMatrixState = LedMatrixState;
    class Image extends pxsim.RefObject {
        constructor(width, data) {
            super();
            this.width = width;
            this.data = data;
            this.height = (this.data.length / this.width) | 0;
        }
        print() {
            console.debug(`Image id:${this.id} size:${this.width}x${this.height}`);
        }
        get(x, y) {
            x = x | 0;
            y = y | 0;
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                return 0;
            return this.data[y * this.width + x];
        }
        set(x, y, v) {
            x = x | 0;
            y = y | 0;
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                return;
            this.data[y * this.width + x] = Math.max(0, Math.min(255, v));
        }
        copyTo(xSrcIndex, length, target, xTargetIndex) {
            xSrcIndex = xSrcIndex | 0;
            length = length | 0;
            xTargetIndex = xTargetIndex | 0;
            for (let x = 0; x < length; x++) {
                for (let y = 0; y < this.height; y++) {
                    let value = this.get(xSrcIndex + x, y);
                    target.set(xTargetIndex + x, y, value);
                }
            }
        }
        shiftLeft(cols) {
            cols = cols | 0;
            for (let x = 0; x < this.width; ++x)
                for (let y = 0; y < this.height; ++y)
                    this.set(x, y, x < this.width - cols ? this.get(x + cols, y) : 0);
        }
        shiftRight(cols) {
            cols = cols >> 0;
            for (let x = this.width - 1; x >= 0; --x)
                for (let y = 0; y < this.height; ++y)
                    this.set(x, y, x >= cols ? this.get(x - cols, y) : 0);
        }
        clear() {
            for (let i = 0; i < this.data.length; ++i)
                this.data[i] = 0;
        }
    }
    pxsim.Image = Image;
    function createInternalImage(width) {
        width = width >> 0;
        let img = createImage(width);
        return img;
    }
    pxsim.createInternalImage = createInternalImage;
    function createImage(width) {
        width = width >> 0;
        return new Image(width, new Array(width * 5));
    }
    pxsim.createImage = createImage;
    function createImageFromBuffer(data) {
        return new Image((data.length / 5) | 0, data);
    }
    pxsim.createImageFromBuffer = createImageFromBuffer;
    function createImageFromString(text) {
        let font = pxsim.board().ledMatrixState.font;
        let w = font.width;
        let sprite = createInternalImage(6 * text.length - 1);
        let k = 0;
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i);
            let charStart = (charCode - 32) * 5;
            if (charStart < 0 || charStart + 5 > w) {
                charCode = " ".charCodeAt(0);
                charStart = (charCode - 32) * 5;
            }
            font.copyTo(charStart, 5, sprite, k);
            k = k + 5;
            if (i < text.length - 1) {
                k = k + 1;
            }
        }
        return sprite;
    }
    pxsim.createImageFromString = createImageFromString;
    pxsim.FONT_DATA = [0x0, 0x0, 0x0, 0x0, 0x0, 0x8, 0x8, 0x8, 0x0, 0x8, 0xa, 0x4a, 0x40, 0x0, 0x0, 0xa, 0x5f, 0xea, 0x5f, 0xea, 0xe, 0xd9, 0x2e, 0xd3, 0x6e, 0x19, 0x32, 0x44, 0x89, 0x33, 0xc, 0x92, 0x4c, 0x92, 0x4d, 0x8, 0x8, 0x0, 0x0, 0x0, 0x4, 0x88, 0x8, 0x8, 0x4, 0x8, 0x4, 0x84, 0x84, 0x88, 0x0, 0xa, 0x44, 0x8a, 0x40, 0x0, 0x4, 0x8e, 0xc4, 0x80, 0x0, 0x0, 0x0, 0x4, 0x88, 0x0, 0x0, 0xe, 0xc0, 0x0, 0x0, 0x0, 0x0, 0x8, 0x0, 0x1, 0x22, 0x44, 0x88, 0x10, 0xc, 0x92, 0x52, 0x52, 0x4c, 0x4, 0x8c, 0x84, 0x84, 0x8e, 0x1c, 0x82, 0x4c, 0x90, 0x1e, 0x1e, 0xc2, 0x44, 0x92, 0x4c, 0x6, 0xca, 0x52, 0x5f, 0xe2, 0x1f, 0xf0, 0x1e, 0xc1, 0x3e, 0x2, 0x44, 0x8e, 0xd1, 0x2e, 0x1f, 0xe2, 0x44, 0x88, 0x10, 0xe, 0xd1, 0x2e, 0xd1, 0x2e, 0xe, 0xd1, 0x2e, 0xc4, 0x88, 0x0, 0x8, 0x0, 0x8, 0x0, 0x0, 0x4, 0x80, 0x4, 0x88, 0x2, 0x44, 0x88, 0x4, 0x82, 0x0, 0xe, 0xc0, 0xe, 0xc0, 0x8, 0x4, 0x82, 0x44, 0x88, 0xe, 0xd1, 0x26, 0xc0, 0x4, 0xe, 0xd1, 0x35, 0xb3, 0x6c, 0xc, 0x92, 0x5e, 0xd2, 0x52, 0x1c, 0x92, 0x5c, 0x92, 0x5c, 0xe, 0xd0, 0x10, 0x10, 0xe, 0x1c, 0x92, 0x52, 0x52, 0x5c, 0x1e, 0xd0, 0x1c, 0x90, 0x1e, 0x1e, 0xd0, 0x1c, 0x90, 0x10, 0xe, 0xd0, 0x13, 0x71, 0x2e, 0x12, 0x52, 0x5e, 0xd2, 0x52, 0x1c, 0x88, 0x8, 0x8, 0x1c, 0x1f, 0xe2, 0x42, 0x52, 0x4c, 0x12, 0x54, 0x98, 0x14, 0x92, 0x10, 0x10, 0x10, 0x10, 0x1e, 0x11, 0x3b, 0x75, 0xb1, 0x31, 0x11, 0x39, 0x35, 0xb3, 0x71, 0xc, 0x92, 0x52, 0x52, 0x4c, 0x1c, 0x92, 0x5c, 0x90, 0x10, 0xc, 0x92, 0x52, 0x4c, 0x86, 0x1c, 0x92, 0x5c, 0x92, 0x51, 0xe, 0xd0, 0xc, 0x82, 0x5c, 0x1f, 0xe4, 0x84, 0x84, 0x84, 0x12, 0x52, 0x52, 0x52, 0x4c, 0x11, 0x31, 0x31, 0x2a, 0x44, 0x11, 0x31, 0x35, 0xbb, 0x71, 0x12, 0x52, 0x4c, 0x92, 0x52, 0x11, 0x2a, 0x44, 0x84, 0x84, 0x1e, 0xc4, 0x88, 0x10, 0x1e, 0xe, 0xc8, 0x8, 0x8, 0xe, 0x10, 0x8, 0x4, 0x82, 0x41, 0xe, 0xc2, 0x42, 0x42, 0x4e, 0x4, 0x8a, 0x40, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1f, 0x8, 0x4, 0x80, 0x0, 0x0, 0x0, 0xe, 0xd2, 0x52, 0x4f, 0x10, 0x10, 0x1c, 0x92, 0x5c, 0x0, 0xe, 0xd0, 0x10, 0xe, 0x2, 0x42, 0x4e, 0xd2, 0x4e, 0xc, 0x92, 0x5c, 0x90, 0xe, 0x6, 0xc8, 0x1c, 0x88, 0x8, 0xe, 0xd2, 0x4e, 0xc2, 0x4c, 0x10, 0x10, 0x1c, 0x92, 0x52, 0x8, 0x0, 0x8, 0x8, 0x8, 0x2, 0x40, 0x2, 0x42, 0x4c, 0x10, 0x14, 0x98, 0x14, 0x92, 0x8, 0x8, 0x8, 0x8, 0x6, 0x0, 0x1b, 0x75, 0xb1, 0x31, 0x0, 0x1c, 0x92, 0x52, 0x52, 0x0, 0xc, 0x92, 0x52, 0x4c, 0x0, 0x1c, 0x92, 0x5c, 0x90, 0x0, 0xe, 0xd2, 0x4e, 0xc2, 0x0, 0xe, 0xd0, 0x10, 0x10, 0x0, 0x6, 0xc8, 0x4, 0x98, 0x8, 0x8, 0xe, 0xc8, 0x7, 0x0, 0x12, 0x52, 0x52, 0x4f, 0x0, 0x11, 0x31, 0x2a, 0x44, 0x0, 0x11, 0x31, 0x35, 0xbb, 0x0, 0x12, 0x4c, 0x8c, 0x92, 0x0, 0x11, 0x2a, 0x44, 0x98, 0x0, 0x1e, 0xc4, 0x88, 0x1e, 0x6, 0xc4, 0x8c, 0x84, 0x86, 0x8, 0x8, 0x8, 0x8, 0x8, 0x18, 0x8, 0xc, 0x88, 0x18, 0x0, 0x0, 0xc, 0x83, 0x60];
    function createFont() {
        let nb = pxsim.FONT_DATA.length;
        let n = nb / 5;
        let font = createInternalImage(nb);
        for (let c = 0; c < n; c++) {
            for (let row = 0; row < 5; row++) {
                let char = pxsim.FONT_DATA[c * 5 + row];
                for (let col = 0; col < 5; col++) {
                    if ((char & (1 << col)) != 0)
                        font.set((c * 5 + 4) - col, row, 255);
                }
            }
        }
        return font;
    }
    pxsim.createFont = createFont;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var fonts;
    (function (fonts) {
        function charCodeBuffer(charCode) {
            if (charCode < 32 /* DAL.MICROBIT_FONT_ASCII_START */ || charCode > 126 /* DAL.MICROBIT_FONT_ASCII_END */)
                return undefined;
            const b = pxsim.board();
            const led = b.ledMatrixState;
            const font = led.font;
            const h = font.height;
            const w = font.width;
            const buf = pxsim.control.createBuffer(h);
            const offset = (charCode - 32 /* DAL.MICROBIT_FONT_ASCII_START */) * h;
            for (let row = 0; row < h; ++row)
                buf.data[row] = pxsim.FONT_DATA[offset + row];
            return buf;
        }
        fonts.charCodeBuffer = charCodeBuffer;
    })(fonts = pxsim.fonts || (pxsim.fonts = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var images;
    (function (images) {
        function createImage(img) {
            return img;
        }
        images.createImage = createImage;
        function createBigImage(img) {
            return img;
        }
        images.createBigImage = createBigImage;
    })(images = pxsim.images || (pxsim.images = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var ImageMethods;
    (function (ImageMethods) {
        function showImage(leds, offset, interval) {
            pxsim.pxtrt.nullCheck(leds);
            offset = offset >> 0;
            interval = interval >> 0;
            let cb = pxsim.getResume();
            let first = true;
            leds = clampPixelBrightness(leds);
            pxsim.board().ledMatrixState.animationQ.enqueue({
                interval,
                frame: () => {
                    if (first) {
                        leds.copyTo(offset, 5, pxsim.board().ledMatrixState.image, 0);
                        first = false;
                        return true;
                    }
                    return false;
                },
                whenDone: cb
            });
        }
        ImageMethods.showImage = showImage;
        function plotImage(leds, offset) {
            pxsim.pxtrt.nullCheck(leds);
            offset = offset >> 0;
            leds = clampPixelBrightness(leds);
            pxsim.board().ledMatrixState.animationQ.enqueue({
                interval: 0,
                frame: () => {
                    leds.copyTo(offset, 5, pxsim.board().ledMatrixState.image, 0);
                    return false;
                }
            });
        }
        ImageMethods.plotImage = plotImage;
        function height(leds) {
            pxsim.pxtrt.nullCheck(leds);
            return leds.height;
        }
        ImageMethods.height = height;
        function width(leds) {
            pxsim.pxtrt.nullCheck(leds);
            return leds.width;
        }
        ImageMethods.width = width;
        function plotFrame(leds, frame) {
            ImageMethods.plotImage(leds, frame * leds.height);
        }
        ImageMethods.plotFrame = plotFrame;
        function showFrame(leds, frame, interval) {
            ImageMethods.showImage(leds, frame * leds.height, interval);
        }
        ImageMethods.showFrame = showFrame;
        function pixel(leds, x, y) {
            pxsim.pxtrt.nullCheck(leds);
            return leds.get(x, y);
        }
        ImageMethods.pixel = pixel;
        function setPixel(leds, x, y, v) {
            pxsim.pxtrt.nullCheck(leds);
            leds.set(x, y, v);
        }
        ImageMethods.setPixel = setPixel;
        function clear(leds) {
            pxsim.pxtrt.nullCheck(leds);
            leds.clear();
        }
        ImageMethods.clear = clear;
        function setPixelBrightness(i, x, y, b) {
            pxsim.pxtrt.nullCheck(i);
            i.set(x, y, b);
        }
        ImageMethods.setPixelBrightness = setPixelBrightness;
        function pixelBrightness(i, x, y) {
            pxsim.pxtrt.nullCheck(i);
            return i.get(x, y);
        }
        ImageMethods.pixelBrightness = pixelBrightness;
        function scrollImage(leds, stride, interval) {
            pxsim.pxtrt.nullCheck(leds);
            stride = stride >> 0;
            interval = interval >> 0;
            if (stride == 0)
                stride = 1;
            let cb = pxsim.getResume();
            let off = stride > 0 ? 0 : leds.width - 1;
            let display = pxsim.board().ledMatrixState.image;
            leds = clampPixelBrightness(leds);
            pxsim.board().ledMatrixState.animationQ.enqueue({
                interval: interval,
                frame: () => {
                    if (off >= leds.width || off < 0)
                        return false;
                    if (stride > 0) {
                        display.shiftLeft(stride);
                        const c = Math.min(stride, leds.width - off);
                        leds.copyTo(off, c, display, 5 - stride);
                    }
                    else {
                        display.shiftRight(-stride);
                        const c = Math.min(-stride, leds.width - off);
                        leds.copyTo(off, c, display, 0);
                    }
                    off += stride;
                    return true;
                },
                whenDone: cb
            });
        }
        ImageMethods.scrollImage = scrollImage;
        function clampPixelBrightness(img) {
            let res = img;
            if (pxsim.led.displayMode() === pxsim.DisplayMode.greyscale && pxsim.led.brightness() < 0xff) {
                res = new pxsim.Image(img.width, img.data);
                const b = pxsim.led.brightness();
                for (let x = 0; x < res.width; ++x) {
                    for (let y = 0; y < 5; ++y) {
                        if (pixelBrightness(res, x, y) > b) {
                            setPixelBrightness(res, x, y, b);
                        }
                    }
                }
            }
            return res;
        }
    })(ImageMethods = pxsim.ImageMethods || (pxsim.ImageMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var basic;
    (function (basic) {
        function showNumber(x, interval) {
            interval |= 0;
            if (interval <= 0)
                interval = 1;
            let leds = pxsim.createImageFromString(x.toString());
            if (x < 0 || x >= 10)
                pxsim.ImageMethods.scrollImage(leds, 1, interval);
            else
                showLeds(leds, interval * 5);
        }
        basic.showNumber = showNumber;
        function showString(s, interval) {
            interval |= 0;
            if (interval <= 0)
                interval = 1;
            if (s.length == 0) {
                clearScreen();
                basic.pause(interval * 5);
            }
            else if (s.length > 1) {
                pxsim.ImageMethods.scrollImage(pxsim.createImageFromString(s + " "), 1, interval);
            }
            else {
                showLeds(pxsim.createImageFromString(s), interval * 5);
            }
        }
        basic.showString = showString;
        function showLeds(leds, interval) {
            interval |= 0;
            showAnimation(leds, interval);
        }
        basic.showLeds = showLeds;
        function clearScreen() {
            pxsim.board().ledMatrixState.image.clear();
            pxsim.runtime.queueDisplayUpdate();
        }
        basic.clearScreen = clearScreen;
        function showAnimation(leds, interval) {
            interval |= 0;
            pxsim.ImageMethods.scrollImage(leds, 5, interval);
        }
        basic.showAnimation = showAnimation;
        function plotLeds(leds) {
            pxsim.ImageMethods.plotImage(leds, 0);
        }
        basic.plotLeds = plotLeds;
    })(basic = pxsim.basic || (pxsim.basic = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var led;
    (function (led) {
        function plot(x, y) {
            x |= 0;
            y |= 0;
            pxsim.board().ledMatrixState.image.set(x, y, 0xff);
            pxsim.runtime.queueDisplayUpdate();
        }
        led.plot = plot;
        function plotBrightness(x, y, brightness) {
            x |= 0;
            y |= 0;
            const state = pxsim.board().ledMatrixState;
            brightness |= 0;
            brightness = Math.max(0, Math.min(led.brightness(), brightness));
            if (brightness != 0 && brightness != 0xff && state.displayMode != pxsim.DisplayMode.greyscale)
                state.displayMode = pxsim.DisplayMode.greyscale;
            state.image.set(x, y, brightness);
            pxsim.runtime.queueDisplayUpdate();
        }
        led.plotBrightness = plotBrightness;
        function unplot(x, y) {
            x |= 0;
            y |= 0;
            pxsim.board().ledMatrixState.image.set(x, y, 0);
            pxsim.runtime.queueDisplayUpdate();
        }
        led.unplot = unplot;
        function pointBrightness(x, y) {
            x |= 0;
            y |= 0;
            return pxsim.board().ledMatrixState.image.get(x, y);
        }
        led.pointBrightness = pointBrightness;
        function brightness() {
            return pxsim.board().ledMatrixState.brigthness;
        }
        led.brightness = brightness;
        function setBrightness(value) {
            value |= 0;
            pxsim.board().ledMatrixState.brigthness = Math.max(0, Math.min(255, value));
            pxsim.runtime.queueDisplayUpdate();
        }
        led.setBrightness = setBrightness;
        function stopAnimation() {
            pxsim.board().ledMatrixState.animationQ.cancelAll();
            pxsim.board().ledMatrixState.image.clear();
        }
        led.stopAnimation = stopAnimation;
        function setDisplayMode(mode) {
            pxsim.board().ledMatrixState.displayMode = mode;
            pxsim.runtime.queueDisplayUpdate();
        }
        led.setDisplayMode = setDisplayMode;
        function displayMode() {
            return pxsim.board().ledMatrixState.displayMode;
        }
        led.displayMode = displayMode;
        function screenshot() {
            let img = pxsim.createImage(5);
            pxsim.board().ledMatrixState.image.copyTo(0, 5, img, 0);
            return img;
        }
        led.screenshot = screenshot;
        function enable(on) {
            pxsim.board().ledMatrixState.disabled = !on;
            pxsim.runtime.queueDisplayUpdate();
        }
        led.enable = enable;
    })(led = pxsim.led || (pxsim.led = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function lightLevel() {
            let b = pxsim.board().lightSensorState;
            if (!b.usesLightLevel) {
                b.usesLightLevel = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            return b.lightLevel;
        }
        input.lightLevel = lightLevel;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function onLogoEvent(action, handler) {
            const b = pxsim.board();
            if (!b)
                return;
            // update rendering
            pxsim.runtime.queueDisplayUpdate();
            // minimum v2
            b.ensureHardwareVersion(2);
            // register handle
            pxsim.pxtcore.registerWithDal(121 /* DAL.MICROBIT_ID_LOGO */, action, handler);
        }
        input.onLogoEvent = onLogoEvent;
        function logoIsPressed() {
            const b = pxsim.board();
            if (!b)
                return false;
            // minimum v2
            b.ensureHardwareVersion(2);
            return b.logoTouch.pressed;
        }
        input.logoIsPressed = logoIsPressed;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pins;
    (function (pins) {
        function touchSetMode(name, mode) {
            const b = pxsim.board();
            if (b)
                b.ensureHardwareVersion(2);
            // not simulated
        }
        pins.touchSetMode = touchSetMode;
    })(pins = pxsim.pins || (pxsim.pins = {}));
})(pxsim || (pxsim = {}));
// move to common packages eventually
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function soundLevel() {
            const b = pxsim.microphoneState();
            if (!b)
                return 0;
            b.setUsed();
            b.pingSoundLevel();
            return b.getLevel();
        }
        input.soundLevel = soundLevel;
        function onSound(sound /* SoundThreshold */, body) {
            const b = pxsim.microphoneState();
            if (!b)
                return;
            b.setUsed();
            b.onSoundRegistered = true;
            pxsim.pxtcore.registerWithDal(b.id, sound, body);
        }
        input.onSound = onSound;
        function setSoundThreshold(sound, threshold) {
            const b = pxsim.microphoneState();
            if (!b)
                return;
            if (sound === 2 /* SoundThreshold.Loud */)
                b.setHighThreshold(threshold);
            else
                b.setLowThreshold(threshold);
        }
        input.setSoundThreshold = setSoundThreshold;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        function createMicroServoElement() {
            return pxsim.svg.parseString(`
        <svg xmlns="http://www.w3.org/2000/svg" id="svg2" width="112.188" height="299.674">
          <g id="layer1" stroke-linecap="round" stroke-linejoin="round" transform="scale(0.8)">
            <path id="path8212" fill="#0061ff" stroke-width="6.6" d="M.378 44.61v255.064h112.188V44.61H.378z"/>
            <path id="crankbase" fill="#00f" stroke-width="6.6" d="M56.57 88.047C25.328 88.047 0 113.373 0 144.615c.02 22.352 11.807 42.596 32.238 51.66.03 3.318.095 5.24.088 7.938 0 13.947 11.307 25.254 25.254 25.254 13.947 0 25.254-11.307 25.254-25.254-.006-2.986-.415-5.442-.32-8.746 19.487-9.45 30.606-29.195 30.625-50.852 0-31.24-25.33-56.568-56.57-56.568z"/>
            <path id="lowertip" fill="#00a2ff" stroke-width="2" d="M.476 260.78v38.894h53.82v-10.486a6.82 6.566 0 0 1-4.545-6.182 6.82 6.566 0 0 1 6.82-6.566 6.82 6.566 0 0 1 6.82 6.566 6.82 6.566 0 0 1-4.545 6.182v10.486h53.82V260.78H.475z"/>
            <path id="uppertip" fill="#00a2ff" stroke-width="2" d="M112.566 83.503V44.61h-53.82v10.487a6.82 6.566 0 0 1 4.544 6.18 6.82 6.566 0 0 1-6.818 6.568 6.82 6.566 0 0 1-6.82-6.567 6.82 6.566 0 0 1 4.546-6.18V44.61H.378v38.893h112.188z"/>
            <path id="VCC" fill="red" stroke-width="2" d="M53.72 21.93h5.504v22.627H53.72z"/>
            <path id="LOGIC" fill="#fc0" stroke-width="2" d="M47.3 21.93h5.503v22.627H47.3z"/>
            <path id="GND" fill="#a02c2c" stroke-width="2" d="M60.14 21.93h5.505v22.627H60.14z"/>
            <path id="connector" stroke-width="2" d="M45.064 0a1.488 1.488 0 0 0-1.488 1.488v24.5a1.488 1.488 0 0 0 1.488 1.487h22.71a1.488 1.488 0 0 0 1.49-1.488v-24.5A1.488 1.488 0 0 0 67.774 0h-22.71z"/>
            <g id="crank" transform="translate(0 -752.688)">
              <path id="arm" fill="#ececec" stroke="#000" stroke-width="1.372" d="M47.767 880.88c-4.447 1.162-8.412 8.278-8.412 18.492s3.77 18.312 8.412 18.494c8.024.314 78.496 5.06 78.51-16.952.012-22.013-74.377-21.117-78.51-20.035z"/>
              <circle id="path8216" cx="56.661" cy="899.475" r="8.972" fill="gray" stroke-width="2"/>
            </g>
          </g>
        </svg>
                    `).firstElementChild;
        }
        function mkMicroServoPart(xy = [0, 0]) {
            return { el: createMicroServoElement(), x: xy[0], y: xy[1], w: 112.188, h: 299.674 };
        }
        visuals.mkMicroServoPart = mkMicroServoPart;
        const SPEED = 300; // 0.1s/60 degree
        class MicroServoView {
            constructor() {
                this.style = "";
                this.overElement = undefined;
                this.defs = [];
                this.currentAngle = 0;
                this.targetAngle = 0;
                this.lastAngleTime = 0;
            }
            init(bus, state, svgEl, otherParams) {
                this.state = state;
                this.pin = this.state.props.servos[pxsim.readPin(otherParams["name"] || otherParams["pin"])];
                this.bus = bus;
                this.defs = [];
                this.initDom();
                this.updateState();
            }
            initDom() {
                this.element = createMicroServoElement();
                this.crankEl = this.element.querySelector("#crank");
                this.crankTransform = this.crankEl.getAttribute("transform");
            }
            moveToCoord(xy) {
                let [x, y] = xy;
                visuals.translateEl(this.element, [x, y]);
            }
            updateState() {
                const p = this.state.getPin(this.pin);
                const continuous = !!p.servoContinuous;
                const servoAngle = p.servoAngle;
                if (continuous) {
                    // for a continuous servo, the angle is interpreted as a rotation speed
                    // 0 -> -100%, 90 - 0%, 180 - 100%
                    const now = pxsim.U.now();
                    const dt = Math.min(now - this.lastAngleTime, 50) / 1000;
                    this.currentAngle = this.targetAngle;
                    this.targetAngle += ((servoAngle - 90) / 90) * SPEED * dt;
                }
                else {
                    this.targetAngle = 180.0 - servoAngle;
                }
                if (this.targetAngle != this.currentAngle)
                    this.renderAngle();
            }
            renderAngle() {
                const now = pxsim.U.now();
                const cx = 56.661;
                const cy = 899.475;
                const dt = Math.min(now - this.lastAngleTime, 50) / 1000;
                const delta = this.targetAngle - this.currentAngle;
                this.currentAngle += Math.min(Math.abs(delta), SPEED * dt) * (delta > 0 ? 1 : -1);
                this.crankEl.setAttribute("transform", this.crankTransform
                    + ` rotate(${this.currentAngle}, ${cx}, ${cy})`);
                this.lastAngleTime = now;
                setTimeout(() => pxsim.runtime.updateDisplay(), 20);
            }
            updateTheme() {
            }
        }
        visuals.MicroServoView = MicroServoView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var control;
    (function (control) {
        function __midiSend(data) {
            const b = pxsim.board();
            pxsim.AudioContextManager.sendMidiMessage(data);
        }
        control.__midiSend = __midiSend;
    })(control = pxsim.control || (pxsim.control = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    /**
     * Error codes used in the micro:bit runtime.
    */
    let PanicCode;
    (function (PanicCode) {
        // PANIC Codes. These are not return codes, but are terminal conditions.
        // These induce a panic operation, where all code stops executing, and a panic state is
        // entered where the panic code is diplayed.
        // Out out memory error. Heap storage was requested, but is not available.
        PanicCode[PanicCode["MICROBIT_OOM"] = 20] = "MICROBIT_OOM";
        // Corruption detected in the micro:bit heap space
        PanicCode[PanicCode["MICROBIT_HEAP_ERROR"] = 30] = "MICROBIT_HEAP_ERROR";
        // Dereference of a NULL pointer through the ManagedType class,
        PanicCode[PanicCode["MICROBIT_NULL_DEREFERENCE"] = 40] = "MICROBIT_NULL_DEREFERENCE";
    })(PanicCode = pxsim.PanicCode || (pxsim.PanicCode = {}));
    ;
    function panic(code) {
        console.log("PANIC:", code);
        throw new Error("PANIC " + code);
    }
    pxsim.panic = panic;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var basic;
    (function (basic) {
        basic.pause = pxsim.thread.pause;
        basic.forever = pxsim.thread.forever;
    })(basic = pxsim.basic || (pxsim.basic = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var control;
    (function (control) {
        control.inBackground = pxsim.thread.runInBackground;
        function onEvent(id, evid, handler, flags) {
            if (id == 3 /* DAL.MICROBIT_ID_BUTTON_AB */) {
                const b = pxsim.board().buttonPairState;
                if (!b.usesButtonAB) {
                    b.usesButtonAB = true;
                    pxsim.runtime.queueDisplayUpdate();
                }
            }
            pxsim.pxtcore.registerWithDal(id, evid, handler, flags);
        }
        control.onEvent = onEvent;
        function eventTimestamp() {
            return pxsim.board().bus.getLastEventTime();
        }
        control.eventTimestamp = eventTimestamp;
        function eventValue() {
            return pxsim.board().bus.getLastEventValue();
        }
        control.eventValue = eventValue;
    })(control = pxsim.control || (pxsim.control = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var input;
    (function (input) {
        function calibrateCompass() {
            // device calibrates...
        }
        input.calibrateCompass = calibrateCompass;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pins;
    (function (pins) {
        function onPulsed(name, pulse, body) {
        }
        pins.onPulsed = onPulsed;
        function pulseDuration() {
            return 0;
        }
        pins.pulseDuration = pulseDuration;
        function createBuffer(sz) {
            return pxsim.BufferMethods.createBuffer(sz);
        }
        pins.createBuffer = createBuffer;
        function pulseIn(name, value, maxDuration) {
            let pin = pxsim.getPin(name);
            if (!pin)
                return 0;
            return 5000;
        }
        pins.pulseIn = pulseIn;
        function spiWrite(value) {
            // TODO
            return 0;
        }
        pins.spiWrite = spiWrite;
        function spiTransfer(cmd, resp) {
            // TODO
        }
        pins.spiTransfer = spiTransfer;
        function spiFrequency(f) {
            // TODO
        }
        pins.spiFrequency = spiFrequency;
        function spiFormat(bits, mode) {
            // TODO
        }
        pins.spiFormat = spiFormat;
        function spiPins(mosi, miso, sck) {
            // TODO
        }
        pins.spiPins = spiPins;
        function i2cReadBuffer(address, size, repeat) {
            // fake reading zeros
            return createBuffer(size);
        }
        pins.i2cReadBuffer = i2cReadBuffer;
        function i2cWriteBuffer(address, buf, repeat) {
            // fake - noop
        }
        pins.i2cWriteBuffer = i2cWriteBuffer;
        // this likely shouldn't be called
        function getPinAddress(name) {
            return pxsim.getPin(name);
        }
        pins.getPinAddress = getPinAddress;
        function setEvents(name, event) {
        }
        pins.setEvents = setEvents;
        function setMatrixWidth(pin, width) {
            const lp = pxsim.neopixelState(pin);
            if (!lp)
                return;
            lp.width = width;
        }
        pins.setMatrixWidth = setMatrixWidth;
    })(pins = pxsim.pins || (pxsim.pins = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var devices;
    (function (devices) {
        function tellCameraTo(action) {
            // TODO
        }
        devices.tellCameraTo = tellCameraTo;
        function tellRemoteControlTo(action) {
            // TODO
        }
        devices.tellRemoteControlTo = tellRemoteControlTo;
        function raiseAlertTo(action) {
            // TODO
        }
        devices.raiseAlertTo = raiseAlertTo;
        function onSignalStrengthChanged(action) {
            // TODO
        }
        devices.onSignalStrengthChanged = onSignalStrengthChanged;
        function signalStrength() {
            // TODO
            return 0;
        }
        devices.signalStrength = signalStrength;
        function onGamepadButton(button, body) {
            // TODO
        }
        devices.onGamepadButton = onGamepadButton;
    })(devices = pxsim.devices || (pxsim.devices = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var bluetooth;
    (function (bluetooth) {
        function startIOPinService() {
            // TODO
        }
        bluetooth.startIOPinService = startIOPinService;
        function startLEDService() {
            // TODO
        }
        bluetooth.startLEDService = startLEDService;
        function startTemperatureService() {
            // TODO
        }
        bluetooth.startTemperatureService = startTemperatureService;
        function startMagnetometerService() {
            // TODO
        }
        bluetooth.startMagnetometerService = startMagnetometerService;
        function startAccelerometerService() {
            // TODO
        }
        bluetooth.startAccelerometerService = startAccelerometerService;
        function startButtonService() {
            // TODO
        }
        bluetooth.startButtonService = startButtonService;
        function startUartService() {
            // TODO
        }
        bluetooth.startUartService = startUartService;
        function uartWriteString(s) {
            pxsim.serial.writeString(s);
        }
        bluetooth.uartWriteString = uartWriteString;
        function uartWriteBuffer(b) {
            pxsim.serial.writeBuffer(b);
        }
        bluetooth.uartWriteBuffer = uartWriteBuffer;
        function uartReadBuffer() {
            return pxsim.pins.createBuffer(0);
        }
        bluetooth.uartReadBuffer = uartReadBuffer;
        function uartReadUntil(del) {
            return pxsim.serial.readUntil(del);
        }
        bluetooth.uartReadUntil = uartReadUntil;
        function onUartDataReceived(delimiters, handler) {
            let b = pxsim.board();
            b.bus.listen(1200 /* DAL.MICROBIT_ID_BLE_UART */, 1 /* DAL.MICROBIT_UART_S_EVT_DELIM_MATCH */, handler);
        }
        bluetooth.onUartDataReceived = onUartDataReceived;
        function onBluetoothConnected(a) {
            // TODO
        }
        bluetooth.onBluetoothConnected = onBluetoothConnected;
        function onBluetoothDisconnected(a) {
            // TODO
        }
        bluetooth.onBluetoothDisconnected = onBluetoothDisconnected;
        function advertiseUrl(url, power, connectable) { }
        bluetooth.advertiseUrl = advertiseUrl;
        function advertiseUidBuffer(nsAndInstance, power, connectable) { }
        bluetooth.advertiseUidBuffer = advertiseUidBuffer;
        function stopAdvertising() { }
        bluetooth.stopAdvertising = stopAdvertising;
        function setTransmitPower(power) { }
        bluetooth.setTransmitPower = setTransmitPower;
    })(bluetooth = pxsim.bluetooth || (pxsim.bluetooth = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var light;
    (function (light) {
        function sendWS2812Buffer(buffer, pin) {
            pxsim.sendBufferAsm(buffer, pin);
        }
        light.sendWS2812Buffer = sendWS2812Buffer;
        function sendWS2812BufferWithBrightness(buffer, pin, brightness) {
            const clone = new pxsim.RefBuffer(new Uint8Array(buffer.data));
            const data = clone.data;
            for (let i = 0; i < data.length; ++i) {
                data[i] = (data[i] * brightness) >> 8;
            }
            pxsim.sendBufferAsm(clone, pin);
        }
        light.sendWS2812BufferWithBrightness = sendWS2812BufferWithBrightness;
        function setMode(pin, mode) {
            const lp = pxsim.neopixelState(pin);
            if (!lp)
                return;
            lp.mode = mode & 0xff;
        }
        light.setMode = setMode;
    })(light = pxsim.light || (pxsim.light = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var music;
    (function (music) {
        function setBuiltInSpeakerEnabled(enabled) {
            const b = pxsim.board();
            if (!b)
                return;
            // TODO some rendering about this
            b.ensureHardwareVersion(2);
            b.speakerEnabled = !!enabled;
        }
        music.setBuiltInSpeakerEnabled = setBuiltInSpeakerEnabled;
        function setSilenceLevel(level) {
            // ignore in v1,v2
        }
        music.setSilenceLevel = setSilenceLevel;
        function isSoundPlaying() {
            const audioActive = pxsim.AudioContextManager.isAudioElementActive();
            const soundExpressionPlaying = pxsim.codal.music.isSoundExpPlaying();
            return audioActive || soundExpressionPlaying || pxsim.record.audioIsPlaying();
        }
        music.isSoundPlaying = isSoundPlaying;
    })(music = pxsim.music || (pxsim.music = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var music;
    (function (music) {
        var MusicalIntervals;
        (function (MusicalIntervals) {
            // #if CONFIG_ENABLED(JUST_SCALE)
            // const float MusicalIntervals.chromaticInterval[] = [1.000000, 1.059463, 1.122462, 1.189207, 1.259921, 1.334840, 1.414214, 1.498307, 1.587401, 1.681793, 1.781797, 1.887749];
            // #else
            // const float MusicalIntervals.chromaticInterval[] = [1.000000, 1.0417, 1.1250, 1.2000, 1.2500, 1.3333, 1.4063, 1.5000, 1.6000, 1.6667, 1.8000, 1.8750];
            // #endif
            MusicalIntervals.chromaticInterval = [1.000000, 1.0417, 1.1250, 1.2000, 1.2500, 1.3333, 1.4063, 1.5000, 1.6000, 1.6667, 1.8000, 1.8750];
            MusicalIntervals.majorScaleInterval = [MusicalIntervals.chromaticInterval[0], MusicalIntervals.chromaticInterval[2], MusicalIntervals.chromaticInterval[4], MusicalIntervals.chromaticInterval[5], MusicalIntervals.chromaticInterval[7], MusicalIntervals.chromaticInterval[9], MusicalIntervals.chromaticInterval[11]];
            MusicalIntervals.minorScaleInterval = [MusicalIntervals.chromaticInterval[0], MusicalIntervals.chromaticInterval[2], MusicalIntervals.chromaticInterval[3], MusicalIntervals.chromaticInterval[5], MusicalIntervals.chromaticInterval[7], MusicalIntervals.chromaticInterval[8], MusicalIntervals.chromaticInterval[10]];
            MusicalIntervals.pentatonicScaleInterval = [MusicalIntervals.chromaticInterval[0], MusicalIntervals.chromaticInterval[2], MusicalIntervals.chromaticInterval[4], MusicalIntervals.chromaticInterval[7], MusicalIntervals.chromaticInterval[9]];
            MusicalIntervals.majorTriadInterval = [MusicalIntervals.chromaticInterval[0], MusicalIntervals.chromaticInterval[4], MusicalIntervals.chromaticInterval[7]];
            MusicalIntervals.minorTriadInterval = [MusicalIntervals.chromaticInterval[0], MusicalIntervals.chromaticInterval[3], MusicalIntervals.chromaticInterval[7]];
            MusicalIntervals.diminishedInterval = [MusicalIntervals.chromaticInterval[0], MusicalIntervals.chromaticInterval[3], MusicalIntervals.chromaticInterval[6], MusicalIntervals.chromaticInterval[9]];
            MusicalIntervals.wholeToneInterval = [MusicalIntervals.chromaticInterval[0], MusicalIntervals.chromaticInterval[2], MusicalIntervals.chromaticInterval[4], MusicalIntervals.chromaticInterval[6], MusicalIntervals.chromaticInterval[8], MusicalIntervals.chromaticInterval[10]];
        })(MusicalIntervals = music.MusicalIntervals || (music.MusicalIntervals = {}));
    })(music = pxsim.music || (pxsim.music = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var music;
    (function (music) {
        var MusicalProgressions;
        (function (MusicalProgressions) {
            MusicalProgressions.chromatic = { interval: music.MusicalIntervals.chromaticInterval, length: 12 };
            MusicalProgressions.majorScale = { interval: music.MusicalIntervals.majorScaleInterval, length: 7 };
            MusicalProgressions.minorScale = { interval: music.MusicalIntervals.minorScaleInterval, length: 7 };
            MusicalProgressions.pentatonicScale = { interval: music.MusicalIntervals.pentatonicScaleInterval, length: 5 };
            MusicalProgressions.majorTriad = { interval: music.MusicalIntervals.majorTriadInterval, length: 3 };
            MusicalProgressions.minorTriad = { interval: music.MusicalIntervals.minorTriadInterval, length: 3 };
            MusicalProgressions.diminished = { interval: music.MusicalIntervals.diminishedInterval, length: 4 };
            MusicalProgressions.wholeTone = { interval: music.MusicalIntervals.wholeToneInterval, length: 6 };
            /**
             * Determine the frequency of a given note in a given progressions
             *
             * @param root The root frequency of the progression
             * @param progression The Progression to use
             * @param offset The offset (interval) of the note to generate
             * @return The frequency of the note requested in Hz.
             */
            function calculateFrequencyFromProgression(root, progression, offset) {
                let octave = Math.floor(offset / progression.length);
                let index = offset % progression.length;
                return root * Math.pow(2, octave) * progression.interval[index];
            }
            MusicalProgressions.calculateFrequencyFromProgression = calculateFrequencyFromProgression;
        })(MusicalProgressions = music.MusicalProgressions || (music.MusicalProgressions = {}));
    })(music = pxsim.music || (pxsim.music = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    class RecordingState {
        constructor() {
            this.currentlyRecording = false;
            this.audioClippingThreshold = 0.08;
            this.audioPlaying = false;
            this.inputBitRate = pxsim.record.defaultBitRate();
            this.outputBitRate = pxsim.record.defaultBitRate();
            this.handleAudioPlaying = () => {
                this.audioPlaying = true;
            };
            this.handleAudioStopped = () => {
                this.audioPlaying = false;
            };
            this.initListeners = () => {
                if (this.recording) {
                    this.recording.addEventListener("play", this.handleAudioPlaying, false);
                    this.recording.addEventListener("ended", this.handleAudioStopped, false);
                }
            };
        }
    }
    pxsim.RecordingState = RecordingState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var record;
    (function (record_1) {
        // Arbitrarily chosen lower bound. Can't go much lower than this without bugs cropping up
        const MIN_BIT_RATE = 3000;
        // This is double the default in chrome (128000)
        const MAX_BIT_RATE = 256000;
        const MAX_SAMPLE_RATE = 22000;
        const MIN_SAMPLE_RATE = 1000;
        const MIN_RECORDING_TIME = 2000;
        const MAX_RECORDING_TIME = 10000;
        let _initialized = false;
        function init() {
            if (!_initialized) {
                registerSimStop();
                _initialized = true;
            }
        }
        function stopRecorder(b) {
            const state = b.recordingState;
            state.recorder.stop();
            state.currentlyRecording = false;
            pxsim.runtime.queueDisplayUpdate();
            if (state.stream.active) {
                for (const track of state.stream.getAudioTracks()) {
                    track.stop();
                    track.enabled = false;
                }
            }
        }
        async function populateRecording(b) {
            const state = b.recordingState;
            if (state.currentlyErasing) {
                await erasingAsync(b);
            }
            if (state.chunks[0].size > 0) {
                state.audioURL = null;
                const recordingType = pxsim.isSafari() ? "audio/mp4" : "audio/ogg; codecs=opus";
                const blob = new Blob(state.chunks, { type: recordingType });
                state.audioURL = window.URL.createObjectURL(blob);
            }
            state.currentlyRecording = false;
            state.recorder = null;
            state.chunks = [];
        }
        async function record() {
            var _a;
            let b = pxsim.board();
            init();
            const state = b.recordingState;
            if (state.recorder) {
                state.recorder.stop();
                clearTimeout(state.recordTimeoutID);
            }
            if ((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia) {
                try {
                    state.stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    state.recorder = new MediaRecorder(state.stream, { audioBitsPerSecond: state.inputBitRate });
                    state.recorder.start();
                    state.currentlyRecording = true;
                    pxsim.runtime.queueDisplayUpdate();
                    const recordBitRate = state.inputBitRate;
                    const duration = (1 - ((recordBitRate - MIN_BIT_RATE) / (MAX_BIT_RATE - MIN_BIT_RATE))) * (MAX_RECORDING_TIME - MIN_RECORDING_TIME) + MIN_RECORDING_TIME;
                    state.recordTimeoutID = setTimeout(() => {
                        stopRecorder(b);
                    }, duration);
                    state.recorder.ondataavailable = (e) => {
                        state.chunks.push(e.data);
                    };
                    state.recorder.onstop = async () => {
                        await populateRecording(b);
                        state.audioURLBitRate = recordBitRate;
                    };
                }
                catch (error) {
                    console.log("An error occurred, could not get microphone access");
                    if (state.recorder) {
                        state.recorder.stop();
                    }
                    state.currentlyRecording = false;
                }
            }
            else {
                console.log("getUserMedia not supported on your browser!");
                state.currentlyRecording = false;
            }
        }
        record_1.record = record;
        function stopAudio() {
            const b = pxsim.board();
            if (!b)
                return;
            if (b.recordingState.currentlyRecording && b.recordingState.recordTimeoutID) {
                clearTimeout(b.recordingState.recordTimeoutID);
                if (b.recordingState.recorder) {
                    stopRecorder(b);
                }
            }
            else if (b.recordingState.recording && b.recordingState.audioPlaying) {
                b.recordingState.handleAudioStopped();
                stopPlayback();
            }
        }
        function registerSimStop() {
            pxsim.AudioContextManager.onStopAll(() => {
                const b = pxsim.board();
                if (b && b.recordingState && b.recordingState.recording) {
                    stopAudio();
                    b.recordingState.recording.removeEventListener("play", b.recordingState.handleAudioPlaying);
                    b.recordingState.recording.removeEventListener("ended", b.recordingState.handleAudioStopped);
                }
            });
        }
        function play() {
            const b = pxsim.board();
            if (!b)
                return;
            init();
            stopAudio();
            const state = b.recordingState;
            const volume = pxsim.AudioContextManager.isMuted() ? 0 : Math.round((pxsim.music.volume() / 0xff) * 100) / 100;
            state.recording = pxsim.AudioContextManager.createAudioSourceNode(state.audioURL, state.audioClippingThreshold, volume);
            state.initListeners();
            state.audioPlaying = true;
            setTimeout(async () => {
                if (!state.currentlyErasing && state.recording) {
                    try {
                        const minPlaybackRate = 0.15;
                        // 15 is the maximum playback rate that still produced sound in Chrome on Windows.
                        // In Firefox, it seems like 8 is the max. Higher numbers silently fail.
                        let maxPlaybackRate = 15;
                        if (pxsim.isFirefox()) {
                            maxPlaybackRate = 8;
                        }
                        const playbackRate = Math.max(minPlaybackRate, Math.min(maxPlaybackRate, bitRateToSampleRate(state.outputBitRate) / bitRateToSampleRate(state.audioURLBitRate)));
                        state.recording.playbackRate = playbackRate;
                        state.recording.preservesPitch = false;
                        await state.recording.play();
                    }
                    catch (e) {
                        if (!(e instanceof DOMException)) {
                            throw e;
                        }
                    }
                }
                else {
                    state.audioPlaying = false;
                }
            }, 10);
        }
        record_1.play = play;
        function stop() {
            stopAudio();
        }
        record_1.stop = stop;
        function stopPlayback() {
            const b = pxsim.board();
            if (!b)
                return;
            b.recordingState.recording.pause();
            b.recordingState.recording.currentTime = 0;
            b.recordingState.recording.removeEventListener("play", b.recordingState.handleAudioPlaying);
            b.recordingState.recording.removeEventListener("ended", b.recordingState.handleAudioStopped);
        }
        function erasingAsync(b) {
            return new Promise((resolve, reject) => {
                if (b.recordingState.recording && b.recordingState.audioPlaying) {
                    stopPlayback();
                }
                if (b.recordingState.audioURL) {
                    window.URL.revokeObjectURL(b.recordingState.audioURL);
                    b.recordingState.recording = null;
                }
                b.recordingState.audioPlaying = false;
                resolve(null);
                b.recordingState.currentlyErasing = false;
            });
        }
        function erase() {
            const b = pxsim.board();
            if (!b)
                return;
            b.recordingState.chunks = [];
            b.recordingState.currentlyErasing = true;
        }
        record_1.erase = erase;
        function setMicrophoneGain(gain) {
            const b = pxsim.board();
            if (!b)
                return;
            const tolerance = 0.1 * Number.EPSILON;
            if (gain - 0.079 < tolerance) { // low mic sensitivity
                b.recordingState.audioClippingThreshold = 0.08;
            }
            else if (gain - 0.2 < tolerance) { // mid mic sensitivity
                b.recordingState.audioClippingThreshold = 0.03;
            }
            else if (gain - 1.0 < tolerance) { // high mic sensitivity
                b.recordingState.audioClippingThreshold = 0.01;
            }
        }
        record_1.setMicrophoneGain = setMicrophoneGain;
        function audioDuration(sampleRate) {
            return 0;
        }
        record_1.audioDuration = audioDuration;
        function audioIsPlaying() {
            const b = pxsim.board();
            if (!b)
                return false;
            return b.recordingState.audioPlaying;
        }
        record_1.audioIsPlaying = audioIsPlaying;
        function audioIsRecording() {
            const b = pxsim.board();
            if (!b)
                return false;
            return b.recordingState.recorder ? b.recordingState.recorder.state === "recording" : false;
        }
        record_1.audioIsRecording = audioIsRecording;
        function audioIsStopped() {
            const b = pxsim.board();
            if (!b)
                return true;
            const isNotPlaying = !audioIsPlaying();
            const isNotRecording = !audioIsRecording();
            return b.recordingState.recording ? isNotPlaying && isNotRecording : false;
        }
        record_1.audioIsStopped = audioIsStopped;
        function setInputSampleRate(sampleRate) {
            const b = pxsim.board();
            if (!b)
                return;
            b.recordingState.inputBitRate = sampleRateToBitRate(sampleRate);
        }
        record_1.setInputSampleRate = setInputSampleRate;
        function setOutputSampleRate(sampleRate) {
            const b = pxsim.board();
            if (!b)
                return;
            b.recordingState.outputBitRate = sampleRateToBitRate(sampleRate);
        }
        record_1.setOutputSampleRate = setOutputSampleRate;
        function setBothSamples(sampleRate) {
            setInputSampleRate(sampleRate);
            setOutputSampleRate(sampleRate);
        }
        record_1.setBothSamples = setBothSamples;
        /**
         * The browser API doesn't allow us to control sample rate directly, but we
         * can affect it by setting the bit rate. This maps the supported sample rates
         * into a reasonable range of bit rates.
         */
        function sampleRateToBitRate(sampleRate) {
            return mapRange(sampleRate, MIN_SAMPLE_RATE, MAX_SAMPLE_RATE, MIN_BIT_RATE, MAX_BIT_RATE);
        }
        function bitRateToSampleRate(bitRate) {
            return mapRange(bitRate, MIN_BIT_RATE, MAX_BIT_RATE, MIN_SAMPLE_RATE, MAX_SAMPLE_RATE);
        }
        function mapRange(value, inMin, inMax, outMin, outMax) {
            value = Math.min(Math.max(inMin, value), inMax);
            return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
        }
        function defaultBitRate() {
            return sampleRateToBitRate(11000);
        }
        record_1.defaultBitRate = defaultBitRate;
    })(record = pxsim.record || (pxsim.record = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    const SERIAL_BUFFER_LENGTH = 16;
    class SerialState {
        constructor(runtime, board) {
            this.runtime = runtime;
            this.board = board;
            this.serialIn = [];
            this.serialOutBuffer = "";
            this.board.addMessageListener(this.handleMessage.bind(this));
        }
        handleMessage(msg) {
            if (msg.type === "serial") {
                const data = msg.data || "";
                this.receiveData(data);
            }
        }
        receiveData(data) {
            this.serialIn.push();
        }
        readSerial() {
            let v = this.serialIn.shift() || "";
            return v;
        }
        writeSerial(s) {
            this.serialOutBuffer += s;
            if (/\n/.test(this.serialOutBuffer) || this.serialOutBuffer.length > SERIAL_BUFFER_LENGTH) {
                pxsim.Runtime.postMessage({
                    type: 'serial',
                    data: this.serialOutBuffer,
                    id: pxsim.runtime.id,
                    sim: true
                });
                this.serialOutBuffer = '';
            }
        }
        writeCsv(s, type) {
            pxsim.Runtime.postMessage({
                type: 'serial',
                data: s,
                id: pxsim.runtime.id,
                csvType: type,
                sim: true
            });
        }
    }
    pxsim.SerialState = SerialState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var serial;
    (function (serial) {
        function writeString(s) {
            pxsim.board().writeSerial(s);
        }
        serial.writeString = writeString;
        function writeBuffer(buf) {
            // TODO
        }
        serial.writeBuffer = writeBuffer;
        function readUntil(del) {
            return readString();
        }
        serial.readUntil = readUntil;
        function readString() {
            return pxsim.board().serialState.readSerial();
        }
        serial.readString = readString;
        function onDataReceived(delimiters, handler) {
            let b = pxsim.board();
            b.bus.listen(12 /* DAL.MICROBIT_ID_SERIAL */, 1 /* DAL.MICROBIT_SERIAL_EVT_DELIM_MATCH */, handler);
        }
        serial.onDataReceived = onDataReceived;
        function redirect(tx, rx, rate) {
            // TODO?
        }
        serial.redirect = redirect;
        function redirectToUSB() {
            // TODO
        }
        serial.redirectToUSB = redirectToUSB;
        function setRxBufferSize(size) {
            // TODO
        }
        serial.setRxBufferSize = setRxBufferSize;
        function setTxBufferSize(size) {
            // TODO
        }
        serial.setTxBufferSize = setTxBufferSize;
        function readBuffer(length) {
            length |= 0;
            if (length <= 0)
                length = 64;
            return pxsim.pins.createBuffer(length);
        }
        serial.readBuffer = readBuffer;
        function setBaudRate(rate) {
            // TODO
        }
        serial.setBaudRate = setBaudRate;
        function writeDmesg() {
            // TODO
        }
        serial.writeDmesg = writeDmesg;
    })(serial = pxsim.serial || (pxsim.serial = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var music;
    (function (music) {
        //%
        function __playSoundExpression(notes, waitTillDone) {
            notes = lookupBuiltIn(notes);
            // Volume is multiplied by 0.03 so that it matches the output of other audio blocks.
            const volume = (pxsim.music.volume() / 0xff) * 0.03;
            pxsim.codal.music.__playSoundExpression(notes, waitTillDone, volume);
        }
        music.__playSoundExpression = __playSoundExpression;
        function __stopSoundExpressions() {
            pxsim.codal.music.__stopSoundExpressions();
        }
        music.__stopSoundExpressions = __stopSoundExpressions;
        const giggle = "giggle";
        const giggleData = "010230988019008440044008881023001601003300240000000000000000000000000000,110232570087411440044008880352005901003300010000000000000000010000000000,310232729021105440288908880091006300000000240700020000000000003000000000,310232729010205440288908880091006300000000240700020000000000003000000000,310232729011405440288908880091006300000000240700020000000000003000000000";
        const happy = "happy";
        const happyData = "010231992066911440044008880262002800001800020500000000000000010000000000,002322129029508440240408880000000400022400110000000000000000007500000000,000002129029509440240408880145000400022400110000000000000000007500000000";
        const hello = "hello";
        const helloData = "310230673019702440118708881023012800000000240000000000000000000000000000,300001064001602440098108880000012800000100040000000000000000000000000000,310231064029302440098108881023012800000100040000000000000000000000000000";
        const mysterious = "mysterious";
        const mysteriousData = "400002390033100440240408880477000400022400110400000000000000008000000000,405512845385000440044008880000012803010500160000000000000000085000500015";
        const sad = "sad";
        const sadData = "310232226070801440162408881023012800000100240000000000000000000000000000,310231623093602440093908880000012800000100240000000000000000000000000000";
        const slide = "slide";
        const slideData = "105202325022302440240408881023012801020000110400000000000000010000000000,010232520091002440044008881023012801022400110400000000000000010000000000";
        const soaring = "soaring";
        const soaringData = "210234009530905440599908881023002202000400020250000000000000020000000000,402233727273014440044008880000003101024400030000000000000000000000000000";
        const spring = "spring";
        const springData = "306590037116312440058708880807003400000000240000000000000000050000000000,010230037116313440058708881023003100000000240000000000000000050000000000";
        const twinkle = "twinkle";
        const twinkleData = "010180007672209440075608880855012800000000240000000000000000000000000000";
        const yawn = "yawn";
        const yawnData = "200002281133202440150008881023012801024100240400030000000000010000000000,005312520091002440044008880636012801022400110300000000000000010000000000,008220784019008440044008880681001600005500240000000000000000005000000000,004790784019008440044008880298001600000000240000000000000000005000000000,003210784019008440044008880108001600003300080000000000000000005000000000";
        function lookupBuiltIn(sound) {
            if (sound == giggle)
                return giggleData;
            if (sound == happy)
                return happyData;
            if (sound == hello)
                return helloData;
            if (sound == mysterious)
                return mysteriousData;
            if (sound == sad)
                return sadData;
            if (sound == slide)
                return slideData;
            if (sound == soaring)
                return soaringData;
            if (sound == spring)
                return springData;
            if (sound == twinkle)
                return twinkleData;
            if (sound == yawn)
                return yawnData;
            return sound;
        }
    })(music = pxsim.music || (pxsim.music = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    class ThermometerState {
        constructor() {
            this.usesTemperature = false;
            this.temperature = 21;
        }
    }
    pxsim.ThermometerState = ThermometerState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var input;
    (function (input) {
        function temperature() {
            let b = pxsim.board();
            if (!b.thermometerState.usesTemperature) {
                b.thermometerState.usesTemperature = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            return b.thermometerState.temperature;
        }
        input.temperature = temperature;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.mkBoardView = (opts) => {
            return new visuals.MicrobitBoardSvg({
                runtime: pxsim.runtime,
                theme: visuals.randomTheme(opts.highContrast),
                wireframe: opts.wireframe
            });
        };
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="../../node_modules/pxt-core/built/pxtsim.d.ts"/>
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        function mkLedMatrixSvg(xy, rows, cols) {
            let result = { el: null, y: 0, x: 0, w: 0, h: 0, leds: [], ledsOuter: [], background: null };
            result.el = pxsim.svg.elt("g");
            let width = cols * visuals.PIN_DIST;
            let height = rows * visuals.PIN_DIST;
            let ledRad = Math.round(visuals.PIN_DIST * .35);
            let spacing = visuals.PIN_DIST;
            let padding = (spacing - 2 * ledRad) / 2.0;
            let [x, y] = xy;
            let left = x - (ledRad + padding);
            let top = y - (ledRad + padding);
            result.x = left;
            result.y = top;
            result.w = width;
            result.h = height;
            result.background = pxsim.svg.child(result.el, "rect", { class: "sim-display", x: left, y: top, width: width, height: height });
            // ledsOuter
            result.leds = [];
            result.ledsOuter = [];
            let hoverRad = ledRad * 1.2;
            for (let i = 0; i < rows; ++i) {
                let y = top + ledRad + i * spacing + padding;
                for (let j = 0; j < cols; ++j) {
                    let x = left + ledRad + j * spacing + padding;
                    result.ledsOuter.push(pxsim.svg.child(result.el, "circle", { class: "sim-led-back", cx: x, cy: y, r: ledRad }));
                    result.leds.push(pxsim.svg.child(result.el, "circle", { class: "sim-led", cx: x, cy: y, r: hoverRad, title: `(${j},${i})` }));
                }
            }
            //default theme
            pxsim.svg.fill(result.background, visuals.defaultLedMatrixTheme.background);
            pxsim.svg.fills(result.leds, visuals.defaultLedMatrixTheme.ledOn);
            pxsim.svg.fills(result.ledsOuter, visuals.defaultLedMatrixTheme.ledOff);
            //turn off LEDs
            result.leds.forEach(l => l.style.opacity = 0 + "");
            return result;
        }
        visuals.mkLedMatrixSvg = mkLedMatrixSvg;
        visuals.defaultLedMatrixTheme = {
            background: "#000",
            ledOn: "#ff5f5f",
            ledOff: "#DDD",
        };
        visuals.LED_MATRIX_STYLE = `
            .sim-led-back:hover {
                stroke:#a0a0a0;
                stroke-width:3px;
            }
            .sim-led:hover {
                stroke:#ff7f7f;
                stroke-width:3px;
            }
            `;
        class LedMatrixView {
            constructor() {
                this.DRAW_SIZE = 8;
                this.ACTIVE_SIZE = 5;
                this.style = visuals.LED_MATRIX_STYLE;
            }
            init(bus, state) {
                this.bus = bus;
                this.state = state;
                this.theme = visuals.defaultLedMatrixTheme;
                this.defs = [];
                this.element = this.buildDom();
            }
            moveToCoord(xy) {
                visuals.translateEl(this.element, xy);
            }
            updateTheme() {
                pxsim.svg.fill(this.background, this.theme.background);
                pxsim.svg.fills(this.leds, this.theme.ledOn);
                pxsim.svg.fills(this.ledsOuter, this.theme.ledOff);
            }
            updateState() {
                if (this.state.disabled) {
                    this.leds.forEach((led, i) => {
                        let sel = led;
                        sel.style.opacity = 0 + "";
                    });
                    return;
                }
                const bw = this.state.displayMode == pxsim.DisplayMode.bw;
                const img = this.state.image;
                this.leds.forEach((led, i) => {
                    let sel = led;
                    let dx = i % this.DRAW_SIZE;
                    let dy = (i - dx) / this.DRAW_SIZE;
                    if (dx < this.ACTIVE_SIZE && dy < this.ACTIVE_SIZE) {
                        let j = dx + dy * this.ACTIVE_SIZE;
                        sel.style.opacity = ((bw ? img.data[j] > 0 ? 255 : 0 : img.data[j]) / 255.0) + "";
                    }
                    else {
                        sel.style.opacity = 0 + "";
                    }
                });
            }
            buildDom() {
                let res = mkLedMatrixSvg([0, 0], this.DRAW_SIZE, this.DRAW_SIZE);
                let display = res.el;
                this.background = res.background;
                this.leds = res.leds;
                this.ledsOuter = res.ledsOuter;
                return display;
            }
        }
        visuals.LedMatrixView = LedMatrixView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        const MB_STYLE = `
        svg.sim {
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            display: block;
        }
        svg.sim.grayscale {
            -moz-filter: grayscale(1);
            -webkit-filter: grayscale(1);
            filter: grayscale(1);
        }
        .sim-button-group {
            cursor: pointer;
        }
        .sim-button {
            pointer-events: none;
        }
        .sim-head .sim-button {
            pointer-events: unset;
        }
        .sim-board, .sim-display, sim-button {
            fill: #111;
        }
        .sim-button-outer:hover {
            stroke:grey;
            stroke-width: 3px;
        }
        .sim-button-nut {
            fill:#704A4A;
            pointer-events:none;
        }
        .sim-button-nut:hover {
            stroke:1px solid #704A4A;
        }
        .sim-pin[focusable=true]:hover {
            stroke:#D4AF37;
            stroke-width:2px;
        }

        .sim-pin-touch[focusable=true].touched {
            stroke:darkorange !important;
            stroke-width:5px;
        }

        .sim-led-back:hover {
            stroke:#a0a0a0;
            stroke-width:3px;
        }
        .sim-led:hover {
            stroke:#ff7f7f;
            stroke-width:3px;
        }

        .sim-systemled {
            fill:#333;
            stroke:#555;
            stroke-width: 1px;
        }

        .sim-light-level-button {
            stroke:#fff;
            stroke-width: 3px;
        }

        .sim-antenna {
            stroke:#555;
            stroke-width: 2px;
        }

        .sim-text {
        font-family:"Lucida Console", Monaco, monospace;
        font-size:25px;
        fill:#fff;
        pointer-events: none;
        }

        .sim-text-small,
        .sim-text-pin {
        font-family:"Lucida Console", Monaco, monospace;
        font-size:20px;
        fill:#fff;
        pointer-events: none;
        }

        .sim-thermometer {
            stroke:#aaa;
            stroke-width: 3px;
            cursor: pointer;
        }

        /* animations */
        .sim-flash {
            animation-name: sim-flash-animation;
            animation-duration: 0.1s;
        }

        @keyframes sim-flash-animation {
            from { fill: yellow; }
            to   { fill: default; }
        }

        .sim-flash-stroke {
            animation-name: sim-flash-stroke-animation;
            animation-duration: 0.4s;
            animation-timing-function: ease-in;
        }

        @keyframes sim-flash-stroke-animation {
            from { stroke: yellow; }
            to   { stroke: default; }
        }

        /* wireframe */
        .sim-wireframe * {
            fill: none;
            stroke: black;
        }
        .sim-wireframe .sim-display,
        .sim-wireframe .sim-led,
        .sim-wireframe .sim-led-back,
        .sim-wireframe .sim-head,
        .sim-wireframe .sim-theme,
        .sim-wireframe .sim-button-group,
        .sim-wireframe .sim-button-label,
        .sim-wireframe .sim-button,
        .sim-wireframe .sim-text-pin
        {
            visibility: hidden;
        }
        .sim-wireframe .sim-label
        {
            stroke: none;
            fill: #777;
        }
        .sim-label, .sim-button-label {
            fill: #000;
            pointer-events: none;
        }
        .sim-wireframe .sim-board {
            stroke-width: 2px;
        }
        *:focus {
            outline: none;
        }
        *:focus-visible .sim-button-outer,
        .sim-shake:focus-visible,
        .sim-thermometer:focus-visible {
            outline: 5px solid white;
            stroke: black;
            stroke-width: 10px;
            paint-order: stroke;
        }
        .sim-button-outer.sim-button-group:focus-visible > .sim-button {
            outline: 5px solid white;
            stroke: black;
            stroke-width: 5px;
            paint-order: stroke;
        }
        .sim-light-level-button:focus-visible,
        .sim-antenna-outer:focus-visible > .sim-antenna {
            outline: 5px solid white;
        }
        .sim-pin:focus-visible {
            stroke: white;
            stroke-width: 5px !important;
        }
        .no-drag, .sim-text, .sim-text-small,
        .sim-text-pin {
            user-drag: none;
            user-select: none;
            -moz-user-select: none;
            -webkit-user-drag: none;
            -webkit-user-select: none;
            -ms-user-select: none;
        }
        [focusable=true] {
            cursor: pointer;
        }
    `;
        const MB_HIGHCONTRAST = `
path.sim-board {
    stroke: white;
    stroke-width: 3;
}
.sim-led {
    stroke: red;
}
.sim-led-back {
    stroke: white;
}
*:focus-visible .sim-button-outer,
.sim-pin:focus-visible,
.sim-thermometer:focus-visible,
.sim-shake:focus-visible,
.sim-light-level-button:focus-visible {
    stroke: #10C8CD !important;
}
    `;
        const pins4onXs = [66.7, 79.1, 91.4, 103.7, 164.3, 176.6, 188.9, 201.3, 213.6, 275.2, 287.5, 299.8, 312.1, 324.5, 385.1, 397.4, 409.7, 422];
        const pins4onMids = pins4onXs.map(x => x + 5);
        const littlePinDist = pins4onMids[1] - pins4onMids[0];
        const bigPinWidth = pins4onMids[4] - pins4onMids[3];
        const pin0mid = pins4onXs[0] - bigPinWidth / 2.0;
        const pin3mid = pin0mid - bigPinWidth / 2.0;
        const pin1mid = pins4onMids[3] + bigPinWidth / 2.0;
        const pin2mid = pins4onMids[8] + bigPinWidth / 2.0;
        const pin3Vmid = pins4onMids[13] + bigPinWidth / 2.0;
        const pinGNDmid = pins4onMids[pins4onMids.length - 1] + bigPinWidth / 2.0;
        const pinGND2mid = pinGNDmid + bigPinWidth / 2.0;
        const pinMids = [pin0mid, pin1mid, pin2mid, pin3mid].concat(pins4onMids).concat([pinGNDmid, pin3Vmid, pinGND2mid]);
        const pinNames = [
            "P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10",
            "P11", "P12", "P13", "P14", "P15", "P16", "P17", "P18", "P19", "P20",
            "GND0", "GND", "+3v3", "GND1"
        ];
        const pinDrawOrder = [
            "P3", "P0", "P4", "P5", "P6", "P7", "P1", "P8", "P9", "P10", "P11",
            "P12", "P2", "P13", "P14", "P15", "P16", "P17", "P18", "P19", "P20",
            "GND0", "GND", "+3v3", "GND1"
        ];
        // title is currently unused.
        const pinTitles = [
            { title: "P0, ANALOG IN", ariaLabel: pxsim.localization.lf("Pin 0") },
            { title: "P1, ANALOG IN", ariaLabel: pxsim.localization.lf("Pin 1") },
            { title: "P2, ANALOG IN", ariaLabel: pxsim.localization.lf("Pin 2") },
            { title: "P3, ANALOG IN, LED Col 1", ariaLabel: pxsim.localization.lf("Pin 3") },
            { title: "P4, ANALOG IN, LED Col 2", ariaLabel: pxsim.localization.lf("Pin 4") },
            { title: "P5, BUTTON A", ariaLabel: pxsim.localization.lf("Pin 5") },
            { title: "P6, LED Col 9", ariaLabel: pxsim.localization.lf("Pin 6") },
            { title: "P7, LED Col 8", ariaLabel: pxsim.localization.lf("Pin 7") },
            { title: "P8", ariaLabel: pxsim.localization.lf("Pin 8") },
            { title: "P9, LED Col 7", ariaLabel: pxsim.localization.lf("Pin 9") },
            { title: "P10, ANALOG IN, LED Col 3", ariaLabel: pxsim.localization.lf("Pin 10") },
            { title: "P11, BUTTON B", ariaLabel: pxsim.localization.lf("Pin 11") },
            { title: "P12, RESERVED ACCESSIBILITY", ariaLabel: pxsim.localization.lf("Pin 12") },
            { title: "P13, SPI - SCK", ariaLabel: pxsim.localization.lf("Pin 13") },
            { title: "P14, SPI - MISO", ariaLabel: pxsim.localization.lf("Pin 14") },
            { title: "P15, SPI - MOSI", ariaLabel: pxsim.localization.lf("Pin 15") },
            { title: "P16, SPI - Chip Select", ariaLabel: pxsim.localization.lf("Pin 16") },
            { title: "P17, +3v3", ariaLabel: pxsim.localization.lf("Pin 3V") },
            { title: "P18, +3v3", ariaLabel: pxsim.localization.lf("Pin 3V") },
            { title: "P19, I2C - SCL", ariaLabel: pxsim.localization.lf("Pin 19") },
            { title: "P20, I2C - SDA", ariaLabel: pxsim.localization.lf("Pin 20") },
            { title: "GND", ariaLabel: pxsim.localization.lf("Pin GND") },
            { title: "GND", ariaLabel: pxsim.localization.lf("Pin GND") },
            { title: "+3v3", ariaLabel: pxsim.localization.lf("Pin 3V") },
            { title: "GND", ariaLabel: pxsim.localization.lf("Pin GND") },
        ];
        const MB_WIDTH = 500;
        const MB_HEIGHT = 408;
        const LIGHT_LEVEL_BUTTON_POSITION_Y = 50;
        const LIGHT_LEVEL_BUTTON_RADIUS = 35;
        const ANTENNA_X = 380;
        const ANTENNA_WAVE_PERIOD_X = 18;
        const ANTENNA_WAVE_COUNT = 5;
        visuals.themes = ["#3ADCFE", "#FFD43A", "#3AFFB3", "#FF3A54"].map(accent => {
            return {
                accent: accent,
                display: "#111",
                pin: "#D4AF37",
                pinTouched: "#FFA500",
                pinActive: "#FF5500",
                ledOn: "#ff7f7f",
                ledOff: "#202020",
                buttonOuter: "#979797",
                buttonUp: "#111",
                buttonDown: "#FFA500",
                virtualButtonOuter: "#333",
                virtualButtonUp: "#fff",
                lightLevelOn: "yellow",
                lightLevelOff: "#555"
            };
        });
        function randomTheme(highContrast) {
            let theme = visuals.themes[Math.floor(Math.random() * visuals.themes.length)];
            if (highContrast) {
                theme = JSON.parse(JSON.stringify(theme));
                theme.highContrast = true;
                theme.ledOff = "#000000";
                theme.ledOn = "#FF0000";
                theme.pin = "#D4AF37";
                theme.accent = "#FFD43A";
            }
            return theme;
        }
        visuals.randomTheme = randomTheme;
        class MicrobitBoardSvg {
            constructor(props) {
                this.props = props;
                this.liveRegionInitialized = false;
                this.headInitialized = false;
                this.antennaInitialized = false;
                this.lightLevelInitialized = false;
                this.thermometerInitialized = false;
                this.soundLevelInitialized = false;
                this.shakeInitialized = false;
                this.pinNmToCoord = {};
                this.domHardwareVersion = 1;
                this.bindings = [];
                this.moveHeadingOnClick = (ev) => {
                    let pt = this.element.createSVGPoint();
                    let cur = pxsim.svg.cursorPoint(pt, this.element, ev);
                    const logoBounds = this.head.getBBox();
                    const logoCenterX = logoBounds.x + (logoBounds.width / 2);
                    const logoCenterY = logoBounds.y + (logoBounds.height / 2);
                    const distance = Math.sqrt((((cur.y - logoCenterY) ** 2) + ((cur.x - logoCenterX) ** 2)));
                    // 30 and 90 are not precise, just numbers that fit nicely with usage
                    if (distance > 30 && distance < 90) {
                        const state = this.board;
                        state.compassState.heading = Math.floor(Math.atan2(cur.y - logoCenterY, cur.x - logoCenterX) * 180 / Math.PI) + 90;
                        if (state.compassState.heading < 0)
                            state.compassState.heading += 360;
                        this.updateHeading();
                    }
                };
                this.lastFlashTime = 0;
                this.lastAntennaFlash = 0;
                this.recordPinCoords();
                this.buildDom();
                if (props && props.wireframe)
                    pxsim.U.addClass(this.element, "sim-wireframe");
                if (props && props.theme)
                    this.updateTheme();
                if (props && props.runtime) {
                    this.board = this.props.runtime.board;
                    this.board.updateSubscribers.push(() => this.updateState());
                    this.updateState(true);
                    this.attachEvents();
                }
            }
            getView() {
                return {
                    el: this.element,
                    y: 0,
                    x: 0,
                    w: MB_WIDTH,
                    h: MB_HEIGHT
                };
            }
            getCoord(pinNm) {
                return this.pinNmToCoord[pinNm];
            }
            highlightPin(pinNm) {
                //TODO: for instructions
            }
            getPinDist() {
                return littlePinDist * 1.7;
            }
            recordPinCoords() {
                const pinsY = 356.7 + 40;
                pinNames.forEach((nm, i) => {
                    let x = pinMids[i];
                    this.pinNmToCoord[nm] = [x, pinsY];
                });
            }
            removeEventListeners() {
                for (const binding of this.bindings) {
                    const el = binding.element || document;
                    el.removeEventListener(binding.event, binding.handler);
                }
                document.body.removeEventListener(pxsim.pointerEvents.down[0], this.moveHeadingOnClick);
            }
            updateTheme() {
                let theme = this.props.theme;
                pxsim.svg.fill(this.display, theme.display);
                pxsim.svg.fills(this.leds, theme.ledOn);
                pxsim.svg.fills(this.ledsOuter, theme.ledOff);
                if (this.microphoneLed && this.board.microphoneState.sensorUsed) {
                    pxsim.svg.fills([this.microphoneLed], theme.ledOn);
                    pxsim.svg.filter(this.microphoneLed, `url(#ledglow)`);
                }
                pxsim.svg.fills(this.buttonsOuter.slice(0, 2), theme.buttonOuter);
                pxsim.svg.fills(this.buttons.slice(0, 2), theme.buttonUp);
                pxsim.svg.fill(this.buttonsOuter[2], theme.virtualButtonOuter);
                pxsim.svg.fill(this.buttons[2], theme.virtualButtonUp);
                pxsim.svg.fills(this.logos, theme.accent);
                if (this.domHardwareVersion > 1) {
                    pxsim.svg.fills(this.heads.slice(1), "gold");
                }
                else {
                    pxsim.svg.fills(this.heads.slice(1), theme.accent);
                }
                pxsim.svg.fill(this.shakeButton, theme.virtualButtonUp);
                this.pinGradients.forEach(lg => pxsim.svg.setGradientColors(lg, theme.pin, theme.pinActive));
                pxsim.svg.setGradientColors(this.lightLevelGradient, theme.lightLevelOn, theme.lightLevelOff);
                pxsim.svg.setGradientColors(this.thermometerGradient, theme.ledOff, theme.ledOn);
                pxsim.svg.setGradientColors(this.soundLevelGradient, theme.ledOff, theme.ledOn);
                this.positionV2Elements();
            }
            updateState(initialCall = false) {
                const state = this.board;
                if (!state)
                    return;
                this.updateHardwareVersion();
                this.updateMicrophone();
                this.updateRecordingActive();
                this.updateButtonPairs();
                this.updateLEDMatrix();
                this.updatePins();
                this.updateTilt();
                this.updateHeading();
                this.updateLightLevel();
                this.updateTemperature();
                this.updateButtonAB();
                this.updateGestures();
                this.updateRSSI();
                if (!this.props.runtime || this.props.runtime.dead)
                    pxsim.U.addClass(this.element, "grayscale");
                else
                    pxsim.U.removeClass(this.element, "grayscale");
                if (!initialCall && !this.liveRegionInitialized) {
                    // The iframe document's innerHTML is cleared after mkBoardView is called.
                    // Ensure that the live region is created after this.
                    pxsim.accessibility.setLiveContent("");
                    this.liveRegionInitialized = true;
                }
            }
            updateButtonPairs() {
                const state = this.board;
                const { buttonDown, buttonUp, virtualButtonUp } = this.props.theme;
                const { aBtn, bBtn, abBtn } = state.buttonPairState;
                pxsim.svg.fill(this.buttons[0], aBtn.pressed ? buttonDown : buttonUp);
                pxsim.svg.fill(this.buttons[1], bBtn.pressed ? buttonDown : buttonUp);
                pxsim.svg.fill(this.buttons[2], abBtn.pressed ? buttonDown : virtualButtonUp);
                pxsim.svg.fill(this.headParts, state.logoTouch.pressed ? buttonDown : buttonUp);
            }
            updateLEDMatrix() {
                const state = this.board;
                if (state.ledMatrixState.disabled) {
                    this.leds.forEach((led, i) => {
                        const sel = led;
                        sel.style.opacity = "0";
                    });
                }
                else {
                    const bw = state.ledMatrixState.displayMode == pxsim.DisplayMode.bw;
                    const img = state.ledMatrixState.image;
                    const br = state.ledMatrixState.brigthness != undefined ? state.ledMatrixState.brigthness : 255;
                    this.leds.forEach((led, i) => {
                        const sel = led;
                        let imgbr = bw ? (img.data[i] > 0 ? br : 0) : img.data[i];
                        // correct brightness
                        const opacity = imgbr > 0 ? imgbr / 255 * 155 + 100 : 0;
                        const transfrom = imgbr > 0 ? imgbr / 255 * 0.4 + 0.6 : 0;
                        sel.style.opacity = (opacity / 255) + "";
                        if (transfrom > 0) {
                            sel.style.transformBox = 'fill-box';
                            sel.style.transformOrigin = '50% 50%';
                            sel.style.transform = `scale(${transfrom})`;
                        }
                    });
                }
            }
            updateGestures() {
                let state = this.board;
                if (state.accelerometerState.useShake && !this.shakeInitialized) {
                    this.shakeInitialized = true;
                    this.shakeButton.style.visibility = "visible";
                    pxsim.accessibility.makeFocusable(this.shakeButton);
                    pxsim.svg.fill(this.shakeButton, this.props.theme.virtualButtonUp);
                    pxsim.pointerEvents.down.forEach(evid => this.shakeButton.addEventListener(evid, ev => {
                        let state = this.board;
                        pxsim.svg.fill(this.shakeButton, this.props.theme.buttonDown);
                    }));
                    this.shakeButton.addEventListener(pxsim.pointerEvents.leave, ev => {
                        let state = this.board;
                        pxsim.svg.fill(this.shakeButton, this.props.theme.virtualButtonUp);
                    });
                    this.shakeButton.addEventListener(pxsim.pointerEvents.up, ev => {
                        let state = this.board;
                        pxsim.svg.fill(this.shakeButton, this.props.theme.virtualButtonUp);
                        this.board.accelerometerState.shake();
                    });
                    pxsim.accessibility.enableKeyboardInteraction(this.shakeButton, () => {
                        pxsim.svg.fill(this.shakeButton, this.props.theme.buttonDown);
                    }, () => {
                        pxsim.svg.fill(this.shakeButton, this.props.theme.virtualButtonUp);
                        this.board.accelerometerState.shake();
                    });
                    pxsim.accessibility.setAria(this.shakeButton, "button", pxsim.localization.lf("Shake"));
                    this.shakeText = pxsim.svg.child(this.g, "text", { x: 420, y: 122, class: "sim-text-small", "aria-hidden": true });
                    this.shakeText.textContent = "SHAKE";
                }
            }
            updateMicrophone() {
                const b = pxsim.board();
                if (!b
                    || !b.microphoneState.sensorUsed)
                    return;
                this.updateSoundLevel();
            }
            updateRecordingActive() {
                const b = pxsim.board();
                if (!b)
                    return;
                let theme = this.props.theme;
                if (this.microphoneLed) {
                    if (b.recordingState.currentlyRecording || b.microphoneState.soundLevelRequested) {
                        pxsim.svg.fills([this.microphoneLed], theme.ledOn);
                        pxsim.svg.filter(this.microphoneLed, `url(#ledglow)`);
                    }
                    else if (!(b.microphoneState.onSoundRegistered || b.microphoneState.soundLevelRequested)) {
                        pxsim.svg.fills([this.microphoneLed], theme.ledOff);
                        pxsim.svg.filter(this.microphoneLed, `url(#none)`);
                    }
                }
            }
            updateButtonAB() {
                let state = this.board;
                if (state.buttonPairState.usesButtonAB && !this.buttonABText) {
                    this.buttonsOuter[2].style.visibility = "visible";
                    this.buttons[2].style.visibility = "visible";
                    this.buttonABText = pxsim.svg.child(this.g, "text", { class: "sim-text", x: 370, y: 272 });
                    this.buttonABText.textContent = "A+B";
                    this.updateTheme();
                    this.positionV2Elements();
                }
            }
            updatePin(pin, index) {
                var _a, _b;
                if (!pin)
                    return;
                let text = this.pinTexts[index];
                let v = "";
                let ariaValueNow;
                if (pin.mode & pxsim.PinFlags.Analog) {
                    v = Math.floor(100 - (pin.value || 0) / 1023 * 100) + "%";
                    if (text)
                        text.textContent = (pin.period ? "~" : "") + (pin.value || 0) + "";
                    ariaValueNow = (_a = pin.value) !== null && _a !== void 0 ? _a : 0;
                }
                else if (pin.mode & pxsim.PinFlags.Digital) {
                    v = pin.value > 0 ? "0%" : "100%";
                    if (text)
                        text.textContent = pin.value > 0 ? "1" : "0";
                    ariaValueNow = pin.value > 0 ? 1 : 0;
                }
                else if (pin.mode & pxsim.PinFlags.Touch) {
                    v = pin.touched ? "0%" : "100%";
                    if (text)
                        text.textContent = "";
                }
                else {
                    v = "100%";
                    if (text)
                        text.textContent = "";
                }
                if (v)
                    pxsim.svg.setGradientValue(this.pinGradients[index], v);
                if (pin.mode !== pxsim.PinFlags.Unused) {
                    pxsim.accessibility.makeFocusable(this.pins[index]);
                    if (pin.mode & pxsim.PinFlags.Touch) {
                        this.pins[index].setAttribute("role", "button");
                        this.pins[index].ariaLabel = this.pins[index].firstChild.textContent;
                        this.pins[index].removeAttribute("aria-valuemin");
                        this.pins[index].removeAttribute("aria-valuemax");
                        this.pins[index].removeAttribute("aria-orientation");
                        this.pins[index].removeAttribute("aria-valuenow");
                        this.pins[index].removeAttribute("aria-valuetext");
                        this.pins[index].removeAttribute("aria-readonly");
                    }
                    else {
                        this.pins[index].setAttribute("role", "slider");
                        this.pins[index].ariaLabel = this.pins[index].firstChild.textContent;
                        this.pins[index].setAttribute("aria-valuemin", "0");
                        this.pins[index].setAttribute("aria-valuemax", pin.mode & pxsim.PinFlags.Analog ? "1023" : "1");
                        this.pins[index].setAttribute("aria-orientation", "vertical");
                        this.pins[index].setAttribute("aria-valuenow", (_b = ariaValueNow.toString()) !== null && _b !== void 0 ? _b : "");
                        // Check that the text content isn't just a plain int and only set aria-valuetext if required.
                        if ((text === null || text === void 0 ? void 0 : text.textContent) && (text === null || text === void 0 ? void 0 : text.textContent) !== parseInt(text === null || text === void 0 ? void 0 : text.textContent).toString()) {
                            this.pins[index].setAttribute("aria-valuetext", text.textContent);
                        }
                        else {
                            this.pins[index].removeAttribute("aria-valuetext");
                        }
                        if (pin.mode & pxsim.PinFlags.Input) {
                            this.pins[index].removeAttribute("aria-readonly");
                        }
                        else {
                            this.pins[index].setAttribute("aria-readonly", "true");
                        }
                    }
                }
            }
            updateTemperature() {
                let state = this.board;
                if (!state || !state.thermometerState.usesTemperature)
                    return;
                let tmin = -5;
                let tmax = 50;
                if (!this.thermometerInitialized) {
                    this.thermometerInitialized = true;
                    this.thermometer.style.visibility = "visible";
                    this.thermometerText = pxsim.svg.child(this.g, "text", { class: 'sim-text', x: 58, y: 130, "aria-hidden": true });
                    if (this.props.runtime)
                        this.props.runtime.environmentGlobals[pxsim.localization.lf("temperature")] = state.thermometerState.temperature;
                    this.updateTheme();
                    let pt = this.element.createSVGPoint();
                    pxsim.svg.buttonEvents(this.thermometer, 
                    // move
                    (ev) => {
                        let cur = pxsim.svg.cursorPoint(pt, this.element, ev);
                        let t = Math.max(0, Math.min(1, (260 - cur.y) / 140));
                        state.thermometerState.temperature = Math.floor(tmin + t * (tmax - tmin));
                        this.updateTemperature();
                    }, 
                    // start
                    ev => { }, 
                    // stop
                    ev => { }, 
                    // keydown
                    (ev) => {
                        const value = commonKeyHandler(ev, state.thermometerState.temperature, tmin, tmax);
                        if (value !== undefined) {
                            state.thermometerState.temperature = value;
                            this.updateTemperature();
                        }
                    });
                    pxsim.accessibility.makeFocusable(this.thermometer);
                    pxsim.accessibility.setAria(this.thermometer, "slider", pxsim.localization.lf("Temperature"));
                    this.thermometer.setAttribute("aria-valuemin", "-5");
                    this.thermometer.setAttribute("aria-valuemax", "50");
                    this.thermometer.setAttribute("aria-orientation", "vertical");
                    this.thermometer.setAttribute("aria-valuenow", "21");
                    this.thermometer.setAttribute("aria-valuetext", "21°C");
                }
                let t = Math.max(tmin, Math.min(tmax, state.thermometerState.temperature));
                let per = Math.floor((state.thermometerState.temperature - tmin) / (tmax - tmin) * 100);
                pxsim.svg.setGradientValue(this.thermometerGradient, 100 - per + "%");
                this.thermometerText.textContent = t + "°C";
                this.thermometer.setAttribute("aria-valuenow", t.toString());
                this.thermometer.setAttribute("aria-valuetext", t + "°C");
            }
            updateSoundLevel() {
                let state = this.board;
                if (!state || !state.microphoneState.sensorUsed)
                    return;
                const tmin = 0; // state.microphoneState.min;
                const tmax = 255; //state.microphoneState.max;
                if (!this.soundLevelInitialized) {
                    this.soundLevelInitialized = true;
                    this.soundLevel.style.visibility = "visible";
                    const level = state.microphoneState.getLevel();
                    this.soundLevelText = pxsim.svg.child(this.g, "text", { class: 'sim-text', x: 370, y: 90, "aria-hidden": true });
                    if (this.props.runtime)
                        this.props.runtime.environmentGlobals[pxsim.localization.lf("sound level")] = state.microphoneState.getLevel();
                    this.updateTheme();
                    let pt = this.element.createSVGPoint();
                    pxsim.svg.buttonEvents(this.soundLevel, 
                    // move
                    (ev) => {
                        let cur = pxsim.svg.cursorPoint(pt, this.element, ev);
                        let t = Math.max(0, Math.min(1, (260 - cur.y) / 140));
                        state.microphoneState.setLevel(Math.floor(tmin + t * (tmax - tmin)));
                        this.updateMicrophone();
                    }, 
                    // start
                    ev => { }, 
                    // stop
                    ev => { }, 
                    // keydown
                    (ev) => {
                        const value = commonKeyHandler(ev, state.microphoneState.getLevel(), tmin, tmax);
                        if (value !== undefined) {
                            state.microphoneState.setLevel(value);
                            this.updateMicrophone();
                        }
                    });
                    pxsim.accessibility.makeFocusable(this.soundLevel);
                    pxsim.accessibility.setAria(this.soundLevel, "slider", pxsim.localization.lf("Sound Level"));
                    this.soundLevel.setAttribute("aria-valuemin", tmin + "");
                    this.soundLevel.setAttribute("aria-valuemax", tmax + "");
                    this.soundLevel.setAttribute("aria-orientation", "vertical");
                    this.soundLevel.setAttribute("aria-valuenow", level + "");
                    this.soundLevel.setAttribute("aria-valuetext", level + "");
                }
                let t = Math.max(tmin, Math.min(tmax, state.microphoneState.getLevel()));
                let per = Math.floor((state.microphoneState.getLevel() - tmin) / (tmax - tmin) * 100);
                pxsim.svg.setGradientValue(this.soundLevelGradient, (100 - per) + "%");
                this.soundLevelText.textContent = t + "";
                this.soundLevel.setAttribute("aria-valuenow", t.toString());
                this.soundLevel.setAttribute("aria-valuetext", t + "");
            }
            updateHeading() {
                let xc = 258;
                let yc = 75;
                let state = this.board;
                if (!state || !state.compassState.usesHeading)
                    return;
                if (!this.headInitialized) {
                    let p = this.heads[1];
                    p.setAttribute("d", "m269.9,50.134647l0,0l-39.5,0l0,0c-14.1,0.1 -24.6,10.7 -24.6,24.8c0,13.9 10.4,24.4 24.3,24.7l0,0l39.6,0c14.2,0 40.36034,-22.97069 40.36034,-24.85394c0,-1.88326 -26.06034,-24.54606 -40.16034,-24.64606m-0.2,39l0,0l-39.3,0c-7.7,-0.1 -14,-6.4 -14,-14.2c0,-7.8 6.4,-14.2 14.2,-14.2l39.1,0c7.8,0 14.2,6.4 14.2,14.2c0,7.9 -6.4,14.2 -14.2,14.2l0,0l0,0z");
                    this.updateTheme();
                    let pt = this.element.createSVGPoint();
                    pxsim.svg.buttonEvents(this.head, 
                    // move
                    (ev) => {
                        let cur = pxsim.svg.cursorPoint(pt, this.element, ev);
                        state.compassState.heading = Math.floor(Math.atan2(cur.y - yc, cur.x - xc) * 180 / Math.PI) + 90;
                        if (state.compassState.heading < 0)
                            state.compassState.heading += 360;
                        this.updateHeading();
                    }, 
                    // start
                    ev => { }, 
                    // stop
                    ev => { }, 
                    // keydown
                    (ev) => {
                        const value = commonKeyHandler(ev, state.compassState.heading, 0, 359);
                        if (value !== undefined) {
                            state.compassState.heading = value;
                            this.updateHeading();
                        }
                    });
                    this.headInitialized = true;
                }
                let txt = state.compassState.heading.toString() + "°";
                if (txt != this.headText.textContent) {
                    pxsim.svg.rotateElement(this.head, xc, yc, state.compassState.heading - 180);
                    this.headText.textContent = txt;
                    if (this.props.runtime)
                        this.props.runtime.environmentGlobals[pxsim.localization.lf("heading")] = state.compassState.heading;
                }
                // make sim head focusable when there is a compass
                this.headParts.setAttribute("class", "sim-button-outer sim-button-group");
                pxsim.accessibility.makeFocusable(this.headParts);
            }
            flashSystemLed() {
                if (!this.systemLed)
                    this.systemLed = pxsim.svg.child(this.g, "circle", { class: "sim-systemled", cx: 300, cy: 20, r: 5 });
                let now = Date.now();
                if (now - this.lastFlashTime > 150) {
                    this.lastFlashTime = now;
                    pxsim.svg.animate(this.systemLed, "sim-flash");
                }
            }
            flashAntenna() {
                var _a;
                if (!this.antennaInitialized) {
                    this.antenna.style.visibility = "visible";
                    this.antennaInitialized = true;
                    const antennaWidth = ANTENNA_WAVE_PERIOD_X * ANTENNA_WAVE_COUNT;
                    const valueMin = -128;
                    const valueMax = -42;
                    const setValue = (val) => {
                        const rs = Math.max(valueMin, Math.min(valueMax, val));
                        this.board.radioState.datagram.rssi = rs;
                        this.updateRSSI();
                    };
                    const pt = this.element.createSVGPoint();
                    const mouseEventHandler = (ev) => {
                        const state = this.board;
                        if (!state)
                            return;
                        const pos = pxsim.svg.cursorPoint(pt, this.element, ev);
                        setValue((-138 + (pos.x - ANTENNA_X) / antennaWidth * 100) | 0);
                    };
                    const keyboardEventHandler = (ev) => {
                        var _a;
                        const value = commonKeyHandler(ev, (_a = this.board.radioState.datagram.rssi) !== null && _a !== void 0 ? _a : -75, valueMin, valueMax);
                        if (value !== undefined) {
                            setValue(value);
                        }
                    };
                    pxsim.svg.buttonEvents(this.antenna.children[0], mouseEventHandler, mouseEventHandler, mouseEventHandler, () => { });
                    pxsim.svg.buttonEvents(this.antenna.children[1], mouseEventHandler, mouseEventHandler, mouseEventHandler, () => { });
                    this.antenna.addEventListener('keydown', keyboardEventHandler);
                    pxsim.accessibility.makeFocusable(this.antenna);
                    pxsim.accessibility.setAria(this.antenna, "slider", pxsim.localization.lf("Received Signal Strength Indicator"));
                    ;
                    this.antenna.setAttribute("aria-valuemin", `${valueMin}`);
                    this.antenna.setAttribute("aria-valuemax", `${valueMax}`);
                    this.antenna.setAttribute("aria-orientation", "horizontal");
                    this.antenna.setAttribute("aria-valuenow", ((_a = this.board.radioState.datagram.rssi) !== null && _a !== void 0 ? _a : -75).toString());
                }
                let now = Date.now();
                if (now - this.lastAntennaFlash > 200) {
                    this.lastAntennaFlash = now;
                    pxsim.svg.animate(this.antenna.children[1], 'sim-flash-stroke');
                }
                this.updateRSSI();
            }
            updateRSSI() {
                let state = this.board;
                if (!state)
                    return;
                const v = state.radioState.datagram.rssi;
                if (v === undefined)
                    return;
                if (!this.rssi) {
                    let ayt = 10;
                    let ayb = 40;
                    for (let i = 0; i < 4; ++i)
                        pxsim.svg.child(this.g, "rect", { x: ANTENNA_X - 90 + i * 6, y: ayt + 28 - i * 4, width: 4, height: 2 + i * 4, fill: "#fff" });
                    this.rssi = pxsim.svg.child(this.g, "text", { x: ANTENNA_X - 64, y: ayb, class: "sim-text", "aria-hidden": true });
                    this.rssi.textContent = "";
                }
                const vt = v.toString();
                if (vt !== this.rssi.textContent) {
                    this.rssi.textContent = v.toString();
                    this.antenna.setAttribute("aria-valuenow", this.rssi.textContent);
                }
            }
            updatePins() {
                let state = this.board;
                if (!state)
                    return;
                state.edgeConnectorState.pins.forEach((pin, i) => this.updatePin(pin, i));
            }
            updateLightLevel() {
                let state = this.board;
                if (!state || !state.lightSensorState.usesLightLevel)
                    return;
                if (!this.lightLevelInitialized) {
                    this.lightLevelInitialized = true;
                    this.lightLevelButton.style.visibility = "visible";
                    let pt = this.element.createSVGPoint();
                    pxsim.svg.buttonEvents(this.lightLevelButton, 
                    // move
                    (ev) => {
                        let pos = pxsim.svg.cursorPoint(pt, this.element, ev);
                        let rs = LIGHT_LEVEL_BUTTON_RADIUS / 2;
                        let level = Math.max(0, Math.min(255, Math.floor((pos.y - (LIGHT_LEVEL_BUTTON_POSITION_Y - rs)) / (2 * rs) * 255)));
                        if (level != this.board.lightSensorState.lightLevel) {
                            this.board.lightSensorState.lightLevel = level;
                            this.applyLightLevel();
                        }
                    }, 
                    // start
                    ev => { }, 
                    // stop
                    ev => { }, 
                    // keydown
                    (ev) => {
                        const value = commonKeyHandler(ev, state.lightSensorState.lightLevel, 0, 255);
                        if (value !== undefined) {
                            state.lightSensorState.lightLevel = value;
                            this.updateLightLevel();
                        }
                    });
                    this.lightLevelText = pxsim.svg.child(this.g, "text", { x: 85, y: LIGHT_LEVEL_BUTTON_POSITION_Y + LIGHT_LEVEL_BUTTON_RADIUS - 5, text: '', class: 'sim-text', 'aria-hidden': true });
                    if (this.props.runtime)
                        this.props.runtime.environmentGlobals[pxsim.localization.lf("lightLevel")] = state.lightSensorState.lightLevel;
                    this.updateTheme();
                    pxsim.accessibility.makeFocusable(this.lightLevelButton);
                    pxsim.accessibility.setAria(this.lightLevelButton, "slider", pxsim.localization.lf("Light level"));
                    this.lightLevelButton.setAttribute("aria-valuemin", "0");
                    this.lightLevelButton.setAttribute("aria-valuemax", "255");
                    this.lightLevelButton.setAttribute("aria-orientation", "vertical");
                    this.lightLevelButton.setAttribute("aria-valuenow", "128");
                }
                pxsim.svg.setGradientValue(this.lightLevelGradient, Math.min(100, Math.max(0, Math.floor(state.lightSensorState.lightLevel * 100 / 255))) + '%');
                this.lightLevelText.textContent = state.lightSensorState.lightLevel.toString();
            }
            applyLightLevel() {
                let lv = this.board.lightSensorState.lightLevel;
                pxsim.svg.setGradientValue(this.lightLevelGradient, Math.min(100, Math.max(0, Math.floor(lv * 100 / 255))) + '%');
                this.lightLevelText.textContent = lv.toString();
                this.lightLevelButton.setAttribute("aria-valuenow", lv.toString());
            }
            findParentElement() {
                let el = this.element;
                while (el.parentNode && el.parentNode.nodeName == "svg")
                    el = el.parentNode;
                return el;
            }
            updateTilt() {
                const state = this.board;
                if (!state || !state.accelerometerState.accelerometer.isActive)
                    return;
                const acc = state.accelerometerState.accelerometer;
                const x = acc.getX();
                const y = -acc.getY();
                const z = acc.getZ();
                const af = 8 / 1023;
                const s = 1 - Math.min(0.1, Math.pow(Math.max(Math.abs(x), Math.abs(y)) / 1023, 2) / 35);
                acc.updateEnvironmentGlobals();
                // fix top parent and apply style to it
                const el = this.findParentElement();
                el.style.transform = `perspective(30em) rotateX(${y * af}deg) rotateY(${x * af}deg) scale(${s}, ${s})`;
                el.style.perspectiveOrigin = "50% 50% 50%";
                el.style.perspective = "30em";
                // don't display acc data when AB is on, v2 is on or soundLevel is on
                const soundLevelVisible = this.soundLevel.style.visibility == "visible";
                if (state.buttonPairState.usesButtonAB
                    || this.v2Circle
                    || soundLevelVisible) {
                    if (this.accTextX)
                        this.accTextX.textContent = "";
                    if (this.accTextY)
                        this.accTextY.textContent = "";
                    if (this.accTextZ)
                        this.accTextZ.textContent = "";
                }
                else {
                    // update text
                    if (acc.flags & pxsim.AccelerometerFlag.X) {
                        if (!this.accTextX) {
                            this.accTextX = pxsim.svg.child(this.g, "text", { x: 365, y: 260, class: "sim-text", "aria-hidden": true });
                            this.accTextX.textContent = "";
                        }
                        this.accTextX.textContent = `ax:${x}`;
                    }
                    if (acc.flags & pxsim.AccelerometerFlag.Y) {
                        if (!this.accTextY) {
                            this.accTextY = pxsim.svg.child(this.g, "text", { x: 365, y: 285, class: "sim-text", "aria-hidden": true });
                            this.accTextY.textContent = "";
                        }
                        this.accTextY.textContent = `ay:${-y}`;
                    }
                    if (acc.flags & pxsim.AccelerometerFlag.Z) {
                        if (!this.accTextZ) {
                            this.accTextZ = pxsim.svg.child(this.g, "text", { x: 365, y: 310, class: "sim-text", "aria-hidden": true });
                            this.accTextZ.textContent = "";
                        }
                        this.accTextZ.textContent = `az:${z}`;
                    }
                }
            }
            buildDom() {
                this.domHardwareVersion = 1;
                this.element = pxsim.svg.elt("svg");
                pxsim.svg.hydrate(this.element, {
                    "version": "1.0",
                    "viewBox": `0 0 ${MB_WIDTH} ${MB_HEIGHT}`,
                    "class": "sim",
                    "x": "0px",
                    "y": "0px",
                    "width": MB_WIDTH + "px",
                    "height": MB_HEIGHT + "px",
                    "fill": "rgba(0,0,0,0)",
                    // Allows screen reader users to interact with board properly.
                    "role": "application"
                });
                this.style = pxsim.svg.child(this.element, "style", {});
                this.style.textContent = MB_STYLE + (this.props.theme.highContrast ? MB_HIGHCONTRAST : "");
                this.defs = pxsim.svg.child(this.element, "defs", {});
                this.g = pxsim.svg.elt("g");
                this.element.appendChild(this.g);
                // filters
                let ledglow = pxsim.svg.child(this.defs, "filter", { id: "ledglow", x: "-75%", y: "-75%", width: "300%", height: "300%" });
                pxsim.svg.child(ledglow, "feMorphology", { operator: "dilate", radius: "4", in: "SourceAlpha", result: "thicken" });
                pxsim.svg.child(ledglow, "feGaussianBlur", { stdDeviation: "5", in: "thicken", result: "blurred" });
                pxsim.svg.child(ledglow, "feFlood", { "flood-color": "rgb(255, 17, 77)", result: "glowColor" });
                pxsim.svg.child(ledglow, "feComposite", { in: "glowColor", in2: "blurred", operator: "in", result: "ledglow_colored" });
                let ledglowMerge = pxsim.svg.child(ledglow, "feMerge", {});
                pxsim.svg.child(ledglowMerge, "feMergeNode", { in: "ledglow_colored" });
                pxsim.svg.child(ledglowMerge, "feMergeNode", { in: "SourceGraphic" });
                let glow = pxsim.svg.child(this.defs, "filter", { id: "filterglow", x: "-5%", y: "-5%", width: "120%", height: "120%" });
                pxsim.svg.child(glow, "feGaussianBlur", { stdDeviation: "5", result: "glow" });
                let merge = pxsim.svg.child(glow, "feMerge", {});
                for (let i = 0; i < 3; ++i)
                    pxsim.svg.child(merge, "feMergeNode", { in: "glow" });
                // outline
                this.pkg = pxsim.svg.path(this.g, "sim-board", "M498,31.9C498,14.3,483.7,0,466.1,0H31.9C14.3,0,0,14.3,0,31.9v342.2C0,391.7,14.3,406,31.9,406h434.2c17.6,0,31.9-14.3,31.9-31.9V31.9z M14.3,206.7c-2.7,0-4.8-2.2-4.8-4.8c0-2.7,2.2-4.8,4.8-4.8c2.7,0,4.8,2.2,4.8,4.8C19.2,204.6,17,206.7,14.3,206.7z M486.2,206.7c-2.7,0-4.8-2.2-4.8-4.8c0-2.72.2-4.8,4.8-4.8c2.7,0,4.8,2.2,4.8,4.8C491,204.6,488.8,206.7,486.2,206.7z");
                pxsim.svg.hydrate(this.pkg, { fill: "#111" });
                // script background
                this.display = pxsim.svg.path(this.g, "sim-display", "M333.8,310.3H165.9c-8.3,0-15-6.7-15-15V127.5c0-8.3,6.7-15,15-15h167.8c8.3,0,15,6.7,15,15v167.8C348.8,303.6,342.1,310.3,333.8,310.3z");
                pxsim.svg.hydrate(this.display, { fill: "#111" });
                this.logos = [];
                this.logos.push(pxsim.svg.child(this.g, "polygon", { class: "sim-theme", points: "115,56.7 173.1,0 115,0" }));
                this.logos.push(pxsim.svg.path(this.g, "sim-theme", "M114.2,0H25.9C12.1,2.1,0,13.3,0,27.7v83.9L114.2,0z"));
                this.logos.push(pxsim.svg.child(this.g, "polygon", { class: "sim-theme", points: "173,27.9 202.5,0 173,0" }));
                this.logos.push(pxsim.svg.child(this.g, "polygon", { class: "sim-theme", points: "54.1,242.4 54.1,274.1 22.4,274.1" }));
                this.logos.push(pxsim.svg.child(this.g, "polygon", { class: "sim-theme", points: "446.2,164.6 446.2,132.8 477.9,132.8" }));
                // leds
                this.leds = [];
                this.ledsOuter = [];
                let left = 154, top = 113, ledoffw = 46, ledoffh = 44;
                for (let i = 0; i < 5; ++i) {
                    let ledtop = i * ledoffh + top;
                    for (let j = 0; j < 5; ++j) {
                        let ledleft = j * ledoffw + left;
                        let k = i * 5 + j;
                        this.ledsOuter.push(pxsim.svg.child(this.g, "rect", { class: "sim-led-back", x: ledleft, y: ledtop, width: 10, height: 20, rx: 2, ry: 2 }));
                        let led = pxsim.svg.child(this.g, "rect", { class: "sim-led", x: ledleft - 2, y: ledtop - 2, width: 14, height: 24, rx: 3, ry: 3, title: `(${j},${i})` });
                        pxsim.svg.filter(led, `url(#ledglow)`);
                        this.leds.push(led);
                    }
                }
                // Order of construction affects tab ordering
                this.buildLightLevelElement();
                this.buildAntennaElement();
                this.buildHeadElement();
                this.buildThermometerElement();
                this.buildSoundLevel();
                this.buildShakeElement();
                this.buildButtonElements();
                this.buildPinElements();
            }
            buildAntennaElement() {
                this.antenna = pxsim.svg.child(this.g, "g", { class: "sim-antenna-outer" });
                const ayt = 10;
                const ayb = 40;
                const antennaWidth = ANTENNA_WAVE_PERIOD_X * ANTENNA_WAVE_COUNT;
                const borderOffset = 3;
                pxsim.svg.child(this.antenna, "rect", {
                    x: ANTENNA_X - borderOffset,
                    y: ayt - borderOffset,
                    width: antennaWidth + 2 * borderOffset,
                    height: ayb - ayt + 2 * borderOffset,
                    fill: "transparent",
                    rx: 2
                });
                let ax = ANTENNA_X;
                const dax = ANTENNA_WAVE_PERIOD_X;
                pxsim.svg.child(this.antenna, "polyline", { class: "sim-antenna", points: `${ax},${ayb} ${ax},${ayt} ${ax += dax},${ayt} ${ax},${ayb} ${ax += dax},${ayb} ${ax},${ayt} ${ax += dax},${ayt} ${ax},${ayb} ${ax += dax},${ayb} ${ax},${ayt} ${ax += dax},${ayt}` });
                this.antenna.style.visibility = "hidden";
            }
            buildSoundLevel() {
                let gid = "gradient-soundlevel";
                this.soundLevelGradient = pxsim.svg.linearGradient(this.defs, gid);
                this.soundLevel = pxsim.svg.child(this.g, "rect", {
                    class: "sim-thermometer no-drag",
                    x: 360,
                    y: 110,
                    width: 20,
                    height: 160,
                    rx: 5, ry: 5,
                    fill: `url(#${gid})`
                });
                this.soundLevel.style.visibility = "hidden";
            }
            buildThermometerElement() {
                let gid = "gradient-thermometer";
                this.thermometerGradient = pxsim.svg.linearGradient(this.defs, gid);
                this.thermometer = pxsim.svg.child(this.g, "rect", {
                    class: "sim-thermometer no-drag",
                    x: 120,
                    y: 110,
                    width: 20,
                    height: 160,
                    rx: 5, ry: 5,
                    fill: `url(#${gid})`
                });
                this.thermometer.style.visibility = "hidden";
            }
            buildLightLevelElement() {
                let gid = "gradient-light-level";
                this.lightLevelGradient = pxsim.svg.linearGradient(this.defs, gid);
                this.lightLevelButton = pxsim.svg.child(this.g, "circle", {
                    cx: `50px`, cy: `${LIGHT_LEVEL_BUTTON_POSITION_Y}px`, r: `${LIGHT_LEVEL_BUTTON_RADIUS}px`,
                    class: 'sim-light-level-button no-drag',
                    fill: `url(#${gid})`
                });
                this.lightLevelButton.style.visibility = "hidden";
            }
            buildHeadElement() {
                // head
                this.head = pxsim.svg.child(this.g, "g", { class: "sim-head" });
                pxsim.svg.child(this.head, "ellipse", { cx: 251, cy: 75, rx: 75, ry: 35, fill: "transparent" });
                this.headParts = pxsim.svg.child(this.head, "g", {});
                this.heads = [];
                // background
                this.heads.push(pxsim.svg.path(this.headParts, "sim-button", "M 269.9 50.2 L 269.9 50.2 l -39.5 0 v 0 c -14.1 0.1 -24.6 10.7 -24.6 24.8 c 0 13.9 10.4 24.4 24.3 24.7 v 0 h 39.6 c 14.2 0 24.8 -10.6 24.8 -24.7 C 294.5 61 284 50.3 269.9 50.2 M 269.7 89.2"));
                // shapes
                this.heads.push(pxsim.svg.path(this.headParts, "sim-theme", "M269.9,50.2L269.9,50.2l-39.5,0v0c-14.1,0.1-24.6,10.7-24.6,24.8c0,13.9,10.4,24.4,24.3,24.7v0h39.6c14.2,0,24.8-10.6,24.8-24.7C294.5,61,284,50.3,269.9,50.2 M269.7,89.2L269.7,89.2l-39.3,0c-7.7-0.1-14-6.4-14-14.2c0-7.8,6.4-14.2,14.2-14.2h39.1c7.8,0,14.2,6.4,14.2,14.2C283.9,82.9,277.5,89.2,269.7,89.2"));
                this.heads.push(pxsim.svg.path(this.headParts, "sim-theme", "M230.6,69.7c-2.9,0-5.3,2.4-5.3,5.3c0,2.9,2.4,5.3,5.3,5.3c2.9,0,5.3-2.4,5.3-5.3C235.9,72.1,233.5,69.7,230.6,69.7"));
                this.heads.push(pxsim.svg.path(this.headParts, "sim-theme", "M269.7,80.3c2.9,0,5.3-2.4,5.3-5.3c0-2.9-2.4-5.3-5.3-5.3c-2.9,0-5.3,2.4-5.3,5.3C264.4,77.9,266.8,80.3,269.7,80.3"));
                this.headText = pxsim.svg.child(this.g, "text", { x: 160, y: 60, class: "sim-text", "aria-hidden": true });
            }
            buildPinElements() {
                // https://www.microbit.co.uk/device/pins
                // The order of this.pins must match the edgeConnectorState.pins order.
                // The draw order must match the desired tab order. To this end we
                // create the drawlist in sim order and evaluate it in tab order.
                // P0, P1, P2
                let drawList = [
                    "M16.5,341.2c0,0.4-0.1,0.9-0.1,1.3v60.7c4.1,1.7,8.6,2.7,12.9,2.7h34.4v-64.7c0,0,0-0.1,0-0.1c0-13-10.6-23.6-23.7-23.6C27.2,317.6,16.5,328.1,16.5,341.2z M21.2,341.6c0-10.7,8.7-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3c0,10.7-8.6,19.3-19.3,19.3C29.9,360.9,21.2,352.2,21.2,341.6z",
                    "M139.1,317.3c-12.8,0-22.1,10.3-23.1,23.1V406h46.2v-65.6C162.2,327.7,151.9,317.3,139.1,317.3zM139.3,360.1c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C158.6,351.5,150,360.1,139.3,360.1z",
                    "M249,317.3c-12.8,0-22.1,10.3-23.1,23.1V406h46.2v-65.6C272.1,327.7,261.8,317.3,249,317.3z M249.4,360.1c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C268.7,351.5,260.1,360.1,249.4,360.1z"
                ].map((p) => () => pxsim.svg.path(this.g, "sim-pin sim-pin-touch", p));
                // P3
                drawList.push(() => pxsim.svg.path(this.g, "sim-pin", "M0,357.7v19.2c0,10.8,6.2,20.2,14.4,25.2v-44.4H0z"));
                pins4onXs.forEach(x => {
                    drawList.push(() => pxsim.svg.child(this.g, "rect", { x: x, y: 356.7, width: 10, height: 50, class: "sim-pin" }));
                });
                drawList.push(() => pxsim.svg.path(this.g, "sim-pin", "M483.6,402c8.2-5,14.4-14.4,14.4-25.1v-19.2h-14.4V402z"));
                drawList.push(() => pxsim.svg.path(this.g, "sim-pin", "M359.9,317.3c-12.8,0-22.1,10.3-23.1,23.1V406H383v-65.6C383,327.7,372.7,317.3,359.9,317.3z M360,360.1c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C379.3,351.5,370.7,360.1,360,360.1z"));
                drawList.push(() => pxsim.svg.path(this.g, "sim-pin", "M458,317.6c-13,0-23.6,10.6-23.6,23.6c0,0,0,0.1,0,0.1h0V406H469c4.3,0,8.4-1,12.6-2.7v-60.7c0-0.4,0-0.9,0-1.3C481.6,328.1,471,317.6,458,317.6z M457.8,360.9c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C477.1,352.2,468.4,360.9,457.8,360.9z"));
                this.pins = pinDrawOrder.reduce((pins, pinName) => {
                    const simPinIndex = pinNames.indexOf(pinName);
                    const newPin = drawList[simPinIndex]();
                    pxsim.svg.hydrate(newPin, { title: pinTitles[simPinIndex].ariaLabel });
                    pins[simPinIndex] = newPin;
                    return pins;
                }, new Array(pinDrawOrder.length));
                this.pinGradients = this.pins.map((pin, i) => {
                    let gid = "gradient-pin-" + i;
                    let lg = pxsim.svg.linearGradient(this.defs, gid);
                    pin.setAttribute("fill", `url(#${gid})`);
                    return lg;
                });
                this.pinTexts = [67, 165, 275].map(x => pxsim.svg.child(this.g, "text", { class: "sim-text-pin", x: x, y: 345, "aria-hidden": true }));
                pxsim.svg.path(this.g, "sim-label", "M35.7,376.4c0-2.8,2.1-5.1,5.5-5.1c3.3,0,5.5,2.4,5.5,5.1v4.7c0,2.8-2.2,5.1-5.5,5.1c-3.3,0-5.5-2.4-5.5-5.1V376.4zM43.3,376.4c0-1.3-0.8-2.3-2.2-2.3c-1.3,0-2.1,1.1-2.1,2.3v4.7c0,1.2,0.8,2.3,2.1,2.3c1.3,0,2.2-1.1,2.2-2.3V376.4z");
                pxsim.svg.path(this.g, "sim-label", "M136.2,374.1c2.8,0,3.4-0.8,3.4-2.5h2.9v14.3h-3.4v-9.5h-3V374.1z");
                pxsim.svg.path(this.g, "sim-label", "M248.6,378.5c1.7-1,3-1.7,3-3.1c0-1.1-0.7-1.6-1.6-1.6c-1,0-1.8,0.6-1.8,2.1h-3.3c0-2.6,1.8-4.6,5.1-4.6c2.6,0,4.9,1.3,4.9,4.3c0,2.4-2.3,3.9-3.8,4.7c-2,1.3-2.5,1.8-2.5,2.9h6.1v2.7h-10C244.8,381.2,246.4,379.9,248.6,378.5z");
                pxsim.svg.path(this.g, "sim-label", "M352.1,381.1c0,1.6,0.9,2.5,2.2,2.5c1.2,0,1.9-0.9,1.9-1.9c0-1.2-0.6-2-2.1-2h-1.3v-2.6h1.3c1.5,0,1.9-0.7,1.9-1.8c0-1.1-0.7-1.6-1.6-1.6c-1.4,0-1.8,0.8-1.8,2.1h-3.3c0-2.4,1.5-4.6,5.1-4.6c2.6,0,5,1.3,5,4c0,1.6-1,2.8-2.1,3.2c1.3,0.5,2.3,1.6,2.3,3.5c0,2.7-2.4,4.3-5.2,4.3c-3.5,0-5.5-2.1-5.5-5.1H352.1z");
                pxsim.svg.path(this.g, "sim-label", "M368.5,385.9h-3.1l-5.1-14.3h3.5l3.1,10.1l3.1-10.1h3.6L368.5,385.9z");
                pxsim.svg.path(this.g, "sim-label", "M444.4,378.3h7.4v2.5h-1.5c-0.6,3.3-3,5.5-7.1,5.5c-4.8,0-7.5-3.5-7.5-7.5c0-3.9,2.8-7.5,7.5-7.5c3.8,0,6.4,2.3,6.6,5h-3.5c-0.2-1.1-1.4-2.2-3.1-2.2c-2.7,0-4.1,2.3-4.1,4.7c0,2.5,1.4,4.7,4.4,4.7c2,0,3.2-1.2,3.4-2.7h-2.5V378.3z");
                pxsim.svg.path(this.g, "sim-label", "M461.4,380.9v-9.3h3.3v14.3h-3.5l-5.2-9.2v9.2h-3.3v-14.3h3.5L461.4,380.9z");
                pxsim.svg.path(this.g, "sim-label", "M472.7,371.6c4.8,0,7.5,3.5,7.5,7.2s-2.7,7.2-7.5,7.2h-5.3v-14.3H472.7z M470.8,374.4v8.6h1.8c2.7,0,4.2-2.1,4.2-4.3s-1.6-4.3-4.2-4.3H470.8z");
            }
            buildShakeElement() {
                this.shakeButton = pxsim.svg.child(this.g, "circle", {
                    cx: 404,
                    cy: 115,
                    r: 12,
                    class: "sim-shake",
                });
                this.shakeButton.style.visibility = "hidden";
            }
            buildButtonElements() {
                this.buttonsOuter = [];
                this.buttons = [];
                const outerBtn = (left, top, label) => {
                    const btnr = 4;
                    const btnw = 56.2;
                    const btnn = 6;
                    const btnnm = 10;
                    let btng = pxsim.svg.child(this.g, "g", { class: "sim-button-group" });
                    pxsim.accessibility.makeFocusable(btng);
                    pxsim.accessibility.setAria(btng, "button", label);
                    this.buttonsOuter.push(btng);
                    pxsim.svg.child(btng, "rect", { class: "sim-button-outer", x: left, y: top, rx: btnr, ry: btnr, width: btnw, height: btnw });
                    pxsim.svg.child(btng, "circle", { class: "sim-button-nut", cx: left + btnnm, cy: top + btnnm, r: btnn });
                    pxsim.svg.child(btng, "circle", { class: "sim-button-nut", cx: left + btnnm, cy: top + btnw - btnnm, r: btnn });
                    pxsim.svg.child(btng, "circle", { class: "sim-button-nut", cx: left + btnw - btnnm, cy: top + btnw - btnnm, r: btnn });
                    pxsim.svg.child(btng, "circle", { class: "sim-button-nut", cx: left + btnw - btnnm, cy: top + btnnm, r: btnn });
                };
                outerBtn(25.9, 176.4, "A");
                this.buttons.push(pxsim.svg.path(this.g, "sim-button", "M69.7,203.5c0,8.7-7,15.7-15.7,15.7s-15.7-7-15.7-15.7c0-8.7,7-15.7,15.7-15.7S69.7,194.9,69.7,203.5"));
                outerBtn(418.1, 176.4, "B");
                this.buttons.push(pxsim.svg.path(this.g, "sim-button", "M461.9,203.5c0,8.7-7,15.7-15.7,15.7c-8.7,0-15.7-7-15.7-15.7c0-8.7,7-15.7,15.7-15.7C454.9,187.8,461.9,194.9,461.9,203.5"));
                outerBtn(417, 250, "A+B");
                this.buttons.push(pxsim.svg.child(this.g, "circle", { class: "sim-button", cx: 446, cy: 278, r: 16.5 }));
                this.buttonsOuter[2].style.visibility = "hidden";
                this.buttons[2].style.visibility = "hidden";
                this.buttons.forEach(btn => pxsim.svg.hydrate(btn, { fill: "#111" }));
                pxsim.svg.path(this.g, "sim-button-label", "M48.1,270.9l-0.6-1.7h-5.1l-0.6,1.7h-3.5l5.1-14.3h3.1l5.2,14.3H48.1z M45,260.7l-1.8,5.9h3.5L45,260.7z");
                pxsim.svg.path(this.g, "sim-button-label", "M449.1,135.8h5.9c3.9,0,4.7,2.4,4.7,3.9c0,1.8-1.4,2.9-2.5,3.2c0.9,0,2.6,1.1,2.6,3.3c0,1.5-0.8,4-4.7,4h-6V135.8zM454.4,141.7c1.6,0,2-1,2-1.7c0-0.6-0.3-1.7-2-1.7h-2v3.4H454.4z M452.4,144.1v3.5h2.1c1.6,0,2-1,2-1.8c0-0.7-0.4-1.8-2-1.8H452.4z");
            }
            updateHardwareVersion() {
                // check if microphone has been used
                const b = this.board;
                if (!b)
                    return;
                if (b.microphoneState.sensorUsed)
                    b.ensureHardwareVersion(2);
                // check current version
                const version = this.board.hardwareVersion;
                if (version === this.domHardwareVersion)
                    return;
                this.domHardwareVersion = this.board.hardwareVersion;
                // v2 skinning
                // don't use yellow theme
                if (this.props.theme.accent === "#FFD43A") {
                    this.props.theme = visuals.themes[0];
                }
                // display v2 indicator
                const title = pxsim.localization.lf("micro:bit v2 needed");
                this.v2Circle = pxsim.svg.child(this.g, "circle", { r: 21, title: title });
                pxsim.svg.fill(this.v2Circle, "white");
                this.v2Text = pxsim.svg.child(this.g, "text", { class: "sim-text", title: title, "aria-hidden": true });
                this.v2Text.textContent = "V2";
                pxsim.svg.fill(this.v2Text, "black");
                this.v2Text.style.fontWeight = "700";
                // update pins
                // notch: 46.2 -> h 7 c 0 0 -1 -9 8 -8 l 18 0 c 0 0 9 -1 8 8 h 7
                this.pins[0].setAttribute("d", "M 16.5 341.2 c 0 0.4 -0.1 0.9 -0.1 1.3 v 60.7 c 2.6 1.8 4.6 2.8 8.6 2.8 c 0 0 -1 -9 8 -8 l 16 0 c 0 0 9 -1 8 8 h 8 v -64.7 c 0 0 0 -0.1 0 -0.1 c 0 -13 -10.6 -23.6 -23.7 -23.6 C 27.2 317.6 16.5 328.1 16.5 341.2 z M 21.2 341.6 c 0 -10.7 8.7 -19.3 19.3 -19.3 c 10.7 0 19.3 8.7 19.3 19.3 c 0 10.7 -8.6 19.3 -19.3 19.3 C 29.9 360.9 21.2 352.2 21.2 341.6 z");
                this.pins[1].setAttribute("d", "M139.1,317.3c-12.8,0-22.1,10.3-23.1,23.1V406h 6 c 0 0 -1 -9 8 -8 l 17 0 c 0 0 9 -1 8 8 h 7v-65.6C162.2,327.7,151.9,317.3,139.1,317.3zM139.3,360.1c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C158.6,351.5,150,360.1,139.3,360.1z");
                this.pins[2].setAttribute("d", "M249,317.3c-12.8,0-22.1,10.3-23.1,23.1V406h 6 c 0 0 -1 -9 8 -8 l 17 0 c 0 0 9 -1 8 8 h 7v-65.6C272.1,327.7,261.8,317.3,249,317.3z M249.4,360.1c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C268.7,351.5,260.1,360.1,249.4,360.1z");
                // 3v
                this.pins[this.pins.length - 2].setAttribute("d", "M359.9,317.3c-12.8,0-22.1,10.3-23.1,23.1V406h 7 c 0 0 -1 -9 8 -8 l 17 0 c 0 0 9 -1 8 8 h 7v-65.6C383,327.7,372.7,317.3,359.9,317.3z M360,360.1c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C379.3,351.5,370.7,360.1,360,360.1z");
                this.pins[this.pins.length - 1].setAttribute("d", "M 458 317.6 c -13 0 -23.6 10.6 -23.6 23.6 c 0 0 0 0.1 0 0.1 h 0 V 406 h 7 c 0 0 -1 -9 8 -8 l 17 0 c 0 0 9 -1 8 8 h 1.6 c 2 0 4 -1 5 -3 v -60.7 c 0 -0.4 0 -0.9 0 -1.3 C 481.6 328.1 471 317.6 458 317.6 z M 457.8 360.9 c -10.7 0 -19.3 -8.6 -19.3 -19.3 c 0 -10.7 8.6 -19.3 19.3 -19.3 c 10.7 0 19.3 8.7 19.3 19.3 C 477.1 352.2 468.4 360.9 457.8 360.9 z");
                // outline
                this.pkg.setAttribute("d", "M 498 31.9 C 498 14.3 483.7 0 466.1 0 H 31.9 C 14.3 0 0 14.3 0 31.9 v 342.2 C -1 399 21 405 23 406 c 0 0 -1 -9 8 -8 l 18 0 c 0 0 9 -1 8 8 h 7 h 50 h 7 c 0 0 -1 -9 8 -8 l 18 0 c 0 0 9 -1 8 8 h 7 h 63 h 7 c 0 0 -1 -9 8 -8 l 18 0 c 0 0 9 -1 8 8 h 7 h 64 h 7 c 0 0 -1 -9 8 -8 l 18 0 c 0 0 9 -1 8 8 h 7 h 51 h 5 c 0 0 -1 -9 8 -8 l 18 0 c 0 0 9 -1 8 8 h 0 c 9 0 23 -17 23 -31 V 31.9 z M 14.3 206.7 c -2.7 0 -4.8 -2.2 -4.8 -4.8 c 0 -2.7 2.2 -4.8 4.8 -4.8 c 2.7 0 4.8 2.2 4.8 4.8 C 19.2 204.6 17 206.7 14.3 206.7 z M 486.2 206.7 c -2.7 0 -4.8 -2.2 -4.8 -4.8 c 0 -2.72 0.2 -4.8 4.8 -4.8 c 2.7 0 4.8 2.2 4.8 4.8 C 491 204.6 488.8 206.7 486.2 206.7 z");
                const headTitle = pxsim.localization.lf("logo touch (micro:bit v2 needed)");
                pxsim.accessibility.makeFocusable(this.headParts);
                pxsim.accessibility.setAria(this.headParts, "button", headTitle);
                this.headParts.setAttribute("class", "sim-button-outer sim-button-group");
                this.attachButtonEvents(this.board.logoTouch, this.headParts, this.headParts);
                document.body.addEventListener(pxsim.pointerEvents.down[0], this.moveHeadingOnClick);
                // microphone led
                const microphoneTitle = pxsim.localization.lf("microphone (micro:bit v2 needed)");
                const microg = pxsim.svg.child(this.g, "g", { title: microphoneTitle });
                this.microphoneLed = pxsim.svg.path(microg, "sim-led sim-mic", "M 352.852 71 C 351.315 71 350.07 72.248 350.07 73.784 V 79.056 C 350.07 80.594 351.316 81.838 352.852 81.838 C 354.387 81.838 355.634 80.593 355.634 79.056 V 73.784 C 355.634 72.248 354.387 71 352.852 71 Z M 346.743 79.981 C 346.743 82.84 348.853 85.062 351.501 85.658 V 87.095 H 348.448 V 89.329 H 357.366 V 87.095 H 354.306 V 85.658 C 356.954 85.064 359.071 82.842 359.071 79.981 H 357.057 C 357.057 82.174 355.168 83.81 352.905 83.81 C 350.64 83.81 348.757 82.173 348.757 79.981 Z");
                pxsim.svg.fills([this.microphoneLed], this.props.theme.ledOff);
                // ring
                pxsim.svg.child(this.g, "circle", { cx: 336, cy: 86, r: 3, stroke: "gold", strokeWidth: "1px" });
                this.updateMicrophone();
                this.updateTheme();
            }
            positionV2Elements() {
                if (this.v2Circle && this.v2Text) {
                    const offsetFromAB = !!(this.board && this.board.buttonPairState.usesButtonAB);
                    const x = offsetFromAB ? 385 : 458;
                    const y = offsetFromAB ? 300 : 290;
                    this.v2Circle.setAttribute("cx", "" + x);
                    this.v2Circle.setAttribute("cy", "" + y);
                    this.v2Text.setAttribute("x", `${x - 15}`);
                    this.v2Text.setAttribute("y", `${y + 8}`);
                }
                if (this.soundLevel && this.buttonABText) {
                    // hide A+B text
                    this.buttonABText.setAttribute("x", "386");
                    this.buttonABText.setAttribute("y", "274");
                    this.buttonABText.style.fontSize = "95%";
                }
            }
            attachEvents() {
                this.attachIFrameEvents();
                this.attachAccelerometerEvents();
                this.attachPinsIOEvents();
                this.attachPinsTouchEvents();
                this.attachABEvents();
                this.attachAPlusBEvents();
                this.attachKeyboardEvents();
            }
            attachIFrameEvents() {
                pxsim.Runtime.messagePosted = (msg) => {
                    switch (msg.type || "") {
                        case "serial":
                            this.flashSystemLed();
                            break;
                        case "radiopacket":
                            this.flashAntenna();
                            break;
                        case "eventbus":
                            if (msg.id == 2000 /* DAL.MES_BROADCAST_GENERAL_ID */)
                                this.flashAntenna();
                            break;
                    }
                };
            }
            attachAccelerometerEvents() {
                let tiltDecayer = undefined;
                const state = this.board;
                const startTiltDecay = () => {
                    if (!tiltDecayer) {
                        const doDecay = () => {
                            let accx = state.accelerometerState.accelerometer.getX(pxsim.MicroBitCoordinateSystem.RAW);
                            accx = Math.floor(Math.abs(accx) * 0.85) * (accx > 0 ? 1 : -1);
                            let accy = state.accelerometerState.accelerometer.getY(pxsim.MicroBitCoordinateSystem.RAW);
                            accy = Math.floor(Math.abs(accy) * 0.85) * (accy > 0 ? 1 : -1);
                            let accz = -Math.sqrt(Math.max(0, 1023 * 1023 - accx * accx - accy * accy));
                            if (Math.abs(accx) <= 24 && Math.abs(accy) <= 24) {
                                cancelAnimationFrame(tiltDecayer);
                                tiltDecayer = 0;
                                accx = 0;
                                accy = 0;
                                accz = -1023;
                            }
                            else {
                                tiltDecayer = requestAnimationFrame(doDecay);
                            }
                            state.accelerometerState.accelerometer.update(accx, accy, accz);
                            this.updateTilt();
                        };
                        tiltDecayer = requestAnimationFrame(doDecay);
                    }
                };
                const handleMove = (xPos, yPos, boardWidth, boardHeight) => {
                    if (yPos > boardHeight || xPos < 0 || xPos > boardWidth) {
                        startTiltDecay();
                        return;
                    }
                    if (tiltDecayer) {
                        cancelAnimationFrame(tiltDecayer);
                        tiltDecayer = undefined;
                    }
                    const ax = (xPos - boardWidth / 2) / (boardWidth / 3);
                    const ay = (yPos - boardHeight / 2) / (boardHeight / 3);
                    const x = -Math.max(-1023, Math.min(1023, Math.floor(ax * 1023)));
                    const y = -Math.max(-1023, Math.min(1023, Math.floor(ay * 1023)));
                    const z2 = 1023 * 1023 - x * x - y * y;
                    const z = Math.floor((z2 > 0 ? -1 : 1) * Math.sqrt(Math.abs(z2)));
                    state.accelerometerState.accelerometer.update(x, y, z);
                    this.updateTilt();
                };
                this.bindEvent(document, pxsim.pointerEvents.move, (ev) => {
                    if (!state.accelerometerState.accelerometer.isActive)
                        return;
                    const boardElement = this.element;
                    const parentSvg = this.findParentElement();
                    const xPos = ev.clientX != null ? ev.clientX : ev.pageX;
                    const yPos = ev.clientY != null ? ev.clientY : ev.pageY;
                    // The outermost SVG has a transform applied to it to create the tilt
                    // effect. In order to give us a constant bounding box to work with,
                    // we want to calculate the pre-transform bounds of the board element
                    // we can do this by comparing the aspect ratio of the page to the
                    // viewbox of the board SVG, since it should always be maximized within
                    // the page.
                    const pageBounds = document.body.getBoundingClientRect();
                    if (parentSvg && parentSvg !== this.element) {
                        // If we are embedded in another SVG (e.g. the breadboard is present),
                        // we need to do some extra work to find the bounding box of the board
                        // element within the parent SVG.
                        const parentViewBoxWidth = parentSvg.viewBox.baseVal.width;
                        const parentViewBoxHeight = parentSvg.viewBox.baseVal.height;
                        const aspectRatio = parentViewBoxWidth / parentViewBoxHeight;
                        let parentWidth;
                        let parentHeight;
                        if (pageBounds.width / pageBounds.height > aspectRatio) {
                            parentHeight = pageBounds.height;
                            parentWidth = parentHeight * aspectRatio;
                        }
                        else {
                            parentWidth = pageBounds.width;
                            parentHeight = parentWidth / aspectRatio;
                        }
                        const parentLeft = pageBounds.left + (pageBounds.width - parentWidth) / 2;
                        const parentTop = pageBounds.top + (pageBounds.height - parentHeight) / 2;
                        const boardWidth = parseFloat(boardElement.getAttribute("width"));
                        const boardHeight = parseFloat(boardElement.getAttribute("height"));
                        const boardLeft = parseFloat(boardElement.getAttribute("x"));
                        const boardTop = parseFloat(boardElement.getAttribute("y"));
                        const boardPixelLeft = parentLeft + (boardLeft / parentViewBoxWidth) * parentWidth;
                        const boardPixelTop = parentTop + (boardTop / parentViewBoxHeight) * parentHeight;
                        const boardPixelWidth = (boardWidth / parentViewBoxWidth) * parentWidth;
                        const boardPixelHeight = (boardHeight / parentViewBoxHeight) * parentHeight;
                        handleMove(xPos - boardPixelLeft, yPos - boardPixelTop, boardPixelWidth, boardPixelHeight);
                    }
                    else {
                        const boardViewboxWidth = this.element.viewBox.baseVal.width;
                        const boardViewboxHeight = this.element.viewBox.baseVal.height;
                        const aspectRatio = boardViewboxWidth / boardViewboxHeight;
                        let boardWidth;
                        let boardHeight;
                        if (pageBounds.width / pageBounds.height > aspectRatio) {
                            boardHeight = pageBounds.height;
                            boardWidth = boardHeight * aspectRatio;
                        }
                        else {
                            boardWidth = pageBounds.width;
                            boardHeight = boardWidth / aspectRatio;
                        }
                        const boardLeft = pageBounds.left + (pageBounds.width - boardWidth) / 2;
                        const boardTop = pageBounds.top + (pageBounds.height - boardHeight) / 2;
                        handleMove(xPos - boardLeft, yPos - boardTop, boardWidth, boardHeight);
                    }
                }, false);
                this.bindEvent(document, pxsim.pointerEvents.leave, (ev) => {
                    let state = this.board;
                    if (!state.accelerometerState.accelerometer.isActive)
                        return;
                    startTiltDecay();
                }, false);
            }
            attachPinsIOEvents() {
                this.pins.forEach((pin, index) => {
                    if (!this.board.edgeConnectorState.pins[index])
                        return;
                    let pt = this.element.createSVGPoint();
                    pxsim.svg.buttonEvents(pin, 
                    // move
                    ev => {
                        let state = this.board;
                        let pin = state.edgeConnectorState.pins[index];
                        let svgpin = this.pins[index];
                        if (pin.mode & pxsim.PinFlags.Input && !(pin.mode & pxsim.PinFlags.Touch)) {
                            let cursor = pxsim.svg.cursorPoint(pt, this.element, ev);
                            let maxValue = pin.mode & pxsim.PinFlags.Analog ? 1023 : 1;
                            let v = (400 - cursor.y) / 40 * maxValue;
                            pin.value = Math.max(0, Math.min(maxValue, Math.floor(v)));
                        }
                        this.updatePin(pin, index);
                    }, 
                    // start
                    ev => {
                        let state = this.board;
                        let pin = state.edgeConnectorState.pins[index];
                        let svgpin = this.pins[index];
                        pxsim.U.addClass(svgpin, "touched");
                        if (pin.mode & pxsim.PinFlags.Input && !(pin.mode & pxsim.PinFlags.Touch)) {
                            let cursor = pxsim.svg.cursorPoint(pt, this.element, ev);
                            let maxValue = pin.mode & pxsim.PinFlags.Analog ? 1023 : 1;
                            let v = (400 - cursor.y) / 40 * maxValue;
                            pin.value = Math.max(0, Math.min(maxValue, Math.floor(v)));
                        }
                        this.updatePin(pin, index);
                    }, 
                    // stop
                    (ev) => {
                        let state = this.board;
                        let pin = state.edgeConnectorState.pins[index];
                        let svgpin = this.pins[index];
                        pxsim.U.removeClass(svgpin, "touched");
                        this.updatePin(pin, index);
                        return false;
                    }, 
                    // keydown
                    (ev) => {
                        const state = this.board;
                        const pin = state.edgeConnectorState.pins[index];
                        const value = pinKeyHandler(ev, pin.value, 0, pin.mode & pxsim.PinFlags.Analog ? 1023 : 1, pin.mode);
                        if (value !== undefined) {
                            pin.value = value;
                            this.updatePin(pin, index);
                        }
                    });
                });
            }
            attachPinsTouchEvents() {
                this.pins.slice(0, 3).forEach((btn, index) => {
                    let pressedTime;
                    pxsim.pointerEvents.down.forEach(evid => btn.addEventListener(evid, ev => {
                        let state = this.board;
                        state.edgeConnectorState.pins[index].touched = true;
                        this.updatePin(state.edgeConnectorState.pins[index], index);
                        this.board.bus.queue(state.edgeConnectorState.pins[index].id, 1 /* DAL.MICROBIT_BUTTON_EVT_DOWN */);
                        pressedTime = pxsim.runtime.runningTime();
                    }));
                    btn.addEventListener(pxsim.pointerEvents.leave, ev => {
                        let state = this.board;
                        state.edgeConnectorState.pins[index].touched = false;
                        this.updatePin(state.edgeConnectorState.pins[index], index);
                    });
                    btn.addEventListener(pxsim.pointerEvents.up, ev => {
                        let state = this.board;
                        state.edgeConnectorState.pins[index].touched = false;
                        this.updatePin(state.edgeConnectorState.pins[index], index);
                        this.board.bus.queue(state.edgeConnectorState.pins[index].id, 2 /* DAL.MICROBIT_BUTTON_EVT_UP */);
                        const currentTime = pxsim.runtime.runningTime();
                        if (currentTime - pressedTime > 1000 /* DAL.DEVICE_BUTTON_LONG_CLICK_TIME */)
                            this.board.bus.queue(state.edgeConnectorState.pins[index].id, 4 /* DAL.MICROBIT_BUTTON_EVT_LONG_CLICK */);
                        else
                            this.board.bus.queue(state.edgeConnectorState.pins[index].id, 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */);
                        pressedTime = undefined;
                    });
                    pxsim.accessibility.enableKeyboardInteraction(btn, () => {
                        let state = this.board;
                        state.edgeConnectorState.pins[index].touched = true;
                        let svgpin = this.pins[index];
                        pxsim.U.addClass(svgpin, "touched");
                        this.updatePin(state.edgeConnectorState.pins[index], index);
                        this.board.bus.queue(state.edgeConnectorState.pins[index].id, 1 /* DAL.MICROBIT_BUTTON_EVT_DOWN */);
                    }, () => {
                        let state = this.board;
                        state.edgeConnectorState.pins[index].touched = false;
                        let svgpin = this.pins[index];
                        pxsim.U.removeClass(svgpin, "touched");
                        this.updatePin(state.edgeConnectorState.pins[index], index);
                        this.board.bus.queue(state.edgeConnectorState.pins[index].id, 2 /* DAL.MICROBIT_BUTTON_EVT_UP */);
                        this.board.bus.queue(state.edgeConnectorState.pins[index].id, 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */);
                    });
                });
            }
            attachABEvents() {
                const bpState = this.board.buttonPairState;
                const stateButtons = [bpState.aBtn, bpState.bBtn];
                const elButtonOuters = this.buttonsOuter.slice(0, 2);
                const elButtons = this.buttons.slice(0, 2);
                elButtonOuters.forEach((btn, index) => {
                    this.attachButtonEvents(stateButtons[index], btn, elButtons[index]);
                });
            }
            attachButtonEvents(stateButton, buttonOuter, elButton) {
                let pressedTime;
                pxsim.pointerEvents.down.forEach(evid => buttonOuter.addEventListener(evid, ev => {
                    stateButton.pressed = true;
                    this.updateButtonPairs();
                    this.board.bus.queue(stateButton.id, 1 /* DAL.MICROBIT_BUTTON_EVT_DOWN */);
                    pressedTime = pxsim.runtime.runningTime();
                }));
                buttonOuter.addEventListener(pxsim.pointerEvents.leave, ev => {
                    stateButton.pressed = false;
                    this.updateButtonPairs();
                    pxsim.svg.fill(elButton, this.props.theme.buttonUp);
                });
                buttonOuter.addEventListener(pxsim.pointerEvents.up, ev => {
                    stateButton.pressed = false;
                    this.updateButtonPairs();
                    this.board.bus.queue(stateButton.id, 2 /* DAL.MICROBIT_BUTTON_EVT_UP */);
                    const currentTime = pxsim.runtime.runningTime();
                    if (currentTime - pressedTime > 1000 /* DAL.DEVICE_BUTTON_LONG_CLICK_TIME */)
                        this.board.bus.queue(stateButton.id, 4 /* DAL.MICROBIT_BUTTON_EVT_LONG_CLICK */);
                    else
                        this.board.bus.queue(stateButton.id, 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */);
                    pressedTime = undefined;
                });
                pxsim.accessibility.enableKeyboardInteraction(buttonOuter, () => {
                    stateButton.pressed = true;
                    this.updateButtonPairs();
                    this.board.bus.queue(stateButton.id, 1 /* DAL.MICROBIT_BUTTON_EVT_DOWN */);
                }, () => {
                    stateButton.pressed = false;
                    this.updateButtonPairs();
                    this.board.bus.queue(stateButton.id, 2 /* DAL.MICROBIT_BUTTON_EVT_UP */);
                    this.board.bus.queue(stateButton.id, 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */);
                });
            }
            attachAPlusBEvents() {
                const bpState = this.board.buttonPairState;
                let pressedTime;
                // A+B
                pxsim.pointerEvents.down.forEach(evid => this.buttonsOuter[2].addEventListener(evid, ev => {
                    bpState.aBtn.pressed = true;
                    bpState.bBtn.pressed = true;
                    bpState.abBtn.pressed = true;
                    this.updateButtonPairs();
                    this.board.bus.queue(bpState.abBtn.id, 1 /* DAL.MICROBIT_BUTTON_EVT_DOWN */);
                    pressedTime = pxsim.runtime.runningTime();
                }));
                this.buttonsOuter[2].addEventListener(pxsim.pointerEvents.leave, ev => {
                    bpState.aBtn.pressed = false;
                    bpState.bBtn.pressed = false;
                    bpState.abBtn.pressed = false;
                    this.updateButtonPairs();
                });
                this.buttonsOuter[2].addEventListener(pxsim.pointerEvents.up, ev => {
                    bpState.aBtn.pressed = false;
                    bpState.bBtn.pressed = false;
                    bpState.abBtn.pressed = false;
                    this.updateButtonPairs();
                    this.board.bus.queue(bpState.abBtn.id, 2 /* DAL.MICROBIT_BUTTON_EVT_UP */);
                    const currentTime = pxsim.runtime.runningTime();
                    if (currentTime - pressedTime > 1000 /* DAL.DEVICE_BUTTON_LONG_CLICK_TIME */)
                        this.board.bus.queue(bpState.abBtn.id, 4 /* DAL.MICROBIT_BUTTON_EVT_LONG_CLICK */);
                    else
                        this.board.bus.queue(bpState.abBtn.id, 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */);
                    pressedTime = undefined;
                });
                pxsim.accessibility.enableKeyboardInteraction(this.buttonsOuter[2], () => {
                    bpState.aBtn.pressed = true;
                    bpState.bBtn.pressed = true;
                    bpState.abBtn.pressed = true;
                    this.updateButtonPairs();
                    this.board.bus.queue(bpState.abBtn.id, 1 /* DAL.MICROBIT_BUTTON_EVT_DOWN */);
                }, () => {
                    bpState.aBtn.pressed = false;
                    bpState.bBtn.pressed = false;
                    bpState.abBtn.pressed = false;
                    this.updateButtonPairs();
                    this.board.bus.queue(bpState.abBtn.id, 2 /* DAL.MICROBIT_BUTTON_EVT_UP */);
                    this.board.bus.queue(bpState.abBtn.id, 3 /* DAL.MICROBIT_BUTTON_EVT_CLICK */);
                });
            }
            attachKeyboardEvents() {
                pxsim.accessibility.postKeyboardEvent();
            }
            bindEvent(element, eventName, handler, ...rest) {
                element.addEventListener(eventName, handler, ...rest);
                this.bindings.push({ element, event: eventName, handler });
            }
        }
        visuals.MicrobitBoardSvg = MicrobitBoardSvg;
        const isHandledKey = (key) => {
            return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End"].includes(key);
        };
        const getSliderStepValue = (min, max) => {
            const range = max - min;
            // Assumes slider values are always integers.
            return Math.max(1, Math.floor(range / 10));
        };
        const commonKeyHandler = (e, currentValue, min, max) => {
            const key = e.key;
            if (isHandledKey(key)) {
                e.preventDefault();
            }
            switch (key) {
                case "ArrowDown":
                case "ArrowLeft": {
                    return Math.max(min, currentValue - 1);
                }
                case "ArrowUp":
                case "ArrowRight": {
                    return Math.min(max, currentValue + 1);
                }
                case "Home": {
                    return min;
                }
                case "End": {
                    return max;
                }
                case "PageDown": {
                    const step = getSliderStepValue(min, max);
                    const value = currentValue - step;
                    return Math.max(min, value);
                }
                case "PageUp": {
                    const step = getSliderStepValue(min, max);
                    const value = currentValue + step;
                    return Math.min(max, value);
                }
            }
            return undefined;
        };
        const pinKeyHandler = (e, currentValue, min, max, pinMode) => {
            const key = e.key;
            if (isHandledKey(key)) {
                if (!(pinMode & pxsim.PinFlags.Input)) {
                    e.preventDefault();
                    pxsim.accessibility.setLiveContent(pxsim.localization.lf("This pin is read-only"));
                    return undefined;
                }
                if (pinMode & pxsim.PinFlags.Touch) {
                    // The pin is in touch mode and has button markup, not a slider.
                    e.preventDefault();
                    return undefined;
                }
            }
            // The pin value for a digital pin may be higher than 1 depending on how its value was set.
            const currentValueClamped = Math.min(max, currentValue);
            return commonKeyHandler(e, currentValueClamped, min, max);
        };
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM461.64 256l45.64-45.64c6.3-6.3 6.3-16.52 0-22.82l-22.82-22.82c-6.3-6.3-16.52-6.3-22.82 0L416 210.36l-45.64-45.64c-6.3-6.3-16.52-6.3-22.82 0l-22.82 22.82c-6.3 6.3-6.3 16.52 0 22.82L370.36 256l-45.63 45.63c-6.3 6.3-6.3 16.52 0 22.82l22.82 22.82c6.3 6.3 16.52 6.3 22.82 0L416 301.64l45.64 45.64c6.3 6.3 16.52 6.3 22.82 0l22.82-22.82c6.3-6.3 6.3-16.52 0-22.82L461.64 256z"/></svg>`;
    // We only need to unmute from within the iframe once
    let hasUnmuted = false;
    function createMuteButton() {
        const el = document.createElement("div");
        el.setAttribute("id", "safari-mute-button-outer");
        el.innerHTML = `
            <button class="safari-mute-button" tabindex="1">
                ${icon}
            </button>
        `;
        const button = el.firstElementChild;
        button.setAttribute("title", pxsim.localization.lf("Unmute simulator"));
        button.addEventListener("click", () => {
            pxsim.AudioContextManager.mute(false);
            pxsim.setParentMuteState("unmuted");
            button.remove();
            hasUnmuted = true;
        });
        return el;
    }
    pxsim.createMuteButton = createMuteButton;
    function shouldShowMute() {
        return isSafari() && !hasUnmuted;
    }
    pxsim.shouldShowMute = shouldShowMute;
    // Everything below is taken from browserutils in pxt
    function hasNavigator() {
        return typeof navigator !== "undefined";
    }
    pxsim.hasNavigator = hasNavigator;
    //Microsoft Edge lies about its user agent and claims to be Chrome, but Microsoft Edge/Version
    //is always at the end
    function isEdge() {
        return hasNavigator() && /Edge/i.test(navigator.userAgent);
    }
    pxsim.isEdge = isEdge;
    //IE11 also lies about its user agent, but has Trident appear somewhere in
    //the user agent. Detecting the different between IE11 and Microsoft Edge isn't
    //super-important because the UI is similar enough
    function isIE() {
        return hasNavigator() && /Trident/i.test(navigator.userAgent);
    }
    pxsim.isIE = isIE;
    //Microsoft Edge and IE11 lie about being Chrome. Chromium-based Edge ("Edgeium") will be detected as Chrome, that is ok. If you're looking for Edgeium, use `isChromiumEdge()`.
    function isChrome() {
        return !isEdge() && !isIE() && !!navigator && (/Chrome/i.test(navigator.userAgent) || /Chromium/i.test(navigator.userAgent));
    }
    pxsim.isChrome = isChrome;
    //Chrome and Microsoft Edge lie about being Safari
    function isSafari() {
        //Could also check isMac but I don't want to risk excluding iOS
        //Checking for iPhone, iPod or iPad as well as Safari in order to detect home screen browsers on iOS
        return !isChrome() && !isEdge() && !!navigator && /(Macintosh|Safari|iPod|iPhone|iPad)/i.test(navigator.userAgent);
    }
    pxsim.isSafari = isSafari;
    //Safari and WebKit lie about being Firefox
    function isFirefox() {
        return !isSafari() && !!navigator && (/Firefox/i.test(navigator.userAgent) || /Seamonkey/i.test(navigator.userAgent));
    }
    pxsim.isFirefox = isFirefox;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        /**
         * Distinct high-contrast wire color for every micro:bit signal pin (P0..P20).
         * Power (+3v3/VCC) and Ground (GND) wires are intentionally never drawn.
         */
        visuals.PIN_WIRE_COLORS = {
            P0: "#ef4444",
            P1: "#f97316",
            P2: "#eab308",
            P3: "#84cc16",
            P4: "#22c55e",
            P5: "#10b981",
            P6: "#14b8a6",
            P7: "#06b6d4",
            P8: "#0ea5e9",
            P9: "#3b82f6",
            P10: "#6366f1",
            P11: "#8b5cf6",
            P12: "#a855f7",
            P13: "#d946ef",
            P14: "#ec4899",
            P15: "#f43f5e",
            P16: "#fb923c",
            P17: "#a3e635",
            P18: "#2dd4bf",
            P19: "#38bdf8",
            P20: "#c084fc" // Lavender (I2C SDA)
        };
        function getPinWireColor(pinName) {
            return visuals.PIN_WIRE_COLORS[pinName] || "#38bdf8";
        }
        visuals.getPinWireColor = getPinWireColor;
        /**
         * Port enum decoder for ModuleWorld_Digital.mwDigitalNum (1..10)
         * in libs/Module-World/Module-World.ts
         */
        function decodeDigitalPort(val) {
            const map = {
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
        visuals.decodeDigitalPort = decodeDigitalPort;
        /**
         * Port enum decoder for ModuleWorld_Analog.mwAnalogNum (1..3)
         */
        function decodeAnalogPort(val) {
            const map = {
                1: ["P0", "P1"],
                2: ["P2", "P3"],
                3: ["P3", "P4"]
            };
            return map[val] || ["P0", "P1"];
        }
        visuals.decodeAnalogPort = decodeAnalogPort;
        /**
         * Port enum decoder for ModuleWorld_PWM.mwServoNum (1..4)
         * 1: P1, 2: P4, 3: P2, 4: P10
         */
        function decodeServoPort(val) {
            const map = {
                1: ["P1"],
                2: ["P4"],
                3: ["P2"],
                4: ["P10"]
            };
            return map[val] || ["P1"];
        }
        visuals.decodeServoPort = decodeServoPort;
        /**
         * Convert a micro:bit pin name ("P0".."P20") to its DAL pin ID (MICROBIT_ID_IO_P0 = 7 .. P20 = 27)
         */
        function pinNameToId(pinName) {
            const idx = parseInt(pinName.replace(/^P/, ""), 10);
            if (!isNaN(idx) && idx >= 0 && idx <= 20) {
                return 100 /* DAL.MICROBIT_ID_IO_P0 */ + idx;
            }
            return -1;
        }
        visuals.pinNameToId = pinNameToId;
        function getPinInstance(pinName) {
            const b = pxsim.board();
            if (!b || !b.edgeConnectorState)
                return undefined;
            const id = pinNameToId(pinName);
            return b.edgeConnectorState.getPin(id) || undefined;
        }
        visuals.getPinInstance = getPinInstance;
        /** Pins shared with micro:bit V2 LED matrix columns/rows and photosensitive sensor */
        visuals.LED_SHARED_PINS = ["P3", "P4", "P6", "P7", "P9", "P10"];
        /**
         * Universal base class for 1x1, 2x1, and 1x2 WoM simulator modules.
         * Handles sprite rendering, wire pad generation with per-pin colors, status badges,
         * interactive overlays, and pin state synchronization.
         */
        class WomModuleBase {
            constructor(opts) {
                this.spriteEl = null;
                this.moduleType = opts.moduleType;
                this.displayName = opts.displayName;
                this.pins = opts.pins;
                this.pinKey = WomModuleManager.canonicalPinKey(opts.pins);
                this.colSpan = opts.colSpan || 1;
                this.rowSpan = opts.rowSpan || 1;
                this.padEdge = opts.padEdge || "top";
                this.wiredPins = opts.wiredPins || (opts.pins.length ? [opts.pins[0]] : []);
                this.width = WomModuleManager.getModuleWidth(this.colSpan);
                this.height = WomModuleManager.getModuleHeight(this.rowSpan);
                this.element = pxsim.svg.elt("g", {
                    class: `wom-module wom-${this.moduleType}`
                });
                const showBg = opts.showCardBackground !== undefined
                    ? opts.showCardBackground
                    : (this.colSpan > 1 || !opts.sprite);
                if (showBg) {
                    pxsim.svg.child(this.element, "rect", {
                        x: 0,
                        y: 0,
                        width: this.width,
                        height: this.height,
                        rx: 8,
                        fill: "#1e293b",
                        stroke: "#475569",
                        "stroke-width": 1.5
                    });
                }
                if (opts.sprite) {
                    const b = opts.spriteBounds || this.getDefaultSpriteBounds();
                    this.spriteEl = pxsim.svg.child(this.element, "image", {
                        x: b.x,
                        y: b.y,
                        width: b.width,
                        height: b.height
                    });
                    const resolved = WomModuleManager.resolveAssetUrl(opts.sprite);
                    this.spriteEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", resolved);
                    this.spriteEl.setAttribute("href", resolved);
                }
                this.overlayGroup = pxsim.svg.child(this.element, "g", {
                    class: "wom-overlay-layer"
                });
                this.statusText = pxsim.svg.child(this.element, "text", {
                    x: this.width / 2,
                    y: this.height - 3,
                    "text-anchor": "middle",
                    fill: "#64748b",
                    "font-family": "monospace, sans-serif",
                    "font-size": "10px",
                    "font-weight": "bold",
                    style: "pointer-events: none; user-select: none;"
                });
                this.setBadgeText();
            }
            getDefaultSpriteBounds() {
                if (this.colSpan === 2 && this.rowSpan === 1) {
                    return { x: 8, y: 6, width: 156, height: 108 };
                }
                if (this.colSpan === 1 && this.rowSpan === 2) {
                    return { x: 6, y: 6, width: 136, height: 286 };
                }
                return { x: 6, y: 4, width: 136, height: 136 };
            }
            /** Update the module's bottom label badge */
            setBadgeText(status, color = "#64748b") {
                if (!this.statusText)
                    return;
                const portStr = this.pins.join("");
                this.statusText.textContent = status
                    ? `${this.displayName} (${portStr}): ${status}`
                    : `${this.displayName} (${portStr})`;
                this.statusText.setAttribute("fill", color);
            }
            /** Add a semi-transparent colored circle indicator over the module */
            addCircleOverlay(cx = this.width / 2, cy = (this.height - 12) / 2, r = 46, fill = "#ef4444", fillOpacity = 0.4) {
                return pxsim.svg.child(this.overlayGroup, "circle", {
                    cx,
                    cy,
                    r,
                    fill,
                    "fill-opacity": fillOpacity,
                    stroke: fill,
                    "stroke-opacity": Math.min(1, fillOpacity + 0.25),
                    "stroke-width": 1.5,
                    opacity: 0,
                    style: "pointer-events: none; transition: opacity 0.12s ease;"
                });
            }
            /** Add a rotatable/draggable SVG vector part overlay (e.g., rotor or joystick stick) */
            addSvgOverlay(href, x, y, width, height) {
                const group = pxsim.svg.child(this.overlayGroup, "g", {
                    transform: `translate(${x}, ${y})`
                });
                const image = pxsim.svg.child(group, "image", {
                    x: 0,
                    y: 0,
                    width,
                    height
                });
                const resolved = WomModuleManager.resolveAssetUrl(href);
                image.setAttributeNS("http://www.w3.org/1999/xlink", "href", resolved);
                image.setAttribute("href", resolved);
                return { group, image };
            }
            /** Resolve an asset URL to relative "sprites/..." format */
            resolveAssetUrl(url) {
                return WomModuleManager.resolveAssetUrl(url);
            }
            /** Set href on an SVG image element with normalized URL resolution */
            setImageHref(image, url) {
                const resolved = WomModuleManager.resolveAssetUrl(url);
                image.setAttributeNS("http://www.w3.org/1999/xlink", "href", resolved);
                image.setAttribute("href", resolved);
            }
            /** Update the main background sprite href with normalized URL resolution */
            setSpriteHref(url) {
                if (!this.spriteEl)
                    return;
                this.setImageHref(this.spriteEl, url);
            }
            /**
             * Add an HTML control container inside a <foreignObject> that automatically
             * stops pointer/mouse/touch event propagation so sliders/inputs work smoothly.
             */
            addControlForeignObject(x, y, width, height) {
                const fo = pxsim.svg.child(this.overlayGroup, "foreignObject", {
                    x,
                    y,
                    width,
                    height
                });
                const container = document.createElement("div");
                container.style.cssText =
                    "color:#f8fafc;font-family:sans-serif;font-size:11px;display:flex;flex-direction:column;gap:4px;padding:2px;user-select:none;";
                const stopProp = (e) => e.stopPropagation();
                ["pointerdown", "mousedown", "touchstart"].forEach(ev => container.addEventListener(ev, stopProp));
                fo.appendChild(container);
                return { fo, container };
            }
            /** Bind mouse/pointer hover events on the module */
            bindHover(onChange) {
                this.element.style.cursor = "pointer";
                let isHovering = false;
                const handle = (next) => {
                    if (isHovering === next)
                        return;
                    isHovering = next;
                    onChange(next);
                    if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                        pxsim.runtime.queueDisplayUpdate();
                    }
                };
                this.element.addEventListener("mouseenter", () => handle(true));
                this.element.addEventListener("mouseleave", () => handle(false));
                this.element.addEventListener("pointerenter", () => handle(true));
                this.element.addEventListener("pointerleave", () => handle(false));
            }
            /** Bind press-and-hold events on the module or a specific sub-element */
            bindPress(target = this.element, onChange) {
                target.style.cursor = "pointer";
                let isPressed = false;
                const handle = (next) => {
                    if (isPressed === next)
                        return;
                    isPressed = next;
                    onChange(next);
                    if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                        pxsim.runtime.queueDisplayUpdate();
                    }
                };
                target.addEventListener("pointerdown", (e) => {
                    e.stopPropagation();
                    handle(true);
                });
                target.addEventListener("pointerup", () => handle(false));
                target.addEventListener("pointerleave", () => handle(false));
                target.addEventListener("mousedown", (e) => {
                    e.stopPropagation();
                    handle(true);
                });
                target.addEventListener("mouseup", () => handle(false));
                target.addEventListener("mouseleave", () => handle(false));
            }
            /** Set simulated digital input value (0 or 1) on a pin, immune to pins.setPull overwrites */
            setDigitalInput(pinName, value) {
                const pin = getPinInstance(pinName);
                if (!pin)
                    return;
                pin.womDigitalValue = value;
                pin.value = value > 0 ? 1023 : 0;
            }
            /** Set simulated analog input value (0..1023) on a pin */
            setAnalogInput(pinName, value) {
                const pin = getPinInstance(pinName);
                if (!pin)
                    return;
                const clamped = Math.max(0, Math.min(1023, Math.round(value)));
                pin.womAnalogValue = clamped;
                pin.value = clamped;
            }
            /** Set simulated pulseIn duration in microseconds on a pin (e.g. distanceCm * 58 for Ultrasonic) */
            setPulseMicros(pinName, micros) {
                const pin = getPinInstance(pinName);
                if (!pin)
                    return;
                pin.womPulseMicros = Math.max(0, Math.round(micros));
            }
            /**
             * Automatically generates signal wire pads (excluding GND and 3v3) along `padEdge`,
             * each colored with its pin's unique color from PIN_WIRE_COLORS.
             * Subclasses may override this if custom pad coordinates are desired.
             */
            getWirePads() {
                const count = this.wiredPins.length;
                return this.wiredPins.map((pinName, idx) => {
                    const offset = (idx - (count - 1) / 2) * 12;
                    let x = this.width / 2 + offset;
                    let y = 26;
                    if (this.padEdge === "bottom") {
                        x = this.width / 2 + offset;
                        y = this.height - 24;
                    }
                    else if (this.padEdge === "left") {
                        x = 24;
                        y = this.height / 2 + offset;
                    }
                    else if (this.padEdge === "right") {
                        x = this.width - 24;
                        y = this.height / 2 + offset;
                    }
                    return {
                        label: pinName,
                        targetPin: pinName,
                        x,
                        y,
                        color: getPinWireColor(pinName)
                    };
                });
            }
            updateState() {
                // Optional hook for subclasses
            }
        }
        visuals.WomModuleBase = WomModuleBase;
        class WomModuleManager {
            constructor(boardInstance) {
                this.boardInstance = boardInstance;
                this.rootGroup = null;
                this.wiresGroup = null;
                this.modulesGroup = null;
                this.warningGroup = null;
                /** Canonical pinKey (e.g. "P0,P1") -> spawned module */
                this.modulesByPinKey = {};
                /** Individual pin name (e.g. "P0") -> spawned module owning that pin */
                this.pinOwner = {};
                /** 2D occupancy grid: occupied[row][col] */
                this.occupied = [];
                this.warningsShown = {};
                this.lastPostedHeight = 430;
                WomModuleManager.installHooks();
            }
            static registerFactory(moduleType, factory, dmesgHandler) {
                WomModuleManager.factories[moduleType] = factory;
                if (dmesgHandler) {
                    WomModuleManager.dmesgHandlers[moduleType] = dmesgHandler;
                }
            }
            static registerI2cHandler(addresses, handler) {
                for (const addr of addresses) {
                    WomModuleManager.i2cHandlers[addr] = handler;
                }
            }
            /**
             * Resolves a sprite or vector overlay URL so it works in both local dev server
             * (where simulator runs at /sim/simulator.html) and static production deployments
             * like GitHub Pages (where simulator runs at /<route>/simulator.html).
             *
             * Absolute paths like "/sim/sprites/..." incorrectly resolve against the domain root
             * on GitHub Pages (e.g. https://user.github.io/sim/sprites/...) causing 404s.
             * Relative paths ("sprites/...") resolve seamlessly relative to simulator.html
             * in all environments.
             */
            static resolveAssetUrl(url) {
                if (!url)
                    return url;
                if (url.startsWith("/sim/")) {
                    return url.substring(5);
                }
                if (url.startsWith("/")) {
                    return url.substring(1);
                }
                return url;
            }
            static isLedShowing(ledState) {
                if (!ledState)
                    return false;
                if (ledState.disabled === true)
                    return false;
                if (ledState._hasActiveDisplay)
                    return true;
                if (ledState.image && ledState.image.data) {
                    for (let i = 0; i < ledState.image.data.length; i++) {
                        if (ledState.image.data[i] > 0)
                            return true;
                    }
                }
                if (ledState.animationQ &&
                    ledState.animationQ.queue &&
                    ledState.animationQ.queue.length > 0) {
                    return true;
                }
                return false;
            }
            static isPhotosensitiveActive(lightState) {
                return !!(lightState && lightState.usesLightLevel);
            }
            static isLedConflictActive(b) {
                const boardInst = b || pxsim.board();
                if (!boardInst || !boardInst.ledMatrixState)
                    return false;
                const ledState = boardInst.ledMatrixState;
                const lightState = boardInst.lightSensorState;
                const isPhotosensitive = WomModuleManager.isPhotosensitiveActive(lightState);
                const isShowing = WomModuleManager.isLedShowing(ledState);
                // If led.enable(false) was explicitly called:
                if (ledState.disabled === true) {
                    return isPhotosensitive || isShowing;
                }
                // If led.enable(true) was explicitly called:
                if (ledState.disabled === false) {
                    return true;
                }
                // Default state (before any call to led.enable):
                if (WomModuleManager.defaultLedState) {
                    return true;
                }
                else {
                    return isPhotosensitive || isShowing;
                }
            }
            /**
             * Initialize WoM support on a DalBoard instance.
             * Called from DalBoard.initAsync(this) in sim/dalboard.ts.
             */
            static initBoard(b) {
                WomModuleManager.installHooks();
                let mgr = b.womManager;
                if (!mgr) {
                    mgr = new WomModuleManager(b);
                    b.womManager = mgr;
                    b.updateSubscribers.push(() => mgr.updateAllModules());
                }
                return mgr;
            }
            static get(b) {
                const target = b || pxsim.board();
                if (!target)
                    return undefined;
                if (!target.womManager) {
                    return WomModuleManager.initBoard(target);
                }
                return target.womManager;
            }
            /**
             * Install runtime hooks on pxsim.control and pxsim.pins without modifying sim/state/* files.
             * Uses `_womHook` markers on the wrapped functions so hooks survive script load order.
             */
            static installHooks() {
                if (typeof pxsim === "undefined")
                    return;
                // 1. Hook pxsim.control.dmesg
                if (pxsim.control && (!pxsim.control.dmesg || !pxsim.control.dmesg._womHook)) {
                    const origDmesg = pxsim.control.dmesg;
                    const hookedDmesg = function (msg) {
                        if (msg && msg.indexOf("wom:") === 0) {
                            WomModuleManager.handleDmesg(msg);
                            return;
                        }
                        if (origDmesg) {
                            origDmesg.call(pxsim.control, msg);
                        }
                    };
                    hookedDmesg._womHook = true;
                    pxsim.control.dmesg = hookedDmesg;
                }
                // 2. Hook pxsim.pins.digitalReadPin (checks pin.womDigitalValue first)
                if (pxsim.pins && (!pxsim.pins.digitalReadPin || !pxsim.pins.digitalReadPin._womHook)) {
                    const origDigitalRead = pxsim.pins.digitalReadPin;
                    const hookedDigitalRead = function (pinId) {
                        const pin = pxsim.getPin(pinId);
                        if (pin && pin.womDigitalValue !== undefined) {
                            pin.mode = pxsim.PinFlags.Digital | pxsim.PinFlags.Input;
                            return pin.womDigitalValue;
                        }
                        return origDigitalRead ? origDigitalRead.call(pxsim.pins, pinId) : 0;
                    };
                    hookedDigitalRead._womHook = true;
                    pxsim.pins.digitalReadPin = hookedDigitalRead;
                }
                // 3. Hook pxsim.pins.analogReadPin (checks pin.womAnalogValue first)
                if (pxsim.pins && (!pxsim.pins.analogReadPin || !pxsim.pins.analogReadPin._womHook)) {
                    const origAnalogRead = pxsim.pins.analogReadPin;
                    const hookedAnalogRead = function (pinId) {
                        const pin = pxsim.getPin(pinId);
                        if (pin && pin.womAnalogValue !== undefined) {
                            pin.mode = pxsim.PinFlags.Analog | pxsim.PinFlags.Input;
                            return pin.womAnalogValue;
                        }
                        return origAnalogRead ? origAnalogRead.call(pxsim.pins, pinId) : 0;
                    };
                    hookedAnalogRead._womHook = true;
                    pxsim.pins.analogReadPin = hookedAnalogRead;
                }
                // 4. Hook pxsim.pins.pulseIn (checks pin.womPulseMicros first)
                if (pxsim.pins && (!pxsim.pins.pulseIn || !pxsim.pins.pulseIn._womHook)) {
                    const origPulseIn = pxsim.pins.pulseIn;
                    const hookedPulseIn = function (name, value, maxDuration) {
                        const pin = pxsim.getPin(name);
                        if (pin && pin.womPulseMicros !== undefined) {
                            return pin.womPulseMicros;
                        }
                        return origPulseIn ? origPulseIn.call(pxsim.pins, name, value, maxDuration) : 0;
                    };
                    hookedPulseIn._womHook = true;
                    pxsim.pins.pulseIn = hookedPulseIn;
                }
                // 5. Hook pxsim.pins.servoSetPulse (stores pin.womServoPulse and queues display update)
                if (pxsim.pins && (!pxsim.pins.servoSetPulse || !pxsim.pins.servoSetPulse._womHook)) {
                    const origServoSetPulse = pxsim.pins.servoSetPulse;
                    const hookedServoSetPulse = function (pinId, micros) {
                        const pin = pxsim.getPin(pinId);
                        if (pin) {
                            pin.womServoPulse = micros;
                            if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                                pxsim.runtime.queueDisplayUpdate();
                            }
                        }
                        if (origServoSetPulse) {
                            origServoSetPulse.call(pxsim.pins, pinId, micros);
                        }
                    };
                    hookedServoSetPulse._womHook = true;
                    pxsim.pins.servoSetPulse = hookedServoSetPulse;
                }
                // 6. Hook pxsim.pins.i2cWriteBuffer & i2cReadBuffer
                if (pxsim.pins && (!pxsim.pins.i2cWriteBuffer || !pxsim.pins.i2cWriteBuffer._womHook)) {
                    const origI2cWrite = pxsim.pins.i2cWriteBuffer;
                    const hookedI2cWrite = function (address, buf, repeat) {
                        const handler = WomModuleManager.i2cHandlers[address];
                        const b = pxsim.board();
                        if (handler && handler.onWrite && b) {
                            handler.onWrite(b, address, buf, repeat);
                        }
                        if (origI2cWrite) {
                            origI2cWrite.call(pxsim.pins, address, buf, repeat);
                        }
                    };
                    hookedI2cWrite._womHook = true;
                    pxsim.pins.i2cWriteBuffer = hookedI2cWrite;
                }
                if (pxsim.pins && (!pxsim.pins.i2cReadBuffer || !pxsim.pins.i2cReadBuffer._womHook)) {
                    const origI2cRead = pxsim.pins.i2cReadBuffer;
                    const hookedI2cRead = function (address, size, repeat) {
                        const handler = WomModuleManager.i2cHandlers[address];
                        const b = pxsim.board();
                        if (handler && handler.onRead && b) {
                            const res = handler.onRead(b, address, size, repeat);
                            if (res)
                                return res;
                        }
                        return origI2cRead ? origI2cRead.call(pxsim.pins, address, size, repeat) : pxsim.pins.createBuffer(size);
                    };
                    hookedI2cRead._womHook = true;
                    pxsim.pins.i2cReadBuffer = hookedI2cRead;
                }
            }
            static handleDmesg(msg) {
                const b = pxsim.board();
                if (!b)
                    return;
                const mgr = WomModuleManager.get(b);
                if (!mgr)
                    return;
                // Format: "wom:<moduleType>:<arg0>:<arg1>..."
                const parts = msg.split(":");
                const moduleType = parts[1];
                const args = parts.slice(2);
                const customHandler = WomModuleManager.dmesgHandlers[moduleType];
                if (customHandler) {
                    customHandler(b, args);
                    return;
                }
                // Default handler: decode first argument as mwDigitalNum port (1..10) or comma-separated pin list
                const firstArg = args[0] || "1";
                let pins;
                if (firstArg.indexOf("P") === 0) {
                    pins = firstArg.split(",");
                }
                else {
                    const portVal = parseInt(firstArg, 10) || 1;
                    pins = decodeDigitalPort(portVal);
                }
                mgr.ensureModule(moduleType, pins, args);
            }
            /** Compute pixel width for a given colSpan (1 -> 148, 2 -> 312) */
            static getModuleWidth(colSpan) {
                return colSpan * WomModuleManager.CELL_W + (colSpan - 1) * WomModuleManager.GAP_X;
            }
            /** Compute pixel height for a given rowSpan (1 -> 148, 2 -> 312) */
            static getModuleHeight(rowSpan) {
                return rowSpan * WomModuleManager.CELL_H + (rowSpan - 1) * WomModuleManager.GAP_Y;
            }
            static canonicalPinKey(pins) {
                return pins.slice().sort().join(",");
            }
            getBoardView() {
                const b = this.boardInstance || pxsim.board();
                if (!b)
                    return undefined;
                if (b.boardView)
                    return b.boardView;
                if (b.viewHost && b.viewHost.boardView) {
                    return b.viewHost.boardView;
                }
                return undefined;
            }
            ensureContainers() {
                const b = this.boardInstance || pxsim.board();
                if (!b || !b.view)
                    return false;
                const svgEl = b.view;
                if (!this.rootGroup || !svgEl.contains(this.rootGroup)) {
                    this.rootGroup = pxsim.svg.child(svgEl, "g", { class: "wom-board-area" });
                    this.wiresGroup = pxsim.svg.child(this.rootGroup, "g", { class: "wom-wires-layer" });
                    this.modulesGroup = pxsim.svg.child(this.rootGroup, "g", { class: "wom-modules-layer" });
                    this.warningGroup = pxsim.svg.child(this.rootGroup, "g", { class: "wom-warning-layer" });
                }
                return true;
            }
            /**
             * Retrieve an already-spawned module by its pins, or spawn a new one.
             * Enforces strict pin-set ownership and shows a warning on cross-module pin conflicts.
             */
            ensureModule(moduleType, pins, args = []) {
                if (!this.ensureContainers())
                    return null;
                const pinKey = WomModuleManager.canonicalPinKey(pins);
                // 1. Exact pin-set match: reuse if same moduleType, otherwise warn conflict
                const existingExact = this.modulesByPinKey[pinKey];
                if (existingExact) {
                    if (existingExact.moduleType === moduleType) {
                        if (existingExact.updateState)
                            existingExact.updateState();
                        return existingExact;
                    }
                    else {
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
                // 2b. Check LED matrix shared pin conflict (orange warning banner)
                const ledConflictPins = pins.filter(p => visuals.LED_SHARED_PINS.indexOf(p) !== -1);
                if (ledConflictPins.length > 0 && WomModuleManager.isLedConflictActive(this.boardInstance)) {
                    this.showLedPinConflictWarning(moduleType, pins, ledConflictPins);
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
                this.modulesGroup.appendChild(mod.element);
                // 5. Draw Bezier signal wires from module pads to micro:bit edge connector
                this.drawWiresForModule(mod, modX, modY);
                // 6. Expand SVG viewBox and simulator aspect ratio to fit all rows
                this.updateViewBox();
                if (mod.updateState)
                    mod.updateState();
                return mod;
            }
            getModuleByPins(pins) {
                const key = WomModuleManager.canonicalPinKey(pins);
                return this.modulesByPinKey[key];
            }
            updateAllModules() {
                for (const key of Object.keys(this.modulesByPinKey)) {
                    const mod = this.modulesByPinKey[key];
                    if (mod && mod.updateState) {
                        mod.updateState();
                    }
                }
            }
            allocateGridSlot(colSpan, rowSpan) {
                for (let r = 0; r < 50; r++) {
                    if (!this.occupied[r])
                        this.occupied[r] = [false, false, false];
                    if (rowSpan === 2 && !this.occupied[r + 1])
                        this.occupied[r + 1] = [false, false, false];
                    for (let c = 0; c <= WomModuleManager.GRID_COLS - colSpan; c++) {
                        let fits = true;
                        for (let dr = 0; dr < rowSpan; dr++) {
                            for (let dc = 0; dc < colSpan; dc++) {
                                if (this.occupied[r + dr][c + dc]) {
                                    fits = false;
                                    break;
                                }
                            }
                            if (!fits)
                                break;
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
            drawWiresForModule(mod, modX, modY) {
                const boardView = this.getBoardView();
                if (!boardView || !this.wiresGroup)
                    return;
                const pads = mod.getWirePads();
                pads.forEach((pad, idx) => {
                    const pinName = pad.targetPin;
                    // Strictly skip any GND or 3v3/VCC wires; only draw signal wires (P0..P20)
                    if (!pinName ||
                        pinName.indexOf("P") !== 0 ||
                        pinName === "+3v3" ||
                        pinName === "3v3" ||
                        pinName === "3V" ||
                        pinName === "VCC" ||
                        pinName === "GND") {
                        return;
                    }
                    const boardCoord = boardView.getCoord(pinName);
                    if (!boardCoord)
                        return;
                    const wireColor = pad.color || getPinWireColor(pinName);
                    const x1 = modX + pad.x;
                    const y1 = modY + pad.y;
                    const x2 = boardCoord[0];
                    const y2 = boardCoord[1];
                    const dy = Math.max(40, Math.abs(y1 - y2) * 0.45);
                    const jitter = (idx - 0.5) * 6;
                    const d = `M ${x1} ${y1} C ${x1 + jitter} ${y1 - dy}, ${x2 + jitter} ${y2 + dy}, ${x2} ${y2}`;
                    // Subtle shadow under wire for readability
                    pxsim.svg.child(this.wiresGroup, "path", {
                        d,
                        fill: "none",
                        stroke: "rgba(0,0,0,0.35)",
                        "stroke-width": 4.5,
                        "stroke-linecap": "round"
                    });
                    pxsim.svg.child(this.wiresGroup, "path", {
                        d,
                        fill: "none",
                        stroke: wireColor,
                        "stroke-width": 3,
                        "stroke-linecap": "round",
                        opacity: 0.92
                    });
                });
            }
            showPinConflictWarning(attemptedType, attemptedPins, existingOwner, conflictPin) {
                const pinDesc = conflictPin ? conflictPin : attemptedPins.join(", ");
                const msg = `Pin conflict on ${pinDesc}: already used by ${existingOwner.displayName} (${existingOwner.pins.join(",")}), cannot attach ${attemptedType}.`;
                if (this.warningsShown[msg])
                    return;
                this.warningsShown[msg] = true;
                console.warn(`[WoM Sim] ${msg}`);
                if (!this.warningGroup)
                    return;
                const bannerIndex = Object.keys(this.warningsShown).length - 1;
                const yOffset = 412 + bannerIndex * 26;
                const g = pxsim.svg.child(this.warningGroup, "g", {
                    transform: `translate(10, ${yOffset})`
                });
                pxsim.svg.child(g, "rect", {
                    x: 0,
                    y: 0,
                    width: 480,
                    height: 22,
                    rx: 4,
                    fill: "#b91c1c",
                    stroke: "#fca5a5",
                    "stroke-width": 1
                });
                const t = pxsim.svg.child(g, "text", {
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
            showLedPinConflictWarning(attemptedType, attemptedPins, conflictPins, displayName) {
                const pinDesc = conflictPins.join(", ");
                const targetName = displayName || attemptedType;
                const msg = `Pin conflict on ${pinDesc}: pin(s) shared with micro:bit LED screen; call led.enable(false) to use for ${targetName}.`;
                if (this.warningsShown[msg])
                    return;
                this.warningsShown[msg] = true;
                console.warn(`[WoM Sim] ${msg}`);
                if (!this.warningGroup)
                    return;
                const bannerIndex = Object.keys(this.warningsShown).length - 1;
                const yOffset = 412 + bannerIndex * 26;
                const g = pxsim.svg.child(this.warningGroup, "g", {
                    transform: `translate(10, ${yOffset})`
                });
                pxsim.svg.child(g, "rect", {
                    x: 0,
                    y: 0,
                    width: 480,
                    height: 22,
                    rx: 4,
                    fill: "#c2410c",
                    stroke: "#fdba74",
                    "stroke-width": 1
                });
                const t = pxsim.svg.child(g, "text", {
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
            updateViewBox() {
                const b = this.boardInstance || pxsim.board();
                if (!b || !b.view)
                    return;
                const numRows = Math.max(1, this.occupied.length);
                const numWarnings = Object.keys(this.warningsShown).length;
                const warningExtra = Math.max(0, (numWarnings - 1) * 26);
                const requiredHeight = Math.max(430 + warningExtra, WomModuleManager.START_Y +
                    numRows * (WomModuleManager.CELL_H + WomModuleManager.GAP_Y) +
                    16);
                b.view.setAttribute("viewBox", `0 0 500 ${requiredHeight}`);
                if (requiredHeight !== this.lastPostedHeight && typeof pxsim.Runtime !== "undefined" && pxsim.Runtime.postMessage) {
                    this.lastPostedHeight = requiredHeight;
                    pxsim.Runtime.postMessage({
                        type: "aspectratio",
                        value: 500 / requiredHeight,
                        frameid: pxsim.Embed ? pxsim.Embed.frameid : undefined
                    });
                }
            }
        }
        WomModuleManager.factories = {};
        WomModuleManager.dmesgHandlers = {};
        WomModuleManager.i2cHandlers = {};
        /**
         * Default LED state before led.enable is called.
         * micro:bit V2 hardware enables the LED screen by default (true).
         * If false, LED conflict is only flagged when photosensitive or LED showing modes are active.
         */
        WomModuleManager.defaultLedState = true;
        WomModuleManager.GRID_COLS = 3;
        WomModuleManager.CELL_W = 148;
        WomModuleManager.CELL_H = 148;
        WomModuleManager.GAP_X = 16;
        WomModuleManager.GAP_Y = 20;
        WomModuleManager.START_X = 12;
        WomModuleManager.START_Y = 450;
        visuals.WomModuleManager = WomModuleManager;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomButtonModule extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "button",
                    displayName: "Button",
                    pins,
                    colSpan: 1,
                    rowSpan: 1,
                    sprite: "sprites/wom_button.png",
                    padEdge: "right",
                    wiredPins: [pins[0]]
                });
                /** True when button is currently pressed down (active-low -> 0) */
                this.isPressed = false;
                // Center of the square 136x136 sprite at (6, 4) is (74, 72).
                // Button cap has a radius of ~26px (scaled from native 235x235).
                // Semi-transparent shadow overlay signifies button being pressed.
                this.shadowCircle = this.addCircleOverlay(74, 72, 28, "#000000", 0.45);
                this.setBadgeText("Released", "#64748b");
                this.bindPress(this.element, (pressed) => {
                    this.isPressed = pressed;
                    this.shadowCircle.setAttribute("opacity", pressed ? "1" : "0");
                    this.setBadgeText(pressed ? "Pressed" : "Released", pressed ? "#ef4444" : "#64748b");
                    this.syncPinState();
                });
                this.syncPinState();
            }
            syncPinState() {
                // In Module-World.ts: enButton.Press = 0, enButton.Realse = 1
                this.setDigitalInput(this.pins[0], this.isPressed ? 0 : 1);
            }
            updateState() {
                this.syncPinState();
            }
        }
        visuals.WomButtonModule = WomButtonModule;
        visuals.WomModuleManager.registerFactory("button", (pins) => new WomButtonModule(pins));
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomColorModule extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "color",
                    displayName: "Color",
                    pins: ["P19", "P20"],
                    colSpan: 1,
                    rowSpan: 1,
                    sprite: "sprites/wom_color_recognition.png",
                    padEdge: "left",
                    wiredPins: ["P19", "P20"]
                });
                /** Sensor center in module coordinates (between the two white arrows on wom_color_recognition.png) */
                this.sensorCenterX = 74;
                this.sensorCenterY = 72;
                /** Outer radius where color recognition begins transitioning from dark grey (100,100,100) */
                this.detectRadius = 42;
                /** Inner dead-center radius where target color is 100% pure with zero noise */
                this.deadCenterRadius = 3.5;
                /** Radius of each draggable colored circle */
                this.ballRadius = 8.5;
                /** Y coordinate of the bottom floor where circles rest under gravity */
                this.floorY = 123;
                /** Downward gravity acceleration in px/s^2 */
                this.gravity = 460;
                this.balls = [];
                this.activeRegister = WomColorModule.REG_R;
                /** Latest sampled RGB values (0..255) including distance-scaled noise */
                this.currentR = 105;
                this.currentG = 105;
                this.currentB = 105;
                this.lastNoiseTime = 0;
                this.animFrameId = null;
                this.lastFrameTime = 0;
                // 1. Always-lit white illumination LED glow at (74, 54)
                const whiteLed = this.addCircleOverlay(74, 54, 8, "#ffffff", 0.55);
                whiteLed.setAttribute("opacity", "1");
                // 2. Dashed sensing boundary ring around sensor center (74, 72)
                this.rangeRing = pxsim.svg.child(this.overlayGroup, "circle", {
                    cx: this.sensorCenterX,
                    cy: this.sensorCenterY,
                    r: this.detectRadius,
                    fill: "none",
                    stroke: "#94a3b8",
                    "stroke-width": 1,
                    "stroke-dasharray": "3,3",
                    opacity: 0.55,
                    style: "pointer-events: none;"
                });
                // 3. Central sensor aperture swatch showing the currently recognized RGB color
                this.centerSwatch = pxsim.svg.child(this.overlayGroup, "circle", {
                    cx: this.sensorCenterX,
                    cy: this.sensorCenterY,
                    r: 9,
                    fill: "rgb(100, 100, 100)",
                    "fill-opacity": 0.85,
                    stroke: "#e2e8f0",
                    "stroke-width": 1.2,
                    style: "pointer-events: none;"
                });
                // 4. Create the 4 draggable colored circles (Red, Green, Blue, Yellow)
                const defs = [
                    { id: "red", label: "R", targetRgb: [255, 0, 0], fill: "#ef4444", stroke: "#fecaca", homeX: 33, startY: 92 },
                    { id: "green", label: "G", targetRgb: [0, 255, 0], fill: "#22c55e", stroke: "#bbf7d0", homeX: 60, startY: 84 },
                    { id: "blue", label: "B", targetRgb: [0, 0, 255], fill: "#3b82f6", stroke: "#bfdbfe", homeX: 88, startY: 88 },
                    { id: "yellow", label: "Y", targetRgb: [255, 255, 0], fill: "#eab308", stroke: "#fef08a", homeX: 115, startY: 96 }
                ];
                for (const d of defs) {
                    const group = pxsim.svg.child(this.overlayGroup, "g", {
                        transform: `translate(${d.homeX}, ${d.startY})`,
                        style: "cursor: grab;"
                    });
                    // Invisible hit target for easier grabbing
                    pxsim.svg.child(group, "circle", {
                        cx: 0,
                        cy: 0,
                        r: this.ballRadius + 4,
                        fill: "transparent"
                    });
                    const circle = pxsim.svg.child(group, "circle", {
                        cx: 0,
                        cy: 0,
                        r: this.ballRadius,
                        fill: d.fill,
                        stroke: d.stroke,
                        "stroke-width": 1.6,
                        style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.65));"
                    });
                    this.balls.push({
                        id: d.id,
                        label: d.label,
                        targetRgb: d.targetRgb,
                        fill: d.fill,
                        stroke: d.stroke,
                        homeX: d.homeX,
                        x: d.homeX,
                        y: d.startY,
                        vy: 0,
                        isDragging: false,
                        group,
                        circle
                    });
                }
                this.setupDragging();
                this.sampleRgb(true);
                this.ensurePhysicsLoop();
            }
            setupDragging() {
                let activeBall = null;
                for (const ball of this.balls) {
                    ball.group.addEventListener("pointerdown", (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        activeBall = ball;
                        ball.isDragging = true;
                        ball.vy = 0;
                        ball.group.style.cursor = "grabbing";
                        ball.circle.setAttribute("stroke-width", "2.4");
                        // Bring dragged circle to front of overlayGroup
                        this.overlayGroup.appendChild(ball.group);
                        try {
                            ball.group.setPointerCapture(e.pointerId);
                        }
                        catch (_) { }
                    });
                }
                const onPointerMove = (e) => {
                    if (!activeBall)
                        return;
                    e.stopPropagation();
                    e.preventDefault();
                    const rect = this.element.getBoundingClientRect();
                    if (!rect.width || !rect.height)
                        return;
                    let localX = ((e.clientX - rect.left) / rect.width) * this.width;
                    let localY = ((e.clientY - rect.top) / rect.height) * this.height;
                    localX = Math.max(16, Math.min(this.width - 16, localX));
                    localY = Math.max(14, Math.min(this.floorY, localY));
                    // Gentle snap when very close to dead center so user can easily test dead-center (0 noise)
                    const distToCenter = Math.hypot(localX - this.sensorCenterX, localY - this.sensorCenterY);
                    if (distToCenter <= this.deadCenterRadius) {
                        localX = this.sensorCenterX;
                        localY = this.sensorCenterY;
                    }
                    activeBall.x = localX;
                    activeBall.y = localY;
                    activeBall.vy = 0;
                    activeBall.group.setAttribute("transform", `translate(${localX.toFixed(1)}, ${localY.toFixed(1)})`);
                    this.sampleRgb(true);
                    this.ensurePhysicsLoop();
                    if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                        pxsim.runtime.queueDisplayUpdate();
                    }
                };
                const onPointerUp = (e) => {
                    if (!activeBall)
                        return;
                    const released = activeBall;
                    activeBall = null;
                    released.isDragging = false;
                    released.group.style.cursor = "grab";
                    released.circle.setAttribute("stroke-width", "1.6");
                    if (e) {
                        try {
                            released.group.releasePointerCapture(e.pointerId);
                        }
                        catch (_) { }
                    }
                    this.ensurePhysicsLoop();
                };
                for (const ball of this.balls) {
                    ball.group.addEventListener("pointermove", onPointerMove);
                    ball.group.addEventListener("pointerup", onPointerUp);
                    ball.group.addEventListener("pointercancel", onPointerUp);
                }
                this.element.addEventListener("pointermove", onPointerMove);
                this.element.addEventListener("pointerup", onPointerUp);
                this.element.addEventListener("pointercancel", onPointerUp);
                this.element.addEventListener("pointerleave", onPointerUp);
            }
            /**
             * Run gravity simulation so any un-dragged circle above floorY falls to the bottom.
             */
            ensurePhysicsLoop() {
                if (this.animFrameId !== null)
                    return;
                this.lastFrameTime = performance.now();
                const step = (now) => {
                    if (!this.element.isConnected) {
                        this.animFrameId = null;
                        return;
                    }
                    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameTime) / 1000));
                    this.lastFrameTime = now;
                    let anyMoving = false;
                    for (const ball of this.balls) {
                        if (ball.isDragging) {
                            anyMoving = true;
                            continue;
                        }
                        const needsFall = ball.y < this.floorY - 0.1 || Math.abs(ball.vy) > 1;
                        const needsHomeDrift = ball.y >= this.floorY - 2 && Math.abs(ball.x - ball.homeX) > 0.4;
                        if (needsFall || needsHomeDrift) {
                            anyMoving = true;
                            ball.vy += this.gravity * dt;
                            ball.y += ball.vy * dt;
                            if (ball.y >= this.floorY) {
                                ball.y = this.floorY;
                                if (Math.abs(ball.vy) > 45) {
                                    ball.vy = -ball.vy * 0.22;
                                }
                                else {
                                    ball.vy = 0;
                                }
                            }
                            // Gently return X toward its resting slot along the bottom so circles don't stack
                            if (ball.y >= this.floorY - 4) {
                                ball.x += (ball.homeX - ball.x) * Math.min(1, dt * 10);
                                if (Math.abs(ball.x - ball.homeX) <= 0.4) {
                                    ball.x = ball.homeX;
                                }
                            }
                            ball.group.setAttribute("transform", `translate(${ball.x.toFixed(1)}, ${ball.y.toFixed(1)})`);
                        }
                    }
                    this.sampleRgb(false);
                    if (anyMoving) {
                        this.animFrameId = requestAnimationFrame(step);
                    }
                    else {
                        this.animFrameId = null;
                    }
                };
                this.animFrameId = requestAnimationFrame(step);
            }
            /**
             * Compute the closest circle and proximity factor t in [0, 1].
             * - t = 0 when all circles are outside detectRadius (e.g., fallen to bottom).
             * - 0 < t < 1 inside detectRadius.
             * - t = 1 inside deadCenterRadius (dead center: pure target color, zero noise).
             */
            computeProximityModel() {
                let closest = null;
                let minDist = Infinity;
                for (const ball of this.balls) {
                    const d = Math.hypot(ball.x - this.sensorCenterX, ball.y - this.sensorCenterY);
                    if (d < minDist) {
                        minDist = d;
                        closest = ball;
                    }
                }
                // Dark grey baseline when all circles are far from center
                const darkGrey = 100;
                if (!closest || minDist >= this.detectRadius) {
                    return {
                        closest: null,
                        t: 0,
                        baseR: darkGrey,
                        baseG: darkGrey,
                        baseB: darkGrey
                    };
                }
                if (minDist <= this.deadCenterRadius) {
                    return {
                        closest,
                        t: 1,
                        baseR: closest.targetRgb[0],
                        baseG: closest.targetRgb[1],
                        baseB: closest.targetRgb[2]
                    };
                }
                const t = (this.detectRadius - minDist) / (this.detectRadius - this.deadCenterRadius);
                const [tr, tg, tb] = closest.targetRgb;
                return {
                    closest,
                    t,
                    baseR: darkGrey + t * (tr - darkGrey),
                    baseG: darkGrey + t * (tg - darkGrey),
                    baseB: darkGrey + t * (tb - darkGrey)
                };
            }
            /**
             * Generate uniform noise in [0, 10] (max 10, median 5), scaled by (1 - t)
             * so that dead center (t = 1) has zero noise.
             */
            generateChannelNoise(t) {
                if (t >= 1)
                    return 0;
                return (1 - t) * (Math.random() * 10);
            }
            /**
             * Sample RGB values from the proximity + noise model and update visual overlays.
             */
            sampleRgb(forceNewNoise = false) {
                const now = performance.now();
                const model = this.computeProximityModel();
                if (forceNewNoise || now - this.lastNoiseTime >= 80 || model.t >= 1) {
                    this.lastNoiseTime = now;
                    const nR = this.generateChannelNoise(model.t);
                    const nG = this.generateChannelNoise(model.t);
                    const nB = this.generateChannelNoise(model.t);
                    this.currentR = Math.max(0, Math.min(255, Math.round(model.baseR + nR)));
                    this.currentG = Math.max(0, Math.min(255, Math.round(model.baseG + nG)));
                    this.currentB = Math.max(0, Math.min(255, Math.round(model.baseB + nB)));
                }
                const rgbCss = `rgb(${this.currentR}, ${this.currentG}, ${this.currentB})`;
                this.centerSwatch.setAttribute("fill", rgbCss);
                if (model.t >= 1 && model.closest) {
                    this.rangeRing.setAttribute("stroke", model.closest.fill);
                    this.rangeRing.setAttribute("opacity", "0.95");
                }
                else if (model.t > 0 && model.closest) {
                    this.rangeRing.setAttribute("stroke", model.closest.fill);
                    this.rangeRing.setAttribute("opacity", "0.75");
                }
                else {
                    this.rangeRing.setAttribute("stroke", "#94a3b8");
                    this.rangeRing.setAttribute("opacity", "0.55");
                }
                const badgeColor = model.closest && model.t > 0.15 ? model.closest.fill : "#94a3b8";
                this.setBadgeText(`${this.currentR},${this.currentG},${this.currentB}`, badgeColor);
                return [this.currentR, this.currentG, this.currentB];
            }
            onI2cWrite(buf) {
                if (!buf || !buf.data || buf.data.length === 0)
                    return;
                const reg = buf.data[0] & 0xff;
                if (reg === WomColorModule.REG_R ||
                    reg === WomColorModule.REG_G ||
                    reg === WomColorModule.REG_B) {
                    this.activeRegister = reg;
                    if (reg === WomColorModule.REG_R) {
                        this.sampleRgb(true);
                    }
                }
            }
            onI2cRead(size) {
                const out = pxsim.pins.createBuffer(size);
                if (size >= 2) {
                    let channelVal = this.currentR;
                    if (this.activeRegister === WomColorModule.REG_G) {
                        channelVal = this.currentG;
                    }
                    else if (this.activeRegister === WomColorModule.REG_B) {
                        channelVal = this.currentB;
                    }
                    // Encode exact 0..255 channel value in low byte and simulator marker 0x80 in high byte
                    out.data[0] = channelVal & 0xff;
                    out.data[1] = 0x80;
                }
                return out;
            }
            updateState() {
                this.sampleRgb(false);
            }
        }
        WomColorModule.I2C_ADDR = 0x53;
        WomColorModule.REG_R = 0x10;
        WomColorModule.REG_G = 0x0d;
        WomColorModule.REG_B = 0x13;
        visuals.WomColorModule = WomColorModule;
        visuals.WomModuleManager.registerFactory("color", (pins) => new WomColorModule(pins), (b) => {
            const mgr = visuals.WomModuleManager.get(b);
            if (!mgr)
                return;
            mgr.ensureModule("color", ["P19", "P20"]);
        });
        visuals.WomModuleManager.registerI2cHandler([0x53], {
            onWrite(b, _address, buf) {
                const mgr = visuals.WomModuleManager.get(b);
                if (!mgr)
                    return;
                const mod = mgr.ensureModule("color", ["P19", "P20"]);
                if (mod) {
                    mod.onI2cWrite(buf);
                }
            },
            onRead(b, _address, size) {
                const mgr = visuals.WomModuleManager.get(b);
                if (!mgr)
                    return undefined;
                const mod = mgr.ensureModule("color", ["P19", "P20"]);
                if (mod) {
                    return mod.onI2cRead(size);
                }
                return undefined;
            }
        });
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomDht11Module extends visuals.WomModuleBase {
            constructor(pins, args = []) {
                super({
                    moduleType: "dht11",
                    displayName: "DHT11",
                    pins,
                    colSpan: 1,
                    rowSpan: 1,
                    sprite: "sprites/wom_dht11.png",
                    padEdge: "left",
                    wiredPins: [pins[0]]
                });
                this.tempC = 25;
                this.humidity = 60;
                /** Absolute moisture content in g/m^3 (held constant when temperature changes) */
                this.absoluteWaterDensity = 0;
                /** 0 = Temp(C), 1 = Temp(F), 2 = Humidity */
                this.lastQueryType = 0;
                // Left Thermometer geometry constants
                this.tempCenterX = 24;
                this.tempTextX = 27; // Text nudged slightly closer to center
                this.tempZeroY = 96; // Y position corresponding to 0°C
                this.tempFiftyY = 22; // Y position corresponding to 50°C
                this.tempTravel = 74; // 96 - 22
                // Right Humidity slider geometry constants
                this.humCenterX = 124;
                this.humTextX = 121; // Text nudged slightly closer to center
                this.humZeroY = 106; // Y position corresponding to 0%
                this.humMaxY = 40; // Y position corresponding to 100%
                this.humTravel = 66; // 106 - 40
                if (args.length > 1) {
                    const parsedType = parseInt(args[1], 10);
                    if (!isNaN(parsedType)) {
                        this.lastQueryType = parsedType;
                    }
                }
                // =========================================================================
                // 1. LEFT: Old-School Thermometer Scale with Dedicated Dark Backing
                // =========================================================================
                const tempGroup = pxsim.svg.child(this.overlayGroup, "g", {
                    class: "wom-dht-temp-group"
                });
                // Dedicated dark rounded backing behind the temperature slider UI & text
                pxsim.svg.child(tempGroup, "rect", {
                    x: 10,
                    y: 12,
                    width: 32,
                    height: 126,
                    rx: 7,
                    fill: "#0f172a",
                    "fill-opacity": 0.85,
                    stroke: "#334155",
                    "stroke-width": 1.2
                });
                // Outer glass bulb shell at the bottom
                pxsim.svg.child(tempGroup, "circle", {
                    cx: this.tempCenterX,
                    cy: 104,
                    r: 9,
                    fill: "#1e293b",
                    stroke: "#475569",
                    "stroke-width": 1.5,
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.6));"
                });
                // Outer glass stem tube
                pxsim.svg.child(tempGroup, "rect", {
                    x: this.tempCenterX - 4,
                    y: 18,
                    width: 8,
                    height: 80,
                    rx: 4,
                    fill: "#1e293b",
                    stroke: "#475569",
                    "stroke-width": 1.5,
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.6));"
                });
                // Liquid fill inside tube (expands/contracts vertically)
                this.tempCol = pxsim.svg.child(tempGroup, "rect", {
                    x: this.tempCenterX - 2.5,
                    y: this.tempZeroY,
                    width: 5,
                    height: 8,
                    rx: 2.5
                });
                // Liquid fill inside bulb reservoir
                this.tempBulb = pxsim.svg.child(tempGroup, "circle", {
                    cx: this.tempCenterX,
                    cy: 104,
                    r: 7
                });
                // Subtle glass shine / reflection highlight
                pxsim.svg.child(tempGroup, "line", {
                    x1: this.tempCenterX + 1.5,
                    y1: 22,
                    x2: this.tempCenterX + 1.5,
                    y2: 94,
                    stroke: "#ffffff",
                    "stroke-width": 0.8,
                    opacity: 0.3,
                    style: "pointer-events: none;"
                });
                // Crisp level indicator line at the liquid meniscus
                this.tempLevelIndicator = pxsim.svg.child(tempGroup, "line", {
                    x1: this.tempCenterX - 3.5,
                    y1: this.tempZeroY,
                    x2: this.tempCenterX + 3.5,
                    y2: this.tempZeroY,
                    stroke: "#ffffff",
                    "stroke-width": 1,
                    opacity: 0.85,
                    style: "pointer-events: none;"
                });
                // "Temp." label written below thermometer (nudged slightly closer to center)
                this.tempLabel = pxsim.svg.child(tempGroup, "text", {
                    x: this.tempTextX,
                    y: 122,
                    "text-anchor": "middle",
                    "font-size": "10px",
                    "font-weight": "bold",
                    "font-family": "sans-serif",
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.9)); pointer-events: none; user-select: none;"
                });
                this.tempLabel.textContent = "Temp.";
                // Numeric temperature readout below label (nudged slightly closer to center)
                this.tempValueText = pxsim.svg.child(tempGroup, "text", {
                    x: this.tempTextX,
                    y: 132,
                    "text-anchor": "middle",
                    "font-size": "8.5px",
                    "font-weight": "bold",
                    "font-family": "monospace, sans-serif",
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.9)); pointer-events: none; user-select: none;"
                });
                // Interactive hitzone covering the thermometer
                const tempHitZone = pxsim.svg.child(tempGroup, "rect", {
                    x: 10,
                    y: 14,
                    width: 32,
                    height: 102,
                    fill: "transparent",
                    style: "cursor: ns-resize;"
                });
                // =========================================================================
                // 2. RIGHT: Vertical Humidity Slider with Dedicated Dark Backing
                // =========================================================================
                const humGroup = pxsim.svg.child(this.overlayGroup, "g", {
                    class: "wom-dht-hum-group"
                });
                // Dedicated dark rounded backing behind the humidity slider UI & text
                pxsim.svg.child(humGroup, "rect", {
                    x: 106,
                    y: 8,
                    width: 32,
                    height: 130,
                    rx: 7,
                    fill: "#0f172a",
                    "fill-opacity": 0.85,
                    stroke: "#334155",
                    "stroke-width": 1.2
                });
                // Weather SVG icon on top of the humidity slider
                this.humIcon = pxsim.svg.child(humGroup, "image", {
                    x: this.humCenterX - 11,
                    y: 12,
                    width: 22,
                    height: 22,
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.8)); pointer-events: none;"
                });
                // Slider background track
                pxsim.svg.child(humGroup, "rect", {
                    x: this.humCenterX - 3,
                    y: this.humMaxY,
                    width: 6,
                    height: this.humTravel,
                    rx: 3,
                    fill: "#1e293b",
                    stroke: "#475569",
                    "stroke-width": 1,
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.6));"
                });
                // Active filled track (from bottom up to thumb position)
                this.humTrackFill = pxsim.svg.child(humGroup, "rect", {
                    x: this.humCenterX - 3,
                    y: this.humZeroY,
                    width: 6,
                    height: 0,
                    rx: 3,
                    fill: "#64748b"
                });
                // Draggable slider knob / thumb
                this.humThumb = pxsim.svg.child(humGroup, "circle", {
                    cx: this.humCenterX,
                    cy: this.humZeroY,
                    r: 6.5,
                    fill: "#64748b",
                    stroke: "#ffffff",
                    "stroke-width": 1.5,
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.8)); pointer-events: none;"
                });
                this.humThumbGrip = pxsim.svg.child(humGroup, "line", {
                    x1: this.humCenterX - 2.5,
                    y1: this.humZeroY,
                    x2: this.humCenterX + 2.5,
                    y2: this.humZeroY,
                    stroke: "rgba(0,0,0,0.5)",
                    "stroke-width": 1,
                    "stroke-linecap": "round",
                    style: "pointer-events: none;"
                });
                // "Hum." label below the slider (nudged slightly closer to center)
                this.humLabel = pxsim.svg.child(humGroup, "text", {
                    x: this.humTextX,
                    y: 122,
                    "text-anchor": "middle",
                    "font-size": "10px",
                    "font-weight": "bold",
                    "font-family": "sans-serif",
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.9)); pointer-events: none; user-select: none;"
                });
                this.humLabel.textContent = "Hum.";
                // Numeric humidity readout below label (nudged slightly closer to center)
                this.humValueText = pxsim.svg.child(humGroup, "text", {
                    x: this.humTextX,
                    y: 132,
                    "text-anchor": "middle",
                    "font-size": "8.5px",
                    "font-weight": "bold",
                    "font-family": "monospace, sans-serif",
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.9)); pointer-events: none; user-select: none;"
                });
                // Interactive hitzone covering the humidity slider
                const humHitZone = pxsim.svg.child(humGroup, "rect", {
                    x: 106,
                    y: 36,
                    width: 32,
                    height: 76,
                    fill: "transparent",
                    style: "cursor: ns-resize;"
                });
                // Setup pointer dragging for both sliders
                this.setupInteractions(tempHitZone, humHitZone);
                // Initialize thermodynamic baseline (constant water vapor per m^3)
                this.updateAbsoluteWaterDensity();
                // Initial visual update
                this.updateVisuals();
                this.syncPinState();
            }
            /** Saturation water vapor density (g/m^3) at temperature T in °C (Magnus formula) */
            satWaterDensity(tC) {
                const es = 6.1078 * Math.exp((17.27 * tC) / (tC + 237.3)); // saturation vapor pressure in hPa
                return (216.7 * es) / (tC + 273.15); // absolute saturation density in g/m^3
            }
            updateAbsoluteWaterDensity() {
                const satDensity = this.satWaterDensity(this.tempC);
                // Limit amount of water per m^3 to at most 100% saturation at current temperature
                const clampedHum = Math.max(0, Math.min(100, this.humidity));
                this.absoluteWaterDensity = (clampedHum / 100) * satDensity;
            }
            updateHumidityFromPhysics() {
                const satDensity = this.satWaterDensity(this.tempC);
                if (satDensity > 0) {
                    // If reducing temperature causes water to exceed 100% humidity, discard excess water (condensation)
                    if (this.absoluteWaterDensity > satDensity) {
                        this.absoluteWaterDensity = satDensity;
                        this.humidity = 100;
                    }
                    else {
                        const calculatedHum = (this.absoluteWaterDensity / satDensity) * 100;
                        this.humidity = Math.max(0, Math.min(100, Math.round(calculatedHum)));
                    }
                }
            }
            setupInteractions(tempZone, humZone) {
                let activeDrag = null;
                const updateFromPointer = (e) => {
                    if (!activeDrag)
                        return;
                    e.stopPropagation();
                    e.preventDefault();
                    const rect = this.element.getBoundingClientRect();
                    if (!rect.width || !rect.height)
                        return;
                    const localY = ((e.clientY - rect.top) / rect.height) * this.height;
                    if (activeDrag === "temp") {
                        // Temperature 0°C at tempZeroY (96), 50°C at tempFiftyY (22)
                        const frac = Math.max(0, Math.min(1, (this.tempZeroY - localY) / this.tempTravel));
                        this.tempC = Math.round(frac * 50);
                        // Fixed water vapor per cubic meter: relative humidity shifts with temperature
                        this.updateHumidityFromPhysics();
                    }
                    else {
                        // Humidity 0% at humZeroY (106), 100% at humMaxY (40)
                        const frac = Math.max(0, Math.min(1, (this.humZeroY - localY) / this.humTravel));
                        this.humidity = Math.round(frac * 100);
                        // Explicit change to moisture content: update absolute moisture baseline
                        this.updateAbsoluteWaterDensity();
                    }
                    this.updateVisuals();
                    this.syncPinState();
                };
                const startDrag = (target, hitZone, e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    activeDrag = target;
                    try {
                        hitZone.setPointerCapture(e.pointerId);
                    }
                    catch (_) { }
                    updateFromPointer(e);
                };
                const stopDrag = (hitZone, e) => {
                    if (!activeDrag)
                        return;
                    if (hitZone && e) {
                        try {
                            hitZone.releasePointerCapture(e.pointerId);
                        }
                        catch (_) { }
                    }
                    activeDrag = null;
                };
                tempZone.addEventListener("pointerdown", (e) => startDrag("temp", tempZone, e));
                humZone.addEventListener("pointerdown", (e) => startDrag("hum", humZone, e));
                tempZone.addEventListener("pointermove", updateFromPointer);
                humZone.addEventListener("pointermove", updateFromPointer);
                this.element.addEventListener("pointermove", updateFromPointer);
                tempZone.addEventListener("pointerup", (e) => stopDrag(tempZone, e));
                humZone.addEventListener("pointerup", (e) => stopDrag(humZone, e));
                this.element.addEventListener("pointerup", () => stopDrag());
                this.element.addEventListener("pointercancel", () => stopDrag());
                this.element.addEventListener("pointerleave", () => stopDrag());
            }
            /** Calculate color of the thermometer fluid: cool blue at 0°C transitioning to deep red at 50°C */
            getTempColor(tempC) {
                const t = Math.max(0, Math.min(1, tempC / 50));
                const stops = [
                    { t: 0.0, r: 56, g: 189, b: 248 },
                    { t: 0.3, r: 45, g: 212, b: 191 },
                    { t: 0.55, r: 245, g: 158, b: 11 },
                    { t: 0.8, r: 249, g: 115, b: 22 },
                    { t: 1.0, r: 239, g: 68, b: 68 } // Hot red
                ];
                for (let i = 0; i < stops.length - 1; i++) {
                    if (t >= stops[i].t && t <= stops[i + 1].t) {
                        const factor = (t - stops[i].t) / (stops[i + 1].t - stops[i].t);
                        const r = Math.round(stops[i].r + factor * (stops[i + 1].r - stops[i].r));
                        const g = Math.round(stops[i].g + factor * (stops[i + 1].g - stops[i].g));
                        const b = Math.round(stops[i].b + factor * (stops[i + 1].b - stops[i].b));
                        return `rgb(${r},${g},${b})`;
                    }
                }
                return "rgb(239,68,68)";
            }
            /** Calculate color of humidity slider: cool grey at 0% transitioning to vibrant blue at 100% */
            getHumColor(humidity) {
                const t = Math.max(0, Math.min(1, humidity / 100));
                // 0%: cool slate grey (100, 116, 139) #64748b -> 100%: vibrant sky blue (14, 165, 233) #0ea5e9
                const startR = 100, startG = 116, startB = 139;
                const endR = 14, endG = 165, endB = 233;
                const r = Math.round(startR + t * (endR - startR));
                const g = Math.round(startG + t * (endG - startG));
                const b = Math.round(startB + t * (endB - startB));
                return `rgb(${r},${g},${b})`;
            }
            /** Calculate color for humidity text below slider: turns to white as humidity reduces to stay readable on dark tint */
            getHumTextColor(humidity) {
                const t = Math.max(0, Math.min(1, humidity / 100));
                // 0%: crisp white (255, 255, 255) -> 100%: vibrant sky blue (14, 165, 233)
                const startR = 255, startG = 255, startB = 255;
                const endR = 14, endG = 165, endB = 233;
                const r = Math.round(startR + t * (endR - startR));
                const g = Math.round(startG + t * (endG - startG));
                const b = Math.round(startB + t * (endB - startB));
                return `rgb(${r},${g},${b})`;
            }
            /**
             * Return weather SVG icon href based on humidity:
             * 100% -> Rain
             * 75% to 99% -> Clouds
             * 30% to 74% -> Cloud and sun
             * 10% to 29% -> Sun
             * 0% to 9% -> Sahara dune
             */
            getWeatherIconHref(hum) {
                if (hum >= 100)
                    return "sprites/dht_rain.svg";
                if (hum >= 75)
                    return "sprites/dht_clouds.svg";
                if (hum >= 30)
                    return "sprites/dht_sun_cloud.svg";
                if (hum >= 10)
                    return "sprites/dht_sun.svg";
                return "sprites/dht_dune.svg";
            }
            updateVisuals() {
                // 1. Update Thermometer
                const fluidColor = this.getTempColor(this.tempC);
                const tempFrac = Math.max(0, Math.min(1, this.tempC / 50));
                const yTop = this.tempZeroY - tempFrac * this.tempTravel;
                const colHeight = (this.tempZeroY - yTop) + 8; // Extends seamlessly into bulb
                this.tempCol.setAttribute("y", yTop.toFixed(1));
                this.tempCol.setAttribute("height", colHeight.toFixed(1));
                this.tempCol.setAttribute("fill", fluidColor);
                this.tempBulb.setAttribute("fill", fluidColor);
                this.tempLevelIndicator.setAttribute("y1", yTop.toFixed(1));
                this.tempLevelIndicator.setAttribute("y2", yTop.toFixed(1));
                // "Temp." and readout use the same dynamic changing color
                this.tempLabel.setAttribute("fill", fluidColor);
                this.tempValueText.setAttribute("fill", fluidColor);
                this.tempValueText.textContent = `${this.tempC}°C`;
                // 2. Update Humidity Slider & Weather Icon
                const humColor = this.getHumColor(this.humidity);
                const humTextColor = this.getHumTextColor(this.humidity);
                const humFrac = Math.max(0, Math.min(1, this.humidity / 100));
                const thumbY = this.humZeroY - humFrac * this.humTravel;
                const trackHeight = this.humZeroY - thumbY;
                this.humTrackFill.setAttribute("y", thumbY.toFixed(1));
                this.humTrackFill.setAttribute("height", trackHeight.toFixed(1));
                this.humTrackFill.setAttribute("fill", humColor);
                this.humThumb.setAttribute("cy", thumbY.toFixed(1));
                this.humThumb.setAttribute("fill", humColor);
                this.humThumbGrip.setAttribute("y1", thumbY.toFixed(1));
                this.humThumbGrip.setAttribute("y2", thumbY.toFixed(1));
                // Text turns to white as humidity reduces to remain clearly readable
                this.humLabel.setAttribute("fill", humTextColor);
                this.humValueText.setAttribute("fill", humTextColor);
                this.humValueText.textContent = `${this.humidity}%`;
                const iconHref = this.getWeatherIconHref(this.humidity);
                this.humIcon.setAttributeNS("http://www.w3.org/1999/xlink", "href", iconHref);
                this.humIcon.setAttribute("href", iconHref);
                // 3. Update bottom badge & runtime
                this.setBadgeText(`${this.tempC}°C ${this.humidity}%`, "#38bdf8");
                if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                    pxsim.runtime.queueDisplayUpdate();
                }
            }
            setQueryType(dht11type) {
                if (!isNaN(dht11type)) {
                    this.lastQueryType = dht11type;
                }
                this.syncPinState();
            }
            syncPinState() {
                let requestedValue = this.tempC;
                if (this.lastQueryType === 1) {
                    // Fahrenheit conversion
                    requestedValue = Math.round((this.tempC * 9) / 5 + 32);
                }
                else if (this.lastQueryType === 2) {
                    requestedValue = this.humidity;
                }
                this.setDigitalInput(this.pins[0], -(requestedValue + 1000));
            }
            updateState() {
                this.syncPinState();
            }
        }
        visuals.WomDht11Module = WomDht11Module;
        visuals.WomModuleManager.registerFactory("dht11", (pins, args) => new WomDht11Module(pins, args), (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const dht11type = parseInt(args[1] || "0", 10) || 0;
            const pins = visuals.decodeDigitalPort(portVal);
            const mgr = visuals.WomModuleManager.get(b);
            if (!mgr)
                return;
            const mod = mgr.ensureModule("dht11", pins, args);
            if (mod) {
                mod.setQueryType(dht11type);
            }
        });
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomIrModule extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "ir",
                    displayName: "IR",
                    pins,
                    colSpan: 1,
                    rowSpan: 1,
                    sprite: "sprites/wom_ir.png",
                    padEdge: "top",
                    wiredPins: [pins[0]]
                });
                /** True when mouse hovers over the module (obstacle detected -> active-low 0) */
                this.obstacleDetected = false;
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
            syncPinState() {
                // In Module-World.ts: enObstacle.Obstacle = 0, enObstacle.NoObstacle = 1
                this.setDigitalInput(this.pins[0], this.obstacleDetected ? 0 : 1);
            }
            updateState() {
                this.syncPinState();
            }
        }
        visuals.WomIrModule = WomIrModule;
        visuals.WomModuleManager.registerFactory("ir", (pins) => new WomIrModule(pins));
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomJoystickModule extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "joystick",
                    displayName: "Joystick",
                    pins,
                    colSpan: 1,
                    rowSpan: 1,
                    sprite: "sprites/wom_joystick_base.png",
                    padEdge: "right",
                    wiredPins: pins // Wire both X (pins[0]) and Y (pins[1])
                });
                this.xVal = 512;
                this.yVal = 512;
                this.dx = 0;
                this.dy = 0;
                this.springAnimId = null;
                this.centerX = 74;
                this.centerY = 72;
                this.maxRadius = 12;
                this.stickSize = 60;
                const { group } = this.addSvgOverlay("sprites/joystick_stick.svg", this.centerX - this.stickSize / 2, this.centerY - this.stickSize / 2, this.stickSize, this.stickSize);
                this.stickGroup = group;
                this.stickGroup.style.cursor = "grab";
                let dragging = false;
                const stopSpring = () => {
                    if (this.springAnimId !== null) {
                        cancelAnimationFrame(this.springAnimId);
                        this.springAnimId = null;
                    }
                };
                const applyOffset = (dx, dy) => {
                    this.dx = dx;
                    this.dy = dy;
                    const x = this.centerX - this.stickSize / 2 + dx;
                    const y = this.centerY - this.stickSize / 2 + dy;
                    this.stickGroup.setAttribute("transform", `translate(${x}, ${y})`);
                    // Map (-maxRadius..+maxRadius) to (0..1023)
                    // In Module-World.ts: x < 100 = Left, x > 700 = Right; y < 100 = Down, y > 700 = Up
                    this.xVal = Math.max(0, Math.min(1023, Math.round(((dx / this.maxRadius) + 1) * 511.5)));
                    this.yVal = Math.max(0, Math.min(1023, Math.round(((-dy / this.maxRadius) + 1) * 511.5)));
                    const dirLabel = this.getDirectionLabel();
                    this.setBadgeText(dirLabel, dirLabel === "Center" ? "#64748b" : "#38bdf8");
                    this.syncPinState();
                    if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                        pxsim.runtime.queueDisplayUpdate();
                    }
                };
                const updateFromPointer = (clientX, clientY) => {
                    const rect = this.element.getBoundingClientRect();
                    if (!rect.width || !rect.height)
                        return;
                    const localX = ((clientX - rect.left) / rect.width) * this.width;
                    const localY = ((clientY - rect.top) / rect.height) * this.height;
                    let dx = (localX - this.centerX) * 0.25;
                    let dy = (localY - this.centerY) * 0.25;
                    const dist = Math.hypot(dx, dy);
                    if (dist > this.maxRadius) {
                        dx = (dx / dist) * this.maxRadius;
                        dy = (dy / dist) * this.maxRadius;
                    }
                    applyOffset(dx, dy);
                };
                const springBackToCenter = () => {
                    stopSpring();
                    const step = () => {
                        const nextDx = this.dx * 0.65;
                        const nextDy = this.dy * 0.65;
                        if (Math.hypot(nextDx, nextDy) < 0.5) {
                            this.dx = 0;
                            this.dy = 0;
                            const x = this.centerX - this.stickSize / 2;
                            const y = this.centerY - this.stickSize / 2;
                            this.stickGroup.setAttribute("transform", `translate(${x}, ${y})`);
                            this.xVal = 512;
                            this.yVal = 512;
                            this.setBadgeText("Center", "#64748b");
                            this.syncPinState();
                            this.springAnimId = null;
                            if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                                pxsim.runtime.queueDisplayUpdate();
                            }
                            return;
                        }
                        applyOffset(nextDx, nextDy);
                        this.springAnimId = requestAnimationFrame(step);
                    };
                    this.springAnimId = requestAnimationFrame(step);
                };
                this.element.style.cursor = "grab";
                this.element.addEventListener("pointerdown", (e) => {
                    e.stopPropagation();
                    stopSpring();
                    dragging = true;
                    this.element.style.cursor = "grabbing";
                    this.stickGroup.style.cursor = "grabbing";
                    if (this.element.setPointerCapture) {
                        try {
                            this.element.setPointerCapture(e.pointerId);
                        }
                        catch (_) { }
                    }
                    updateFromPointer(e.clientX, e.clientY);
                });
                this.element.addEventListener("pointermove", (e) => {
                    if (!dragging)
                        return;
                    e.stopPropagation();
                    updateFromPointer(e.clientX, e.clientY);
                });
                const releaseStick = (e) => {
                    if (!dragging)
                        return;
                    dragging = false;
                    this.element.style.cursor = "grab";
                    this.stickGroup.style.cursor = "grab";
                    if (this.element.releasePointerCapture) {
                        try {
                            this.element.releasePointerCapture(e.pointerId);
                        }
                        catch (_) { }
                    }
                    springBackToCenter();
                };
                this.element.addEventListener("pointerup", releaseStick);
                this.element.addEventListener("pointerleave", releaseStick);
                this.element.addEventListener("pointercancel", releaseStick);
                this.setBadgeText("Center", "#64748b");
                this.syncPinState();
            }
            getDirectionLabel() {
                if (this.xVal < 100)
                    return "Left";
                if (this.xVal > 700)
                    return "Right";
                if (this.yVal < 100)
                    return "Down";
                if (this.yVal > 700)
                    return "Up";
                return "Center";
            }
            syncPinState() {
                if (this.pins[0])
                    this.setAnalogInput(this.pins[0], this.xVal);
                if (this.pins[1])
                    this.setAnalogInput(this.pins[1], this.yVal);
            }
            updateState() {
                this.syncPinState();
            }
        }
        visuals.WomJoystickModule = WomJoystickModule;
        visuals.WomModuleManager.registerFactory("joystick", (pins) => new WomJoystickModule(pins), (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = visuals.decodeAnalogPort(portVal);
            const mgr = visuals.WomModuleManager.get(b);
            if (mgr)
                mgr.ensureModule("joystick", pins, args);
        });
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomLightModule extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "light",
                    displayName: "Light",
                    pins,
                    colSpan: 1,
                    rowSpan: 1,
                    sprite: "sprites/wom_photoresistor.png",
                    padEdge: "right",
                    wiredPins: [pins[0]]
                });
                this.lightLevel = 500;
                // Warm yellow glow over the photoresistor proportional to light intensity
                this.glowCircle = this.addCircleOverlay(74, 72, 26, "#facc15", 0.35);
                this.glowCircle.setAttribute("opacity", String((this.lightLevel / 1023) * 0.85));
                const { container } = this.addControlForeignObject(16, 100, 116, 44);
                container.style.cssText =
                    "background:rgba(15,23,42,0.82);border-radius:6px;padding:3px 6px;color:#f8fafc;font-family:sans-serif;font-size:10px;display:flex;flex-direction:column;gap:2px;user-select:none;";
                const header = document.createElement("div");
                header.style.cssText = "display:flex;justify-content:space-between;font-weight:bold;color:#facc15;";
                const label = document.createElement("span");
                label.textContent = "Light";
                const readout = document.createElement("span");
                readout.textContent = String(this.lightLevel);
                header.appendChild(label);
                header.appendChild(readout);
                const slider = document.createElement("input");
                slider.type = "range";
                slider.min = "0";
                slider.max = "1023";
                slider.value = String(this.lightLevel);
                slider.style.cssText = "width:100%;height:14px;margin:0;cursor:pointer;";
                slider.addEventListener("input", () => {
                    this.lightLevel = parseInt(slider.value, 10) || 0;
                    readout.textContent = String(this.lightLevel);
                    this.glowCircle.setAttribute("opacity", String((this.lightLevel / 1023) * 0.85));
                    this.setBadgeText(String(this.lightLevel), "#facc15");
                    this.syncPinState();
                });
                container.appendChild(header);
                container.appendChild(slider);
                this.setBadgeText(String(this.lightLevel), "#facc15");
                this.syncPinState();
            }
            syncPinState() {
                // ModuleWorld_Analog.Light returns 1024 - pins.analogReadPin(lightpin)
                this.setAnalogInput(this.pins[0], 1024 - this.lightLevel);
                const pin = visuals.getPinInstance(this.pins[0]);
                if (pin) {
                    pin.womAnalogValue = 1024 - this.lightLevel;
                }
            }
            updateState() {
                this.syncPinState();
            }
        }
        visuals.WomLightModule = WomLightModule;
        visuals.WomModuleManager.registerFactory("light", (pins) => new WomLightModule(pins), (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = visuals.decodeAnalogPort(portVal);
            const mgr = visuals.WomModuleManager.get(b);
            if (mgr)
                mgr.ensureModule("light", pins, args);
        });
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomPirModule extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "pir",
                    displayName: "PIR",
                    pins,
                    colSpan: 1,
                    rowSpan: 1,
                    sprite: "sprites/wom_pir.png",
                    padEdge: "left",
                    wiredPins: [pins[0]]
                });
                /** Internal state variable (0 to 1023) representing accumulated motion energy */
                this.internalEnergy = 0;
                /** Binary motion detection state (derived from internalEnergy >= MOTION_THRESHOLD) */
                this.motionDetected = false;
                this.sensorCenterX = 74;
                this.sensorCenterY = 68;
                this.circleRadius = 16;
                this.MOTION_THRESHOLD = 150;
                this.DECAY_RATE = 500; // Units per second (1023 decays to < 150 in ~1.75s, 0 in ~2s)
                // Circle positions
                this.handX = 38;
                this.handY = 110;
                this.robotX = 110;
                this.robotY = 110;
                // Kinematic tracking for hand
                this.prevHandDist = 0;
                this.prevHandAngle = 0;
                this.isObstructed = false;
                // Animation frame for decay loop
                this.decayAnimId = null;
                this.lastDecayTime = 0;
                // 1. Red glow over the PIR dome when motion is detected
                this.domeGlow = this.addCircleOverlay(this.sensorCenterX, this.sensorCenterY, 40, "#ef4444", 0.35);
                // 2. Red directional arrow group (rendered beneath hand and robot circles)
                this.arrowGroup = pxsim.svg.child(this.overlayGroup, "g", {
                    class: "wom-pir-arrow",
                    style: "pointer-events: none; filter: drop-shadow(0px 0px 1.5px rgba(0,0,0,0.6));"
                });
                this.arrowShaft = pxsim.svg.child(this.arrowGroup, "line", {
                    stroke: "#ef4444",
                    "stroke-linecap": "round"
                });
                this.arrowHead = pxsim.svg.child(this.arrowGroup, "polygon", {
                    fill: "#ef4444"
                });
                // 3. Draggable Warm Hand button circle
                this.handGroup = pxsim.svg.child(this.overlayGroup, "g", {
                    transform: `translate(${this.handX}, ${this.handY})`,
                    style: "cursor: grab;"
                });
                this.handBtnCircle = pxsim.svg.child(this.handGroup, "circle", {
                    cx: 0,
                    cy: 0,
                    r: this.circleRadius,
                    fill: "#1e293b",
                    "fill-opacity": 0.9,
                    stroke: "#ef4444",
                    "stroke-width": 1.8
                });
                const handImg = pxsim.svg.child(this.handGroup, "image", {
                    x: -11,
                    y: -11,
                    width: 22,
                    height: 22,
                    style: "pointer-events: none;"
                });
                this.setImageHref(handImg, "sprites/pir_hand.svg");
                // 4. Draggable Cold Robot button circle (cold slate tone with subtle blue tint)
                this.robotGroup = pxsim.svg.child(this.overlayGroup, "g", {
                    transform: `translate(${this.robotX}, ${this.robotY})`,
                    style: "cursor: grab;"
                });
                this.robotBtnCircle = pxsim.svg.child(this.robotGroup, "circle", {
                    cx: 0,
                    cy: 0,
                    r: this.circleRadius,
                    fill: "#1e293b",
                    "fill-opacity": 0.9,
                    stroke: "#64748b",
                    "stroke-width": 1.8
                });
                const robotImg = pxsim.svg.child(this.robotGroup, "image", {
                    x: -11,
                    y: -11,
                    width: 22,
                    height: 22,
                    style: "pointer-events: none;"
                });
                this.setImageHref(robotImg, "sprites/pir_robot.svg");
                // Initialize kinematic baselines
                const initDx = this.sensorCenterX - this.handX;
                const initDy = this.sensorCenterY - this.handY;
                this.prevHandDist = Math.hypot(initDx, initDy);
                this.prevHandAngle = Math.atan2(initDy, initDx);
                const initialObs = this.checkObstructed();
                this.isObstructed = initialObs.obstructed;
                // Setup dragging interactions
                this.setupDraggables();
                // Initial render
                this.renderArrow(initialObs);
                this.setBadgeText("Idle", "#64748b");
                this.syncPinState();
            }
            setupDraggables() {
                let activeDrag = null;
                const startDrag = (target, group, circle, e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    activeDrag = target;
                    group.style.cursor = "grabbing";
                    circle.setAttribute("stroke-width", "2.5");
                    try {
                        group.setPointerCapture(e.pointerId);
                    }
                    catch (_) { }
                };
                const handleMove = (e) => {
                    if (!activeDrag)
                        return;
                    e.stopPropagation();
                    e.preventDefault();
                    const rect = this.element.getBoundingClientRect();
                    if (!rect.width || !rect.height)
                        return;
                    const localX = Math.max(18, Math.min(this.width - 18, ((e.clientX - rect.left) / rect.width) * this.width));
                    const localY = Math.max(18, Math.min(this.height - 24, ((e.clientY - rect.top) / rect.height) * this.height));
                    if (activeDrag === "hand") {
                        this.moveHand(localX, localY);
                    }
                    else {
                        this.moveRobot(localX, localY);
                    }
                };
                const stopDrag = (e) => {
                    if (!activeDrag)
                        return;
                    if (activeDrag === "hand") {
                        this.handGroup.style.cursor = "grab";
                        this.handBtnCircle.setAttribute("stroke-width", "1.8");
                        if (e) {
                            try {
                                this.handGroup.releasePointerCapture(e.pointerId);
                            }
                            catch (_) { }
                        }
                    }
                    else {
                        this.robotGroup.style.cursor = "grab";
                        this.robotBtnCircle.setAttribute("stroke-width", "1.8");
                        if (e) {
                            try {
                                this.robotGroup.releasePointerCapture(e.pointerId);
                            }
                            catch (_) { }
                        }
                    }
                    activeDrag = null;
                };
                this.handGroup.addEventListener("pointerdown", (e) => startDrag("hand", this.handGroup, this.handBtnCircle, e));
                this.robotGroup.addEventListener("pointerdown", (e) => startDrag("robot", this.robotGroup, this.robotBtnCircle, e));
                this.handGroup.addEventListener("pointermove", handleMove);
                this.robotGroup.addEventListener("pointermove", handleMove);
                this.element.addEventListener("pointermove", handleMove);
                this.handGroup.addEventListener("pointerup", stopDrag);
                this.robotGroup.addEventListener("pointerup", stopDrag);
                this.element.addEventListener("pointerup", stopDrag);
                this.element.addEventListener("pointercancel", stopDrag);
                this.element.addEventListener("pointerleave", stopDrag);
            }
            checkObstructed() {
                const dx = this.sensorCenterX - this.handX;
                const dy = this.sensorCenterY - this.handY;
                const D = Math.hypot(dx, dy);
                if (D < 1)
                    return { obstructed: false, tHit: D };
                const ux = dx / D;
                const uy = dy / D;
                const nx = -uy;
                const ny = ux;
                const vx = this.robotX - this.handX;
                const vy = this.robotY - this.handY;
                const tProj = vx * ux + vy * uy;
                const dPerp = Math.abs(vx * nx + vy * ny);
                // Is the robot along the ray between the hand and the sensor center?
                if (tProj > 0 && tProj < D + this.circleRadius && dPerp < this.circleRadius) {
                    const deltaT = Math.sqrt(this.circleRadius * this.circleRadius - dPerp * dPerp);
                    const tHit = tProj - deltaT;
                    if (tHit < D) {
                        return { obstructed: true, tHit: Math.max(0, tHit) };
                    }
                }
                return { obstructed: false, tHit: D };
            }
            moveHand(newX, newY) {
                this.handX = newX;
                this.handY = newY;
                this.handGroup.setAttribute("transform", `translate(${newX}, ${newY})`);
                const dx = this.sensorCenterX - newX;
                const dy = this.sensorCenterY - newY;
                const D = Math.hypot(dx, dy);
                const angle = Math.atan2(dy, dx);
                const obs = this.checkObstructed();
                // Check if obstruction state flipped
                if (obs.obstructed !== this.isObstructed) {
                    this.internalEnergy = Math.min(1023, this.internalEnergy + 350);
                    this.isObstructed = obs.obstructed;
                }
                if (!obs.obstructed) {
                    // Direction change (in radians, branch-cut normalized)
                    const deltaAngle = Math.abs(this.normalizeAngle(angle - this.prevHandAngle));
                    // Thickness / distance change (in pixels)
                    const deltaDist = Math.abs(D - this.prevHandDist);
                    // Proximity factor (0 when far at D >= 85, 1 when close at D <= 20)
                    const tClose = Math.max(0, Math.min(1, 1 - (D - 20) / 65));
                    // More sensitive when closer to sensor center
                    const sensitivity = 1.0 + 2.5 * tClose;
                    const addedEnergy = (600 * deltaAngle + 12 * deltaDist) * sensitivity;
                    this.internalEnergy = Math.min(1023, this.internalEnergy + addedEnergy);
                }
                // If obstructed, treat movement energy as 0
                this.prevHandAngle = angle;
                this.prevHandDist = D;
                this.ensureDecayLoop();
                this.renderArrow(obs);
                this.updateMotionVisuals();
            }
            moveRobot(newX, newY) {
                this.robotX = newX;
                this.robotY = newY;
                this.robotGroup.setAttribute("transform", `translate(${newX}, ${newY})`);
                const obs = this.checkObstructed();
                // Moving the robot does NOT increase internal state UNLESS obstruction flips
                if (obs.obstructed !== this.isObstructed) {
                    this.internalEnergy = Math.min(1023, this.internalEnergy + 350);
                    this.isObstructed = obs.obstructed;
                    this.ensureDecayLoop();
                }
                this.renderArrow(obs);
                this.updateMotionVisuals();
            }
            renderArrow(obs) {
                const dx = this.sensorCenterX - this.handX;
                const dy = this.sensorCenterY - this.handY;
                const D = Math.hypot(dx, dy);
                if (D < 1) {
                    this.arrowGroup.style.display = "none";
                    return;
                }
                const ux = dx / D;
                const uy = dy / D;
                const nx = -uy;
                const ny = ux;
                // Arrow starts at boundary of the hand circle
                const startX = this.handX + ux * this.circleRadius;
                const startY = this.handY + uy * this.circleRadius;
                // Arrow ends at robot circle boundary if obstructed, or sensor center if unobstructed
                let endX;
                let endY;
                if (obs.obstructed) {
                    if (obs.tHit <= this.circleRadius) {
                        // Robot overlaps the hand directly along the ray
                        this.arrowGroup.style.display = "none";
                        return;
                    }
                    endX = this.handX + ux * obs.tHit;
                    endY = this.handY + uy * obs.tHit;
                }
                else {
                    endX = this.sensorCenterX;
                    endY = this.sensorCenterY;
                }
                const arrowLen = Math.hypot(endX - startX, endY - startY);
                if (arrowLen < 3) {
                    this.arrowGroup.style.display = "none";
                    return;
                }
                this.arrowGroup.style.display = "";
                // The closer the hand to the center, the thicker the arrow gets
                const tClose = Math.max(0, Math.min(1, 1 - (D - 20) / 65));
                const shaftWidth = 1.6 + tClose * 3.0; // 1.6px (far) to 4.6px (close)
                const headWidth = 3.0 + tClose * 2.8; // 3.0px to 5.8px
                const headLen = Math.min(arrowLen * 0.55, 6 + tClose * 4); // 6px to 10px
                const shaftEndX = endX - ux * headLen;
                const shaftEndY = endY - uy * headLen;
                this.arrowShaft.setAttribute("x1", startX.toFixed(1));
                this.arrowShaft.setAttribute("y1", startY.toFixed(1));
                this.arrowShaft.setAttribute("x2", shaftEndX.toFixed(1));
                this.arrowShaft.setAttribute("y2", shaftEndY.toFixed(1));
                this.arrowShaft.setAttribute("stroke-width", shaftWidth.toFixed(1));
                const w1x = shaftEndX + nx * headWidth;
                const w1y = shaftEndY + ny * headWidth;
                const w2x = shaftEndX - nx * headWidth;
                const w2y = shaftEndY - ny * headWidth;
                this.arrowHead.setAttribute("points", `${endX.toFixed(1)},${endY.toFixed(1)} ${w1x.toFixed(1)},${w1y.toFixed(1)} ${w2x.toFixed(1)},${w2y.toFixed(1)}`);
            }
            updateMotionVisuals() {
                const wasDetected = this.motionDetected;
                this.motionDetected = this.internalEnergy >= this.MOTION_THRESHOLD;
                if (wasDetected !== this.motionDetected) {
                    this.domeGlow.setAttribute("opacity", this.motionDetected ? "1" : "0");
                    this.setBadgeText(this.motionDetected ? "Motion" : "Idle", this.motionDetected ? "#ef4444" : "#64748b");
                    this.syncPinState();
                    if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                        pxsim.runtime.queueDisplayUpdate();
                    }
                }
            }
            ensureDecayLoop() {
                if (this.decayAnimId !== null)
                    return;
                this.lastDecayTime = performance.now();
                const step = (now) => {
                    if (!this.element.isConnected) {
                        this.decayAnimId = null;
                        return;
                    }
                    const dtSec = Math.min(0.1, (now - this.lastDecayTime) / 1000);
                    this.lastDecayTime = now;
                    if (this.internalEnergy > 0) {
                        this.internalEnergy = Math.max(0, this.internalEnergy - this.DECAY_RATE * dtSec);
                        this.updateMotionVisuals();
                        if (this.internalEnergy > 0) {
                            this.decayAnimId = requestAnimationFrame(step);
                            return;
                        }
                    }
                    this.decayAnimId = null;
                };
                this.decayAnimId = requestAnimationFrame(step);
            }
            normalizeAngle(rad) {
                while (rad > Math.PI)
                    rad -= 2 * Math.PI;
                while (rad < -Math.PI)
                    rad += 2 * Math.PI;
                return rad;
            }
            syncPinState() {
                // enPIR.OPIR = 1, enPIR.NoPIR = 0
                this.setDigitalInput(this.pins[0], this.motionDetected ? 1 : 0);
            }
            updateState() {
                this.syncPinState();
            }
        }
        visuals.WomPirModule = WomPirModule;
        visuals.WomModuleManager.registerFactory("pir", (pins) => new WomPirModule(pins));
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomPotentiometerModule extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "potentiometer",
                    displayName: "Pot",
                    pins,
                    colSpan: 1,
                    rowSpan: 1,
                    sprite: "sprites/wom_potentiometer.png",
                    padEdge: "right",
                    wiredPins: [pins[0]]
                });
                this.currentValue = 512;
                this.angleDeg = 0;
                this.centerX = 74;
                this.centerY = 72;
                // Rotor overlay centered at (74, 72) over the potentiometer shaft
                const rotorSize = 58;
                this.rotorGroup = pxsim.svg.child(this.overlayGroup, "g", {
                    transform: `rotate(${this.angleDeg}, ${this.centerX}, ${this.centerY})`,
                    style: "cursor: grab;"
                });
                // potentiometer_rotor.svg has its red tick drawn at bottom-left (-135 deg from top);
                // offset inner image by +135 deg so angleDeg=0 points straight up and [-135, +135] matches the tick.
                const innerGroup = pxsim.svg.child(this.rotorGroup, "g", {
                    transform: `rotate(135, ${this.centerX}, ${this.centerY})`
                });
                const rotorImg = pxsim.svg.child(innerGroup, "image", {
                    x: this.centerX - rotorSize / 2,
                    y: this.centerY - rotorSize / 2,
                    width: rotorSize,
                    height: rotorSize
                });
                this.setImageHref(rotorImg, "sprites/potentiometer_rotor.svg");
                let dragging = false;
                const updateFromPointer = (clientX, clientY) => {
                    const rect = this.element.getBoundingClientRect();
                    if (!rect.width || !rect.height)
                        return;
                    const localX = ((clientX - rect.left) / rect.width) * this.width;
                    const localY = ((clientY - rect.top) / rect.height) * this.height;
                    const dx = localX - this.centerX;
                    const dy = localY - this.centerY;
                    if (dx * dx + dy * dy < 4)
                        return;
                    // Angle in degrees relative to 12 o'clock (-180..+180)
                    let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
                    deg = Math.max(-135, Math.min(135, deg));
                    this.angleDeg = deg;
                    this.currentValue = Math.round(((deg + 135) / 270) * 1023);
                    this.rotorGroup.setAttribute("transform", `rotate(${this.angleDeg}, ${this.centerX}, ${this.centerY})`);
                    this.setBadgeText(String(this.currentValue), "#38bdf8");
                    this.syncPinState();
                    if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                        pxsim.runtime.queueDisplayUpdate();
                    }
                };
                this.element.style.cursor = "grab";
                this.element.addEventListener("pointerdown", (e) => {
                    e.stopPropagation();
                    dragging = true;
                    this.element.style.cursor = "grabbing";
                    this.rotorGroup.style.cursor = "grabbing";
                    if (this.element.setPointerCapture) {
                        try {
                            this.element.setPointerCapture(e.pointerId);
                        }
                        catch (_) { }
                    }
                    updateFromPointer(e.clientX, e.clientY);
                });
                this.element.addEventListener("pointermove", (e) => {
                    if (!dragging)
                        return;
                    e.stopPropagation();
                    updateFromPointer(e.clientX, e.clientY);
                });
                const endDrag = (e) => {
                    if (!dragging)
                        return;
                    dragging = false;
                    this.element.style.cursor = "grab";
                    this.rotorGroup.style.cursor = "grab";
                    if (this.element.releasePointerCapture) {
                        try {
                            this.element.releasePointerCapture(e.pointerId);
                        }
                        catch (_) { }
                    }
                };
                this.element.addEventListener("pointerup", endDrag);
                this.element.addEventListener("pointercancel", endDrag);
                this.setBadgeText(String(this.currentValue), "#38bdf8");
                this.syncPinState();
            }
            syncPinState() {
                this.setAnalogInput(this.pins[0], this.currentValue);
            }
            updateState() {
                this.syncPinState();
            }
        }
        visuals.WomPotentiometerModule = WomPotentiometerModule;
        visuals.WomModuleManager.registerFactory("potentiometer", (pins) => new WomPotentiometerModule(pins), (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = visuals.decodeAnalogPort(portVal);
            const mgr = visuals.WomModuleManager.get(b);
            if (mgr)
                mgr.ensureModule("potentiometer", pins, args);
        });
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomRgbModule extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "rgb",
                    displayName: "RGB",
                    pins: ["P12", "P13", "P14"],
                    colSpan: 1,
                    rowSpan: 1,
                    sprite: "sprites/wom_rgb.png",
                    padEdge: "right",
                    wiredPins: ["P12", "P13", "P14"]
                });
                // Glowing circle overlay centered over the RGB LED on the PCB (74, 72)
                this.ledCircle = this.addCircleOverlay(74, 72, 24, "rgb(0, 0, 0)", 0);
                this.setBadgeText("OFF", "#64748b");
                this.updateState();
            }
            readChannel255(pinName) {
                const pin = visuals.getPinInstance(pinName);
                if (!pin)
                    return 0;
                const raw = Math.max(0, Math.min(1023, pin.value || 0));
                return Math.round((raw / 1023) * 255);
            }
            updateState() {
                // Note: In libs/Module-World/Module-World.ts (RGB and RGB2):
                // P13 is Red (value1), P14 is Green (value2), and P12 is Blue (value3).
                const r = this.readChannel255("P13");
                const g = this.readChannel255("P14");
                const b = this.readChannel255("P12");
                const fillOpacity = Math.min(1, (r + g + b) / 255);
                const colorStr = `rgb(${r}, ${g}, ${b})`;
                this.ledCircle.setAttribute("fill", colorStr);
                this.ledCircle.setAttribute("stroke", colorStr);
                this.ledCircle.setAttribute("fill-opacity", String(fillOpacity));
                this.ledCircle.setAttribute("stroke-opacity", String(Math.min(1, fillOpacity + 0.2)));
                this.ledCircle.setAttribute("opacity", fillOpacity > 0 ? "1" : "0");
                if (r === 0 && g === 0 && b === 0) {
                    this.setBadgeText("OFF", "#64748b");
                }
                else {
                    this.setBadgeText(`${r},${g},${b}`, colorStr);
                }
            }
        }
        visuals.WomRgbModule = WomRgbModule;
        visuals.WomModuleManager.registerFactory("rgb", (pins) => new WomRgbModule(pins));
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        const UK_SERVO_TRANSLATIONS = {
            "front side": "Передня сторона",
            "back side": "Задня сторона",
            "0 degree position": "Позиція в стані 0"
        };
        function isUkrainianLocale() {
            try {
                // 1. Check parent window's MakeCode internal userLanguage()
                const parentWin = typeof window !== "undefined" ? window.parent : null;
                if (parentWin && parentWin.pxt && parentWin.pxt.Util && parentWin.pxt.Util.userLanguage) {
                    const lang = parentWin.pxt.Util.userLanguage();
                    if (typeof lang === "string" && lang.toLowerCase().startsWith("uk"))
                        return true;
                }
                // 2. Check MakeCode PXT_LANG cookie (shared across same origin)
                if (typeof document !== "undefined" && document.cookie) {
                    const m = /(?:^|;\s*)PXT_LANG=([a-zA-Z\-]+)/.exec(document.cookie);
                    if (m && m[1].toLowerCase().startsWith("uk"))
                        return true;
                }
                // 3. Check parent document's html lang attribute
                if (parentWin && parentWin.document && parentWin.document.documentElement && parentWin.document.documentElement.lang) {
                    if (parentWin.document.documentElement.lang.toLowerCase().startsWith("uk"))
                        return true;
                }
                // 4. Check parent window's actual URL query/hash if present
                if (parentWin && parentWin.location && parentWin.location.href) {
                    if (/[\?&#](?:lang|language)=uk/i.test(parentWin.location.href))
                        return true;
                }
            }
            catch (_a) { }
            return false;
        }
        function getServoLocalizedTooltip(key) {
            if (isUkrainianLocale()) {
                return UK_SERVO_TRANSLATIONS[key] || key;
            }
            if (typeof pxsim !== "undefined" && pxsim.localization && pxsim.localization.lf) {
                if (key === "front side")
                    return pxsim.localization.lf("front side");
                if (key === "back side")
                    return pxsim.localization.lf("back side");
                if (key === "0 degree position")
                    return pxsim.localization.lf("0 degree position");
            }
            return key;
        }
        class WomServoModule extends visuals.WomModuleBase {
            constructor(pins, initialMode = "360", locked = false) {
                super({
                    moduleType: "servo",
                    displayName: "Servo",
                    pins,
                    colSpan: 1,
                    rowSpan: 2,
                    sprite: initialMode === "continuous"
                        ? "sprites/wom_servo_continuous.png"
                        : "sprites/wom_servo.png",
                    padEdge: "top",
                    wiredPins: [pins[0]],
                    showCardBackground: false
                });
                this.mode = "360";
                this.modeLockedByInit = false;
                this.isBack = false;
                this.defaultRotation = 0;
                this.currentAngle = 0;
                this.targetAngle = 0;
                this.targetRpm = 0;
                this.lastFrameTime = 0;
                this.animFrameId = null;
                this.shaftX = 74;
                this.shaftY = 108;
                this.hornScale = 0.28;
                this.mode = initialMode;
                this.modeLockedByInit = locked;
                // Mode label ("360" or "270") displayed on the servo body
                this.cardModeText = pxsim.svg.child(this.overlayGroup, "text", {
                    x: this.width / 2,
                    y: 205,
                    "text-anchor": "middle",
                    fill: "#334155",
                    "font-family": "monospace, sans-serif",
                    "font-size": "24px",
                    "font-weight": "bold",
                    style: "pointer-events: none; user-select: none;"
                });
                // "Geekservo" unselectable string across the servo on front side, 5% smaller and 2x more transparent
                this.geekservoText = pxsim.svg.child(this.overlayGroup, "text", {
                    x: this.width / 2,
                    y: 228,
                    "text-anchor": "middle",
                    fill: "#0f172a",
                    opacity: "0.22",
                    "font-family": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    "font-size": "19px",
                    "font-weight": "900",
                    "letter-spacing": "1.5px",
                    style: "pointer-events: none; user-select: none;"
                });
                this.geekservoText.textContent = "Geekservo";
                // Rotating horn (/sim/sprites/servo_rotor.svg, viewBox 400x120, pivot at (60, 60))
                // Placed after cardModeText in DOM so it visually occludes the mode text when rotated downward
                this.rotorGroup = pxsim.svg.child(this.overlayGroup, "g", {});
                const rotorImg = pxsim.svg.child(this.rotorGroup, "image", {
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 120
                });
                this.setImageHref(rotorImg, "sprites/servo_rotor.svg");
                // Circular toggle button ('f' / 'b') on top of the bottom left corner
                this.createFaceToggleButton();
                // Circular 0 degree selection button on the bottom right (positional servos only)
                this.createZeroPositionButton();
                // Position statusText snugly below the servo sprite (eliminating the ~48px gap from rowSpan 2 cell height)
                if (this.statusText) {
                    this.statusText.setAttribute("y", "275");
                }
                this.applyModeVisuals();
                this.renderHornAngle(0);
                this.updateState();
            }
            setServoMode(mode, fromInitBlock = false) {
                if (this.modeLockedByInit && !fromInitBlock)
                    return;
                if (fromInitBlock) {
                    this.modeLockedByInit = true;
                }
                if (this.mode !== mode) {
                    this.mode = mode;
                    this.applyModeVisuals();
                }
                this.updateState();
            }
            applyModeVisuals() {
                const spriteHref = this.mode === "continuous"
                    ? "sprites/wom_servo_continuous.png"
                    : "sprites/wom_servo.png";
                this.setSpriteHref(spriteHref);
                if (this.mode === "continuous") {
                    this.cardModeText.textContent = "";
                }
                else {
                    this.cardModeText.textContent = this.mode;
                }
                if (this.zeroPosBtnGroup) {
                    this.zeroPosBtnGroup.style.display = this.mode === "continuous" ? "none" : "block";
                }
            }
            renderHornAngle(angleDeg) {
                // angleDeg is the servo state (rotation degrees relative to 0).
                // The default rotation relative to upwards is applied before back mode translation:
                const frontAngle = (angleDeg + this.defaultRotation) % 360;
                const normFront = frontAngle < 0 ? frontAngle + 360 : frontAngle;
                const angleFromUp = this.isBack
                    ? (360 - normFront) % 360
                    : normFront;
                const visualDeg = angleFromUp - 90;
                this.rotorGroup.setAttribute("transform", `translate(${this.shaftX}, ${this.shaftY}) scale(${this.hornScale}) rotate(${visualDeg}) translate(-60, -60)`);
            }
            ensureAnimationLoop() {
                if (this.animFrameId !== null)
                    return;
                this.lastFrameTime = performance.now();
                const step = (now) => {
                    if (!this.element.isConnected) {
                        this.animFrameId = null;
                        return;
                    }
                    const dtSec = Math.min(0.1, (now - this.lastFrameTime) / 1000);
                    this.lastFrameTime = now;
                    if (this.mode === "continuous") {
                        if (Math.abs(this.targetRpm) < 0.5) {
                            this.animFrameId = null;
                            return;
                        }
                        const degPerSec = (this.targetRpm / 60) * 360;
                        this.currentAngle = (this.currentAngle + degPerSec * dtSec) % 360;
                        if (this.currentAngle < 0)
                            this.currentAngle += 360;
                        this.renderHornAngle(this.currentAngle);
                        this.animFrameId = requestAnimationFrame(step);
                    }
                    else {
                        const diff = this.targetAngle - this.currentAngle;
                        if (Math.abs(diff) < 0.01) {
                            this.currentAngle = this.targetAngle;
                            this.renderHornAngle(this.currentAngle);
                            this.setBadgeText(`${Math.round(this.currentAngle)}°`, "#38bdf8");
                            this.animFrameId = null;
                            return;
                        }
                        const maxStep = WomServoModule.POSITIONAL_SPEED_DEG_PER_SEC * dtSec;
                        if (Math.abs(diff) <= maxStep) {
                            this.currentAngle = this.targetAngle;
                        }
                        else {
                            this.currentAngle += Math.sign(diff) * maxStep;
                        }
                        this.renderHornAngle(this.currentAngle);
                        this.setBadgeText(`${Math.round(this.currentAngle)}°`, "#38bdf8");
                        if (Math.abs(this.targetAngle - this.currentAngle) >= 0.01) {
                            this.animFrameId = requestAnimationFrame(step);
                        }
                        else {
                            this.animFrameId = null;
                        }
                    }
                };
                this.animFrameId = requestAnimationFrame(step);
            }
            createFaceToggleButton() {
                const initialTitle = getServoLocalizedTooltip("front side");
                const btnGroup = pxsim.svg.child(this.overlayGroup, "g", {
                    class: "wom-servo-face-btn",
                    style: "cursor: pointer;"
                });
                btnGroup.setAttribute("title", initialTitle);
                this.faceBtnTitle = pxsim.svg.child(btnGroup, "title", {});
                this.faceBtnTitle.textContent = initialTitle;
                this.faceBtnCircle = pxsim.svg.child(btnGroup, "circle", {
                    cx: 30,
                    cy: 238,
                    r: 14.3,
                    fill: "#1e293b",
                    stroke: "#475569",
                    "stroke-width": 1.5,
                    style: "cursor: pointer;"
                });
                this.faceBtnText = pxsim.svg.child(btnGroup, "text", {
                    x: 30,
                    y: 243.5,
                    "text-anchor": "middle",
                    fill: "#94a3b8",
                    "font-family": "monospace, sans-serif",
                    "font-size": "15px",
                    "font-weight": "bold",
                    style: "pointer-events: none; user-select: none;"
                });
                this.faceBtnText.textContent = "f";
                btnGroup.addEventListener("mouseenter", () => {
                    this.faceBtnCircle.setAttribute("stroke", "#38bdf8");
                });
                btnGroup.addEventListener("mouseleave", () => {
                    this.faceBtnCircle.setAttribute("stroke", this.isBack ? "#38bdf8" : "#475569");
                });
                btnGroup.addEventListener("pointerdown", (e) => {
                    e.stopPropagation();
                });
                btnGroup.addEventListener("mousedown", (e) => {
                    e.stopPropagation();
                });
                btnGroup.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.toggleFace();
                });
                this.faceBtnGroup = btnGroup;
            }
            createZeroPositionButton() {
                const title = getServoLocalizedTooltip("0 degree position");
                const btnGroup = pxsim.svg.child(this.overlayGroup, "g", {
                    class: "wom-servo-zero-btn",
                    style: "cursor: pointer;"
                });
                btnGroup.setAttribute("title", title);
                const titleEl = pxsim.svg.child(btnGroup, "title", {});
                titleEl.textContent = title;
                this.zeroPosBtnCircle = pxsim.svg.child(btnGroup, "circle", {
                    cx: 118,
                    cy: 238,
                    r: 14.3,
                    fill: "#ffffff",
                    stroke: "#94a3b8",
                    "stroke-width": 1.5,
                    style: "cursor: pointer;"
                });
                // Clipped container for miniature rotor horn centered at (118, 238)
                const clipId = `wom-zero-clip-${this.pinKey}`;
                const clip = pxsim.svg.child(this.overlayGroup, "clipPath", { id: clipId });
                pxsim.svg.child(clip, "circle", { cx: 118, cy: 238, r: 13.8 });
                const miniRotorG = pxsim.svg.child(btnGroup, "g", {
                    "clip-path": `url(#${clipId})`,
                    style: "pointer-events: none;"
                });
                this.miniRotorImg = pxsim.svg.child(miniRotorG, "image", {
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 120
                });
                this.setImageHref(this.miniRotorImg, "sprites/servo_rotor.svg");
                this.updateZeroPositionButtonVisuals();
                btnGroup.addEventListener("mouseenter", () => {
                    this.zeroPosBtnCircle.setAttribute("stroke", "#38bdf8");
                });
                btnGroup.addEventListener("mouseleave", () => {
                    this.zeroPosBtnCircle.setAttribute("stroke", "#94a3b8");
                });
                btnGroup.addEventListener("pointerdown", (e) => {
                    e.stopPropagation();
                });
                btnGroup.addEventListener("mousedown", (e) => {
                    e.stopPropagation();
                });
                btnGroup.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.cycleDefaultRotation();
                });
                this.zeroPosBtnGroup = btnGroup;
                this.zeroPosBtnGroup.style.display = this.mode === "continuous" ? "none" : "block";
            }
            updateZeroPositionButtonVisuals() {
                if (!this.miniRotorImg)
                    return;
                const btnAngleFromUp = this.isBack
                    ? (360 - this.defaultRotation) % 360
                    : this.defaultRotation;
                const visualDeg = btnAngleFromUp - 90;
                this.miniRotorImg.setAttribute("transform", `translate(118, 238) rotate(${visualDeg}) scale(0.0426) translate(-60, -60)`);
            }
            cycleDefaultRotation() {
                if (this.mode === "continuous")
                    return;
                this.defaultRotation = (this.defaultRotation + 90) % 360;
                this.updateZeroPositionButtonVisuals();
                this.renderHornAngle(this.currentAngle);
                if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                    pxsim.runtime.queueDisplayUpdate();
                }
            }
            toggleFace() {
                this.isBack = !this.isBack;
                this.updateFaceButtonVisuals();
                this.updateZeroPositionButtonVisuals();
                if (this.mode === "continuous") {
                    this.targetRpm = -this.targetRpm;
                    if (Math.abs(this.targetRpm) >= 0.5) {
                        const dir = (this.isBack ? -this.targetRpm : this.targetRpm) > 0 ? "CW" : "CCW";
                        this.setBadgeText(`${Math.round(Math.abs(this.targetRpm))}rpm ${dir}`, "#22c55e");
                    }
                    this.renderHornAngle(this.currentAngle);
                }
                else {
                    this.renderHornAngle(this.currentAngle);
                    this.setBadgeText(`${Math.round(this.currentAngle)}°`, "#38bdf8");
                }
            }
            updateFaceButtonVisuals() {
                const label = this.isBack ? "b" : "f";
                const tooltip = getServoLocalizedTooltip(this.isBack ? "back side" : "front side");
                this.faceBtnText.textContent = label;
                this.faceBtnText.setAttribute("fill", this.isBack ? "#38bdf8" : "#94a3b8");
                this.faceBtnCircle.setAttribute("stroke", this.isBack ? "#38bdf8" : "#475569");
                this.faceBtnCircle.setAttribute("fill", this.isBack ? "#0f172a" : "#1e293b");
                this.faceBtnGroup.setAttribute("title", tooltip);
                this.faceBtnTitle.textContent = tooltip;
                if (this.geekservoText) {
                    this.geekservoText.style.display = this.isBack ? "none" : "block";
                }
            }
            updateState() {
                const pin = visuals.getPinInstance(this.pins[0]);
                const pulse = pin ? pin.womServoPulse : undefined;
                if (pulse === undefined) {
                    const idleText = this.mode === "continuous"
                        ? "0 rpm"
                        : `${Math.round(this.currentAngle)}°`;
                    this.setBadgeText(idleText, "#64748b");
                    return;
                }
                const clampedPulse = Math.max(500, Math.min(2500, pulse));
                if (this.mode === "continuous") {
                    // 1500 us = 0 rpm (stopped); 500 us = 160 rpm CCW (-160); 2500 us = 160 rpm CW (+160)
                    const delta = clampedPulse - 1500;
                    if (Math.abs(delta) < 15) {
                        this.targetRpm = 0;
                        this.setBadgeText("0 rpm", "#64748b");
                    }
                    else {
                        this.targetRpm = (delta / 1000) * 160;
                        const dir = (this.isBack ? -this.targetRpm : this.targetRpm) > 0 ? "CW" : "CCW";
                        this.setBadgeText(`${Math.round(Math.abs(this.targetRpm))}rpm ${dir}`, "#22c55e");
                        this.ensureAnimationLoop();
                    }
                }
                else {
                    this.targetRpm = 0;
                    const maxAngle = this.mode === "270" ? 270 : 360;
                    const angle = ((clampedPulse - 500) / 2000) * maxAngle;
                    this.targetAngle = angle;
                    if (Math.abs(this.targetAngle - this.currentAngle) < 0.01) {
                        this.currentAngle = this.targetAngle;
                        this.renderHornAngle(this.currentAngle);
                        this.setBadgeText(`${Math.round(this.currentAngle)}°`, "#38bdf8");
                    }
                    else {
                        this.ensureAnimationLoop();
                    }
                }
            }
        }
        /**
         * Positional servo rotational transition speed:
         * 720 degrees per second (2 full rotations per second).
         */
        WomServoModule.POSITIONAL_SPEED_DEG_PER_SEC = 720;
        visuals.WomServoModule = WomServoModule;
        function parseServoTypeArg(val) {
            const n = parseInt(val || "1", 10);
            if (n === 2 || val === "270")
                return "270";
            if (n === 3 || val === "continuous")
                return "continuous";
            return "360";
        }
        visuals.WomModuleManager.registerFactory("servo", (pins, args) => {
            const mode = parseServoTypeArg(args[1]);
            const fromInit = args[2] === "init";
            return new WomServoModule(pins, mode, fromInit);
        }, (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = visuals.decodeServoPort(portVal);
            const mgr = visuals.WomModuleManager.get(b);
            if (!mgr)
                return;
            const mod = mgr.ensureModule("servo", pins, args);
            if (mod && args[1]) {
                mod.setServoMode(parseServoTypeArg(args[1]), false);
            }
        });
        visuals.WomModuleManager.registerFactory("servo_init", (pins, args) => new WomServoModule(pins, parseServoTypeArg(args[1]), true), (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = visuals.decodeServoPort(portVal);
            const mgr = visuals.WomModuleManager.get(b);
            if (!mgr)
                return;
            const mode = parseServoTypeArg(args[1]);
            const mod = mgr.ensureModule("servo", pins, [args[0], mode, "init"]);
            if (mod) {
                mod.setServoMode(mode, true);
            }
        });
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        /** Native pixel dimensions of /sim/sprites/wom_tm1650.png */
        const TM1650_NATIVE_W = 1255;
        const TM1650_NATIVE_H = 848;
        /** Horizontal pixel pitch between consecutive digits (0..3) in native 1255x848 coordinates */
        const TM1650_DIGIT_STEP_X = 198.15;
        /**
         * Exact centerline endpoints for Digit 0 segments (A..G, DP) in native 1255x848 coordinates.
         * Each segment is inset slightly from its miter corners so round linecaps leave crisp gaps.
         */
        const TM1650_DIGIT0_SEGMENTS = [
            { x1: 295.5, y1: 314.9, x2: 379.5, y2: 314.9 },
            { x1: 390.9, y1: 327.5, x2: 383.9, y2: 405.5 },
            { x1: 380.4, y1: 444.5, x2: 374.0, y2: 522.5 },
            { x1: 275.5, y1: 535.1, x2: 359.5, y2: 535.1 },
            { x1: 271.2, y1: 444.5, x2: 264.2, y2: 522.5 },
            { x1: 281.5, y1: 327.5, x2: 274.7, y2: 405.5 },
            { x1: 285.5, y1: 424.6, x2: 370.5, y2: 424.6 },
            { x1: 407.7, y1: 530.6, x2: 407.7, y2: 530.6, isDot: true } // Bit 7 (0x80): Decimal Point (DP)
        ];
        /** Lookup table for decoding 7-segment bitmasks (bits 0..6) back to readable badge characters */
        const SEG_TO_CHAR = {
            0x00: " ",
            0x3f: "0",
            0x06: "1",
            0x5b: "2",
            0x4f: "3",
            0x66: "4",
            0x6d: "5",
            0x7d: "6",
            0x07: "7",
            0x7f: "8",
            0x6f: "9",
            0x77: "A",
            0x7c: "b",
            0x39: "C",
            0x58: "c",
            0x5e: "d",
            0x79: "E",
            0x7b: "e",
            0x71: "F",
            0x76: "H",
            0x74: "h",
            0x1e: "J",
            0x38: "L",
            0x54: "n",
            0x5c: "o",
            0x73: "P",
            0x67: "q",
            0x50: "r",
            0x78: "t",
            0x3e: "U",
            0x1c: "u",
            0x6e: "y",
            0x40: "-",
            0x08: "_"
        };
        class WomTm1650Module extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "tm1650",
                    displayName: "TM1650",
                    pins,
                    colSpan: 2,
                    rowSpan: 1,
                    sprite: "sprites/wom_tm1650.png",
                    spriteBounds: WomTm1650Module.SPRITE_BOUNDS,
                    padEdge: "top",
                    wiredPins: ["P19", "P20"],
                    showCardBackground: false
                });
                /** Current 8-bit segment mask for each of the 4 digits (0x34..0x37) */
                this.digitMasks = [0, 0, 0, 0];
                /** Whether the TM1650 display driver is enabled (bit 0 of command register 0x24) */
                this.displayOn = true;
                /** Brightness intensity level (1..8, default 3) */
                this.intensity = 3;
                /** 4x8 matrix of SVG <line> elements representing the red segments on top of wom_tm1650.png */
                this.segmentLines = [];
                this.buildDisplayOverlay();
                this.renderDisplay();
            }
            /**
             * Convert a coordinate from native wom_tm1650.png space (1255x848)
             * to local SVG module coordinates.
             */
            toModuleCoord(nativeX, nativeY) {
                const b = WomTm1650Module.SPRITE_BOUNDS;
                return {
                    x: b.x + (nativeX / TM1650_NATIVE_W) * b.width,
                    y: b.y + (nativeY / TM1650_NATIVE_H) * b.height
                };
            }
            /**
             * Draw a single red segment line (or round dot for DP) in the overlay group
             * positioned over its corresponding unlit segment in wom_tm1650.png.
             */
            createSegmentLine(digitIndex, segIndex) {
                const def = TM1650_DIGIT0_SEGMENTS[segIndex];
                const offsetX = digitIndex * TM1650_DIGIT_STEP_X;
                const p1 = this.toModuleCoord(def.x1 + offsetX, def.y1);
                const p2 = this.toModuleCoord(def.x2 + offsetX, def.y2);
                const scale = WomTm1650Module.SPRITE_BOUNDS.width / TM1650_NATIVE_W;
                const strokeWidth = (def.isDot ? 25 : 18) * scale;
                return pxsim.svg.child(this.overlayGroup, "line", {
                    x1: p1.x.toFixed(2),
                    y1: p1.y.toFixed(2),
                    x2: p2.x.toFixed(2),
                    y2: p2.y.toFixed(2),
                    stroke: "#ef4444",
                    "stroke-width": strokeWidth.toFixed(2),
                    "stroke-linecap": "round",
                    opacity: "0",
                    style: "pointer-events: none; filter: drop-shadow(0px 0px 2px rgba(239, 68, 68, 0.75)); transition: opacity 0.05s linear;"
                });
            }
            /**
             * Create all 32 red segment overlay lines (4 digits x 8 segments) over the background PNG.
             */
            buildDisplayOverlay() {
                this.segmentLines = [];
                for (let d = 0; d < 4; d++) {
                    const digitEls = [];
                    for (let s = 0; s < 8; s++) {
                        digitEls.push(this.createSegmentLine(d, s));
                    }
                    this.segmentLines.push(digitEls);
                }
            }
            /**
             * Update the red segment overlay lines for a single digit position (0..3).
             */
            drawDigitSegments(digitIndex, mask, activeOpacity) {
                const lines = this.segmentLines[digitIndex];
                if (!lines)
                    return;
                for (let s = 0; s < 8; s++) {
                    const isLit = this.displayOn && ((mask & (1 << s)) !== 0);
                    lines[s].setAttribute("opacity", isLit ? activeOpacity : "0");
                }
            }
            /**
             * Refresh all 4 digits' segment overlays and the module status badge.
             */
            renderDisplay() {
                // Map intensity (1..8) to a vivid opacity range (0.55..1.0) when display is on
                const clampedIntensity = Math.max(1, Math.min(8, this.intensity || 3));
                const activeOpacity = this.displayOn
                    ? (0.52 + (clampedIntensity / 8) * 0.48).toFixed(2)
                    : "0";
                for (let d = 0; d < 4; d++) {
                    this.drawDigitSegments(d, this.digitMasks[d] || 0, activeOpacity);
                }
                if (!this.displayOn) {
                    this.setBadgeText("OFF", "#64748b");
                    return;
                }
                const anyLit = this.digitMasks.some(m => (m & 0xff) !== 0);
                if (!anyLit) {
                    this.setBadgeText("ON", "#ef4444");
                    return;
                }
                let text = "";
                for (let d = 0; d < 4; d++) {
                    const mask = this.digitMasks[d] & 0xff;
                    const seg7 = mask & 0x7f;
                    const dp = (mask & 0x80) !== 0;
                    const ch = SEG_TO_CHAR[seg7] !== undefined ? SEG_TO_CHAR[seg7] : "?";
                    text += ch + (dp ? "." : "");
                }
                this.setBadgeText(text.trim() || "ON", "#ef4444");
            }
            /**
             * Handle I2C writes to TM1650 command register (0x24) and digit registers (0x34..0x37).
             */
            onI2cWrite(address, byteVal) {
                const b = byteVal & 0xff;
                if (address === 0x24) {
                    this.displayOn = (b & 0x01) !== 0;
                    if (this.displayOn) {
                        const rawIntensity = (b >> 4) & 0x07;
                        if (rawIntensity > 0) {
                            this.intensity = rawIntensity;
                        }
                        else if ((b & 0x80) !== 0) {
                            // In TM1650, dat = 8 produces (8 << 4) | 0x01 = 0x81 (max brightness)
                            this.intensity = 8;
                        }
                        else if (this.intensity <= 0) {
                            this.intensity = 3;
                        }
                    }
                }
                else if (address >= 0x34 && address <= 0x37) {
                    const digitIndex = address - 0x34;
                    this.digitMasks[digitIndex] = b;
                }
                this.renderDisplay();
                if (typeof pxsim.runtime !== "undefined" && pxsim.runtime) {
                    pxsim.runtime.queueDisplayUpdate();
                }
            }
            updateState() {
                this.renderDisplay();
            }
        }
        WomTm1650Module.SPRITE_BOUNDS = {
            x: 55.37,
            y: 1,
            width: 201.26,
            height: 136
        };
        visuals.WomTm1650Module = WomTm1650Module;
        visuals.WomModuleManager.registerFactory("tm1650", (pins) => new WomTm1650Module(pins));
        visuals.WomModuleManager.registerI2cHandler([0x24, 0x34, 0x35, 0x36, 0x37], {
            onWrite(b, address, buf) {
                if (!buf || !buf.data || buf.data.length === 0)
                    return;
                const mgr = visuals.WomModuleManager.get(b);
                if (!mgr)
                    return;
                const mod = mgr.ensureModule("tm1650", ["P19", "P20"]);
                if (mod) {
                    mod.onI2cWrite(address, buf.data[0]);
                }
            }
        });
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./womManager.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WomUltrasonicModule extends visuals.WomModuleBase {
            constructor(pins) {
                super({
                    moduleType: "ultrasonic",
                    displayName: "Ultrasonic",
                    pins,
                    colSpan: 2,
                    rowSpan: 1,
                    sprite: "sprites/wom_ultrasonic.png",
                    padEdge: "top",
                    wiredPins: pins,
                    showCardBackground: true
                });
                this.distanceCm = 25;
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
            syncPinState() {
                // Ultrasonic reads pulseIn on Echo (pins[1]) and divides by 58
                const echoPin = this.pins[1] || this.pins[0];
                this.setPulseMicros(echoPin, this.distanceCm * 58);
            }
            updateState() {
                this.syncPinState();
            }
        }
        visuals.WomUltrasonicModule = WomUltrasonicModule;
        visuals.WomModuleManager.registerFactory("ultrasonic", (pins) => new WomUltrasonicModule(pins));
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        // TODO: add in support for mode, as in CODAL
        function registerWithDal(id, evid, handler, mode = 0) {
            pxsim.board().bus.listen(id, evid, handler, mode);
        }
        pxtcore.registerWithDal = registerWithDal;
        function deepSleep() {
            // TODO?
            console.log("deep sleep requested");
        }
        pxtcore.deepSleep = deepSleep;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var BufferMethods;
    (function (BufferMethods) {
        function fnv1(data) {
            let h = 0x811c9dc5;
            for (let i = 0; i < data.length; ++i) {
                h = Math.imul(h, 0x1000193) ^ data[i];
            }
            return h;
        }
        function hash(buf, bits) {
            bits |= 0;
            if (bits < 1)
                return 0;
            const h = fnv1(buf.data);
            if (bits >= 32)
                return h >>> 0;
            else
                return ((h ^ (h >>> bits)) & ((1 << bits) - 1)) >>> 0;
        }
        BufferMethods.hash = hash;
    })(BufferMethods = pxsim.BufferMethods || (pxsim.BufferMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var control;
    (function (control) {
        control.runInParallel = pxsim.thread.runInBackground;
        control.delay = pxsim.thread.pause;
        function reset() {
            pxsim.Runtime.postMessage({
                type: "simulator",
                command: "restart",
                controlReset: true
            });
            const cb = pxsim.getResume();
        }
        control.reset = reset;
        function singleSimulator() {
            pxsim.Runtime.postMessage({
                type: "simulator",
                command: "single"
            });
        }
        control.singleSimulator = singleSimulator;
        function waitMicros(micros) {
            pxsim.thread.pause(micros / 1000); // it prempts not much we can do here.
        }
        control.waitMicros = waitMicros;
        function deviceName() {
            let b = pxsim.board();
            return b && b.id
                ? b.id.slice(0, 4)
                : "abcd";
        }
        control.deviceName = deviceName;
        function _ramSize() {
            return 32 * 1024 * 1024;
        }
        control._ramSize = _ramSize;
        function deviceSerialNumber() {
            let b = pxsim.board();
            if (!b)
                return 42;
            let n = 0;
            if (b.id) {
                n = parseInt(b.id.slice(1));
                if (isNaN(n)) {
                    n = 0;
                    for (let i = 0; i < b.id.length; ++i) {
                        n = ((n << 5) - n) + b.id.charCodeAt(i);
                        n |= 0;
                    }
                    n = Math.abs(n);
                }
            }
            if (!n)
                n = 42;
            return n;
        }
        control.deviceSerialNumber = deviceSerialNumber;
        function deviceLongSerialNumber() {
            let b = control.createBuffer(8);
            pxsim.BufferMethods.setNumber(b, pxsim.BufferMethods.NumberFormat.UInt32LE, 0, deviceSerialNumber());
            return b;
        }
        control.deviceLongSerialNumber = deviceLongSerialNumber;
        function deviceDalVersion() {
            return "sim";
        }
        control.deviceDalVersion = deviceDalVersion;
        function internalOnEvent(id, evid, handler) {
            pxsim.pxtcore.registerWithDal(id, evid, handler);
        }
        control.internalOnEvent = internalOnEvent;
        function waitForEvent(id, evid) {
            const cb = pxsim.getResume();
            pxsim.board().bus.wait(id, evid, cb);
        }
        control.waitForEvent = waitForEvent;
        function allocateNotifyEvent() {
            let b = pxsim.board();
            return b.bus.nextNotifyEvent++;
        }
        control.allocateNotifyEvent = allocateNotifyEvent;
        function raiseEvent(id, evid, mode) {
            // TODO mode?
            pxsim.board().bus.queue(id, evid);
        }
        control.raiseEvent = raiseEvent;
        function millis() {
            return pxsim.runtime.runningTime();
        }
        control.millis = millis;
        function micros() {
            return pxsim.runtime.runningTimeUs() & 0x3fffffff;
        }
        control.micros = micros;
        function delayMicroseconds(us) {
            control.delay(us / 0.001);
        }
        control.delayMicroseconds = delayMicroseconds;
        function createBuffer(size) {
            return pxsim.BufferMethods.createBuffer(size);
        }
        control.createBuffer = createBuffer;
        function dmesg(msg) {
            console.log(`DMESG: ${msg}`);
        }
        control.dmesg = dmesg;
        function setDebugFlags(flags) {
            console.log(`debug flags: ${flags}`);
        }
        control.setDebugFlags = setDebugFlags;
        function heapSnapshot() {
            console.log(pxsim.runtime.traceObjects());
        }
        control.heapSnapshot = heapSnapshot;
        function toStr(v) {
            if (v instanceof pxsim.RefRecord) {
                return `${v.vtable.name}@${v.id}`;
            }
            if (v instanceof pxsim.RefCollection) {
                let r = "[";
                for (let e of v.toArray()) {
                    if (r.length > 200) {
                        r += "...";
                        break;
                    }
                    r += toStr(e) + ", ";
                }
                r += "]";
                return r;
            }
            if (typeof v == "function") {
                return (v + "").slice(0, 60) + "...";
            }
            return v + "";
        }
        function dmesgPtr(msg, ptr) {
            console.log(`DMESG: ${msg} ${toStr(ptr)}`);
        }
        control.dmesgPtr = dmesgPtr;
        function dmesgValue(ptr) {
            console.log(`DMESG: ${toStr(ptr)}`);
        }
        control.dmesgValue = dmesgValue;
        function gc() { }
        control.gc = gc;
        function profilingEnabled() {
            return !!pxsim.runtime.perfCounters;
        }
        control.profilingEnabled = profilingEnabled;
        function __log(priority, str) {
            switch (priority) {
                case 0:
                    console.debug("d>" + str);
                    break;
                case 1:
                    console.log("l>" + str);
                    break;
                case 2:
                    console.warn("w>" + str);
                    break;
                case 3:
                    console.error("e>" + str);
                    break;
            }
            pxsim.runtime.board.writeSerial(str);
        }
        control.__log = __log;
        function heapDump() {
            // TODO something better
        }
        control.heapDump = heapDump;
        function isUSBInitialized() {
            return false;
        }
        control.isUSBInitialized = isUSBInitialized;
    })(control = pxsim.control || (pxsim.control = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        // general purpose message sending mechanism
        function sendMessage(channel, message, parentOnly) {
            if (!channel)
                return;
            pxsim.Runtime.postMessage({
                type: "messagepacket",
                broadcast: !parentOnly,
                channel: channel,
                data: message && message.data
            });
        }
        pxtcore.sendMessage = sendMessage;
        function peekMessageChannel() {
            const state = pxsim.getControlMessageState();
            const msg = state && state.peek();
            return msg && msg.channel;
        }
        pxtcore.peekMessageChannel = peekMessageChannel;
        function readMessageData() {
            const state = pxsim.getControlMessageState();
            const msg = state && state.read();
            return msg && new pxsim.RefBuffer(msg.data);
        }
        pxtcore.readMessageData = readMessageData;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    // keep in sync with ts
    pxsim.CONTROL_MESSAGE_EVT_ID = 2999;
    pxsim.CONTROL_MESSAGE_RECEIVED = 1;
    class ControlMessageState {
        constructor(board) {
            this.board = board;
            this.messages = [];
            this.enabled = false;
            this.board.addMessageListener(msg => this.messageHandler(msg));
        }
        messageHandler(msg) {
            if (msg.type == "messagepacket") {
                let packet = msg;
                this.enqueue(packet);
            }
        }
        enqueue(message) {
            this.messages.push(message);
            this.board.bus.queue(pxsim.CONTROL_MESSAGE_EVT_ID, pxsim.CONTROL_MESSAGE_RECEIVED);
        }
        peek() {
            return this.messages[0];
        }
        read() {
            return this.messages.shift();
        }
    }
    pxsim.ControlMessageState = ControlMessageState;
    function getControlMessageState() {
        return pxsim.board().controlMessageState;
    }
    pxsim.getControlMessageState = getControlMessageState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    let ThresholdState;
    (function (ThresholdState) {
        ThresholdState[ThresholdState["High"] = 0] = "High";
        ThresholdState[ThresholdState["Low"] = 1] = "Low";
        ThresholdState[ThresholdState["Normal"] = 2] = "Normal";
    })(ThresholdState || (ThresholdState = {}));
    class AnalogSensorState {
        constructor(id, min = 0, max = 255, lowThreshold = 64, highThreshold = 192) {
            this.id = id;
            this.min = min;
            this.max = max;
            this.lowThreshold = lowThreshold;
            this.highThreshold = highThreshold;
            this.sensorUsed = false;
            this.state = ThresholdState.Normal;
            this.level = Math.ceil((max - min) / 2);
        }
        setUsed() {
            if (!this.sensorUsed) {
                this.sensorUsed = true;
                pxsim.runtime.queueDisplayUpdate();
            }
        }
        setLevel(level) {
            this.level = this.clampValue(level);
            if (this.level >= this.highThreshold) {
                this.setState(ThresholdState.High);
            }
            else if (this.level <= this.lowThreshold) {
                this.setState(ThresholdState.Low);
            }
            else {
                this.setState(ThresholdState.Normal);
            }
        }
        getLevel() {
            return this.level;
        }
        setLowThreshold(value) {
            this.lowThreshold = this.clampValue(value);
            this.highThreshold = Math.max(this.lowThreshold + 1, this.highThreshold);
        }
        setHighThreshold(value) {
            this.highThreshold = this.clampValue(value);
            this.lowThreshold = Math.min(this.highThreshold - 1, this.lowThreshold);
        }
        clampValue(value) {
            if (value < this.min) {
                return this.min;
            }
            else if (value > this.max) {
                return this.max;
            }
            return value;
        }
        setState(state) {
            if (this.state === state) {
                return;
            }
            this.state = state;
            switch (state) {
                case ThresholdState.High:
                    pxsim.board().bus.queue(this.id, 2 /* DAL.SENSOR_THRESHOLD_HIGH */);
                    break;
                case ThresholdState.Low:
                    pxsim.board().bus.queue(this.id, 1 /* DAL.SENSOR_THRESHOLD_LOW */);
                    break;
                case ThresholdState.Normal:
                    break;
            }
        }
    }
    pxsim.AnalogSensorState = AnalogSensorState;
})(pxsim || (pxsim = {}));
/// <reference path="../../core/sim/analogSensor.ts" />
var pxsim;
(function (pxsim) {
    class MicrophoneState extends pxsim.AnalogSensorState {
        constructor() {
            super(...arguments);
            this.onSoundRegistered = false;
            this.soundLevelRequested = false;
            this.pingSoundLevel = () => {
                if (this.onSoundRegistered) {
                    return;
                }
                this.soundLevelRequested = true;
                pxsim.runtime.queueDisplayUpdate();
                clearTimeout(this.pingUsed);
                this.pingUsed = setTimeout(() => {
                    this.soundLevelRequested = false;
                    pxsim.runtime.queueDisplayUpdate();
                    this.pingUsed = undefined;
                }, 100);
            };
        }
    }
    pxsim.MicrophoneState = MicrophoneState;
    function microphoneState() {
        return pxsim.board().microphoneState;
    }
    pxsim.microphoneState = microphoneState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    let NeoPixelMode;
    (function (NeoPixelMode) {
        NeoPixelMode[NeoPixelMode["RGB"] = 1] = "RGB";
        NeoPixelMode[NeoPixelMode["RGBW"] = 2] = "RGBW";
        NeoPixelMode[NeoPixelMode["RGB_RGB"] = 3] = "RGB_RGB";
        NeoPixelMode[NeoPixelMode["DotStar"] = 4] = "DotStar";
    })(NeoPixelMode = pxsim.NeoPixelMode || (pxsim.NeoPixelMode = {}));
    class CommonNeoPixelState {
        constructor() {
            this.mode = NeoPixelMode.RGB; // GRB
            this.width = 1;
        }
        get length() {
            return this.buffer ? (this.buffer.length / this.stride) | 0 : 0;
        }
        get stride() {
            return this.mode == NeoPixelMode.RGBW || this.mode == NeoPixelMode.DotStar ? 4 : 3;
        }
        pixelColor(pixel) {
            const offset = pixel * this.stride;
            // RBG
            switch (this.mode) {
                case NeoPixelMode.RGBW:
                    return [this.buffer[offset + 1], this.buffer[offset], this.buffer[offset + 2], this.buffer[offset + 3]];
                case NeoPixelMode.RGB_RGB:
                    return [this.buffer[offset], this.buffer[offset + 1], this.buffer[offset + 2]];
                case NeoPixelMode.DotStar:
                    return [this.buffer[offset + 3], this.buffer[offset + 2], this.buffer[offset + 1]];
                default:
                    return [this.buffer[offset + 1], this.buffer[offset + 0], this.buffer[offset + 2]];
            }
        }
    }
    pxsim.CommonNeoPixelState = CommonNeoPixelState;
    function neopixelState(pinId) {
        return pxsim.board().neopixelState(pinId);
    }
    pxsim.neopixelState = neopixelState;
    function sendBufferAsm(buffer, pin) {
        const b = pxsim.board();
        if (!b)
            return;
        const p = b.edgeConnectorState.getPin(pin);
        if (!p)
            return;
        const lp = neopixelState(p.id);
        if (!lp)
            return;
        const mode = lp.mode;
        pxsim.light.sendBuffer(p, undefined, mode, buffer);
    }
    pxsim.sendBufferAsm = sendBufferAsm;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var light;
    (function (light) {
        // Currently only modifies the builtin pixels
        function sendBuffer(pin, clk, mode, b) {
            const state = pxsim.neopixelState(pin.id);
            if (!state)
                return;
            state.mode = mode & 0xff;
            state.buffer = b.data;
            pxsim.runtime.queueDisplayUpdate();
        }
        light.sendBuffer = sendBuffer;
    })(light = pxsim.light || (pxsim.light = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var visuals;
    (function (visuals) {
        const PIXEL_SPACING = visuals.PIN_DIST * 2.5; // 3
        const PIXEL_RADIUS = visuals.PIN_DIST;
        const CANVAS_WIDTH = 1.2 * visuals.PIN_DIST;
        const CANVAS_HEIGHT = 12 * visuals.PIN_DIST;
        const CANVAS_VIEW_PADDING = visuals.PIN_DIST * 4;
        const CANVAS_LEFT = 1.4 * visuals.PIN_DIST;
        const CANVAS_TOP = visuals.PIN_DIST;
        // For the instructions parts list
        function mkNeoPixelPart(xy = [0, 0]) {
            const NP_PART_XOFF = -13.5;
            const NP_PART_YOFF = -11;
            const NP_PART_WIDTH = 87.5;
            const NP_PART_HEIGHT = 190;
            const NEOPIXEL_PART_IMG = `<svg viewBox="-5 -1 53 112" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
  <rect x="2.5" width="38" height="100" style="fill: rgb(68, 68, 68);"/>
  <rect x="11.748" y="3.2" width="1.391" height="2.553" style="fill: none; stroke-linejoin: round; stroke-width: 3; stroke: rgb(165, 103, 52);"/>
  <rect x="20.75" y="3.2" width="1.391" height="2.553" style="fill: none; stroke-linejoin: round; stroke-width: 3; stroke: rgb(165, 103, 52);"/>
  <rect x="29.75" y="3.2" width="1.391" height="2.553" style="fill: none; stroke-linejoin: round; stroke-width: 3; stroke: rgb(165, 103, 52);"/>
  <g>
    <rect x="9" y="16.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="22.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="28.563" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="11.607" y="14.833" width="19.787" height="18.697" style="fill: rgb(0, 0, 0);"/>
    <ellipse style="fill: rgb(216, 216, 216);" cx="21.5" cy="24.181" rx="7" ry="7"/>
  </g>
  <path d="M -7.25 -103.2 L -2.5 -100.003 L -12 -100.003 L -7.25 -103.2 Z" style="fill: rgb(68, 68, 68);" transform="matrix(-1, 0, 0, -1, 0, 0)" bx:shape="triangle -12 -103.2 9.5 3.197 0.5 0 1@ad6f5cac"/>
  <path d="M -16.75 -103.197 L -12 -100 L -21.5 -100 L -16.75 -103.197 Z" style="fill: rgb(68, 68, 68);" transform="matrix(-1, 0, 0, -1, 0, 0)" bx:shape="triangle -21.5 -103.197 9.5 3.197 0.5 0 1@07d73149"/>
  <path d="M -26.25 -103.2 L -21.5 -100.003 L -31 -100.003 L -26.25 -103.2 Z" style="fill: rgb(68, 68, 68);" transform="matrix(-1, 0, 0, -1, 0, 0)" bx:shape="triangle -31 -103.2 9.5 3.197 0.5 0 1@54403e2d"/>
  <path d="M -35.75 -103.197 L -31 -100 L -40.5 -100 L -35.75 -103.197 Z" style="fill: rgb(68, 68, 68);" transform="matrix(-1, 0, 0, -1, 0, 0)" bx:shape="triangle -40.5 -103.197 9.5 3.197 0.5 0 1@21c9b772"/>
  <g transform="matrix(1, 0, 0, 1, 0.000002, 29.999994)">
    <rect x="9" y="16.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="22.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="28.563" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="11.607" y="14.833" width="19.787" height="18.697" style="fill: rgb(0, 0, 0);"/>
    <ellipse style="fill: rgb(216, 216, 216);" cx="21.5" cy="24.181" rx="7" ry="7"/>
  </g>
  <g transform="matrix(1, 0, 0, 1, 0.000005, 59.999992)">
    <rect x="9" y="16.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="22.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="28.563" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="11.607" y="14.833" width="19.787" height="18.697" style="fill: rgb(0, 0, 0);"/>
    <ellipse style="fill: rgb(216, 216, 216);" cx="21.5" cy="24.181" rx="7" ry="7"/>
  </g>
</svg>`;
            let [x, y] = xy;
            let l = x + NP_PART_XOFF;
            let t = y + NP_PART_YOFF;
            let w = NP_PART_WIDTH;
            let h = NP_PART_HEIGHT;
            let img = pxsim.svg.elt("image");
            pxsim.svg.hydrate(img, {
                class: "sim-neopixel-strip", x: l, y: t, width: w, height: h,
                href: pxsim.svg.toDataUri(NEOPIXEL_PART_IMG)
            });
            return { el: img, x: l, y: t, w: w, h: h };
        }
        visuals.mkNeoPixelPart = mkNeoPixelPart;
        class NeoPixel {
            constructor(xy = [0, 0], width = 1) {
                let el = pxsim.svg.elt("rect");
                let r = PIXEL_RADIUS;
                let [cx, cy] = xy;
                let y = cy - r;
                if (width <= 1)
                    pxsim.svg.hydrate(el, { x: "-50%", y: y, width: "100%", height: r * 2, class: "sim-neopixel" });
                else {
                    let x = cx - r;
                    pxsim.svg.hydrate(el, { x: x, y: y, width: r * 2, height: r * 2, class: "sim-neopixel" });
                }
                this.el = el;
                this.cy = cy;
            }
            setRgb(rgb) {
                let hsl = visuals.rgbToHsl(rgb);
                let [h, s, l] = hsl;
                // at least 70% luminosity
                l = Math.max(l, 60);
                let fill = `hsl(${h}, ${s}%, ${l}%)`;
                this.el.setAttribute("fill", fill);
            }
        }
        visuals.NeoPixel = NeoPixel;
        class NeoPixelCanvas {
            constructor(pin, cols = 1) {
                this.cols = cols;
                this.pixels = [];
                let el = pxsim.svg.elt("svg");
                pxsim.svg.hydrate(el, {
                    "class": `sim-neopixel-canvas`,
                    "x": "0px",
                    "y": "0px",
                    "width": `${CANVAS_WIDTH}px`,
                    "height": `${CANVAS_HEIGHT}px`,
                });
                this.canvas = el;
                this.background = pxsim.svg.child(el, "rect", { class: "sim-neopixel-background hidden" });
                this.updateViewBox(-CANVAS_WIDTH / 2, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }
            updateViewBox(x, y, w, h) {
                this.viewBox = [x, y, w, h];
                pxsim.svg.hydrate(this.canvas, { "viewBox": `${x} ${y} ${w} ${h}` });
                pxsim.svg.hydrate(this.background, { "x": x, "y": y, "width": w, "height": h });
            }
            update(colors) {
                if (!colors || colors.length <= 0)
                    return;
                if (this.pixels.length == 0 && this.cols > 1) {
                    // first time, so redo width of canvas
                    let rows = Math.ceil(colors.length / this.cols);
                    let rt = CANVAS_HEIGHT / rows;
                    let width = this.cols * rt;
                    this.canvas.setAttributeNS(null, "width", `${width}px`);
                    this.updateViewBox(0, 0, width, CANVAS_HEIGHT);
                }
                for (let i = 0; i < colors.length; i++) {
                    let pixel = this.pixels[i];
                    if (!pixel) {
                        let cxy = [0, CANVAS_VIEW_PADDING + i * PIXEL_SPACING];
                        if (this.cols > 1) {
                            const row = Math.floor(i / this.cols);
                            const col = i - row * this.cols;
                            cxy = [(col + 1) * PIXEL_SPACING, (row + 1) * PIXEL_SPACING];
                        }
                        pixel = this.pixels[i] = new NeoPixel(cxy, this.cols);
                        pxsim.svg.hydrate(pixel.el, { title: `offset: ${i}` });
                        this.canvas.appendChild(pixel.el);
                    }
                    pixel.setRgb(colors[i]);
                }
                //show the canvas if it's hidden
                pxsim.U.removeClass(this.background, "hidden");
                // resize
                let [first, last] = [this.pixels[0], this.pixels[this.pixels.length - 1]];
                let yDiff = last.cy - first.cy;
                let newH = yDiff + CANVAS_VIEW_PADDING * 2;
                let [oldX, oldY, oldW, oldH] = this.viewBox;
                if (newH > oldH) {
                    let scalar = newH / oldH;
                    let newW = oldW * scalar;
                    if (this.cols > 1) {
                        // different computation for matrix
                        let rows = Math.ceil(colors.length / this.cols);
                        newH = PIXEL_SPACING * (rows + 1);
                        newW = PIXEL_SPACING * (this.cols + 1);
                        this.updateViewBox(0, oldY, newW, newH);
                    }
                    else
                        this.updateViewBox(-newW / 2, oldY, newW, newH);
                }
            }
            setLoc(xy) {
                let [x, y] = xy;
                pxsim.svg.hydrate(this.canvas, { x: x, y: y });
            }
        }
        visuals.NeoPixelCanvas = NeoPixelCanvas;
        ;
        class NeoPixelView {
            constructor(parsePinString) {
                this.parsePinString = parsePinString;
                this.style = `
            .sim-neopixel-canvas {
            }
            .sim-neopixel-canvas-parent:hover {
                transform-origin: center;
                transform: scale(4) translateY(-220px);
                -moz-transform: scale(4) translateY(-220px);
            }
            .sim-neopixel-canvas .hidden {
                visibility:hidden;
            }
            .sim-neopixel-background {
                fill: rgba(255,255,255,0.9);
            }
            .sim-neopixel-strip {
            }
        `;
            }
            init(bus, state, svgEl, otherParams) {
                this.stripGroup = pxsim.svg.elt("g");
                this.element = this.stripGroup;
                this.pin = this.parsePinString(otherParams["dataPin"] || otherParams["pin"])
                    || this.parsePinString("pins.NEOPIXEL")
                    || this.parsePinString("pins.MOSI");
                this.lastLocation = [0, 0];
                this.state = state(this.pin);
                let part = mkNeoPixelPart();
                this.part = part;
                this.stripGroup.appendChild(part.el);
                this.overElement = null;
                this.makeCanvas();
            }
            makeCanvas() {
                let canvas = new NeoPixelCanvas(this.pin.id, this.state.width);
                if (this.overElement) {
                    this.overElement.removeChild(this.canvas.canvas);
                    this.overElement.appendChild(canvas.canvas);
                }
                else {
                    let canvasG = pxsim.svg.elt("g", { class: "sim-neopixel-canvas-parent" });
                    canvasG.appendChild(canvas.canvas);
                    this.overElement = canvasG;
                }
                this.canvas = canvas;
                this.updateStripLoc();
            }
            moveToCoord(xy) {
                let [x, y] = xy;
                let loc = [x, y];
                this.lastLocation = loc;
                this.updateStripLoc();
            }
            updateStripLoc() {
                let [x, y] = this.lastLocation;
                pxsim.U.assert(typeof x === "number" && typeof y === "number", "invalid x,y for NeoPixel strip");
                this.canvas.setLoc([x + CANVAS_LEFT, y + CANVAS_TOP]);
                pxsim.svg.hydrate(this.part.el, { transform: `translate(${x} ${y})` }); //TODO: update part's l,h, etc.
            }
            updateState() {
                if (this.state.width != this.canvas.cols) {
                    this.makeCanvas();
                }
                let colors = [];
                for (let i = 0; i < this.state.length; i++) {
                    colors.push(this.state.pixelColor(i));
                }
                this.canvas.update(colors);
            }
            updateTheme() { }
        }
        visuals.NeoPixelView = NeoPixelView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var radio;
    (function (radio) {
        function raiseEvent(id, eventid) {
            const state = pxsim.getRadioState();
            state.raiseEvent(id, eventid);
        }
        radio.raiseEvent = raiseEvent;
        function setGroup(id) {
            const state = pxsim.getRadioState();
            state.setGroup(id);
        }
        radio.setGroup = setGroup;
        function setTransmitPower(power) {
            const state = pxsim.getRadioState();
            state.setTransmitPower(power);
        }
        radio.setTransmitPower = setTransmitPower;
        function setFrequencyBand(band) {
            const state = pxsim.getRadioState();
            state.setFrequencyBand(band);
        }
        radio.setFrequencyBand = setFrequencyBand;
        function sendRawPacket(buf) {
            let cb = pxsim.getResume();
            const state = pxsim.getRadioState();
            if (state.enable) {
                state.datagram.send({
                    type: 0,
                    groupId: state.groupId,
                    bufferData: buf.data
                });
            }
            setTimeout(cb, 1);
        }
        radio.sendRawPacket = sendRawPacket;
        function readRawPacket() {
            const state = pxsim.getRadioState();
            const packet = state.datagram.recv();
            const buf = packet.payload.bufferData;
            const n = buf.length;
            if (!n)
                return undefined;
            const rbuf = pxsim.BufferMethods.createBuffer(n + 4);
            for (let i = 0; i < buf.length; ++i)
                rbuf.data[i] = buf[i];
            // append RSSI
            pxsim.BufferMethods.setNumber(rbuf, pxsim.BufferMethods.NumberFormat.Int32LE, n, packet.rssi);
            return rbuf;
        }
        radio.readRawPacket = readRawPacket;
        function onDataReceived(handler) {
            const state = pxsim.getRadioState();
            state.datagram.onReceived(handler);
        }
        radio.onDataReceived = onDataReceived;
        function off() {
            const state = pxsim.getRadioState();
            state.off();
        }
        radio.off = off;
        function on() {
            const state = pxsim.getRadioState();
            state.on();
        }
        radio.on = on;
    })(radio = pxsim.radio || (pxsim.radio = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function getRadioState() {
        return pxsim.board().radioState;
    }
    pxsim.getRadioState = getRadioState;
    class RadioDatagram {
        constructor(runtime, dal) {
            this.runtime = runtime;
            this.dal = dal;
            this.datagram = [];
            this.lastReceived = RadioDatagram.defaultPacket();
            this._rssi = undefined; // not set yet
        }
        get rssi() {
            return this._rssi;
        }
        set rssi(value) {
            this._rssi = value | 0;
        }
        queue(packet) {
            if (this.datagram.length < 4)
                this.datagram.push(packet);
            pxsim.runtime.board.bus.queue(this.dal.ID_RADIO, this.dal.RADIO_EVT_DATAGRAM);
        }
        send(payload) {
            const state = getRadioState();
            pxsim.Runtime.postMessage({
                type: "radiopacket",
                broadcast: true,
                rssi: this._rssi || -75,
                serial: state.transmitSerialNumber ? pxsim.control.deviceSerialNumber() : 0,
                time: new Date().getTime(),
                payload
            });
        }
        recv() {
            let r = this.datagram.shift();
            if (!r)
                r = RadioDatagram.defaultPacket();
            return this.lastReceived = r;
        }
        onReceived(handler) {
            pxsim.pxtcore.registerWithDal(this.dal.ID_RADIO, this.dal.RADIO_EVT_DATAGRAM, handler);
            this.recv();
        }
        static defaultPacket() {
            return {
                rssi: -1,
                serial: 0,
                time: 0,
                payload: { type: -1, groupId: 0, bufferData: new Uint8Array(0) }
            };
        }
    }
    pxsim.RadioDatagram = RadioDatagram;
    class RadioState {
        constructor(runtime, board, dal) {
            this.runtime = runtime;
            this.board = board;
            this.power = 0;
            this.transmitSerialNumber = false;
            this.datagram = new RadioDatagram(runtime, dal);
            this.power = 6; // default value
            this.groupId = 0;
            this.band = 7; // https://github.com/lancaster-university/microbit-dal/blob/master/inc/core/MicroBitConfig.h#L320
            this.enable = true;
            this.board.addMessageListener(this.handleMessage.bind(this));
        }
        handleMessage(msg) {
            if (msg.type == "radiopacket") {
                let packet = msg;
                this.receivePacket(packet);
            }
        }
        setGroup(id) {
            if (this.enable) {
                this.groupId = id & 0xff; // byte only
            }
        }
        setTransmitPower(power) {
            if (this.enable) {
                power = power | 0;
                this.power = Math.max(0, Math.min(7, power));
            }
        }
        setTransmitSerialNumber(sn) {
            this.transmitSerialNumber = !!sn;
        }
        setFrequencyBand(band) {
            if (this.enable) {
                band = band | 0;
                if (band < 0 || band > 83)
                    return;
                this.band = band;
            }
        }
        off() {
            this.enable = false;
        }
        on() {
            this.enable = true;
        }
        raiseEvent(id, eventid) {
            if (this.enable) {
                pxsim.Runtime.postMessage({
                    type: "eventbus",
                    broadcast: true,
                    id,
                    eventid,
                    power: this.power,
                    group: this.groupId
                });
            }
        }
        receivePacket(packet) {
            if (this.enable) {
                if (this.groupId == packet.payload.groupId) {
                    this.datagram.queue(packet);
                }
            }
        }
    }
    pxsim.RadioState = RadioState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var settings;
    (function (settings) {
        let currSize = 0;
        const MAX_SIZE = 16 * 1024;
        function encodeKey(key) {
            return "S/" + key;
        }
        function allKeys() {
            const pref = encodeKey("");
            const st = pxsim.board().storedState;
            return Object.keys(st).filter(k => k.slice(0, pref.length) == pref);
        }
        function userKeys() {
            return allKeys().filter(s => s[2] != "#");
        }
        function computeSize() {
            let sz = 0;
            const storage = pxsim.board().storedState;
            for (let k of allKeys()) {
                sz += k.length + storage[k].length;
            }
            currSize = sz;
        }
        function _set(key, buf) {
            key = encodeKey(key);
            const storage = pxsim.board().storedState;
            const prev = storage[key];
            const val = btoa(pxsim.U.uint8ArrayToString(buf.data));
            const newSize = prev == null
                ? currSize + key.length + val.length
                : currSize + val.length - prev.length;
            if (newSize > MAX_SIZE)
                return -1;
            pxsim.board().setStoredState(key, val);
            currSize = newSize;
            return 0;
        }
        settings._set = _set;
        function _remove(key) {
            key = encodeKey(key);
            const storage = pxsim.board().storedState;
            if (storage[key] == null)
                return -1;
            currSize -= key.length + storage[key].length;
            pxsim.board().setStoredState(key, null);
            return 0;
        }
        settings._remove = _remove;
        function _exists(key) {
            return _get(key) != undefined;
        }
        settings._exists = _exists;
        function _get(key) {
            key = encodeKey(key);
            const storage = pxsim.board().storedState;
            const val = storage[key];
            if (val == null)
                return undefined;
            return new pxsim.RefBuffer(pxsim.U.stringToUint8Array(atob(val)));
        }
        settings._get = _get;
        function _userClean() {
            for (let k of userKeys())
                pxsim.board().setStoredState(k, null);
            computeSize();
            // if system keys take more than 25% of space, delete everything
            if (currSize > MAX_SIZE / 4) {
                for (let k of allKeys())
                    pxsim.board().setStoredState(k, null);
                computeSize();
            }
        }
        settings._userClean = _userClean;
        function _list(prefix) {
            const r = new pxsim.RefCollection();
            const emptyPref = encodeKey("");
            for (let k of prefix[0] == "#" ? allKeys() : userKeys()) {
                const n = k.slice(emptyPref.length);
                if (n.slice(0, prefix.length) != prefix)
                    continue;
                r.push(n);
            }
            return r;
        }
        settings._list = _list;
    })(settings = pxsim.settings || (pxsim.settings = {}));
})(pxsim || (pxsim = {}));

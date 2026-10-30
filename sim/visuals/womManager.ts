namespace pxsim.visuals {
    /**
     * Distinct high-contrast wire color for every micro:bit signal pin (P0..P20).
     * Power (+3v3/VCC) and Ground (GND) wires are intentionally never drawn.
     */
    export const PIN_WIRE_COLORS: { [pinName: string]: string } = {
        P0:  "#ef4444", // Red
        P1:  "#f97316", // Orange
        P2:  "#eab308", // Yellow
        P3:  "#84cc16", // Lime
        P4:  "#22c55e", // Green
        P5:  "#10b981", // Emerald
        P6:  "#14b8a6", // Teal
        P7:  "#06b6d4", // Cyan
        P8:  "#0ea5e9", // Sky Blue
        P9:  "#3b82f6", // Blue
        P10: "#6366f1", // Indigo
        P11: "#8b5cf6", // Violet
        P12: "#a855f7", // Purple
        P13: "#d946ef", // Fuchsia
        P14: "#ec4899", // Pink
        P15: "#f43f5e", // Rose
        P16: "#fb923c", // Amber
        P17: "#a3e635", // Chartreuse
        P18: "#2dd4bf", // Aqua
        P19: "#38bdf8", // Light Blue (I2C SCL)
        P20: "#c084fc"  // Lavender (I2C SDA)
    };

    export function getPinWireColor(pinName: string): string {
        return PIN_WIRE_COLORS[pinName] || "#38bdf8";
    }

    export interface WomWirePad {
        /** Label on module for signal pad, e.g. "OUT", "Trig", "Echo", "SCL", "SDA" */
        label: string;
        /** Target signal pin on micro:bit edge connector: "P0".."P20" (GND/3v3 are not drawn) */
        targetPin: string;
        /** Local X coordinate inside the module's <g> container */
        x: number;
        /** Local Y coordinate inside the module's <g> container */
        y: number;
        /** Optional wire color override (defaults to PIN_WIRE_COLORS[targetPin]) */
        color?: string;
    }

    export interface IWomModule {
        readonly moduleType: string;
        readonly displayName: string;
        readonly pinKey: string;
        readonly pins: string[];
        readonly colSpan: 1 | 2;
        readonly rowSpan: 1 | 2;
        readonly element: SVGGElement;
        /** Return signal wire pads in local module coordinates */
        getWirePads(): WomWirePad[];
        /** Called whenever board state updates or dmesg arrives */
        updateState?(): void;
    }

    export type WomModuleFactory = (pins: string[], args: string[]) => IWomModule;
    export type WomDmesgHandler = (b: DalBoard, args: string[]) => void;

    export interface WomI2cHandler {
        onWrite?(b: DalBoard, address: number, buf: RefBuffer, repeat?: boolean): void;
        onRead?(b: DalBoard, address: number, size: number, repeat?: boolean): RefBuffer | undefined;
    }

    /**
     * Port enum decoder for ModuleWorld_Digital.mwDigitalNum (1..10)
     * in libs/Module-World/Module-World.ts
     */
    export function decodeDigitalPort(val: number): string[] {
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

    /**
     * Port enum decoder for ModuleWorld_Analog.mwAnalogNum (1..3)
     */
    export function decodeAnalogPort(val: number): string[] {
        const map: { [k: number]: string[] } = {
            1: ["P0", "P1"],
            2: ["P2", "P3"],
            3: ["P3", "P4"]
        };
        return map[val] || ["P0", "P1"];
    }

    /**
     * Port enum decoder for ModuleWorld_PWM.mwServoNum (1..4)
     * 1: P1, 2: P4, 3: P2, 4: P10
     */
    export function decodeServoPort(val: number): string[] {
        const map: { [k: number]: string[] } = {
            1: ["P1"],
            2: ["P4"],
            3: ["P2"],
            4: ["P10"]
        };
        return map[val] || ["P1"];
    }

    /**
     * Convert a micro:bit pin name ("P0".."P20") to its DAL pin ID (MICROBIT_ID_IO_P0 = 7 .. P20 = 27)
     */
    export function pinNameToId(pinName: string): number {
        const idx = parseInt(pinName.replace(/^P/, ""), 10);
        if (!isNaN(idx) && idx >= 0 && idx <= 20) {
            return DAL.MICROBIT_ID_IO_P0 + idx;
        }
        return -1;
    }

    export function getPinInstance(pinName: string): Pin | undefined {
        const b = board();
        if (!b || !b.edgeConnectorState) return undefined;
        const id = pinNameToId(pinName);
        return b.edgeConnectorState.getPin(id) || undefined;
    }

    /** Pins shared with micro:bit V2 LED matrix columns/rows and photosensitive sensor */
    export const LED_SHARED_PINS: string[] = ["P3", "P4", "P6", "P7", "P9", "P10"];

    export interface WomModuleOptions {
        moduleType: string;
        displayName: string;
        pins: string[];
        colSpan?: 1 | 2;
        rowSpan?: 1 | 2;
        /** Optional sprite URL, e.g. "/sim/sprites/wom_ir.png" */
        sprite?: string;
        /** Custom sprite bounds inside the module cell (defaults to centered automatic layout) */
        spriteBounds?: { x: number; y: number; width: number; height: number };
        /** Which edge of the module the signal wire pad(s) sit on (default: "top") */
        padEdge?: "top" | "bottom" | "left" | "right";
        /** Signal pins that should have wires drawn to the micro:bit (default: [pins[0]]) */
        wiredPins?: string[];
        /** Draw a dark rounded card background behind the module (default: true for 2x1, false for 1x1 sprite) */
        showCardBackground?: boolean;
    }

    /**
     * Universal base class for 1x1, 2x1, and 1x2 WoM simulator modules.
     * Handles sprite rendering, wire pad generation with per-pin colors, status badges,
     * interactive overlays, and pin state synchronization.
     */
    export abstract class WomModuleBase implements IWomModule {
        public readonly moduleType: string;
        public readonly displayName: string;
        public readonly pinKey: string;
        public readonly pins: string[];
        public readonly colSpan: 1 | 2;
        public readonly rowSpan: 1 | 2;
        public readonly element: SVGGElement;

        protected readonly width: number;
        protected readonly height: number;
        protected readonly padEdge: "top" | "bottom" | "left" | "right";
        protected readonly wiredPins: string[];
        protected spriteEl: SVGImageElement | null = null;
        protected overlayGroup: SVGGElement;
        protected statusText: SVGTextElement;

        constructor(opts: WomModuleOptions) {
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

            this.element = <SVGGElement>svg.elt("g", {
                class: `wom-module wom-${this.moduleType}`
            });

            const showBg = opts.showCardBackground !== undefined
                ? opts.showCardBackground
                : (this.colSpan > 1 || !opts.sprite);

            if (showBg) {
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
            }

            if (opts.sprite) {
                const b = opts.spriteBounds || this.getDefaultSpriteBounds();
                this.spriteEl = <SVGImageElement>svg.child(this.element, "image", {
                    x: b.x,
                    y: b.y,
                    width: b.width,
                    height: b.height
                });
                this.spriteEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", opts.sprite);
                this.spriteEl.setAttribute("href", opts.sprite);
            }

            this.overlayGroup = <SVGGElement>svg.child(this.element, "g", {
                class: "wom-overlay-layer"
            });

            this.statusText = <SVGTextElement>svg.child(this.element, "text", {
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

        private getDefaultSpriteBounds(): { x: number; y: number; width: number; height: number } {
            if (this.colSpan === 2 && this.rowSpan === 1) {
                return { x: 8, y: 6, width: 156, height: 108 };
            }
            if (this.colSpan === 1 && this.rowSpan === 2) {
                return { x: 6, y: 6, width: 136, height: 286 };
            }
            return { x: 6, y: 4, width: 136, height: 136 };
        }

        /** Update the module's bottom label badge */
        protected setBadgeText(status?: string, color: string = "#64748b"): void {
            if (!this.statusText) return;
            const portStr = this.pins.join("");
            this.statusText.textContent = status
                ? `${this.displayName} (${portStr}): ${status}`
                : `${this.displayName} (${portStr})`;
            this.statusText.setAttribute("fill", color);
        }

        /** Add a semi-transparent colored circle indicator over the module */
        protected addCircleOverlay(
            cx: number = this.width / 2,
            cy: number = (this.height - 12) / 2,
            r: number = 46,
            fill: string = "#ef4444",
            fillOpacity: number = 0.4
        ): SVGCircleElement {
            return <SVGCircleElement>svg.child(this.overlayGroup, "circle", {
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
        protected addSvgOverlay(
            href: string,
            x: number,
            y: number,
            width: number,
            height: number
        ): { group: SVGGElement; image: SVGImageElement } {
            const group = <SVGGElement>svg.child(this.overlayGroup, "g", {
                transform: `translate(${x}, ${y})`
            });
            const image = <SVGImageElement>svg.child(group, "image", {
                x: 0,
                y: 0,
                width,
                height
            });
            image.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);
            image.setAttribute("href", href);
            return { group, image };
        }

        /**
         * Add an HTML control container inside a <foreignObject> that automatically
         * stops pointer/mouse/touch event propagation so sliders/inputs work smoothly.
         */
        protected addControlForeignObject(
            x: number,
            y: number,
            width: number,
            height: number
        ): { fo: SVGForeignObjectElement; container: HTMLDivElement } {
            const fo = <SVGForeignObjectElement>svg.child(this.overlayGroup, "foreignObject", {
                x,
                y,
                width,
                height
            });
            const container = document.createElement("div");
            container.style.cssText =
                "color:#f8fafc;font-family:sans-serif;font-size:11px;display:flex;flex-direction:column;gap:4px;padding:2px;user-select:none;";
            const stopProp = (e: Event) => e.stopPropagation();
            ["pointerdown", "mousedown", "touchstart"].forEach(ev =>
                container.addEventListener(ev, stopProp)
            );
            fo.appendChild(container);
            return { fo, container };
        }

        /** Bind mouse/pointer hover events on the module */
        protected bindHover(onChange: (hovering: boolean) => void): void {
            this.element.style.cursor = "pointer";
            let isHovering = false;
            const handle = (next: boolean) => {
                if (isHovering === next) return;
                isHovering = next;
                onChange(next);
                if (typeof runtime !== "undefined" && runtime) {
                    runtime.queueDisplayUpdate();
                }
            };
            this.element.addEventListener("mouseenter", () => handle(true));
            this.element.addEventListener("mouseleave", () => handle(false));
            this.element.addEventListener("pointerenter", () => handle(true));
            this.element.addEventListener("pointerleave", () => handle(false));
        }

        /** Bind press-and-hold events on the module or a specific sub-element */
        protected bindPress(
            target: SVGElement | HTMLElement = this.element,
            onChange: (pressed: boolean) => void
        ): void {
            target.style.cursor = "pointer";
            let isPressed = false;
            const handle = (next: boolean) => {
                if (isPressed === next) return;
                isPressed = next;
                onChange(next);
                if (typeof runtime !== "undefined" && runtime) {
                    runtime.queueDisplayUpdate();
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
        protected setDigitalInput(pinName: string, value: number): void {
            const pin = getPinInstance(pinName);
            if (!pin) return;
            (pin as any).womDigitalValue = value;
            pin.value = value > 0 ? 1023 : 0;
        }

        /** Set simulated analog input value (0..1023) on a pin */
        protected setAnalogInput(pinName: string, value: number): void {
            const pin = getPinInstance(pinName);
            if (!pin) return;
            const clamped = Math.max(0, Math.min(1023, Math.round(value)));
            (pin as any).womAnalogValue = clamped;
            pin.value = clamped;
        }

        /** Set simulated pulseIn duration in microseconds on a pin (e.g. distanceCm * 58 for Ultrasonic) */
        protected setPulseMicros(pinName: string, micros: number): void {
            const pin = getPinInstance(pinName);
            if (!pin) return;
            (pin as any).womPulseMicros = Math.max(0, Math.round(micros));
        }

        /**
         * Automatically generates signal wire pads (excluding GND and 3v3) along `padEdge`,
         * each colored with its pin's unique color from PIN_WIRE_COLORS.
         * Subclasses may override this if custom pad coordinates are desired.
         */
        public getWirePads(): WomWirePad[] {
            const count = this.wiredPins.length;
            return this.wiredPins.map((pinName, idx) => {
                const offset = (idx - (count - 1) / 2) * 12;
                let x = this.width / 2 + offset;
                let y = 26;
                if (this.padEdge === "bottom") {
                    x = this.width / 2 + offset;
                    y = this.height - 24;
                } else if (this.padEdge === "left") {
                    x = 24;
                    y = this.height / 2 + offset;
                } else if (this.padEdge === "right") {
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

        public updateState(): void {
            // Optional hook for subclasses
        }
    }

    export class WomModuleManager {
        private static factories: { [moduleType: string]: WomModuleFactory } = {};
        private static dmesgHandlers: { [moduleType: string]: WomDmesgHandler } = {};
        private static i2cHandlers: { [address: number]: WomI2cHandler } = {};

        public static registerFactory(
            moduleType: string,
            factory: WomModuleFactory,
            dmesgHandler?: WomDmesgHandler
        ) {
            WomModuleManager.factories[moduleType] = factory;
            if (dmesgHandler) {
                WomModuleManager.dmesgHandlers[moduleType] = dmesgHandler;
            }
        }

        public static registerI2cHandler(addresses: number[], handler: WomI2cHandler) {
            for (const addr of addresses) {
                WomModuleManager.i2cHandlers[addr] = handler;
            }
        }

        /**
         * Default LED state before led.enable is called.
         * micro:bit V2 hardware enables the LED screen by default (true).
         * If false, LED conflict is only flagged when photosensitive or LED showing modes are active.
         */
        public static defaultLedState: boolean = true;

        public static isLedShowing(ledState?: LedMatrixState): boolean {
            if (!ledState) return false;
            if (ledState.disabled === true) return false;
            if ((ledState as any)._hasActiveDisplay) return true;
            if (ledState.image && ledState.image.data) {
                for (let i = 0; i < ledState.image.data.length; i++) {
                    if (ledState.image.data[i] > 0) return true;
                }
            }
            if (
                ledState.animationQ &&
                (ledState.animationQ as any).queue &&
                (ledState.animationQ as any).queue.length > 0
            ) {
                return true;
            }
            return false;
        }

        public static isPhotosensitiveActive(lightState?: LightSensorState): boolean {
            return !!(lightState && lightState.usesLightLevel);
        }

        public static isLedConflictActive(b?: DalBoard): boolean {
            const boardInst = b || board();
            if (!boardInst || !boardInst.ledMatrixState) return false;

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
            } else {
                return isPhotosensitive || isShowing;
            }
        }

        /**
         * Initialize WoM support on a DalBoard instance.
         * Called from DalBoard.initAsync(this) in sim/dalboard.ts.
         */
        public static initBoard(b: DalBoard): WomModuleManager {
            WomModuleManager.installHooks();
            let mgr = (b as any).womManager as WomModuleManager;
            if (!mgr) {
                mgr = new WomModuleManager(b);
                (b as any).womManager = mgr;
                b.updateSubscribers.push(() => mgr.updateAllModules());
            }
            return mgr;
        }

        public static get(b?: DalBoard): WomModuleManager | undefined {
            const target = b || board();
            if (!target) return undefined;
            if (!(target as any).womManager) {
                return WomModuleManager.initBoard(target);
            }
            return (target as any).womManager;
        }

        /**
         * Install runtime hooks on pxsim.control and pxsim.pins without modifying sim/state/* files.
         * Uses `_womHook` markers on the wrapped functions so hooks survive script load order.
         */
        public static installHooks() {
            if (typeof pxsim === "undefined") return;

            // 1. Hook pxsim.control.dmesg
            if (pxsim.control && (!(pxsim.control as any).dmesg || !(pxsim.control as any).dmesg._womHook)) {
                const origDmesg = (pxsim.control as any).dmesg;
                const hookedDmesg = function (msg: string) {
                    if (msg && msg.indexOf("wom:") === 0) {
                        WomModuleManager.handleDmesg(msg);
                        return;
                    }
                    if (origDmesg) {
                        origDmesg.call(pxsim.control, msg);
                    }
                };
                (hookedDmesg as any)._womHook = true;
                (pxsim.control as any).dmesg = hookedDmesg;
            }

            // 2. Hook pxsim.pins.digitalReadPin (checks pin.womDigitalValue first)
            if (pxsim.pins && (!(pxsim.pins as any).digitalReadPin || !(pxsim.pins as any).digitalReadPin._womHook)) {
                const origDigitalRead = pxsim.pins.digitalReadPin;
                const hookedDigitalRead = function (pinId: number): number {
                    const pin = getPin(pinId);
                    if (pin && (pin as any).womDigitalValue !== undefined) {
                        pin.mode = PinFlags.Digital | PinFlags.Input;
                        return (pin as any).womDigitalValue;
                    }
                    return origDigitalRead ? origDigitalRead.call(pxsim.pins, pinId) : 0;
                };
                (hookedDigitalRead as any)._womHook = true;
                pxsim.pins.digitalReadPin = hookedDigitalRead;
            }

            // 3. Hook pxsim.pins.analogReadPin (checks pin.womAnalogValue first)
            if (pxsim.pins && (!(pxsim.pins as any).analogReadPin || !(pxsim.pins as any).analogReadPin._womHook)) {
                const origAnalogRead = pxsim.pins.analogReadPin;
                const hookedAnalogRead = function (pinId: number): number {
                    const pin = getPin(pinId);
                    if (pin && (pin as any).womAnalogValue !== undefined) {
                        pin.mode = PinFlags.Analog | PinFlags.Input;
                        return (pin as any).womAnalogValue;
                    }
                    return origAnalogRead ? origAnalogRead.call(pxsim.pins, pinId) : 0;
                };
                (hookedAnalogRead as any)._womHook = true;
                pxsim.pins.analogReadPin = hookedAnalogRead;
            }

            // 4. Hook pxsim.pins.pulseIn (checks pin.womPulseMicros first)
            if (pxsim.pins && (!(pxsim.pins as any).pulseIn || !(pxsim.pins as any).pulseIn._womHook)) {
                const origPulseIn = pxsim.pins.pulseIn;
                const hookedPulseIn = function (name: number, value: number, maxDuration: number): number {
                    const pin = getPin(name);
                    if (pin && (pin as any).womPulseMicros !== undefined) {
                        return (pin as any).womPulseMicros;
                    }
                    return origPulseIn ? origPulseIn.call(pxsim.pins, name, value, maxDuration) : 0;
                };
                (hookedPulseIn as any)._womHook = true;
                pxsim.pins.pulseIn = hookedPulseIn;
            }

            // 5. Hook pxsim.pins.servoSetPulse (stores pin.womServoPulse and queues display update)
            if (pxsim.pins && (!(pxsim.pins as any).servoSetPulse || !(pxsim.pins as any).servoSetPulse._womHook)) {
                const origServoSetPulse = pxsim.pins.servoSetPulse;
                const hookedServoSetPulse = function (pinId: number, micros: number) {
                    const pin = getPin(pinId);
                    if (pin) {
                        (pin as any).womServoPulse = micros;
                        if (typeof runtime !== "undefined" && runtime) {
                            runtime.queueDisplayUpdate();
                        }
                    }
                    if (origServoSetPulse) {
                        origServoSetPulse.call(pxsim.pins, pinId, micros);
                    }
                };
                (hookedServoSetPulse as any)._womHook = true;
                pxsim.pins.servoSetPulse = hookedServoSetPulse;
            }

            // 6. Hook pxsim.pins.i2cWriteBuffer & i2cReadBuffer
            if (pxsim.pins && (!(pxsim.pins as any).i2cWriteBuffer || !(pxsim.pins as any).i2cWriteBuffer._womHook)) {
                const origI2cWrite = pxsim.pins.i2cWriteBuffer;
                const hookedI2cWrite = function (address: number, buf: RefBuffer, repeat?: boolean) {
                    const handler = WomModuleManager.i2cHandlers[address];
                    const b = board();
                    if (handler && handler.onWrite && b) {
                        handler.onWrite(b, address, buf, repeat);
                    }
                    if (origI2cWrite) {
                        origI2cWrite.call(pxsim.pins, address, buf, repeat);
                    }
                };
                (hookedI2cWrite as any)._womHook = true;
                pxsim.pins.i2cWriteBuffer = hookedI2cWrite;
            }

            if (pxsim.pins && (!(pxsim.pins as any).i2cReadBuffer || !(pxsim.pins as any).i2cReadBuffer._womHook)) {
                const origI2cRead = pxsim.pins.i2cReadBuffer;
                const hookedI2cRead = function (address: number, size: number, repeat?: boolean): RefBuffer {
                    const handler = WomModuleManager.i2cHandlers[address];
                    const b = board();
                    if (handler && handler.onRead && b) {
                        const res = handler.onRead(b, address, size, repeat);
                        if (res) return res;
                    }
                    return origI2cRead ? origI2cRead.call(pxsim.pins, address, size, repeat) : pxsim.pins.createBuffer(size);
                };
                (hookedI2cRead as any)._womHook = true;
                pxsim.pins.i2cReadBuffer = hookedI2cRead;
            }
        }

        public static handleDmesg(msg: string) {
            const b = board();
            if (!b) return;
            const mgr = WomModuleManager.get(b);
            if (!mgr) return;

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
            let pins: string[];
            if (firstArg.indexOf("P") === 0) {
                pins = firstArg.split(",");
            } else {
                const portVal = parseInt(firstArg, 10) || 1;
                pins = decodeDigitalPort(portVal);
            }
            mgr.ensureModule(moduleType, pins, args);
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
        private lastPostedHeight = 430;

        public static readonly GRID_COLS = 3;
        public static readonly CELL_W = 148;
        public static readonly CELL_H = 148;
        public static readonly GAP_X = 16;
        public static readonly GAP_Y = 20;
        public static readonly START_X = 12;
        public static readonly START_Y = 450;

        constructor(private boardInstance?: DalBoard) {
            WomModuleManager.installHooks();
        }

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

        private getBoardView(): BoardView | undefined {
            const b = this.boardInstance || board();
            if (!b) return undefined;
            if ((b as any).boardView) return (b as any).boardView;
            if (b.viewHost && (b.viewHost as any).boardView) {
                return (b.viewHost as any).boardView;
            }
            return undefined;
        }

        private ensureContainers(): boolean {
            const b = this.boardInstance || board();
            if (!b || !b.view) return false;
            const svgEl = b.view;

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

            // 1. Exact pin-set match: reuse if same moduleType, otherwise warn conflict
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

            // 2b. Check LED matrix shared pin conflict (orange warning banner)
            const ledConflictPins = pins.filter(p => LED_SHARED_PINS.indexOf(p) !== -1);
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
            this.modulesGroup!.appendChild(mod.element);

            // 5. Draw Bezier signal wires from module pads to micro:bit edge connector
            this.drawWiresForModule(mod, modX, modY);

            // 6. Expand SVG viewBox and simulator aspect ratio to fit all rows
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
            const boardView = this.getBoardView();
            if (!boardView || !this.wiresGroup) return;

            const pads = mod.getWirePads();
            pads.forEach((pad, idx) => {
                const pinName = pad.targetPin;
                // Strictly skip any GND or 3v3/VCC wires; only draw signal wires (P0..P20)
                if (
                    !pinName ||
                    pinName.indexOf("P") !== 0 ||
                    pinName === "+3v3" ||
                    pinName === "3v3" ||
                    pinName === "3V" ||
                    pinName === "VCC" ||
                    pinName === "GND"
                ) {
                    return;
                }

                const boardCoord = boardView.getCoord(pinName);
                if (!boardCoord) return;

                const wireColor = pad.color || getPinWireColor(pinName);
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
                    stroke: wireColor,
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

        public showLedPinConflictWarning(
            attemptedType: string,
            attemptedPins: string[],
            conflictPins: string[],
            displayName?: string
        ): void {
            const pinDesc = conflictPins.join(", ");
            const targetName = displayName || attemptedType;
            const msg = `Pin conflict on ${pinDesc}: pin(s) shared with micro:bit LED screen; call led.enable(false) to use for ${targetName}.`;
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
                fill: "#c2410c",
                stroke: "#fdba74",
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
            const b = this.boardInstance || board();
            if (!b || !b.view) return;
            const numRows = Math.max(1, this.occupied.length);
            const numWarnings = Object.keys(this.warningsShown).length;
            const warningExtra = Math.max(0, (numWarnings - 1) * 26);
            const requiredHeight = Math.max(
                430 + warningExtra,
                WomModuleManager.START_Y +
                numRows * (WomModuleManager.CELL_H + WomModuleManager.GAP_Y) +
                16
            );
            b.view.setAttribute("viewBox", `0 0 500 ${requiredHeight}`);

            if (requiredHeight !== this.lastPostedHeight && typeof Runtime !== "undefined" && Runtime.postMessage) {
                this.lastPostedHeight = requiredHeight;
                Runtime.postMessage(<SimulatorAspectRatioMessage>{
                    type: "aspectratio",
                    value: 500 / requiredHeight,
                    frameid: Embed ? Embed.frameid : undefined
                });
            }
        }
    }
}

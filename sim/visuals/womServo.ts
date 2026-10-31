/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export type WomServoMode = "360" | "270" | "continuous";

    export class WomServoModule extends WomModuleBase {
        private mode: WomServoMode = "360";
        private modeLockedByInit = false;
        private currentAngle = 0;
        private targetRpm = 0;
        private lastFrameTime = 0;
        private animFrameId: number | null = null;
        private rotorGroup: SVGGElement;
        private cardModeText: SVGTextElement;
        private readonly shaftX = 74;
        private readonly shaftY = 108;
        private readonly hornScale = 0.28;

        constructor(pins: string[], initialMode: WomServoMode = "360", locked = false) {
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

            this.mode = initialMode;
            this.modeLockedByInit = locked;

            // Mode label ("360" or "270") displayed on the lower recessed card of positional servos
            this.cardModeText = <SVGTextElement>svg.child(this.overlayGroup, "text", {
                x: this.width / 2,
                y: 235,
                "text-anchor": "middle",
                fill: "#334155",
                "font-family": "monospace, sans-serif",
                "font-size": "24px",
                "font-weight": "bold",
                style: "pointer-events: none; user-select: none;"
            });

            // Rotating horn (/sim/sprites/servo_rotor.svg, viewBox 400x120, pivot at (60, 60))
            this.rotorGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {});
            const rotorImg = <SVGImageElement>svg.child(this.rotorGroup, "image", {
                x: 0,
                y: 0,
                width: 400,
                height: 120
            });
            this.setImageHref(rotorImg, "sprites/servo_rotor.svg");

            this.applyModeVisuals();
            this.renderHornAngle(0);
            this.updateState();
        }

        public setServoMode(mode: WomServoMode, fromInitBlock = false): void {
            if (this.modeLockedByInit && !fromInitBlock) return;
            if (fromInitBlock) {
                this.modeLockedByInit = true;
            }
            if (this.mode !== mode) {
                this.mode = mode;
                this.applyModeVisuals();
            }
            this.updateState();
        }

        private applyModeVisuals(): void {
            const spriteHref = this.mode === "continuous"
                ? "sprites/wom_servo_continuous.png"
                : "sprites/wom_servo.png";
            this.setSpriteHref(spriteHref);
            if (this.mode === "continuous") {
                this.cardModeText.textContent = "";
            } else {
                this.cardModeText.textContent = this.mode;
            }
        }

        private renderHornAngle(angleDeg: number): void {
            this.rotorGroup.setAttribute(
                "transform",
                `translate(${this.shaftX}, ${this.shaftY}) scale(${this.hornScale}) rotate(${angleDeg}) translate(-60, -60)`
            );
        }

        private ensureContinuousLoop(): void {
            if (this.animFrameId !== null) return;
            this.lastFrameTime = performance.now();
            const step = (now: number) => {
                if (!this.element.isConnected || this.mode !== "continuous" || Math.abs(this.targetRpm) < 0.5) {
                    this.animFrameId = null;
                    return;
                }
                const dtSec = Math.min(0.1, (now - this.lastFrameTime) / 1000);
                this.lastFrameTime = now;
                const degPerSec = (this.targetRpm / 60) * 360;
                this.currentAngle = (this.currentAngle + degPerSec * dtSec) % 360;
                this.renderHornAngle(this.currentAngle);
                this.animFrameId = requestAnimationFrame(step);
            };
            this.animFrameId = requestAnimationFrame(step);
        }

        public updateState(): void {
            const pin = getPinInstance(this.pins[0]);
            const pulse: number | undefined = pin ? (pin as any).womServoPulse : undefined;

            if (pulse === undefined) {
                this.setBadgeText(this.mode === "continuous" ? "0 rpm" : "0°", "#64748b");
                return;
            }

            const clampedPulse = Math.max(500, Math.min(2500, pulse));

            if (this.mode === "continuous") {
                // 1500 us = 0 rpm (stopped); 500 us = 160 rpm CCW (-160); 2500 us = 160 rpm CW (+160)
                const delta = clampedPulse - 1500;
                if (Math.abs(delta) < 15) {
                    this.targetRpm = 0;
                    this.setBadgeText("0 rpm", "#64748b");
                } else {
                    this.targetRpm = (delta / 1000) * 160;
                    const dir = this.targetRpm > 0 ? "CW" : "CCW";
                    this.setBadgeText(`${Math.round(Math.abs(this.targetRpm))}rpm ${dir}`, "#22c55e");
                    this.ensureContinuousLoop();
                }
            } else {
                const maxAngle = this.mode === "270" ? 270 : 360;
                const angle = ((clampedPulse - 500) / 2000) * maxAngle;
                this.currentAngle = angle;
                this.renderHornAngle(angle);
                this.setBadgeText(`${Math.round(angle)}°`, "#38bdf8");
            }
        }
    }

    function parseServoTypeArg(val: string | undefined): WomServoMode {
        const n = parseInt(val || "1", 10);
        if (n === 2 || val === "270") return "270";
        if (n === 3 || val === "continuous") return "continuous";
        return "360";
    }

    WomModuleManager.registerFactory(
        "servo",
        (pins, args) => {
            const mode = parseServoTypeArg(args[1]);
            const fromInit = args[2] === "init";
            return new WomServoModule(pins, mode, fromInit);
        },
        (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = decodeServoPort(portVal);
            const mgr = WomModuleManager.get(b);
            if (!mgr) return;
            const mod = mgr.ensureModule<WomServoModule>("servo", pins, args);
            if (mod && args[1]) {
                mod.setServoMode(parseServoTypeArg(args[1]), false);
            }
        }
    );

    WomModuleManager.registerFactory(
        "servo_init",
        (pins, args) => new WomServoModule(pins, parseServoTypeArg(args[1]), true),
        (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = decodeServoPort(portVal);
            const mgr = WomModuleManager.get(b);
            if (!mgr) return;
            const mode = parseServoTypeArg(args[1]);
            const mod = mgr.ensureModule<WomServoModule>("servo", pins, [args[0], mode, "init"]);
            if (mod) {
                mod.setServoMode(mode, true);
            }
        }
    );
}


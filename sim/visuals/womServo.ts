/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export type WomServoMode = "360" | "270" | "continuous";

    const UK_SERVO_TRANSLATIONS: { [key: string]: string } = {
        "front side": "Передня сторона",
        "back side": "Задня сторона",
        "0 degree position": "Позиція в стані 0"
    };

    function isUkrainianLocale(): boolean {
        try {
            // 1. Check parent window's MakeCode internal userLanguage()
            const parentWin = typeof window !== "undefined" ? (window.parent as any) : null;
            if (parentWin && parentWin.pxt && parentWin.pxt.Util && parentWin.pxt.Util.userLanguage) {
                const lang = parentWin.pxt.Util.userLanguage();
                if (typeof lang === "string" && lang.toLowerCase().startsWith("uk")) return true;
            }

            // 2. Check MakeCode PXT_LANG cookie (shared across same origin)
            if (typeof document !== "undefined" && document.cookie) {
                const m = /(?:^|;\s*)PXT_LANG=([a-zA-Z\-]+)/.exec(document.cookie);
                if (m && m[1].toLowerCase().startsWith("uk")) return true;
            }

            // 3. Check parent document's html lang attribute
            if (parentWin && parentWin.document && parentWin.document.documentElement && parentWin.document.documentElement.lang) {
                if (parentWin.document.documentElement.lang.toLowerCase().startsWith("uk")) return true;
            }

            // 4. Check parent window's actual URL query/hash if present
            if (parentWin && parentWin.location && parentWin.location.href) {
                if (/[\?&#](?:lang|language)=uk/i.test(parentWin.location.href)) return true;
            }
        } catch { }
        return false;
    }

    function getServoLocalizedTooltip(key: "front side" | "back side" | "0 degree position"): string {
        if (isUkrainianLocale()) {
            return UK_SERVO_TRANSLATIONS[key] || key;
        }
        if (typeof pxsim !== "undefined" && pxsim.localization && pxsim.localization.lf) {
            if (key === "front side") return pxsim.localization.lf("front side");
            if (key === "back side") return pxsim.localization.lf("back side");
            if (key === "0 degree position") return pxsim.localization.lf("0 degree position");
        }
        return key;
    }

    export class WomServoModule extends WomModuleBase {
        /**
         * Positional servo rotational transition speed:
         * 720 degrees per second (2 full rotations per second).
         */
        public static readonly POSITIONAL_SPEED_DEG_PER_SEC = 720;

        private mode: WomServoMode = "360";
        private modeLockedByInit = false;
        private isBack = false;
        private defaultRotation = 0;
        private currentAngle = 0;
        private targetAngle = 0;
        private targetRpm = 0;
        private lastFrameTime = 0;
        private animFrameId: number | null = null;
        private rotorGroup: SVGGElement;
        private cardModeText: SVGTextElement;
        private geekservoText: SVGTextElement;
        private faceBtnGroup: SVGGElement;
        private faceBtnCircle: SVGCircleElement;
        private faceBtnText: SVGTextElement;
        private faceBtnTitle: SVGTitleElement;
        private zeroPosBtnGroup: SVGGElement;
        private zeroPosBtnCircle: SVGCircleElement;
        private miniRotorImg: SVGImageElement;
        private powerWireGroup: SVGGElement;
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

            // Mode label ("360" or "270") displayed on the servo body
            this.cardModeText = <SVGTextElement>svg.child(this.overlayGroup, "text", {
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
            this.geekservoText = <SVGTextElement>svg.child(this.overlayGroup, "text", {
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
            this.rotorGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {});
            const rotorImg = <SVGImageElement>svg.child(this.rotorGroup, "image", {
                x: 0,
                y: 0,
                width: 400,
                height: 120
            });
            this.setImageHref(rotorImg, "sprites/servo_rotor.svg");

            // Short 5V power wire stub emerging from the top of the servo with unselectable "5V" label
            this.createPowerWireStub();

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

        private createPowerWireStub(): void {
            const wireX = 94;
            const wireBottomY = 42;
            const wireTopY = 29;
            const d = `M ${wireX} ${wireBottomY} L ${wireX} ${wireTopY}`;

            this.powerWireGroup = <SVGGElement>svg.elt("g", {
                class: "wom-servo-5v-wire",
                style: "pointer-events: none; user-select: none;"
            });

            // Insert before spriteEl so the bottom of the short wire tucks cleanly behind the top edge of the servo sprite
            if (this.spriteEl && this.spriteEl.parentNode === this.element) {
                this.element.insertBefore(this.powerWireGroup, this.spriteEl);
            } else {
                this.element.appendChild(this.powerWireGroup);
            }

            // Subtle shadow under wire matching WomModuleManager.drawWiresForModule
            svg.child(this.powerWireGroup, "path", {
                d,
                fill: "none",
                stroke: "rgba(0,0,0,0.35)",
                "stroke-width": 4.5,
                "stroke-linecap": "round"
            });

            // Red 5V power wire stub
            svg.child(this.powerWireGroup, "path", {
                d,
                fill: "none",
                stroke: "#ef4444",
                "stroke-width": 3,
                "stroke-linecap": "round",
                opacity: 0.92
            });

            // Unselectable "5V" label immediately at the end of the short wire
            const label = <SVGTextElement>svg.child(this.powerWireGroup, "text", {
                x: wireX,
                y: wireTopY - 4,
                "text-anchor": "middle",
                fill: "#ef4444",
                "font-family": "monospace, sans-serif",
                "font-size": "16.5px",
                "font-weight": "bold",
                style: "pointer-events: none; user-select: none; -webkit-user-select: none;"
            });
            label.textContent = "5V";
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
            if (this.zeroPosBtnGroup) {
                this.zeroPosBtnGroup.style.display = this.mode === "continuous" ? "none" : "block";
            }
            if (this.powerWireGroup) {
                // Adjust vertical offset so visible stub length matches top edge of positional (y≈33.2) vs continuous (y≈38.9) sprite
                const yOffset = this.mode === "continuous" ? 5.7 : 0;
                this.powerWireGroup.setAttribute("transform", `translate(0, ${yOffset})`);
            }
        }

        private renderHornAngle(angleDeg: number): void {
            // angleDeg is the servo state (rotation degrees relative to 0).
            // The default rotation relative to upwards is applied before back mode translation:
            const frontAngle = (angleDeg + this.defaultRotation) % 360;
            const normFront = frontAngle < 0 ? frontAngle + 360 : frontAngle;
            const angleFromUp = this.isBack
                ? (360 - normFront) % 360
                : normFront;
            const visualDeg = angleFromUp - 90;
            this.rotorGroup.setAttribute(
                "transform",
                `translate(${this.shaftX}, ${this.shaftY}) scale(${this.hornScale}) rotate(${visualDeg}) translate(-60, -60)`
            );
        }

        private ensureAnimationLoop(): void {
            if (this.animFrameId !== null) return;
            this.lastFrameTime = performance.now();
            const step = (now: number) => {
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
                    if (this.currentAngle < 0) this.currentAngle += 360;
                    this.renderHornAngle(this.currentAngle);
                    this.animFrameId = requestAnimationFrame(step);
                } else {
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
                    } else {
                        this.currentAngle += Math.sign(diff) * maxStep;
                    }
                    this.renderHornAngle(this.currentAngle);
                    this.setBadgeText(`${Math.round(this.currentAngle)}°`, "#38bdf8");

                    if (Math.abs(this.targetAngle - this.currentAngle) >= 0.01) {
                        this.animFrameId = requestAnimationFrame(step);
                    } else {
                        this.animFrameId = null;
                    }
                }
            };
            this.animFrameId = requestAnimationFrame(step);
        }

        private createFaceToggleButton(): void {
            const initialTitle = getServoLocalizedTooltip("front side");
            const btnGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {
                class: "wom-servo-face-btn",
                style: "cursor: pointer;"
            });
            btnGroup.setAttribute("title", initialTitle);

            this.faceBtnTitle = <SVGTitleElement>svg.child(btnGroup, "title", {});
            this.faceBtnTitle.textContent = initialTitle;

            this.faceBtnCircle = <SVGCircleElement>svg.child(btnGroup, "circle", {
                cx: 30,
                cy: 238,
                r: 14.3,
                fill: "#1e293b",
                stroke: "#475569",
                "stroke-width": 1.5,
                style: "cursor: pointer;"
            });

            this.faceBtnText = <SVGTextElement>svg.child(btnGroup, "text", {
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

        private createZeroPositionButton(): void {
            const title = getServoLocalizedTooltip("0 degree position");
            const btnGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {
                class: "wom-servo-zero-btn",
                style: "cursor: pointer;"
            });
            btnGroup.setAttribute("title", title);

            const titleEl = <SVGTitleElement>svg.child(btnGroup, "title", {});
            titleEl.textContent = title;

            this.zeroPosBtnCircle = <SVGCircleElement>svg.child(btnGroup, "circle", {
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
            const clip = svg.child(this.overlayGroup, "clipPath", { id: clipId });
            svg.child(clip, "circle", { cx: 118, cy: 238, r: 13.8 });

            const miniRotorG = <SVGGElement>svg.child(btnGroup, "g", {
                "clip-path": `url(#${clipId})`,
                style: "pointer-events: none;"
            });

            this.miniRotorImg = <SVGImageElement>svg.child(miniRotorG, "image", {
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

        private updateZeroPositionButtonVisuals(): void {
            if (!this.miniRotorImg) return;
            const btnAngleFromUp = this.isBack
                ? (360 - this.defaultRotation) % 360
                : this.defaultRotation;
            const visualDeg = btnAngleFromUp - 90;
            this.miniRotorImg.setAttribute(
                "transform",
                `translate(118, 238) rotate(${visualDeg}) scale(0.0426) translate(-60, -60)`
            );
        }

        public cycleDefaultRotation(): void {
            if (this.mode === "continuous") return;
            this.defaultRotation = (this.defaultRotation + 90) % 360;
            this.updateZeroPositionButtonVisuals();
            this.renderHornAngle(this.currentAngle);
            if (typeof runtime !== "undefined" && runtime) {
                runtime.queueDisplayUpdate();
            }
        }

        public toggleFace(): void {
            this.isBack = !this.isBack;
            this.updateFaceButtonVisuals();
            this.updateZeroPositionButtonVisuals();

            if (this.mode === "continuous") {
                if (Math.abs(this.targetRpm) >= 0.5) {
                    const dir = (this.isBack ? -this.targetRpm : this.targetRpm) > 0 ? "CW" : "CCW";
                    this.setBadgeText(`${Math.round(Math.abs(this.targetRpm))}rpm ${dir}`, "#22c55e");
                }
                this.renderHornAngle(this.currentAngle);
            } else {
                this.renderHornAngle(this.currentAngle);
                this.setBadgeText(`${Math.round(this.currentAngle)}°`, "#38bdf8");
            }
        }

        private updateFaceButtonVisuals(): void {
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

        public updateState(): void {
            const pin = getPinInstance(this.pins[0]);
            const pulse: number | undefined = pin ? (pin as any).womServoPulse : undefined;

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
                } else {
                    this.targetRpm = (delta / 1000) * 160;
                    const dir = (this.isBack ? -this.targetRpm : this.targetRpm) > 0 ? "CW" : "CCW";
                    this.setBadgeText(`${Math.round(Math.abs(this.targetRpm))}rpm ${dir}`, "#22c55e");
                    this.ensureAnimationLoop();
                }
            } else {
                this.targetRpm = 0;
                const maxAngle = this.mode === "270" ? 270 : 360;
                const angle = ((clampedPulse - 500) / 2000) * maxAngle;
                this.targetAngle = angle;
                if (Math.abs(this.targetAngle - this.currentAngle) < 0.01) {
                    this.currentAngle = this.targetAngle;
                    this.renderHornAngle(this.currentAngle);
                    this.setBadgeText(`${Math.round(this.currentAngle)}°`, "#38bdf8");
                } else {
                    this.ensureAnimationLoop();
                }
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


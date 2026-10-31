/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomJoystickModule extends WomModuleBase {
        private xVal = 512;
        private yVal = 512;
        private dx = 0;
        private dy = 0;
        private stickGroup: SVGGElement;
        private springAnimId: number | null = null;
        private readonly centerX = 74;
        private readonly centerY = 72;
        private readonly maxRadius = 12;
        private readonly stickSize = 60;

        constructor(pins: string[]) {
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

            const { group } = this.addSvgOverlay(
                "sprites/joystick_stick.svg",
                this.centerX - this.stickSize / 2,
                this.centerY - this.stickSize / 2,
                this.stickSize,
                this.stickSize
            );
            this.stickGroup = group;
            this.stickGroup.style.cursor = "grab";

            let dragging = false;

            const stopSpring = () => {
                if (this.springAnimId !== null) {
                    cancelAnimationFrame(this.springAnimId);
                    this.springAnimId = null;
                }
            };

            const applyOffset = (dx: number, dy: number) => {
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
                if (typeof runtime !== "undefined" && runtime) {
                    runtime.queueDisplayUpdate();
                }
            };

            const updateFromPointer = (clientX: number, clientY: number) => {
                const rect = this.element.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
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
                        if (typeof runtime !== "undefined" && runtime) {
                            runtime.queueDisplayUpdate();
                        }
                        return;
                    }
                    applyOffset(nextDx, nextDy);
                    this.springAnimId = requestAnimationFrame(step);
                };
                this.springAnimId = requestAnimationFrame(step);
            };

            this.element.style.cursor = "grab";
            this.element.addEventListener("pointerdown", (e: PointerEvent) => {
                e.stopPropagation();
                stopSpring();
                dragging = true;
                this.element.style.cursor = "grabbing";
                this.stickGroup.style.cursor = "grabbing";
                if (this.element.setPointerCapture) {
                    try {
                        this.element.setPointerCapture(e.pointerId);
                    } catch (_) {}
                }
                updateFromPointer(e.clientX, e.clientY);
            });

            this.element.addEventListener("pointermove", (e: PointerEvent) => {
                if (!dragging) return;
                e.stopPropagation();
                updateFromPointer(e.clientX, e.clientY);
            });

            const releaseStick = (e: PointerEvent) => {
                if (!dragging) return;
                dragging = false;
                this.element.style.cursor = "grab";
                this.stickGroup.style.cursor = "grab";
                if (this.element.releasePointerCapture) {
                    try {
                        this.element.releasePointerCapture(e.pointerId);
                    } catch (_) {}
                }
                springBackToCenter();
            };

            this.element.addEventListener("pointerup", releaseStick);
            this.element.addEventListener("pointerleave", releaseStick);
            this.element.addEventListener("pointercancel", releaseStick);

            this.setBadgeText("Center", "#64748b");
            this.syncPinState();
        }

        private getDirectionLabel(): string {
            if (this.xVal < 100) return "Left";
            if (this.xVal > 700) return "Right";
            if (this.yVal < 100) return "Down";
            if (this.yVal > 700) return "Up";
            return "Center";
        }

        private syncPinState(): void {
            if (this.pins[0]) this.setAnalogInput(this.pins[0], this.xVal);
            if (this.pins[1]) this.setAnalogInput(this.pins[1], this.yVal);
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory(
        "joystick",
        (pins) => new WomJoystickModule(pins),
        (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = decodeAnalogPort(portVal);
            const mgr = WomModuleManager.get(b);
            if (mgr) mgr.ensureModule("joystick", pins, args);
        }
    );
}

/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomPotentiometerModule extends WomModuleBase {
        private currentValue = 512;
        private angleDeg = 0;
        private rotorGroup: SVGGElement;
        private readonly centerX = 74;
        private readonly centerY = 72;

        constructor(pins: string[]) {
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

            // Rotor overlay centered at (74, 72) over the potentiometer shaft
            const rotorSize = 58;
            this.rotorGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {
                transform: `rotate(${this.angleDeg}, ${this.centerX}, ${this.centerY})`,
                style: "cursor: grab;"
            });
            // potentiometer_rotor.svg has its red tick drawn at bottom-left (-135 deg from top);
            // offset inner image by +135 deg so angleDeg=0 points straight up and [-135, +135] matches the tick.
            const innerGroup = <SVGGElement>svg.child(this.rotorGroup, "g", {
                transform: `rotate(135, ${this.centerX}, ${this.centerY})`
            });
            const rotorImg = <SVGImageElement>svg.child(innerGroup, "image", {
                x: this.centerX - rotorSize / 2,
                y: this.centerY - rotorSize / 2,
                width: rotorSize,
                height: rotorSize
            });
            this.setImageHref(rotorImg, "sprites/potentiometer_rotor.svg");

            let dragging = false;

            const updateFromPointer = (clientX: number, clientY: number) => {
                const rect = this.element.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                const localX = ((clientX - rect.left) / rect.width) * this.width;
                const localY = ((clientY - rect.top) / rect.height) * this.height;
                const dx = localX - this.centerX;
                const dy = localY - this.centerY;
                if (dx * dx + dy * dy < 4) return;

                // Angle in degrees relative to 12 o'clock (-180..+180)
                let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
                deg = Math.max(-135, Math.min(135, deg));
                this.angleDeg = deg;
                this.currentValue = Math.round(((deg + 135) / 270) * 1023);

                this.rotorGroup.setAttribute(
                    "transform",
                    `rotate(${this.angleDeg}, ${this.centerX}, ${this.centerY})`
                );
                this.setBadgeText(String(this.currentValue), "#38bdf8");
                this.syncPinState();
                if (typeof runtime !== "undefined" && runtime) {
                    runtime.queueDisplayUpdate();
                }
            };

            this.element.style.cursor = "grab";
            this.element.addEventListener("pointerdown", (e: PointerEvent) => {
                e.stopPropagation();
                dragging = true;
                this.element.style.cursor = "grabbing";
                this.rotorGroup.style.cursor = "grabbing";
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

            const endDrag = (e: PointerEvent) => {
                if (!dragging) return;
                dragging = false;
                this.element.style.cursor = "grab";
                this.rotorGroup.style.cursor = "grab";
                if (this.element.releasePointerCapture) {
                    try {
                        this.element.releasePointerCapture(e.pointerId);
                    } catch (_) {}
                }
            };

            this.element.addEventListener("pointerup", endDrag);
            this.element.addEventListener("pointercancel", endDrag);

            this.setBadgeText(String(this.currentValue), "#38bdf8");
            this.syncPinState();
        }

        private syncPinState(): void {
            this.setAnalogInput(this.pins[0], this.currentValue);
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory(
        "potentiometer",
        (pins) => new WomPotentiometerModule(pins),
        (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = decodeAnalogPort(portVal);
            const mgr = WomModuleManager.get(b);
            if (mgr) mgr.ensureModule("potentiometer", pins, args);
        }
    );
}

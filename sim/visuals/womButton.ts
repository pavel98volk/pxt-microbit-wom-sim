/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomButtonModule extends WomModuleBase {
        /** True when button is currently pressed down (active-low -> 0) */
        private isPressed = false;
        private shadowCircle: SVGCircleElement;

        constructor(pins: string[]) {
            super({
                moduleType: "button",
                displayName: "Button",
                pins,
                colSpan: 1,
                rowSpan: 1,
                sprite: "/sim/sprites/wom_button.png",
                padEdge: "right",
                wiredPins: [pins[0]]
            });

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

        private syncPinState(): void {
            // In Module-World.ts: enButton.Press = 0, enButton.Realse = 1
            this.setDigitalInput(this.pins[0], this.isPressed ? 0 : 1);
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory("button", (pins) => new WomButtonModule(pins));
}


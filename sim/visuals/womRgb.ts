/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomRgbModule extends WomModuleBase {
        private ledCircle: SVGCircleElement;

        constructor(pins: string[]) {
            super({
                moduleType: "rgb",
                displayName: "RGB",
                pins: ["P12", "P13", "P14"],
                colSpan: 1,
                rowSpan: 1,
                sprite: "/sim/sprites/wom_rgb.png",
                padEdge: "right",
                wiredPins: ["P12", "P13", "P14"]
            });

            // Glowing circle overlay centered over the RGB LED on the PCB (74, 72)
            this.ledCircle = this.addCircleOverlay(74, 72, 24, "rgb(0, 0, 0)", 0);
            this.setBadgeText("OFF", "#64748b");
            this.updateState();
        }

        private readChannel255(pinName: string): number {
            const pin = getPinInstance(pinName);
            if (!pin) return 0;
            const raw = Math.max(0, Math.min(1023, pin.value || 0));
            return Math.round((raw / 1023) * 255);
        }

        public updateState(): void {
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
            } else {
                this.setBadgeText(`${r},${g},${b}`, colorStr);
            }
        }
    }

    WomModuleManager.registerFactory("rgb", (pins) => new WomRgbModule(pins));
}


/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomLightModule extends WomModuleBase {
        private lightLevel = 500;
        private glowCircle: SVGCircleElement;

        constructor(pins: string[]) {
            super({
                moduleType: "light",
                displayName: "Light",
                pins,
                colSpan: 1,
                rowSpan: 1,
                sprite: "/sim/sprites/wom_photoresistor.png",
                padEdge: "right",
                wiredPins: [pins[0]]
            });

            // Warm yellow glow over the photoresistor proportional to light intensity
            this.glowCircle = this.addCircleOverlay(74, 72, 26, "#facc15", 0.35);
            this.glowCircle.setAttribute("opacity", String((this.lightLevel / 1023) * 0.85));

            const { container } = this.addControlForeignObject(16, 86, 116, 44);
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

        private syncPinState(): void {
            // ModuleWorld_Analog.Light returns 1024 - pins.analogReadPin(lightpin)
            this.setAnalogInput(this.pins[0], 1024 - this.lightLevel);
            const pin = getPinInstance(this.pins[0]);
            if (pin) {
                (pin as any).womAnalogValue = 1024 - this.lightLevel;
            }
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory(
        "light",
        (pins) => new WomLightModule(pins),
        (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const pins = decodeAnalogPort(portVal);
            const mgr = WomModuleManager.get(b);
            if (mgr) mgr.ensureModule("light", pins, args);
        }
    );
}

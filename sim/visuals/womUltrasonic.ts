/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomUltrasonicModule extends WomModuleBase {
        private distanceCm = 25;

        constructor(pins: string[]) {
            super({
                moduleType: "ultrasonic",
                displayName: "Ultrasonic",
                pins,
                colSpan: 2,
                rowSpan: 1,
                sprite: "sprites/wom_ultrasonic.png",
                padEdge: "top",
                wiredPins: pins, // Wire both Trig (pins[0]) and Echo (pins[1])
                showCardBackground: true
            });

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

        private syncPinState(): void {
            // Ultrasonic reads pulseIn on Echo (pins[1]) and divides by 58
            const echoPin = this.pins[1] || this.pins[0];
            this.setPulseMicros(echoPin, this.distanceCm * 58);
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory("ultrasonic", (pins) => new WomUltrasonicModule(pins));
}


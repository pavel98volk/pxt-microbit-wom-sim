/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomDht11Module extends WomModuleBase {
        private tempC = 25;
        private humidity = 60;
        /** Absolute moisture content in g/m^3 (held constant when temperature changes) */
        private absoluteWaterDensity = 0;
        /** 0 = Temp(C), 1 = Temp(F), 2 = Humidity */
        private lastQueryType = 0;

        // Left Thermometer geometry constants
        private readonly tempCenterX = 24;
        private readonly tempTextX = 27;   // Text nudged slightly closer to center
        private readonly tempZeroY = 96;   // Y position corresponding to 0°C
        private readonly tempFiftyY = 22;  // Y position corresponding to 50°C
        private readonly tempTravel = 74;  // 96 - 22

        // Right Humidity slider geometry constants
        private readonly humCenterX = 124;
        private readonly humTextX = 121;   // Text nudged slightly closer to center
        private readonly humZeroY = 106;   // Y position corresponding to 0%
        private readonly humMaxY = 40;     // Y position corresponding to 100%
        private readonly humTravel = 66;   // 106 - 40

        // Visual SVG elements for Thermometer
        private tempCol: SVGRectElement;
        private tempBulb: SVGCircleElement;
        private tempLevelIndicator: SVGLineElement;
        private tempLabel: SVGTextElement;
        private tempValueText: SVGTextElement;

        // Visual SVG elements for Humidity
        private humIcon: SVGImageElement;
        private humTrackFill: SVGRectElement;
        private humThumb: SVGCircleElement;
        private humThumbGrip: SVGLineElement;
        private humLabel: SVGTextElement;
        private humValueText: SVGTextElement;

        constructor(pins: string[], args: string[] = []) {
            super({
                moduleType: "dht11",
                displayName: "DHT11",
                pins,
                colSpan: 1,
                rowSpan: 1,
                sprite: "/sim/sprites/wom_dht11.png",
                padEdge: "left",
                wiredPins: [pins[0]]
            });

            if (args.length > 1) {
                const parsedType = parseInt(args[1], 10);
                if (!isNaN(parsedType)) {
                    this.lastQueryType = parsedType;
                }
            }

            // =========================================================================
            // 1. LEFT: Old-School Thermometer Scale with Dedicated Dark Backing
            // =========================================================================
            const tempGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {
                class: "wom-dht-temp-group"
            });

            // Dedicated dark rounded backing behind the temperature slider UI & text
            svg.child(tempGroup, "rect", {
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
            svg.child(tempGroup, "circle", {
                cx: this.tempCenterX,
                cy: 104,
                r: 9,
                fill: "#1e293b",
                stroke: "#475569",
                "stroke-width": 1.5,
                style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.6));"
            });

            // Outer glass stem tube
            svg.child(tempGroup, "rect", {
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
            this.tempCol = <SVGRectElement>svg.child(tempGroup, "rect", {
                x: this.tempCenterX - 2.5,
                y: this.tempZeroY,
                width: 5,
                height: 8,
                rx: 2.5
            });

            // Liquid fill inside bulb reservoir
            this.tempBulb = <SVGCircleElement>svg.child(tempGroup, "circle", {
                cx: this.tempCenterX,
                cy: 104,
                r: 7
            });

            // Subtle glass shine / reflection highlight
            svg.child(tempGroup, "line", {
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
            this.tempLevelIndicator = <SVGLineElement>svg.child(tempGroup, "line", {
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
            this.tempLabel = <SVGTextElement>svg.child(tempGroup, "text", {
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
            this.tempValueText = <SVGTextElement>svg.child(tempGroup, "text", {
                x: this.tempTextX,
                y: 132,
                "text-anchor": "middle",
                "font-size": "8.5px",
                "font-weight": "bold",
                "font-family": "monospace, sans-serif",
                style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.9)); pointer-events: none; user-select: none;"
            });

            // Interactive hitzone covering the thermometer
            const tempHitZone = <SVGRectElement>svg.child(tempGroup, "rect", {
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
            const humGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {
                class: "wom-dht-hum-group"
            });

            // Dedicated dark rounded backing behind the humidity slider UI & text
            svg.child(humGroup, "rect", {
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
            this.humIcon = <SVGImageElement>svg.child(humGroup, "image", {
                x: this.humCenterX - 11,
                y: 12,
                width: 22,
                height: 22,
                style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.8)); pointer-events: none;"
            });

            // Slider background track
            svg.child(humGroup, "rect", {
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
            this.humTrackFill = <SVGRectElement>svg.child(humGroup, "rect", {
                x: this.humCenterX - 3,
                y: this.humZeroY,
                width: 6,
                height: 0,
                rx: 3,
                fill: "#64748b"
            });

            // Draggable slider knob / thumb
            this.humThumb = <SVGCircleElement>svg.child(humGroup, "circle", {
                cx: this.humCenterX,
                cy: this.humZeroY,
                r: 6.5,
                fill: "#64748b",
                stroke: "#ffffff",
                "stroke-width": 1.5,
                style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.8)); pointer-events: none;"
            });

            this.humThumbGrip = <SVGLineElement>svg.child(humGroup, "line", {
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
            this.humLabel = <SVGTextElement>svg.child(humGroup, "text", {
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
            this.humValueText = <SVGTextElement>svg.child(humGroup, "text", {
                x: this.humTextX,
                y: 132,
                "text-anchor": "middle",
                "font-size": "8.5px",
                "font-weight": "bold",
                "font-family": "monospace, sans-serif",
                style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.9)); pointer-events: none; user-select: none;"
            });

            // Interactive hitzone covering the humidity slider
            const humHitZone = <SVGRectElement>svg.child(humGroup, "rect", {
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
        private satWaterDensity(tC: number): number {
            const es = 6.1078 * Math.exp((17.27 * tC) / (tC + 237.3)); // saturation vapor pressure in hPa
            return (216.7 * es) / (tC + 273.15); // absolute saturation density in g/m^3
        }

        private updateAbsoluteWaterDensity(): void {
            const satDensity = this.satWaterDensity(this.tempC);
            // Limit amount of water per m^3 to at most 100% saturation at current temperature
            const clampedHum = Math.max(0, Math.min(100, this.humidity));
            this.absoluteWaterDensity = (clampedHum / 100) * satDensity;
        }

        private updateHumidityFromPhysics(): void {
            const satDensity = this.satWaterDensity(this.tempC);
            if (satDensity > 0) {
                // If reducing temperature causes water to exceed 100% humidity, discard excess water (condensation)
                if (this.absoluteWaterDensity > satDensity) {
                    this.absoluteWaterDensity = satDensity;
                    this.humidity = 100;
                } else {
                    const calculatedHum = (this.absoluteWaterDensity / satDensity) * 100;
                    this.humidity = Math.max(0, Math.min(100, Math.round(calculatedHum)));
                }
            }
        }

        private setupInteractions(tempZone: SVGRectElement, humZone: SVGRectElement): void {
            let activeDrag: "temp" | "hum" | null = null;

            const updateFromPointer = (e: PointerEvent) => {
                if (!activeDrag) return;
                e.stopPropagation();
                e.preventDefault();

                const rect = this.element.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                const localY = ((e.clientY - rect.top) / rect.height) * this.height;

                if (activeDrag === "temp") {
                    // Temperature 0°C at tempZeroY (96), 50°C at tempFiftyY (22)
                    const frac = Math.max(0, Math.min(1, (this.tempZeroY - localY) / this.tempTravel));
                    this.tempC = Math.round(frac * 50);
                    // Fixed water vapor per cubic meter: relative humidity shifts with temperature
                    this.updateHumidityFromPhysics();
                } else {
                    // Humidity 0% at humZeroY (106), 100% at humMaxY (40)
                    const frac = Math.max(0, Math.min(1, (this.humZeroY - localY) / this.humTravel));
                    this.humidity = Math.round(frac * 100);
                    // Explicit change to moisture content: update absolute moisture baseline
                    this.updateAbsoluteWaterDensity();
                }

                this.updateVisuals();
                this.syncPinState();
            };

            const startDrag = (target: "temp" | "hum", hitZone: SVGRectElement, e: PointerEvent) => {
                e.stopPropagation();
                e.preventDefault();
                activeDrag = target;
                try {
                    hitZone.setPointerCapture(e.pointerId);
                } catch (_) {}
                updateFromPointer(e);
            };

            const stopDrag = (hitZone?: SVGRectElement, e?: PointerEvent) => {
                if (!activeDrag) return;
                if (hitZone && e) {
                    try {
                        hitZone.releasePointerCapture(e.pointerId);
                    } catch (_) {}
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
        private getTempColor(tempC: number): string {
            const t = Math.max(0, Math.min(1, tempC / 50));
            const stops = [
                { t: 0.0, r: 56, g: 189, b: 248 },   // Cold icy blue
                { t: 0.3, r: 45, g: 212, b: 191 },   // Teal / cyan
                { t: 0.55, r: 245, g: 158, b: 11 },  // Warm golden amber
                { t: 0.8, r: 249, g: 115, b: 22 },   // Vibrant orange
                { t: 1.0, r: 239, g: 68, b: 68 }     // Hot red
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
        private getHumColor(humidity: number): string {
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
        private getHumTextColor(humidity: number): string {
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
        private getWeatherIconHref(hum: number): string {
            if (hum >= 100) return "/sim/sprites/dht_rain.svg";
            if (hum >= 75) return "/sim/sprites/dht_clouds.svg";
            if (hum >= 30) return "/sim/sprites/dht_sun_cloud.svg";
            if (hum >= 10) return "/sim/sprites/dht_sun.svg";
            return "/sim/sprites/dht_dune.svg";
        }

        private updateVisuals(): void {
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
            if (typeof runtime !== "undefined" && runtime) {
                runtime.queueDisplayUpdate();
            }
        }

        public setQueryType(dht11type: number): void {
            if (!isNaN(dht11type)) {
                this.lastQueryType = dht11type;
            }
            this.syncPinState();
        }

        private syncPinState(): void {
            let requestedValue = this.tempC;
            if (this.lastQueryType === 1) {
                // Fahrenheit conversion
                requestedValue = Math.round((this.tempC * 9) / 5 + 32);
            } else if (this.lastQueryType === 2) {
                requestedValue = this.humidity;
            }
            this.setDigitalInput(this.pins[0], -(requestedValue + 1000));
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory(
        "dht11",
        (pins, args) => new WomDht11Module(pins, args),
        (b, args) => {
            const portVal = parseInt(args[0] || "1", 10) || 1;
            const dht11type = parseInt(args[1] || "0", 10) || 0;
            const pins = decodeDigitalPort(portVal);
            const mgr = WomModuleManager.get(b);
            if (!mgr) return;
            const mod = mgr.ensureModule<WomDht11Module>("dht11", pins, args);
            if (mod) {
                mod.setQueryType(dht11type);
            }
        }
    );
}

/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    /**
     * Segment line definition in the native coordinate system of wom_tm1650.png (1255 x 848).
     * Indices 0..6 correspond to standard 7-segment bars A..G; index 7 is the decimal point (DP).
     */
    interface Tm1650SegmentDef {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        isDot?: boolean;
    }

    /** Native pixel dimensions of /sim/sprites/wom_tm1650.png */
    const TM1650_NATIVE_W = 1255;
    const TM1650_NATIVE_H = 848;

    /** Horizontal pixel pitch between consecutive digits (0..3) in native 1255x848 coordinates */
    const TM1650_DIGIT_STEP_X = 198.15;

    /**
     * Exact centerline endpoints for Digit 0 segments (A..G, DP) in native 1255x848 coordinates.
     * Each segment is inset slightly from its miter corners so round linecaps leave crisp gaps.
     */
    const TM1650_DIGIT0_SEGMENTS: Tm1650SegmentDef[] = [
        { x1: 295.5, y1: 314.9, x2: 379.5, y2: 314.9 }, // Bit 0 (0x01): Segment A (top horizontal)
        { x1: 390.9, y1: 327.5, x2: 383.9, y2: 405.5 }, // Bit 1 (0x02): Segment B (upper-right vertical)
        { x1: 380.4, y1: 444.5, x2: 374.0, y2: 522.5 }, // Bit 2 (0x04): Segment C (lower-right vertical)
        { x1: 275.5, y1: 535.1, x2: 359.5, y2: 535.1 }, // Bit 3 (0x08): Segment D (bottom horizontal)
        { x1: 271.2, y1: 444.5, x2: 264.2, y2: 522.5 }, // Bit 4 (0x10): Segment E (lower-left vertical)
        { x1: 281.5, y1: 327.5, x2: 274.7, y2: 405.5 }, // Bit 5 (0x20): Segment F (upper-left vertical)
        { x1: 285.5, y1: 424.6, x2: 370.5, y2: 424.6 }, // Bit 6 (0x40): Segment G (middle horizontal)
        { x1: 407.7, y1: 530.6, x2: 407.7, y2: 530.6, isDot: true } // Bit 7 (0x80): Decimal Point (DP)
    ];

    /** Lookup table for decoding 7-segment bitmasks (bits 0..6) back to readable badge characters */
    const SEG_TO_CHAR: { [mask: number]: string } = {
        0x00: " ",
        0x3f: "0",
        0x06: "1",
        0x5b: "2",
        0x4f: "3",
        0x66: "4",
        0x6d: "5",
        0x7d: "6",
        0x07: "7",
        0x7f: "8",
        0x6f: "9",
        0x77: "A",
        0x7c: "b",
        0x39: "C",
        0x58: "c",
        0x5e: "d",
        0x79: "E",
        0x7b: "e",
        0x71: "F",
        0x76: "H",
        0x74: "h",
        0x1e: "J",
        0x38: "L",
        0x54: "n",
        0x5c: "o",
        0x73: "P",
        0x67: "q",
        0x50: "r",
        0x78: "t",
        0x3e: "U",
        0x1c: "u",
        0x6e: "y",
        0x40: "-",
        0x08: "_"
    };

    export class WomTm1650Module extends WomModuleBase {
        private static readonly SPRITE_BOUNDS = {
            x: 55.37,
            y: 1,
            width: 201.26,
            height: 136
        };

        /** Current 8-bit segment mask for each of the 4 digits (0x34..0x37) */
        private digitMasks: number[] = [0, 0, 0, 0];
        /** Whether the TM1650 display driver is enabled (bit 0 of command register 0x24) */
        private displayOn: boolean = true;
        /** Brightness intensity level (1..8, default 3) */
        private intensity: number = 3;
        /** 4x8 matrix of SVG <line> elements representing the red segments on top of wom_tm1650.png */
        private segmentLines: SVGLineElement[][] = [];

        constructor(pins: string[]) {
            super({
                moduleType: "tm1650",
                displayName: "TM1650",
                pins,
                colSpan: 2,
                rowSpan: 1,
                sprite: "sprites/wom_tm1650.png",
                spriteBounds: WomTm1650Module.SPRITE_BOUNDS,
                padEdge: "top",
                wiredPins: ["P19", "P20"],
                showCardBackground: false
            });

            this.buildDisplayOverlay();
            this.renderDisplay();
        }

        /**
         * Convert a coordinate from native wom_tm1650.png space (1255x848)
         * to local SVG module coordinates.
         */
        private toModuleCoord(nativeX: number, nativeY: number): { x: number; y: number } {
            const b = WomTm1650Module.SPRITE_BOUNDS;
            return {
                x: b.x + (nativeX / TM1650_NATIVE_W) * b.width,
                y: b.y + (nativeY / TM1650_NATIVE_H) * b.height
            };
        }

        /**
         * Draw a single red segment line (or round dot for DP) in the overlay group
         * positioned over its corresponding unlit segment in wom_tm1650.png.
         */
        private createSegmentLine(digitIndex: number, segIndex: number): SVGLineElement {
            const def = TM1650_DIGIT0_SEGMENTS[segIndex];
            const offsetX = digitIndex * TM1650_DIGIT_STEP_X;
            const p1 = this.toModuleCoord(def.x1 + offsetX, def.y1);
            const p2 = this.toModuleCoord(def.x2 + offsetX, def.y2);

            const scale = WomTm1650Module.SPRITE_BOUNDS.width / TM1650_NATIVE_W;
            const strokeWidth = (def.isDot ? 25 : 18) * scale;

            return <SVGLineElement>svg.child(this.overlayGroup, "line", {
                x1: p1.x.toFixed(2),
                y1: p1.y.toFixed(2),
                x2: p2.x.toFixed(2),
                y2: p2.y.toFixed(2),
                stroke: "#ef4444",
                "stroke-width": strokeWidth.toFixed(2),
                "stroke-linecap": "round",
                opacity: "0",
                style: "pointer-events: none; filter: drop-shadow(0px 0px 2px rgba(239, 68, 68, 0.75)); transition: opacity 0.05s linear;"
            });
        }

        /**
         * Create all 32 red segment overlay lines (4 digits x 8 segments) over the background PNG.
         */
        private buildDisplayOverlay(): void {
            this.segmentLines = [];
            for (let d = 0; d < 4; d++) {
                const digitEls: SVGLineElement[] = [];
                for (let s = 0; s < 8; s++) {
                    digitEls.push(this.createSegmentLine(d, s));
                }
                this.segmentLines.push(digitEls);
            }
        }

        /**
         * Update the red segment overlay lines for a single digit position (0..3).
         */
        public drawDigitSegments(digitIndex: number, mask: number, activeOpacity: string): void {
            const lines = this.segmentLines[digitIndex];
            if (!lines) return;
            for (let s = 0; s < 8; s++) {
                const isLit = this.displayOn && ((mask & (1 << s)) !== 0);
                lines[s].setAttribute("opacity", isLit ? activeOpacity : "0");
            }
        }

        /**
         * Refresh all 4 digits' segment overlays and the module status badge.
         */
        public renderDisplay(): void {
            // Map intensity (1..8) to a vivid opacity range (0.55..1.0) when display is on
            const clampedIntensity = Math.max(1, Math.min(8, this.intensity || 3));
            const activeOpacity = this.displayOn
                ? (0.52 + (clampedIntensity / 8) * 0.48).toFixed(2)
                : "0";

            for (let d = 0; d < 4; d++) {
                this.drawDigitSegments(d, this.digitMasks[d] || 0, activeOpacity);
            }

            if (!this.displayOn) {
                this.setBadgeText("OFF", "#64748b");
                return;
            }

            const anyLit = this.digitMasks.some(m => (m & 0xff) !== 0);
            if (!anyLit) {
                this.setBadgeText("ON", "#ef4444");
                return;
            }

            let text = "";
            for (let d = 0; d < 4; d++) {
                const mask = this.digitMasks[d] & 0xff;
                const seg7 = mask & 0x7f;
                const dp = (mask & 0x80) !== 0;
                const ch = SEG_TO_CHAR[seg7] !== undefined ? SEG_TO_CHAR[seg7] : "?";
                text += ch + (dp ? "." : "");
            }
            this.setBadgeText(text.trim() || "ON", "#ef4444");
        }

        /**
         * Handle I2C writes to TM1650 command register (0x24) and digit registers (0x34..0x37).
         */
        public onI2cWrite(address: number, byteVal: number): void {
            const b = byteVal & 0xff;
            if (address === 0x24) {
                this.displayOn = (b & 0x01) !== 0;
                if (this.displayOn) {
                    const rawIntensity = (b >> 4) & 0x07;
                    if (rawIntensity > 0) {
                        this.intensity = rawIntensity;
                    } else if ((b & 0x80) !== 0) {
                        // In TM1650, dat = 8 produces (8 << 4) | 0x01 = 0x81 (max brightness)
                        this.intensity = 8;
                    } else if (this.intensity <= 0) {
                        this.intensity = 3;
                    }
                }
            } else if (address >= 0x34 && address <= 0x37) {
                const digitIndex = address - 0x34;
                this.digitMasks[digitIndex] = b;
            }

            this.renderDisplay();
            if (typeof runtime !== "undefined" && runtime) {
                runtime.queueDisplayUpdate();
            }
        }

        public updateState(): void {
            this.renderDisplay();
        }
    }

    WomModuleManager.registerFactory(
        "tm1650",
        (pins) => new WomTm1650Module(pins)
    );

    WomModuleManager.registerI2cHandler([0x24, 0x34, 0x35, 0x36, 0x37], {
        onWrite(b: DalBoard, address: number, buf: RefBuffer) {
            if (!buf || !buf.data || buf.data.length === 0) return;
            const mgr = WomModuleManager.get(b);
            if (!mgr) return;
            const mod = mgr.ensureModule<WomTm1650Module>("tm1650", ["P19", "P20"]);
            if (mod) {
                mod.onI2cWrite(address, buf.data[0]);
            }
        }
    });
}


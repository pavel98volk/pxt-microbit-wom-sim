/// <reference path="./womManager.ts" />
/// <reference path="./womColorCamera.ts" />

namespace pxsim.visuals {
    interface ColorBall {
        id: "red" | "green" | "blue" | "yellow";
        label: string;
        targetRgb: [number, number, number];
        fill: string;
        stroke: string;
        homeX: number;
        x: number;
        y: number;
        vy: number;
        isDragging: boolean;
        group: SVGGElement;
        circle: SVGCircleElement;
    }

    export class WomColorModule extends WomModuleBase {
        private static readonly I2C_ADDR = 0x53;
        private static readonly REG_R = 0x10;
        private static readonly REG_G = 0x0d;
        private static readonly REG_B = 0x13;

        /** Sensor center in module coordinates (between the two white arrows on wom_color_recognition.png) */
        private readonly sensorCenterX = 74;
        private readonly sensorCenterY = 72;
        /** Outer radius where color recognition begins transitioning from dark grey (100,100,100) */
        private readonly detectRadius = 42;
        /** Inner dead-center radius where target color is 100% pure with zero noise */
        private readonly deadCenterRadius = 3.5;
        /** Radius of each draggable colored circle */
        private readonly ballRadius = 8.5;
        /** Y coordinate of the bottom floor where circles rest under gravity */
        private readonly floorY = 123;
        /** Downward gravity acceleration in px/s^2 */
        private readonly gravity = 460;

        private balls: ColorBall[] = [];
        private activeRegister: number = WomColorModule.REG_R;

        /** Latest sampled RGB values (0..255) */
        private currentR = 105;
        private currentG = 105;
        private currentB = 105;
        private lastNoiseTime = 0;

        /** Camera mode state & UI elements */
        private cameraMode = false;
        private cameraToggling = false;
        private readonly camera = new WomColorCamera();
        private cameraBtnGroup: SVGGElement;
        private cameraBtnCircle: SVGCircleElement;
        private cameraBtnIcon: SVGImageElement;
        private cameraGreenFilterId: string;

        private centerSwatch: SVGCircleElement;
        private rangeRing: SVGCircleElement;
        private animFrameId: number | null = null;
        private lastFrameTime = 0;

        constructor(pins: string[]) {
            super({
                moduleType: "color",
                displayName: "Color",
                pins: ["P19", "P20"],
                colSpan: 1,
                rowSpan: 1,
                sprite: "sprites/wom_color_recognition.png",
                padEdge: "left",
                wiredPins: ["P19", "P20"]
            });

            this.cameraGreenFilterId = `wom-cam-green-${this.pinKey.replace(/[^a-zA-Z0-9_-]/g, "")}`;

            // 1. Always-lit white illumination LED glow at (74, 54)
            const whiteLed = this.addCircleOverlay(74, 54, 8, "#ffffff", 0.55);
            whiteLed.setAttribute("opacity", "1");

            // 2. Dashed sensing boundary ring around sensor center (74, 72)
            this.rangeRing = <SVGCircleElement>svg.child(this.overlayGroup, "circle", {
                cx: this.sensorCenterX,
                cy: this.sensorCenterY,
                r: this.detectRadius,
                fill: "none",
                stroke: "#94a3b8",
                "stroke-width": 1,
                "stroke-dasharray": "3,3",
                opacity: 0.55,
                style: "pointer-events: none;"
            });

            // 3. Central sensor aperture swatch showing the currently recognized RGB color
            this.centerSwatch = <SVGCircleElement>svg.child(this.overlayGroup, "circle", {
                cx: this.sensorCenterX,
                cy: this.sensorCenterY,
                r: 9,
                fill: "rgb(100, 100, 100)",
                "fill-opacity": 0.85,
                stroke: "#e2e8f0",
                "stroke-width": 1.2,
                style: "pointer-events: none;"
            });

            // 4. Create the 4 draggable colored circles (Red, Green, Blue, Yellow)
            const defs: {
                id: "red" | "green" | "blue" | "yellow";
                label: string;
                targetRgb: [number, number, number];
                fill: string;
                stroke: string;
                homeX: number;
                startY: number;
            }[] = [
                { id: "red", label: "R", targetRgb: [255, 0, 0], fill: "#ef4444", stroke: "#fecaca", homeX: 33, startY: 92 },
                { id: "green", label: "G", targetRgb: [0, 255, 0], fill: "#22c55e", stroke: "#bbf7d0", homeX: 60, startY: 84 },
                { id: "blue", label: "B", targetRgb: [0, 0, 255], fill: "#3b82f6", stroke: "#bfdbfe", homeX: 88, startY: 88 },
                { id: "yellow", label: "Y", targetRgb: [255, 255, 0], fill: "#eab308", stroke: "#fef08a", homeX: 115, startY: 96 }
            ];

            for (const d of defs) {
                const group = <SVGGElement>svg.child(this.overlayGroup, "g", {
                    transform: `translate(${d.homeX}, ${d.startY})`,
                    style: "cursor: grab;"
                });

                // Invisible hit target for easier grabbing
                svg.child(group, "circle", {
                    cx: 0,
                    cy: 0,
                    r: this.ballRadius + 4,
                    fill: "transparent"
                });

                const circle = <SVGCircleElement>svg.child(group, "circle", {
                    cx: 0,
                    cy: 0,
                    r: this.ballRadius,
                    fill: d.fill,
                    stroke: d.stroke,
                    "stroke-width": 1.6,
                    style: "filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.65));"
                });

                this.balls.push({
                    id: d.id,
                    label: d.label,
                    targetRgb: d.targetRgb,
                    fill: d.fill,
                    stroke: d.stroke,
                    homeX: d.homeX,
                    x: d.homeX,
                    y: d.startY,
                    vy: 0,
                    isDragging: false,
                    group,
                    circle
                });
            }

            // 5. Camera mode toggle button in top-left corner of sensor
            this.createCameraButton();

            this.setupDragging();
            this.sampleRgb(true);
            this.ensurePhysicsLoop();
        }

        private createCameraButton(): void {
            const defs = svg.child(this.overlayGroup, "defs", {});
            const filter = svg.child(defs, "filter", {
                id: this.cameraGreenFilterId,
                "color-interpolation-filters": "sRGB"
            });
            // Recolor the grey sprite (#64748b) to vibrant green (#22c55e -> R:0.133, G:0.773, B:0.369)
            svg.child(filter, "feColorMatrix", {
                type: "matrix",
                values: "0 0 0 0 0.133  0 0 0 0 0.773  0 0 0 0 0.369  0 0 0 1 0"
            });

            const btnX = 27;
            const btnY = 25;
            const btnRadius = 11.5;
            const iconSize = 15;

            const btnGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {
                class: "wom-color-camera-btn",
                style: "cursor: pointer;"
            });

            const titleEl = <SVGTitleElement>svg.child(btnGroup, "title", {});
            titleEl.textContent = "Camera mode";

            this.cameraBtnCircle = <SVGCircleElement>svg.child(btnGroup, "circle", {
                cx: btnX,
                cy: btnY,
                r: btnRadius,
                fill: "#f8fafc",
                "fill-opacity": 0.9,
                stroke: "#94a3b8",
                "stroke-width": 1.4,
                style: "cursor: pointer;"
            });

            this.cameraBtnIcon = <SVGImageElement>svg.child(btnGroup, "image", {
                x: btnX - iconSize / 2,
                y: btnY - iconSize / 2,
                width: iconSize,
                height: iconSize,
                style: "pointer-events: none;"
            });
            this.setImageHref(this.cameraBtnIcon, "sprites/color_camera.svg");

            btnGroup.addEventListener("mouseenter", () => {
                this.cameraBtnCircle.setAttribute(
                    "stroke",
                    this.cameraMode ? "#16a34a" : "#64748b"
                );
            });
            btnGroup.addEventListener("mouseleave", () => {
                this.cameraBtnCircle.setAttribute(
                    "stroke",
                    this.cameraMode ? "#22c55e" : "#94a3b8"
                );
            });
            btnGroup.addEventListener("pointerdown", (e) => {
                e.stopPropagation();
            });
            btnGroup.addEventListener("mousedown", (e) => {
                e.stopPropagation();
            });
            btnGroup.addEventListener("click", (e) => {
                e.stopPropagation();
                this.toggleCameraMode();
            });

            this.cameraBtnGroup = btnGroup;
            this.updateCameraButtonVisuals();
        }

        private updateCameraButtonVisuals(): void {
            if (!this.cameraBtnCircle || !this.cameraBtnIcon) return;
            if (this.cameraMode) {
                this.cameraBtnIcon.setAttribute("filter", `url(#${this.cameraGreenFilterId})`);
                this.cameraBtnCircle.setAttribute("stroke", "#22c55e");
                this.cameraBtnCircle.setAttribute("fill", "#f0fdf4");
            } else {
                this.cameraBtnIcon.removeAttribute("filter");
                this.cameraBtnCircle.setAttribute("stroke", "#94a3b8");
                this.cameraBtnCircle.setAttribute("fill", "#f8fafc");
            }
        }

        private setBallsVisible(visible: boolean): void {
            for (const ball of this.balls) {
                if (!visible) {
                    ball.isDragging = false;
                    ball.vy = 0;
                    ball.group.style.cursor = "grab";
                    ball.circle.setAttribute("stroke-width", "1.6");
                    ball.group.style.display = "none";
                } else {
                    ball.group.style.display = "";
                }
            }
        }

        private async toggleCameraMode(): Promise<void> {
            if (this.cameraToggling) return;

            if (this.cameraMode) {
                this.exitCameraMode();
                return;
            }

            this.cameraToggling = true;
            // Show immediate visual feedback while awaiting camera permission / stream startup
            this.cameraBtnCircle.setAttribute("stroke", "#22c55e");
            const started = await this.camera.start();
            this.cameraToggling = false;

            if (!started || !this.element.isConnected) {
                this.exitCameraMode();
                return;
            }

            this.cameraMode = true;
            this.setBallsVisible(false);
            this.updateCameraButtonVisuals();
            // Ensure camera button stays above any previously dragged circles
            this.overlayGroup.appendChild(this.cameraBtnGroup);
            this.sampleRgb(true);
            this.ensurePhysicsLoop();
            if (typeof runtime !== "undefined" && runtime) {
                runtime.queueDisplayUpdate();
            }
        }

        private exitCameraMode(): void {
            this.cameraMode = false;
            this.camera.stop();
            this.setBallsVisible(true);
            this.updateCameraButtonVisuals();
            this.sampleRgb(true);
            this.ensurePhysicsLoop();
            if (typeof runtime !== "undefined" && runtime) {
                runtime.queueDisplayUpdate();
            }
        }

        private setupDragging(): void {
            let activeBall: ColorBall | null = null;

            for (const ball of this.balls) {
                ball.group.addEventListener("pointerdown", (e: PointerEvent) => {
                    if (this.cameraMode) return;
                    e.stopPropagation();
                    e.preventDefault();
                    activeBall = ball;
                    ball.isDragging = true;
                    ball.vy = 0;
                    ball.group.style.cursor = "grabbing";
                    ball.circle.setAttribute("stroke-width", "2.4");
                    // Bring dragged circle to front of overlayGroup, keeping camera button on top
                    this.overlayGroup.appendChild(ball.group);
                    if (this.cameraBtnGroup) {
                        this.overlayGroup.appendChild(this.cameraBtnGroup);
                    }
                    try {
                        ball.group.setPointerCapture(e.pointerId);
                    } catch (_) {}
                });
            }

            const onPointerMove = (e: PointerEvent) => {
                if (!activeBall || this.cameraMode) return;
                e.stopPropagation();
                e.preventDefault();
                const rect = this.element.getBoundingClientRect();
                if (!rect.width || !rect.height) return;

                let localX = ((e.clientX - rect.left) / rect.width) * this.width;
                let localY = ((e.clientY - rect.top) / rect.height) * this.height;

                localX = Math.max(16, Math.min(this.width - 16, localX));
                localY = Math.max(14, Math.min(this.floorY, localY));

                // Gentle snap when very close to dead center so user can easily test dead-center (0 noise)
                const distToCenter = Math.hypot(localX - this.sensorCenterX, localY - this.sensorCenterY);
                if (distToCenter <= this.deadCenterRadius) {
                    localX = this.sensorCenterX;
                    localY = this.sensorCenterY;
                }

                activeBall.x = localX;
                activeBall.y = localY;
                activeBall.vy = 0;
                activeBall.group.setAttribute("transform", `translate(${localX.toFixed(1)}, ${localY.toFixed(1)})`);

                this.sampleRgb(true);
                this.ensurePhysicsLoop();
                if (typeof runtime !== "undefined" && runtime) {
                    runtime.queueDisplayUpdate();
                }
            };

            const onPointerUp = (e?: PointerEvent) => {
                if (!activeBall) return;
                const released = activeBall;
                activeBall = null;
                released.isDragging = false;
                released.group.style.cursor = "grab";
                released.circle.setAttribute("stroke-width", "1.6");
                if (e) {
                    try {
                        released.group.releasePointerCapture(e.pointerId);
                    } catch (_) {}
                }
                this.ensurePhysicsLoop();
            };

            for (const ball of this.balls) {
                ball.group.addEventListener("pointermove", onPointerMove);
                ball.group.addEventListener("pointerup", onPointerUp);
                ball.group.addEventListener("pointercancel", onPointerUp);
            }
            this.element.addEventListener("pointermove", onPointerMove);
            this.element.addEventListener("pointerup", onPointerUp);
            this.element.addEventListener("pointercancel", onPointerUp);
            this.element.addEventListener("pointerleave", onPointerUp);
        }

        /**
         * Run gravity simulation in ball mode or continuous frame sampling in camera mode.
         */
        private ensurePhysicsLoop(): void {
            if (this.animFrameId !== null) return;
            this.lastFrameTime = performance.now();

            const step = (now: number) => {
                if (!this.element.isConnected) {
                    this.animFrameId = null;
                    if (this.cameraMode || this.camera.isActive()) {
                        this.camera.stop();
                        this.cameraMode = false;
                    }
                    return;
                }

                if (this.cameraMode) {
                    if (!this.camera.isActive()) {
                        this.animFrameId = null;
                        this.exitCameraMode();
                        return;
                    }
                    this.sampleRgb(false);
                    this.animFrameId = requestAnimationFrame(step);
                    return;
                }

                const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameTime) / 1000));
                this.lastFrameTime = now;

                let anyMoving = false;
                for (const ball of this.balls) {
                    if (ball.isDragging) {
                        anyMoving = true;
                        continue;
                    }

                    const needsFall = ball.y < this.floorY - 0.1 || Math.abs(ball.vy) > 1;
                    const needsHomeDrift = ball.y >= this.floorY - 2 && Math.abs(ball.x - ball.homeX) > 0.4;

                    if (needsFall || needsHomeDrift) {
                        anyMoving = true;
                        ball.vy += this.gravity * dt;
                        ball.y += ball.vy * dt;

                        if (ball.y >= this.floorY) {
                            ball.y = this.floorY;
                            if (Math.abs(ball.vy) > 45) {
                                ball.vy = -ball.vy * 0.22;
                            } else {
                                ball.vy = 0;
                            }
                        }

                        // Gently return X toward its resting slot along the bottom so circles don't stack
                        if (ball.y >= this.floorY - 4) {
                            ball.x += (ball.homeX - ball.x) * Math.min(1, dt * 10);
                            if (Math.abs(ball.x - ball.homeX) <= 0.4) {
                                ball.x = ball.homeX;
                            }
                        }

                        ball.group.setAttribute(
                            "transform",
                            `translate(${ball.x.toFixed(1)}, ${ball.y.toFixed(1)})`
                        );
                    }
                }

                this.sampleRgb(false);

                if (anyMoving) {
                    this.animFrameId = requestAnimationFrame(step);
                } else {
                    this.animFrameId = null;
                }
            };

            this.animFrameId = requestAnimationFrame(step);
        }

        /**
         * Compute the closest circle and proximity factor t in [0, 1].
         * - t = 0 when all circles are outside detectRadius (e.g., fallen to bottom).
         * - 0 < t < 1 inside detectRadius.
         * - t = 1 inside deadCenterRadius (dead center: pure target color, zero noise).
         */
        private computeProximityModel(): {
            closest: ColorBall | null;
            t: number;
            baseR: number;
            baseG: number;
            baseB: number;
        } {
            let closest: ColorBall | null = null;
            let minDist = Infinity;

            for (const ball of this.balls) {
                const d = Math.hypot(ball.x - this.sensorCenterX, ball.y - this.sensorCenterY);
                if (d < minDist) {
                    minDist = d;
                    closest = ball;
                }
            }

            // Dark grey baseline when all circles are far from center
            const darkGrey = 100;

            if (!closest || minDist >= this.detectRadius) {
                return {
                    closest: null,
                    t: 0,
                    baseR: darkGrey,
                    baseG: darkGrey,
                    baseB: darkGrey
                };
            }

            if (minDist <= this.deadCenterRadius) {
                return {
                    closest,
                    t: 1,
                    baseR: closest.targetRgb[0],
                    baseG: closest.targetRgb[1],
                    baseB: closest.targetRgb[2]
                };
            }

            const t = (this.detectRadius - minDist) / (this.detectRadius - this.deadCenterRadius);
            const [tr, tg, tb] = closest.targetRgb;

            return {
                closest,
                t,
                baseR: darkGrey + t * (tr - darkGrey),
                baseG: darkGrey + t * (tg - darkGrey),
                baseB: darkGrey + t * (tb - darkGrey)
            };
        }

        /**
         * Generate uniform noise in [0, 10] (max 10, median 5), scaled by (1 - t)
         * so that dead center (t = 1) has zero noise.
         */
        private generateChannelNoise(t: number): number {
            if (t >= 1) return 0;
            return (1 - t) * (Math.random() * 10);
        }

        /**
         * Sample RGB values from the active mode (camera mean RGB or ball proximity + noise)
         * and update visual overlays.
         */
        public sampleRgb(forceNewNoise = false): [number, number, number] {
            if (this.cameraMode) {
                const sampled = this.camera.sampleAverageRgb();
                if (sampled) {
                    this.currentR = sampled[0];
                    this.currentG = sampled[1];
                    this.currentB = sampled[2];
                }
                const rgbCss = `rgb(${this.currentR}, ${this.currentG}, ${this.currentB})`;
                this.centerSwatch.setAttribute("fill", rgbCss);
                this.rangeRing.setAttribute("stroke", rgbCss);
                this.rangeRing.setAttribute("opacity", "1");
                this.setBadgeText(`${this.currentR},${this.currentG},${this.currentB}`, rgbCss);
                return [this.currentR, this.currentG, this.currentB];
            }

            const now = performance.now();
            const model = this.computeProximityModel();

            if (forceNewNoise || now - this.lastNoiseTime >= 80 || model.t >= 1) {
                this.lastNoiseTime = now;
                const nR = this.generateChannelNoise(model.t);
                const nG = this.generateChannelNoise(model.t);
                const nB = this.generateChannelNoise(model.t);

                this.currentR = Math.max(0, Math.min(255, Math.round(model.baseR + nR)));
                this.currentG = Math.max(0, Math.min(255, Math.round(model.baseG + nG)));
                this.currentB = Math.max(0, Math.min(255, Math.round(model.baseB + nB)));
            }

            const rgbCss = `rgb(${this.currentR}, ${this.currentG}, ${this.currentB})`;
            this.centerSwatch.setAttribute("fill", rgbCss);

            if (model.t >= 1 && model.closest) {
                this.rangeRing.setAttribute("stroke", model.closest.fill);
                this.rangeRing.setAttribute("opacity", "0.95");
            } else if (model.t > 0 && model.closest) {
                this.rangeRing.setAttribute("stroke", model.closest.fill);
                this.rangeRing.setAttribute("opacity", "0.75");
            } else {
                this.rangeRing.setAttribute("stroke", "#94a3b8");
                this.rangeRing.setAttribute("opacity", "0.55");
            }

            const badgeColor = model.closest && model.t > 0.15 ? model.closest.fill : "#94a3b8";
            this.setBadgeText(`${this.currentR},${this.currentG},${this.currentB}`, badgeColor);

            return [this.currentR, this.currentG, this.currentB];
        }

        public onI2cWrite(buf: RefBuffer): void {
            if (!buf || !buf.data || buf.data.length === 0) return;
            const reg = buf.data[0] & 0xff;
            if (
                reg === WomColorModule.REG_R ||
                reg === WomColorModule.REG_G ||
                reg === WomColorModule.REG_B
            ) {
                this.activeRegister = reg;
                if (reg === WomColorModule.REG_R) {
                    this.sampleRgb(true);
                }
            }
        }

        public onI2cRead(size: number): RefBuffer {
            const out = pxsim.pins.createBuffer(size);
            if (size >= 2) {
                let channelVal = this.currentR;
                if (this.activeRegister === WomColorModule.REG_G) {
                    channelVal = this.currentG;
                } else if (this.activeRegister === WomColorModule.REG_B) {
                    channelVal = this.currentB;
                }
                // Encode exact 0..255 channel value in low byte and simulator marker 0x80 in high byte
                out.data[0] = channelVal & 0xff;
                out.data[1] = 0x80;
            }
            return out;
        }

        public updateState(): void {
            this.sampleRgb(false);
        }
    }

    WomModuleManager.registerFactory(
        "color",
        (pins) => new WomColorModule(pins),
        (b) => {
            const mgr = WomModuleManager.get(b);
            if (!mgr) return;
            mgr.ensureModule<WomColorModule>("color", ["P19", "P20"]);
        }
    );

    WomModuleManager.registerI2cHandler([0x53], {
        onWrite(b: DalBoard, _address: number, buf: RefBuffer) {
            const mgr = WomModuleManager.get(b);
            if (!mgr) return;
            const mod = mgr.ensureModule<WomColorModule>("color", ["P19", "P20"]);
            if (mod) {
                mod.onI2cWrite(buf);
            }
        },
        onRead(b: DalBoard, _address: number, size: number): RefBuffer | undefined {
            const mgr = WomModuleManager.get(b);
            if (!mgr) return undefined;
            const mod = mgr.ensureModule<WomColorModule>("color", ["P19", "P20"]);
            if (mod) {
                return mod.onI2cRead(size);
            }
            return undefined;
        }
    });
}

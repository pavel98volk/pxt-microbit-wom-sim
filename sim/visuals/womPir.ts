/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomPirModule extends WomModuleBase {
        /** Internal state variable (0 to 1023) representing accumulated motion energy */
        private internalEnergy = 0;
        /** Binary motion detection state (derived from internalEnergy >= MOTION_THRESHOLD) */
        private motionDetected = false;

        private readonly sensorCenterX = 74;
        private readonly sensorCenterY = 68;
        private readonly circleRadius = 16;
        private readonly MOTION_THRESHOLD = 150;
        private readonly DECAY_RATE = 500; // Units per second (1023 decays to < 150 in ~1.75s, 0 in ~2s)

        // Circle positions
        private handX = 38;
        private handY = 110;
        private robotX = 110;
        private robotY = 110;

        // Kinematic tracking for hand
        private prevHandDist = 0;
        private prevHandAngle = 0;
        private isObstructed = false;

        // Visual elements
        private domeGlow: SVGCircleElement;
        private arrowGroup: SVGGElement;
        private arrowShaft: SVGLineElement;
        private arrowHead: SVGPolygonElement;
        private handGroup: SVGGElement;
        private handBtnCircle: SVGCircleElement;
        private robotGroup: SVGGElement;
        private robotBtnCircle: SVGCircleElement;

        // Animation frame for decay loop
        private decayAnimId: number | null = null;
        private lastDecayTime = 0;

        constructor(pins: string[]) {
            super({
                moduleType: "pir",
                displayName: "PIR",
                pins,
                colSpan: 1,
                rowSpan: 1,
                sprite: "/sim/sprites/wom_pir.png",
                padEdge: "left",
                wiredPins: [pins[0]]
            });

            // 1. Red glow over the PIR dome when motion is detected
            this.domeGlow = this.addCircleOverlay(this.sensorCenterX, this.sensorCenterY, 40, "#ef4444", 0.35);

            // 2. Red directional arrow group (rendered beneath hand and robot circles)
            this.arrowGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {
                class: "wom-pir-arrow",
                style: "pointer-events: none; filter: drop-shadow(0px 0px 1.5px rgba(0,0,0,0.6));"
            });
            this.arrowShaft = <SVGLineElement>svg.child(this.arrowGroup, "line", {
                stroke: "#ef4444",
                "stroke-linecap": "round"
            });
            this.arrowHead = <SVGPolygonElement>svg.child(this.arrowGroup, "polygon", {
                fill: "#ef4444"
            });

            // 3. Draggable Warm Hand button circle
            this.handGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {
                transform: `translate(${this.handX}, ${this.handY})`,
                style: "cursor: grab;"
            });
            this.handBtnCircle = <SVGCircleElement>svg.child(this.handGroup, "circle", {
                cx: 0,
                cy: 0,
                r: this.circleRadius,
                fill: "#1e293b",
                "fill-opacity": 0.9,
                stroke: "#ef4444",
                "stroke-width": 1.8
            });
            const handImg = <SVGImageElement>svg.child(this.handGroup, "image", {
                x: -11,
                y: -11,
                width: 22,
                height: 22,
                style: "pointer-events: none;"
            });
            handImg.setAttributeNS("http://www.w3.org/1999/xlink", "href", "/sim/sprites/pir_hand.svg");
            handImg.setAttribute("href", "/sim/sprites/pir_hand.svg");

            // 4. Draggable Cold Robot button circle (cold slate tone with subtle blue tint)
            this.robotGroup = <SVGGElement>svg.child(this.overlayGroup, "g", {
                transform: `translate(${this.robotX}, ${this.robotY})`,
                style: "cursor: grab;"
            });
            this.robotBtnCircle = <SVGCircleElement>svg.child(this.robotGroup, "circle", {
                cx: 0,
                cy: 0,
                r: this.circleRadius,
                fill: "#1e293b",
                "fill-opacity": 0.9,
                stroke: "#64748b",
                "stroke-width": 1.8
            });
            const robotImg = <SVGImageElement>svg.child(this.robotGroup, "image", {
                x: -11,
                y: -11,
                width: 22,
                height: 22,
                style: "pointer-events: none;"
            });
            robotImg.setAttributeNS("http://www.w3.org/1999/xlink", "href", "/sim/sprites/pir_robot.svg");
            robotImg.setAttribute("href", "/sim/sprites/pir_robot.svg");

            // Initialize kinematic baselines
            const initDx = this.sensorCenterX - this.handX;
            const initDy = this.sensorCenterY - this.handY;
            this.prevHandDist = Math.hypot(initDx, initDy);
            this.prevHandAngle = Math.atan2(initDy, initDx);
            const initialObs = this.checkObstructed();
            this.isObstructed = initialObs.obstructed;

            // Setup dragging interactions
            this.setupDraggables();

            // Initial render
            this.renderArrow(initialObs);
            this.setBadgeText("Idle", "#64748b");
            this.syncPinState();
        }

        private setupDraggables(): void {
            let activeDrag: "hand" | "robot" | null = null;

            const startDrag = (target: "hand" | "robot", group: SVGGElement, circle: SVGCircleElement, e: PointerEvent) => {
                e.stopPropagation();
                e.preventDefault();
                activeDrag = target;
                group.style.cursor = "grabbing";
                circle.setAttribute("stroke-width", "2.5");
                try {
                    group.setPointerCapture(e.pointerId);
                } catch (_) {}
            };

            const handleMove = (e: PointerEvent) => {
                if (!activeDrag) return;
                e.stopPropagation();
                e.preventDefault();
                const rect = this.element.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                const localX = Math.max(18, Math.min(this.width - 18, ((e.clientX - rect.left) / rect.width) * this.width));
                const localY = Math.max(18, Math.min(this.height - 24, ((e.clientY - rect.top) / rect.height) * this.height));
                if (activeDrag === "hand") {
                    this.moveHand(localX, localY);
                } else {
                    this.moveRobot(localX, localY);
                }
            };

            const stopDrag = (e?: PointerEvent) => {
                if (!activeDrag) return;
                if (activeDrag === "hand") {
                    this.handGroup.style.cursor = "grab";
                    this.handBtnCircle.setAttribute("stroke-width", "1.8");
                    if (e) {
                        try { this.handGroup.releasePointerCapture(e.pointerId); } catch (_) {}
                    }
                } else {
                    this.robotGroup.style.cursor = "grab";
                    this.robotBtnCircle.setAttribute("stroke-width", "1.8");
                    if (e) {
                        try { this.robotGroup.releasePointerCapture(e.pointerId); } catch (_) {}
                    }
                }
                activeDrag = null;
            };

            this.handGroup.addEventListener("pointerdown", (e: PointerEvent) => startDrag("hand", this.handGroup, this.handBtnCircle, e));
            this.robotGroup.addEventListener("pointerdown", (e: PointerEvent) => startDrag("robot", this.robotGroup, this.robotBtnCircle, e));

            this.handGroup.addEventListener("pointermove", handleMove);
            this.robotGroup.addEventListener("pointermove", handleMove);
            this.element.addEventListener("pointermove", handleMove);

            this.handGroup.addEventListener("pointerup", stopDrag);
            this.robotGroup.addEventListener("pointerup", stopDrag);
            this.element.addEventListener("pointerup", stopDrag);
            this.element.addEventListener("pointercancel", stopDrag);
            this.element.addEventListener("pointerleave", stopDrag);
        }

        private checkObstructed(): { obstructed: boolean; tHit: number } {
            const dx = this.sensorCenterX - this.handX;
            const dy = this.sensorCenterY - this.handY;
            const D = Math.hypot(dx, dy);
            if (D < 1) return { obstructed: false, tHit: D };

            const ux = dx / D;
            const uy = dy / D;
            const nx = -uy;
            const ny = ux;

            const vx = this.robotX - this.handX;
            const vy = this.robotY - this.handY;
            const tProj = vx * ux + vy * uy;
            const dPerp = Math.abs(vx * nx + vy * ny);

            // Is the robot along the ray between the hand and the sensor center?
            if (tProj > 0 && tProj < D + this.circleRadius && dPerp < this.circleRadius) {
                const deltaT = Math.sqrt(this.circleRadius * this.circleRadius - dPerp * dPerp);
                const tHit = tProj - deltaT;
                if (tHit < D) {
                    return { obstructed: true, tHit: Math.max(0, tHit) };
                }
            }
            return { obstructed: false, tHit: D };
        }

        private moveHand(newX: number, newY: number): void {
            this.handX = newX;
            this.handY = newY;
            this.handGroup.setAttribute("transform", `translate(${newX}, ${newY})`);

            const dx = this.sensorCenterX - newX;
            const dy = this.sensorCenterY - newY;
            const D = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx);

            const obs = this.checkObstructed();

            // Check if obstruction state flipped
            if (obs.obstructed !== this.isObstructed) {
                this.internalEnergy = Math.min(1023, this.internalEnergy + 350);
                this.isObstructed = obs.obstructed;
            }

            if (!obs.obstructed) {
                // Direction change (in radians, branch-cut normalized)
                const deltaAngle = Math.abs(this.normalizeAngle(angle - this.prevHandAngle));
                // Thickness / distance change (in pixels)
                const deltaDist = Math.abs(D - this.prevHandDist);

                // Proximity factor (0 when far at D >= 85, 1 when close at D <= 20)
                const tClose = Math.max(0, Math.min(1, 1 - (D - 20) / 65));
                // More sensitive when closer to sensor center
                const sensitivity = 1.0 + 2.5 * tClose;

                const addedEnergy = (600 * deltaAngle + 12 * deltaDist) * sensitivity;
                this.internalEnergy = Math.min(1023, this.internalEnergy + addedEnergy);
            }
            // If obstructed, treat movement energy as 0

            this.prevHandAngle = angle;
            this.prevHandDist = D;

            this.ensureDecayLoop();
            this.renderArrow(obs);
            this.updateMotionVisuals();
        }

        private moveRobot(newX: number, newY: number): void {
            this.robotX = newX;
            this.robotY = newY;
            this.robotGroup.setAttribute("transform", `translate(${newX}, ${newY})`);

            const obs = this.checkObstructed();

            // Moving the robot does NOT increase internal state UNLESS obstruction flips
            if (obs.obstructed !== this.isObstructed) {
                this.internalEnergy = Math.min(1023, this.internalEnergy + 350);
                this.isObstructed = obs.obstructed;
                this.ensureDecayLoop();
            }

            this.renderArrow(obs);
            this.updateMotionVisuals();
        }

        private renderArrow(obs: { obstructed: boolean; tHit: number }): void {
            const dx = this.sensorCenterX - this.handX;
            const dy = this.sensorCenterY - this.handY;
            const D = Math.hypot(dx, dy);
            if (D < 1) {
                this.arrowGroup.style.display = "none";
                return;
            }

            const ux = dx / D;
            const uy = dy / D;
            const nx = -uy;
            const ny = ux;

            // Arrow starts at boundary of the hand circle
            const startX = this.handX + ux * this.circleRadius;
            const startY = this.handY + uy * this.circleRadius;

            // Arrow ends at robot circle boundary if obstructed, or sensor center if unobstructed
            let endX: number;
            let endY: number;
            if (obs.obstructed) {
                if (obs.tHit <= this.circleRadius) {
                    // Robot overlaps the hand directly along the ray
                    this.arrowGroup.style.display = "none";
                    return;
                }
                endX = this.handX + ux * obs.tHit;
                endY = this.handY + uy * obs.tHit;
            } else {
                endX = this.sensorCenterX;
                endY = this.sensorCenterY;
            }

            const arrowLen = Math.hypot(endX - startX, endY - startY);
            if (arrowLen < 3) {
                this.arrowGroup.style.display = "none";
                return;
            }
            this.arrowGroup.style.display = "";

            // The closer the hand to the center, the thicker the arrow gets
            const tClose = Math.max(0, Math.min(1, 1 - (D - 20) / 65));
            const shaftWidth = 1.6 + tClose * 3.0; // 1.6px (far) to 4.6px (close)
            const headWidth = 3.0 + tClose * 2.8;   // 3.0px to 5.8px
            const headLen = Math.min(arrowLen * 0.55, 6 + tClose * 4); // 6px to 10px

            const shaftEndX = endX - ux * headLen;
            const shaftEndY = endY - uy * headLen;

            this.arrowShaft.setAttribute("x1", startX.toFixed(1));
            this.arrowShaft.setAttribute("y1", startY.toFixed(1));
            this.arrowShaft.setAttribute("x2", shaftEndX.toFixed(1));
            this.arrowShaft.setAttribute("y2", shaftEndY.toFixed(1));
            this.arrowShaft.setAttribute("stroke-width", shaftWidth.toFixed(1));

            const w1x = shaftEndX + nx * headWidth;
            const w1y = shaftEndY + ny * headWidth;
            const w2x = shaftEndX - nx * headWidth;
            const w2y = shaftEndY - ny * headWidth;

            this.arrowHead.setAttribute(
                "points",
                `${endX.toFixed(1)},${endY.toFixed(1)} ${w1x.toFixed(1)},${w1y.toFixed(1)} ${w2x.toFixed(1)},${w2y.toFixed(1)}`
            );
        }

        private updateMotionVisuals(): void {
            const wasDetected = this.motionDetected;
            this.motionDetected = this.internalEnergy >= this.MOTION_THRESHOLD;

            if (wasDetected !== this.motionDetected) {
                this.domeGlow.setAttribute("opacity", this.motionDetected ? "1" : "0");
                this.setBadgeText(
                    this.motionDetected ? "Motion" : "Idle",
                    this.motionDetected ? "#ef4444" : "#64748b"
                );
                this.syncPinState();
                if (typeof runtime !== "undefined" && runtime) {
                    runtime.queueDisplayUpdate();
                }
            }
        }

        private ensureDecayLoop(): void {
            if (this.decayAnimId !== null) return;
            this.lastDecayTime = performance.now();

            const step = (now: number) => {
                if (!this.element.isConnected) {
                    this.decayAnimId = null;
                    return;
                }

                const dtSec = Math.min(0.1, (now - this.lastDecayTime) / 1000);
                this.lastDecayTime = now;

                if (this.internalEnergy > 0) {
                    this.internalEnergy = Math.max(0, this.internalEnergy - this.DECAY_RATE * dtSec);
                    this.updateMotionVisuals();
                    if (this.internalEnergy > 0) {
                        this.decayAnimId = requestAnimationFrame(step);
                        return;
                    }
                }
                this.decayAnimId = null;
            };

            this.decayAnimId = requestAnimationFrame(step);
        }

        private normalizeAngle(rad: number): number {
            while (rad > Math.PI) rad -= 2 * Math.PI;
            while (rad < -Math.PI) rad += 2 * Math.PI;
            return rad;
        }

        private syncPinState(): void {
            // enPIR.OPIR = 1, enPIR.NoPIR = 0
            this.setDigitalInput(this.pins[0], this.motionDetected ? 1 : 0);
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory("pir", (pins) => new WomPirModule(pins));
}

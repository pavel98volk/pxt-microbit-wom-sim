/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    export class WomIrModule extends WomModuleBase {
        /** True when mouse hovers over the module (obstacle detected -> active-low 0) */
        private obstacleDetected = false;
        private indicatorCircle: SVGCircleElement;

        constructor(pins: string[]) {
            super({
                moduleType: "ir",
                displayName: "IR",
                pins,
                colSpan: 1,
                rowSpan: 1,
                sprite: "/sim/sprites/wom_ir.png",
                padEdge: "top",
                wiredPins: [pins[0]]
            });

            this.indicatorCircle = this.addCircleOverlay(74, 72, 46, "#ef4444", 0.4);
            this.setBadgeText("False", "#64748b");

            this.bindHover((hovering) => {
                this.obstacleDetected = hovering;
                this.indicatorCircle.setAttribute("opacity", hovering ? "1" : "0");
                this.setBadgeText(hovering ? "True" : "False", hovering ? "#ef4444" : "#64748b");
                this.syncPinState();
            });

            this.syncPinState();
        }

        private syncPinState(): void {
            // In Module-World.ts: enObstacle.Obstacle = 0, enObstacle.NoObstacle = 1
            this.setDigitalInput(this.pins[0], this.obstacleDetected ? 0 : 1);
        }

        public updateState(): void {
            this.syncPinState();
        }
    }

    WomModuleManager.registerFactory("ir", (pins) => new WomIrModule(pins));
}

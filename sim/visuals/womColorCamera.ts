/// <reference path="./womManager.ts" />

namespace pxsim.visuals {
    interface CameraContext {
        win: Window;
        doc: Document;
        mediaDevices: MediaDevices;
        constraintsList: MediaStreamConstraints[];
    }

    /**
     * Offscreen webcam controller for the Color Recognition simulator module.
     * Captures video into a hidden <video> element, crops the central square of
     * 50% videoHeight onto an offscreen <canvas>, and computes exact mean R, G, B.
     */
    export class WomColorCamera {
        private static readonly SAMPLE_SIZE = 32;

        private stream: MediaStream | null = null;
        private videoEl: HTMLVideoElement | null = null;
        private canvasEl: HTMLCanvasElement | null = null;
        private ctx: CanvasRenderingContext2D | null = null;
        private active = false;
        private starting = false;

        /**
         * Request camera access and begin streaming into a hidden <video> element.
         * Returns true if the camera stream started, or false if denied / unavailable.
         */
        public async start(): Promise<boolean> {
            if (this.active) return true;
            if (this.starting) return false;
            this.starting = true;

            try {
                this.ensureIframeAllowCamera();

                const acquired = await this.acquireStreamAndContext();
                if (!this.starting || !acquired) {
                    if (acquired && acquired.stream) this.stopStreamTracks(acquired.stream);
                    this.starting = false;
                    return false;
                }

                const { stream, doc } = acquired;
                this.stream = stream;

                const video = doc.createElement("video");
                video.autoplay = true;
                video.muted = true;
                video.playsInline = true;
                video.setAttribute("playsinline", "true");
                video.setAttribute("muted", "true");
                video.style.cssText =
                    "position:fixed;left:-9999px;top:-9999px;width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1;";

                if (doc.body) {
                    doc.body.appendChild(video);
                }

                video.srcObject = stream;
                this.videoEl = video;

                const canvas = doc.createElement("canvas");
                canvas.width = WomColorCamera.SAMPLE_SIZE;
                canvas.height = WomColorCamera.SAMPLE_SIZE;
                this.canvasEl = canvas;
                this.ctx = canvas.getContext("2d", { willReadFrequently: true });

                await this.waitForVideoReady(video);

                if (!this.starting || !this.stream) {
                    this.stop();
                    return false;
                }

                this.active = true;
                this.starting = false;
                console.log("[WoM Sim] Camera mode started");
                return true;
            } catch (err) {
                console.warn("[WoM Sim] Failed to start camera mode:", err);
                this.stop();
                return false;
            }
        }

        /**
         * Stop webcam capture and release all media tracks and offscreen elements.
         */
        public stop(): void {
            const wasActive = this.active;
            this.starting = false;
            this.active = false;

            if (this.stream) {
                this.stopStreamTracks(this.stream);
                this.stream = null;
            }

            if (this.videoEl) {
                try {
                    this.videoEl.pause();
                    this.videoEl.srcObject = null;
                    if (this.videoEl.parentNode) {
                        this.videoEl.parentNode.removeChild(this.videoEl);
                    }
                } catch (_) {}
                this.videoEl = null;
            }

            this.canvasEl = null;
            this.ctx = null;

            if (wasActive) {
                console.log("[WoM Sim] Camera mode stopped");
            }
        }

        public isActive(): boolean {
            if (!this.active || !this.stream) return false;
            const tracks = this.stream.getVideoTracks();
            if (!tracks || tracks.length === 0) return false;
            return tracks.some(t => t.readyState === "live");
        }

        /**
         * Sample the central square of side 50% of videoHeight and compute the exact
         * mean [R, G, B] values (0..255). Returns null if the video frame is not ready.
         */
        public sampleAverageRgb(): [number, number, number] | null {
            if (!this.active || !this.videoEl || !this.ctx || !this.canvasEl) {
                return null;
            }

            const vw = this.videoEl.videoWidth;
            const vh = this.videoEl.videoHeight;
            if (!vw || !vh || this.videoEl.readyState < 2) {
                return null;
            }

            // Crop to 50% of videoHeight as a central square
            const cropSize = Math.max(1, Math.min(vw, Math.floor(vh * 0.5)));
            const sx = Math.max(0, Math.floor((vw - cropSize) / 2));
            const sy = Math.max(0, Math.floor((vh - cropSize) / 2));

            const sampleW = this.canvasEl.width;
            const sampleH = this.canvasEl.height;

            try {
                this.ctx.drawImage(
                    this.videoEl,
                    sx,
                    sy,
                    cropSize,
                    cropSize,
                    0,
                    0,
                    sampleW,
                    sampleH
                );
                const imgData = this.ctx.getImageData(0, 0, sampleW, sampleH);
                const data = imgData.data;
                const pixelCount = sampleW * sampleH;
                if (!pixelCount || data.length < pixelCount * 4) {
                    return null;
                }

                let sumR = 0;
                let sumG = 0;
                let sumB = 0;
                for (let i = 0; i < data.length; i += 4) {
                    sumR += data[i];
                    sumG += data[i + 1];
                    sumB += data[i + 2];
                }

                const meanR = Math.max(0, Math.min(255, Math.round(sumR / pixelCount)));
                const meanG = Math.max(0, Math.min(255, Math.round(sumG / pixelCount)));
                const meanB = Math.max(0, Math.min(255, Math.round(sumB / pixelCount)));

                return [meanR, meanG, meanB];
            } catch (_) {
                return null;
            }
        }

        /**
         * Self-contained helper: if running in a same-origin iframe, ensure the frameElement
         * includes "camera" in its allow attribute before requesting getUserMedia.
         */
        private ensureIframeAllowCamera(): void {
            try {
                if (typeof window !== "undefined" && window.frameElement) {
                    const frame = window.frameElement as HTMLIFrameElement;
                    const currentAllow = frame.getAttribute("allow") || "autoplay;microphone";
                    if (!/camera/i.test(currentAllow)) {
                        frame.setAttribute("allow", `${currentAllow};camera`);
                    }
                }
            } catch (_) {}
        }

        /**
         * Build an ordered list of candidate Window/Document/MediaDevices contexts.
         * IMPORTANT: In Firefox, every object passed into `w.navigator.mediaDevices.getUserMedia(opts)`
         * MUST be allocated inside `w`'s realm (`new (w as any).Object()`), otherwise Firefox throws
         * `DOMException: The object can not be found here.` or rejects the cross-compartment dictionary.
         */
        private getCandidateContexts(): CameraContext[] {
            const contexts: CameraContext[] = [];
            const windows: Window[] = [];

            try {
                if (typeof window !== "undefined" && window.top && window.top !== window) {
                    windows.push(window.top);
                }
            } catch (_) {}

            try {
                if (
                    typeof window !== "undefined" &&
                    window.parent &&
                    window.parent !== window &&
                    windows.indexOf(window.parent) === -1
                ) {
                    windows.push(window.parent);
                }
            } catch (_) {}

            if (typeof window !== "undefined" && windows.indexOf(window) === -1) {
                windows.push(window);
            }

            for (const w of windows) {
                try {
                    const nav = w.navigator;
                    const doc = w.document;
                    if (nav && nav.mediaDevices && typeof nav.mediaDevices.getUserMedia === "function" && doc) {
                        const ObjCtor = (w as any).Object || Object;

                        // Construct constraint objects strictly inside target window w's realm for Firefox
                        const idealW = new ObjCtor();
                        idealW.ideal = 320;
                        const idealH = new ObjCtor();
                        idealH.ideal = 240;
                        const videoDetailed = new ObjCtor();
                        videoDetailed.width = idealW;
                        videoDetailed.height = idealH;

                        const c1 = new ObjCtor();
                        c1.video = videoDetailed;
                        c1.audio = false;

                        const c2 = new ObjCtor();
                        c2.video = true;
                        c2.audio = false;

                        contexts.push({
                            win: w,
                            doc,
                            mediaDevices: nav.mediaDevices,
                            constraintsList: [c1, c2]
                        });
                    }
                } catch (_) {}
            }

            return contexts;
        }

        private async acquireStreamAndContext(): Promise<{ stream: MediaStream; doc: Document } | null> {
            const contexts = this.getCandidateContexts();
            if (contexts.length === 0) {
                console.warn("[WoM Sim] navigator.mediaDevices.getUserMedia is not available.");
                return null;
            }

            let lastErr: any = null;
            for (const ctx of contexts) {
                // Check enumerated videoinput devices first so we can log a clear diagnostic if no camera hardware exists
                let videoInputs: MediaDeviceInfo[] = [];
                try {
                    if (typeof ctx.mediaDevices.enumerateDevices === "function") {
                        const devices = await ctx.mediaDevices.enumerateDevices.call(ctx.mediaDevices);
                        videoInputs = devices.filter((d: MediaDeviceInfo) => d.kind === "videoinput");
                    }
                } catch (_) {}

                for (const constraints of ctx.constraintsList) {
                    try {
                        const stream = await ctx.mediaDevices.getUserMedia.call(ctx.mediaDevices, constraints);
                        if (stream) {
                            return { stream, doc: ctx.doc };
                        }
                    } catch (err: any) {
                        lastErr = err;
                        if (err && (err.name === "NotFoundError" || err.name === "DevicesNotFoundError")) {
                            if (videoInputs.length === 0) {
                                console.warn(
                                    "[WoM Sim] No camera (videoinput) device detected by browser (enumerateDevices returned 0 video inputs)."
                                );
                                return null;
                            }
                            const firstWithId = videoInputs.find((d: MediaDeviceInfo) => !!d.deviceId);
                            if (firstWithId) {
                                try {
                                    const ObjCtor = (ctx.win as any).Object || Object;
                                    const vObj = new ObjCtor();
                                    vObj.deviceId = firstWithId.deviceId;
                                    const fallbackC = new ObjCtor();
                                    fallbackC.video = vObj;
                                    fallbackC.audio = false;
                                    const stream = await ctx.mediaDevices.getUserMedia.call(ctx.mediaDevices, fallbackC);
                                    if (stream) {
                                        return { stream, doc: ctx.doc };
                                    }
                                } catch (_) {}
                            }
                        }
                    }
                }
            }

            if (lastErr) throw lastErr;
            return null;
        }

        private waitForVideoReady(video: HTMLVideoElement): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                let settled = false;
                let timeoutId: any = null;

                const finish = (err?: any) => {
                    if (settled) return;
                    settled = true;
                    if (timeoutId !== null) clearTimeout(timeoutId);
                    video.removeEventListener("loadedmetadata", onReady);
                    video.removeEventListener("loadeddata", onReady);
                    video.removeEventListener("canplay", onReady);
                    video.removeEventListener("playing", onReady);
                    video.removeEventListener("error", onError);
                    if (err) reject(err);
                    else resolve();
                };

                const tryPlay = () => {
                    try {
                        const playPromise = video.play();
                        if (playPromise && typeof playPromise.then === "function") {
                            playPromise.then(() => finish()).catch(() => {
                                if (video.readyState >= 2 || video.videoWidth > 0) {
                                    finish();
                                }
                            });
                        } else if (video.readyState >= 2 || video.videoWidth > 0) {
                            finish();
                        }
                    } catch (_) {
                        if (video.readyState >= 2 || video.videoWidth > 0) {
                            finish();
                        }
                    }
                };

                const onReady = () => {
                    tryPlay();
                };

                const onError = (e: Event) => {
                    finish(e || new Error("Video error"));
                };

                video.addEventListener("loadedmetadata", onReady);
                video.addEventListener("loadeddata", onReady);
                video.addEventListener("canplay", onReady);
                video.addEventListener("playing", onReady);
                video.addEventListener("error", onError);

                tryPlay();

                timeoutId = setTimeout(() => {
                    if (video.videoWidth > 0 || video.readyState >= 2) {
                        finish();
                    } else {
                        finish(new Error("Timed out waiting for camera video stream"));
                    }
                }, 4000);
            });
        }

        private stopStreamTracks(stream: MediaStream): void {
            try {
                const tracks = stream.getTracks();
                for (const track of tracks) {
                    try {
                        track.stop();
                    } catch (_) {}
                }
            } catch (_) {}
        }
    }
}

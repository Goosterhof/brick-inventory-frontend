import CameraCapture from "@shared/components/scanner/CameraCapture.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

describe("CameraCapture", () => {
    let mockGetUserMedia: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGetUserMedia = vi.fn();

        Object.defineProperty(navigator, "mediaDevices", {
            value: {getUserMedia: mockGetUserMedia},
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("rendering", () => {
        it("should render video element and capture button", () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            expect(wrapper.find("video").exists()).toBe(true);
            expect(wrapper.find("canvas").exists()).toBe(true);
            expect(wrapper.find("button").text()).toBe("Capture Photo");
        });

        it("should show loading state initially", () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            expect(wrapper.text()).toContain("Starting camera...");
        });

        it("should hide loading state after camera starts", async () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            expect(wrapper.text()).not.toContain("Starting camera...");
        });

        it("should apply opacity-0 class to video when camera is not active", () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            expect(wrapper.find("video").classes()).toContain("opacity-0");
        });
    });

    describe("camera initialization", () => {
        it("should request camera access on mount with correct constraints", async () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            shallowMount(CameraCapture);
            await flushPromises();

            expect(mockGetUserMedia).toHaveBeenCalledWith({
                video: {facingMode: "environment", width: {ideal: 1280}, height: {ideal: 720}},
            });
        });

        it("should enable capture button when camera is active", async () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {
                value: vi.fn().mockResolvedValue(undefined),
                writable: true,
            });
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});

            await flushPromises();

            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            if (retryButton) {
                await retryButton.trigger("click");
                await flushPromises();
            }

            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            expect(captureButton?.attributes("disabled")).toBeUndefined();
        });

        it("should stop camera tracks on unmount", async () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {
                value: vi.fn().mockResolvedValue(undefined),
                writable: true,
            });
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});

            await flushPromises();

            wrapper.unmount();

            expect(mockTrack.stop).toHaveBeenCalled();
        });
    });

    describe("error handling", () => {
        it("should show error message when camera access is denied (NotAllowedError)", async () => {
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            expect(wrapper.text()).toContain("Camera access denied. Please allow camera access and try again.");
        });

        it("should show error message when no camera is found (NotFoundError)", async () => {
            const error = new Error("No camera");
            error.name = "NotFoundError";
            mockGetUserMedia.mockRejectedValue(error);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            expect(wrapper.text()).toContain("No camera found. Please connect a camera and try again.");
        });

        it("should show generic error message for other Error types", async () => {
            const error = new Error("Something went wrong");
            error.name = "UnknownError";
            mockGetUserMedia.mockRejectedValue(error);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            expect(wrapper.text()).toContain("Failed to access camera: Something went wrong");
        });

        it("should show generic error for non-Error objects", async () => {
            mockGetUserMedia.mockRejectedValue("string error");

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            expect(wrapper.text()).toContain("An unexpected error occurred while accessing the camera.");
        });

        it("should disable capture button when camera is not active", async () => {
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            expect(captureButton?.attributes("disabled")).toBeDefined();
        });
    });

    describe("retry functionality", () => {
        it("should show retry button when error occurs", async () => {
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            expect(retryButton?.exists()).toBe(true);
        });

        it("should retry camera access when retry button is clicked", async () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};

            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValueOnce(error).mockResolvedValueOnce(mockStream);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
        });
    });

    describe("race condition prevention", () => {
        it("should prevent concurrent camera starts", async () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};

            let resolveGetUserMedia: (value: unknown) => void;
            mockGetUserMedia.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveGetUserMedia = resolve;
                    }),
            );

            const wrapper = shallowMount(CameraCapture);

            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");

            await retryButton?.trigger("click");
            await retryButton?.trigger("click");

            resolveGetUserMedia?.(mockStream);
            await flushPromises();

            expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
        });

        it("should stop existing stream before starting new one on retry", async () => {
            const firstTrack = {stop: vi.fn()};
            const firstStream = {getTracks: vi.fn(() => [firstTrack])};
            const secondTrack = {stop: vi.fn()};
            const secondStream = {getTracks: vi.fn(() => [secondTrack])};

            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia
                .mockRejectedValueOnce(error)
                .mockResolvedValueOnce(firstStream)
                .mockResolvedValueOnce(secondStream);

            const wrapper = shallowMount(CameraCapture);

            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {
                value: vi.fn().mockResolvedValue(undefined),
                writable: true,
            });
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});

            await flushPromises();

            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            await retryButton?.trigger("click");
            await flushPromises();

            expect(firstTrack.stop).toHaveBeenCalled();
        });
    });

    describe("image capture", () => {
        it("should emit capture event with blob when capture button is clicked", async () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {
                value: vi.fn().mockResolvedValue(undefined),
                writable: true,
            });
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});

            const mockContext = {drawImage: vi.fn()};
            const canvasElement = wrapper.find("canvas").element as HTMLCanvasElement;
            Object.defineProperty(canvasElement, "getContext", {
                value: vi.fn(() => mockContext),
                writable: true,
            });
            Object.defineProperty(canvasElement, "toBlob", {
                value: vi.fn((callback: (blob: Blob | null) => void) => {
                    callback(new Blob(["test"], {type: "image/jpeg"}));
                }),
                writable: true,
            });

            await flushPromises();

            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            await captureButton?.trigger("click");

            expect(mockContext.drawImage).toHaveBeenCalledWith(videoElement, 0, 0);

            const emitted = wrapper.emitted("capture");
            expect(emitted).toBeTruthy();
            expect(emitted?.[0]?.[0]).toBeInstanceOf(Blob);
        });

        it("should not allow capture when camera is not active", async () => {
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            expect(captureButton?.attributes("disabled")).toBeDefined();

            await captureButton?.trigger("click");
            expect(wrapper.emitted("capture")).toBeUndefined();
        });

        it("should emit error event when toBlob returns null", async () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {
                value: vi.fn().mockResolvedValue(undefined),
                writable: true,
            });
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});

            const mockContext = {drawImage: vi.fn()};
            const canvasElement = wrapper.find("canvas").element as HTMLCanvasElement;
            Object.defineProperty(canvasElement, "getContext", {
                value: vi.fn(() => mockContext),
                writable: true,
            });
            Object.defineProperty(canvasElement, "toBlob", {
                value: vi.fn((callback: (blob: Blob | null) => void) => {
                    callback(null);
                }),
                writable: true,
            });

            await flushPromises();

            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            await captureButton?.trigger("click");

            expect(wrapper.emitted("capture")).toBeUndefined();
            const errorEmitted = wrapper.emitted("error");
            expect(errorEmitted).toBeTruthy();
            expect(errorEmitted?.[0]?.[0]).toBe("Failed to capture image. Please try again.");
        });
    });

    describe("accessibility", () => {
        it("should have aria-label on video element", () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            const video = wrapper.find("video");
            expect(video.attributes("aria-label")).toBe("Live camera feed for capturing Lego bricks");
        });

        it("should have aria-live polite region for loading state", () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            const loadingDiv = wrapper.find("[role='status']");
            expect(loadingDiv.exists()).toBe(true);
            expect(loadingDiv.attributes("aria-live")).toBe("polite");
        });

        it("should have aria-live assertive region for error state", async () => {
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const errorDiv = wrapper.find("[role='alert']");
            expect(errorDiv.exists()).toBe(true);
            expect(errorDiv.attributes("aria-live")).toBe("assertive");
        });

        it("should have dynamic aria-label on capture button based on camera state", async () => {
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            expect(captureButton?.attributes("aria-label")).toBe("Capture photo (camera not ready)");
        });

        it("should update aria-label when camera becomes active", async () => {
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            const wrapper = shallowMount(CameraCapture);

            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {
                value: vi.fn().mockResolvedValue(undefined),
                writable: true,
            });
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});

            await flushPromises();

            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            expect(captureButton?.attributes("aria-label")).toBe("Capture photo of Lego brick");
        });
    });
});

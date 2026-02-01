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
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            // Act
            const wrapper = shallowMount(CameraCapture);

            // Assert
            expect(wrapper.find("video").exists()).toBe(true);
            expect(wrapper.find("canvas").exists()).toBe(true);
            expect(wrapper.find("button").text()).toBe("Capture Photo");
        });

        it("should show loading state initially", () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            // Act
            const wrapper = shallowMount(CameraCapture);

            // Assert
            expect(wrapper.text()).toContain("Starting camera...");
        });

        it("should hide loading state after camera starts", async () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            // Act
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            expect(wrapper.text()).not.toContain("Starting camera...");
        });

        it("should apply opacity-0 class to video when camera is not active", () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            // Act
            const wrapper = shallowMount(CameraCapture);

            // Assert
            expect(wrapper.find("video").classes()).toContain("opacity-0");
        });
    });

    describe("camera initialization", () => {
        it("should request camera access on mount with correct constraints", async () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            // Act
            shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            expect(mockGetUserMedia).toHaveBeenCalledWith({
                video: {facingMode: "environment", width: {ideal: 1280}, height: {ideal: 720}},
            });
        });

        it("should enable capture button when camera is active", async () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);
            const wrapper = shallowMount(CameraCapture);
            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {value: vi.fn().mockResolvedValue(undefined), writable: true});
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});
            await flushPromises();

            // Act
            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            if (retryButton) {
                await retryButton.trigger("click");
                await flushPromises();
            }

            // Assert
            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            expect(captureButton?.attributes("disabled")).toBeUndefined();
        });

        it("should stop camera tracks on unmount", async () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);
            const wrapper = shallowMount(CameraCapture);
            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {value: vi.fn().mockResolvedValue(undefined), writable: true});
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});
            await flushPromises();

            // Act
            wrapper.unmount();

            // Assert
            expect(mockTrack.stop).toHaveBeenCalled();
        });
    });

    describe("error handling", () => {
        it("should show error message when camera access is denied (NotAllowedError)", async () => {
            // Arrange
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            // Act
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Camera access denied. Please allow camera access and try again.");
        });

        it("should show error message when no camera is found (NotFoundError)", async () => {
            // Arrange
            const error = new Error("No camera");
            error.name = "NotFoundError";
            mockGetUserMedia.mockRejectedValue(error);

            // Act
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("No camera found. Please connect a camera and try again.");
        });

        it("should show generic error message for other Error types", async () => {
            // Arrange
            const error = new Error("Something went wrong");
            error.name = "UnknownError";
            mockGetUserMedia.mockRejectedValue(error);

            // Act
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Failed to access camera: Something went wrong");
        });

        it("should show generic error for non-Error objects", async () => {
            // Arrange
            mockGetUserMedia.mockRejectedValue("string error");

            // Act
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("An unexpected error occurred while accessing the camera.");
        });

        it("should disable capture button when camera is not active", async () => {
            // Arrange
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            // Act
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            expect(captureButton?.attributes("disabled")).toBeDefined();
        });
    });

    describe("retry functionality", () => {
        it("should show retry button when error occurs", async () => {
            // Arrange
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            // Act
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            expect(retryButton?.exists()).toBe(true);
        });

        it("should retry camera access when retry button is clicked", async () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValueOnce(error).mockResolvedValueOnce(mockStream);
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Act
            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
        });
    });

    describe("race condition prevention", () => {
        it("should prevent concurrent camera starts", async () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            let resolveGetUserMedia: ((value: unknown) => void) | undefined;
            mockGetUserMedia = vi.fn(
                () =>
                    new Promise((resolve) => {
                        resolveGetUserMedia = resolve;
                    }),
            );
            Object.defineProperty(navigator, "mediaDevices", {
                value: {getUserMedia: mockGetUserMedia},
                writable: true,
                configurable: true,
            });
            const wrapper = shallowMount(CameraCapture);
            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");

            // Act
            await retryButton?.trigger("click");
            await retryButton?.trigger("click");
            resolveGetUserMedia?.(mockStream);
            await flushPromises();

            // Assert
            expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
        });

        it("should stop existing stream before starting new one on retry", async () => {
            // Arrange
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
            Object.defineProperty(videoElement, "play", {value: vi.fn().mockResolvedValue(undefined), writable: true});
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});
            await flushPromises();
            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            // Act
            await retryButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(firstTrack.stop).toHaveBeenCalled();
        });
    });

    describe("image capture", () => {
        it("should emit capture event with blob when capture button is clicked", async () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);
            const wrapper = shallowMount(CameraCapture);
            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {value: vi.fn().mockResolvedValue(undefined), writable: true});
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});
            const mockContext = {drawImage: vi.fn()};
            const canvasElement = wrapper.find("canvas").element as HTMLCanvasElement;
            Object.defineProperty(canvasElement, "getContext", {value: vi.fn(() => mockContext), writable: true});
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

            // Act
            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            await captureButton?.trigger("click");

            // Assert
            expect(mockContext.drawImage).toHaveBeenCalledWith(videoElement, 0, 0);
            const emitted = wrapper.emitted("capture");
            expect(emitted).toBeTruthy();
            expect(emitted?.[0]?.[0]).toBeInstanceOf(Blob);
        });

        it("should not allow capture when camera is not active", async () => {
            // Arrange
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Act
            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            await captureButton?.trigger("click");

            // Assert
            expect(captureButton?.attributes("disabled")).toBeDefined();
            expect(wrapper.emitted("capture")).toBeUndefined();
        });

        it("should emit error event when toBlob returns null", async () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);
            const wrapper = shallowMount(CameraCapture);
            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {value: vi.fn().mockResolvedValue(undefined), writable: true});
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});
            const mockContext = {drawImage: vi.fn()};
            const canvasElement = wrapper.find("canvas").element as HTMLCanvasElement;
            Object.defineProperty(canvasElement, "getContext", {value: vi.fn(() => mockContext), writable: true});
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

            // Act
            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            await captureButton?.trigger("click");

            // Assert
            expect(wrapper.emitted("capture")).toBeUndefined();
            const errorEmitted = wrapper.emitted("error");
            expect(errorEmitted).toBeTruthy();
            expect(errorEmitted?.[0]?.[0]).toBe("Failed to capture image. Please try again.");
        });
    });

    describe("accessibility", () => {
        it("should have aria-label on video element", () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            // Act
            const wrapper = shallowMount(CameraCapture);

            // Assert
            const video = wrapper.find("video");
            expect(video.attributes("aria-label")).toBe("Live camera feed for capturing Lego bricks");
        });

        it("should have aria-live polite region for loading state", () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);

            // Act
            const wrapper = shallowMount(CameraCapture);

            // Assert
            const loadingDiv = wrapper.find("[role='status']");
            expect(loadingDiv.exists()).toBe(true);
            expect(loadingDiv.attributes("aria-live")).toBe("polite");
        });

        it("should have aria-live assertive region for error state", async () => {
            // Arrange
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            // Act
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            const errorDiv = wrapper.find("[role='alert']");
            expect(errorDiv.exists()).toBe(true);
            expect(errorDiv.attributes("aria-live")).toBe("assertive");
        });

        it("should have dynamic aria-label on capture button based on camera state", async () => {
            // Arrange
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            mockGetUserMedia.mockRejectedValue(error);

            // Act
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Assert
            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            expect(captureButton?.attributes("aria-label")).toBe("Capture photo (camera not ready)");
        });

        it("should update aria-label when camera becomes active", async () => {
            // Arrange
            const mockTrack = {stop: vi.fn()};
            const mockStream = {getTracks: vi.fn(() => [mockTrack])};
            mockGetUserMedia.mockResolvedValue(mockStream);
            const wrapper = shallowMount(CameraCapture);
            const videoElement = wrapper.find("video").element as HTMLVideoElement;
            Object.defineProperty(videoElement, "play", {value: vi.fn().mockResolvedValue(undefined), writable: true});
            Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
            Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});
            await flushPromises();

            // Act
            const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            // Assert
            const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
            expect(captureButton?.attributes("aria-label")).toBe("Capture photo of Lego brick");
        });
    });
});

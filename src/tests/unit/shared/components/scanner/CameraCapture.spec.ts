import CameraCapture from "@shared/components/scanner/CameraCapture.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const createMockMediaStream = () => {
    const mockTrack = {stop: vi.fn()};
    return {
        getTracks: vi.fn(() => [mockTrack]),
        mockTrack,
    };
};

const createMockCanvas = (returnNullBlob = false) => {
    const mockContext = {
        drawImage: vi.fn(),
    };
    return {
        getContext: vi.fn(() => mockContext),
        toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
            callback(returnNullBlob ? null : new Blob(["test"], {type: "image/jpeg"}));
        }),
        width: 0,
        height: 0,
        mockContext,
    };
};

describe("CameraCapture", () => {
    let mockGetUserMedia: ReturnType<typeof vi.fn>;
    let mockMediaStream: ReturnType<typeof createMockMediaStream>;

    beforeEach(() => {
        mockMediaStream = createMockMediaStream();
        mockGetUserMedia = vi.fn().mockResolvedValue(mockMediaStream);

        Object.defineProperty(navigator, "mediaDevices", {
            value: {getUserMedia: mockGetUserMedia},
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should render video element and capture button", () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);

        // Assert
        expect(wrapper.find("video").exists()).toBe(true);
        expect(wrapper.find("canvas").exists()).toBe(true);
        expect(wrapper.find("button").exists()).toBe(true);
        expect(wrapper.find("button").text()).toBe("Capture Photo");
    });

    it("should show loading state initially", () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);

        // Assert
        expect(wrapper.text()).toContain("Starting camera...");
    });

    it("should request camera access on mount", async () => {
        // Arrange
        shallowMount(CameraCapture);
        await flushPromises();

        // Assert
        expect(mockGetUserMedia).toHaveBeenCalledWith({
            video: {facingMode: "environment", width: {ideal: 1280}, height: {ideal: 720}},
        });
    });

    it("should hide loading state after camera starts", async () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Starting camera...");
    });

    it("should show error message when camera access is denied", async () => {
        // Arrange
        const error = new Error("Permission denied");
        error.name = "NotAllowedError";
        mockGetUserMedia.mockRejectedValue(error);

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Camera access denied. Please allow camera access and try again.");
    });

    it("should show error message when no camera is found", async () => {
        // Arrange
        const error = new Error("No camera");
        error.name = "NotFoundError";
        mockGetUserMedia.mockRejectedValue(error);

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("No camera found. Please connect a camera and try again.");
    });

    it("should show generic error message for other errors", async () => {
        // Arrange
        const error = new Error("Something went wrong");
        error.name = "UnknownError";
        mockGetUserMedia.mockRejectedValue(error);

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Failed to access camera: Something went wrong");
    });

    it("should show generic error for non-Error objects", async () => {
        // Arrange
        mockGetUserMedia.mockRejectedValue("string error");

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("An unexpected error occurred while accessing the camera.");
    });

    it("should show retry button when error occurs", async () => {
        // Arrange
        const error = new Error("Permission denied");
        error.name = "NotAllowedError";
        mockGetUserMedia.mockRejectedValue(error);

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Assert
        const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
        expect(retryButton?.exists()).toBe(true);
    });

    it("should retry camera access when retry button is clicked", async () => {
        // Arrange
        const error = new Error("Permission denied");
        error.name = "NotAllowedError";
        mockGetUserMedia.mockRejectedValueOnce(error).mockResolvedValueOnce(mockMediaStream);

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Act
        const retryButton = wrapper.findAll("button").find((btn) => btn.text() === "Retry");
        await retryButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
    });

    it("should disable capture button when camera is not active", async () => {
        // Arrange
        const error = new Error("Permission denied");
        error.name = "NotAllowedError";
        mockGetUserMedia.mockRejectedValue(error);

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Assert
        const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
        expect(captureButton?.attributes("disabled")).toBeDefined();
    });

    it("should enable capture button when camera is active", async () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);

        // Simulate video element with play method
        const videoElement = wrapper.find("video").element as HTMLVideoElement;
        Object.defineProperty(videoElement, "play", {
            value: vi.fn().mockResolvedValue(undefined),
            writable: true,
        });

        await flushPromises();

        // Act - trigger startCamera again with the mocked video
        await (wrapper.vm as unknown as {startCamera: () => Promise<void>}).startCamera();
        await flushPromises();

        // Assert
        const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
        expect(captureButton?.attributes("disabled")).toBeUndefined();
    });

    it("should stop camera tracks on unmount", async () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);

        const videoElement = wrapper.find("video").element as HTMLVideoElement;
        Object.defineProperty(videoElement, "play", {
            value: vi.fn().mockResolvedValue(undefined),
            writable: true,
        });

        await (wrapper.vm as unknown as {startCamera: () => Promise<void>}).startCamera();
        await flushPromises();

        // Act
        wrapper.unmount();

        // Assert
        expect(mockMediaStream.mockTrack.stop).toHaveBeenCalled();
    });

    it("should emit capture event with blob when captureImage is called", async () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);
        const mockCanvas = createMockCanvas();

        const videoElement = wrapper.find("video").element as HTMLVideoElement;
        Object.defineProperty(videoElement, "play", {
            value: vi.fn().mockResolvedValue(undefined),
            writable: true,
        });
        Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
        Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});

        const canvasElement = wrapper.find("canvas").element as HTMLCanvasElement;
        Object.defineProperty(canvasElement, "getContext", {value: mockCanvas.getContext, writable: true});
        Object.defineProperty(canvasElement, "toBlob", {value: mockCanvas.toBlob, writable: true});

        await (wrapper.vm as unknown as {startCamera: () => Promise<void>}).startCamera();
        await flushPromises();

        // Act
        (wrapper.vm as unknown as {captureImage: () => void}).captureImage();

        // Assert
        expect(mockCanvas.mockContext.drawImage).toHaveBeenCalledWith(videoElement, 0, 0);
        expect(mockCanvas.toBlob).toHaveBeenCalled();

        const emitted = wrapper.emitted("capture");
        expect(emitted).toBeTruthy();
        expect(emitted?.[0]?.[0]).toBeInstanceOf(Blob);
    });

    it("should emit error when capturing with camera not active", async () => {
        // Arrange
        const error = new Error("Permission denied");
        error.name = "NotAllowedError";
        mockGetUserMedia.mockRejectedValue(error);

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Act
        (wrapper.vm as unknown as {captureImage: () => void}).captureImage();

        // Assert
        expect(wrapper.emitted("capture")).toBeUndefined();
        const errorEmitted = wrapper.emitted("error");
        expect(errorEmitted).toBeTruthy();
        expect(errorEmitted?.[0]?.[0]).toBe("Camera is not active. Please wait for the camera to start.");
    });

    it("should expose startCamera, stopCamera, and captureImage methods", () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);
        const vm = wrapper.vm as unknown as {
            startCamera: () => Promise<void>;
            stopCamera: () => void;
            captureImage: () => void;
        };

        // Assert
        expect(typeof vm.startCamera).toBe("function");
        expect(typeof vm.stopCamera).toBe("function");
        expect(typeof vm.captureImage).toBe("function");
    });

    it("should apply opacity-0 class to video when camera is not active", () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);

        // Assert - camera not yet active during initial load
        expect(wrapper.find("video").classes()).toContain("opacity-0");
    });

    it("should prevent concurrent camera starts (race condition)", async () => {
        // Arrange
        let resolveGetUserMedia: (value: unknown) => void;
        mockGetUserMedia.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveGetUserMedia = resolve;
                }),
        );

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Act - call startCamera multiple times rapidly
        const vm = wrapper.vm as unknown as {startCamera: () => Promise<void>};
        vm.startCamera();
        vm.startCamera();
        vm.startCamera();

        // Resolve the pending request
        resolveGetUserMedia?.(mockMediaStream);
        await flushPromises();

        // Assert - only initial mount call should have triggered getUserMedia
        // subsequent calls should be ignored while isStarting is true
        expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
    });

    it("should stop existing stream before starting new one", async () => {
        // Arrange
        const firstStream = createMockMediaStream();
        const secondStream = createMockMediaStream();
        mockGetUserMedia.mockResolvedValueOnce(firstStream).mockResolvedValueOnce(secondStream);

        const wrapper = shallowMount(CameraCapture);

        const videoElement = wrapper.find("video").element as HTMLVideoElement;
        Object.defineProperty(videoElement, "play", {
            value: vi.fn().mockResolvedValue(undefined),
            writable: true,
        });

        await flushPromises();

        // Act - start camera again (simulating retry)
        await (wrapper.vm as unknown as {startCamera: () => Promise<void>}).startCamera();
        await flushPromises();

        // Assert - first stream should have been stopped
        expect(firstStream.mockTrack.stop).toHaveBeenCalled();
    });

    it("should have proper accessibility attributes on video element", () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);

        // Assert
        const video = wrapper.find("video");
        expect(video.attributes("aria-label")).toBe("Live camera feed for capturing Lego bricks");
    });

    it("should have aria-live region for loading state", () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);

        // Assert
        const loadingDiv = wrapper.find("[role='status']");
        expect(loadingDiv.exists()).toBe(true);
        expect(loadingDiv.attributes("aria-live")).toBe("polite");
    });

    it("should have aria-live region for error state", async () => {
        // Arrange
        const error = new Error("Permission denied");
        error.name = "NotAllowedError";
        mockGetUserMedia.mockRejectedValue(error);

        const wrapper = shallowMount(CameraCapture);
        await flushPromises();

        // Assert
        const errorDiv = wrapper.find("[role='alert']");
        expect(errorDiv.exists()).toBe(true);
        expect(errorDiv.attributes("aria-live")).toBe("assertive");
    });

    it("should have dynamic aria-label on capture button based on camera state", async () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);

        // Assert - camera not active
        const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture Photo");
        expect(captureButton?.attributes("aria-label")).toBe("Capture photo (camera not ready)");

        // Arrange - activate camera
        const videoElement = wrapper.find("video").element as HTMLVideoElement;
        Object.defineProperty(videoElement, "play", {
            value: vi.fn().mockResolvedValue(undefined),
            writable: true,
        });

        await (wrapper.vm as unknown as {startCamera: () => Promise<void>}).startCamera();
        await flushPromises();

        // Assert - camera active
        expect(captureButton?.attributes("aria-label")).toBe("Capture photo of Lego brick");
    });

    it("should emit error event when toBlob returns null", async () => {
        // Arrange
        const wrapper = shallowMount(CameraCapture);
        const mockCanvas = createMockCanvas(true); // Returns null blob

        const videoElement = wrapper.find("video").element as HTMLVideoElement;
        Object.defineProperty(videoElement, "play", {
            value: vi.fn().mockResolvedValue(undefined),
            writable: true,
        });
        Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
        Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});

        const canvasElement = wrapper.find("canvas").element as HTMLCanvasElement;
        Object.defineProperty(canvasElement, "getContext", {value: mockCanvas.getContext, writable: true});
        Object.defineProperty(canvasElement, "toBlob", {value: mockCanvas.toBlob, writable: true});

        await (wrapper.vm as unknown as {startCamera: () => Promise<void>}).startCamera();
        await flushPromises();

        // Act
        (wrapper.vm as unknown as {captureImage: () => void}).captureImage();

        // Assert
        expect(wrapper.emitted("capture")).toBeUndefined();
        const errorEmitted = wrapper.emitted("error");
        expect(errorEmitted).toBeTruthy();
        expect(errorEmitted?.[0]?.[0]).toBe("Failed to capture image. Please try again.");
    });
});

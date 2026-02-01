import CameraCapture from "@shared/components/scanner/CameraCapture.vue";
import {flushPromises, shallowMount, VueWrapper} from "@vue/test-utils";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

/**
 * Creates a mock MediaStream with a single track.
 * Used to simulate navigator.mediaDevices.getUserMedia response.
 */
const createMockMediaStream = () => {
    const mockTrack = {stop: vi.fn()};
    return {
        getTracks: vi.fn(() => [mockTrack]),
        mockTrack,
    };
};

/**
 * Creates a mock canvas context and toBlob implementation.
 * @param returnNullBlob - If true, toBlob callback receives null (simulates failure)
 */
const createMockCanvas = (returnNullBlob = false) => {
    const mockContext = {drawImage: vi.fn()};
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

/**
 * Helper to mock the video element's play method and dimensions.
 */
const mockVideoElement = (wrapper: VueWrapper, options: {width?: number; height?: number} = {}) => {
    const {width = 1280, height = 720} = options;
    const videoElement = wrapper.find("video").element as HTMLVideoElement;

    Object.defineProperty(videoElement, "play", {
        value: vi.fn().mockResolvedValue(undefined),
        writable: true,
    });
    Object.defineProperty(videoElement, "videoWidth", {value: width, writable: true});
    Object.defineProperty(videoElement, "videoHeight", {value: height, writable: true});

    return videoElement;
};

/**
 * Helper to mock the canvas element with custom context and toBlob.
 */
const mockCanvasElement = (wrapper: VueWrapper, mockCanvas: ReturnType<typeof createMockCanvas>) => {
    const canvasElement = wrapper.find("canvas").element as HTMLCanvasElement;

    Object.defineProperty(canvasElement, "getContext", {value: mockCanvas.getContext, writable: true});
    Object.defineProperty(canvasElement, "toBlob", {value: mockCanvas.toBlob, writable: true});

    return canvasElement;
};

/**
 * Helper to create a named Error with specific error type.
 */
const createNamedError = (name: string, message: string) => {
    const error = new Error(message);
    error.name = name;
    return error;
};

/**
 * Helper to find a button by its text content.
 */
const findButtonByText = (wrapper: VueWrapper, text: string) => {
    return wrapper.findAll("button").find((btn) => btn.text() === text);
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

    describe("rendering", () => {
        it("should render video element and capture button", () => {
            const wrapper = shallowMount(CameraCapture);

            expect(wrapper.find("video").exists()).toBe(true);
            expect(wrapper.find("canvas").exists()).toBe(true);
            expect(wrapper.find("button").text()).toBe("Capture Photo");
        });

        it("should show loading state initially", () => {
            const wrapper = shallowMount(CameraCapture);

            expect(wrapper.text()).toContain("Starting camera...");
        });

        it("should hide loading state after camera starts", async () => {
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            expect(wrapper.text()).not.toContain("Starting camera...");
        });

        it("should apply opacity-0 class to video when camera is not active", () => {
            const wrapper = shallowMount(CameraCapture);

            expect(wrapper.find("video").classes()).toContain("opacity-0");
        });
    });

    describe("camera initialization", () => {
        it("should request camera access on mount with correct constraints", async () => {
            shallowMount(CameraCapture);
            await flushPromises();

            expect(mockGetUserMedia).toHaveBeenCalledWith({
                video: {facingMode: "environment", width: {ideal: 1280}, height: {ideal: 720}},
            });
        });

        it("should enable capture button when camera is active", async () => {
            const wrapper = shallowMount(CameraCapture);
            mockVideoElement(wrapper);

            // Remount to trigger camera with mocked video
            mockGetUserMedia.mockResolvedValue(mockMediaStream);
            await flushPromises();

            // Click retry to restart camera with mocked elements
            const retryButton = findButtonByText(wrapper, "Retry");
            if (retryButton) {
                await retryButton.trigger("click");
                await flushPromises();
            }

            const captureButton = findButtonByText(wrapper, "Capture Photo");
            expect(captureButton?.attributes("disabled")).toBeUndefined();
        });

        it("should stop camera tracks on unmount", async () => {
            const wrapper = shallowMount(CameraCapture);
            mockVideoElement(wrapper);
            await flushPromises();

            wrapper.unmount();

            expect(mockMediaStream.mockTrack.stop).toHaveBeenCalled();
        });
    });

    describe("error handling", () => {
        it("should show error message when camera access is denied (NotAllowedError)", async () => {
            mockGetUserMedia.mockRejectedValue(createNamedError("NotAllowedError", "Permission denied"));
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            expect(wrapper.text()).toContain("Camera access denied. Please allow camera access and try again.");
        });

        it("should show error message when no camera is found (NotFoundError)", async () => {
            mockGetUserMedia.mockRejectedValue(createNamedError("NotFoundError", "No camera"));
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            expect(wrapper.text()).toContain("No camera found. Please connect a camera and try again.");
        });

        it("should show generic error message for other Error types", async () => {
            mockGetUserMedia.mockRejectedValue(createNamedError("UnknownError", "Something went wrong"));
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
            mockGetUserMedia.mockRejectedValue(createNamedError("NotAllowedError", "Permission denied"));
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const captureButton = findButtonByText(wrapper, "Capture Photo");
            expect(captureButton?.attributes("disabled")).toBeDefined();
        });
    });

    describe("retry functionality", () => {
        it("should show retry button when error occurs", async () => {
            mockGetUserMedia.mockRejectedValue(createNamedError("NotAllowedError", "Permission denied"));
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const retryButton = findButtonByText(wrapper, "Retry");
            expect(retryButton?.exists()).toBe(true);
        });

        it("should retry camera access when retry button is clicked", async () => {
            mockGetUserMedia
                .mockRejectedValueOnce(createNamedError("NotAllowedError", "Permission denied"))
                .mockResolvedValueOnce(mockMediaStream);

            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const retryButton = findButtonByText(wrapper, "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
        });
    });

    describe("race condition prevention", () => {
        it("should prevent concurrent camera starts", async () => {
            let resolveGetUserMedia: (value: unknown) => void;
            mockGetUserMedia.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveGetUserMedia = resolve;
                    }),
            );

            const wrapper = shallowMount(CameraCapture);

            // First call is from mount, subsequent clicks should be ignored while starting
            const retryButton = findButtonByText(wrapper, "Retry");

            // These clicks should be ignored since camera is already starting
            await retryButton?.trigger("click");
            await retryButton?.trigger("click");

            resolveGetUserMedia?.(mockMediaStream);
            await flushPromises();

            // Only the initial mount call should have triggered getUserMedia
            expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
        });

        it("should stop existing stream before starting new one on retry", async () => {
            const firstStream = createMockMediaStream();
            const secondStream = createMockMediaStream();
            mockGetUserMedia
                .mockRejectedValueOnce(createNamedError("NotAllowedError", "Permission denied"))
                .mockResolvedValueOnce(firstStream)
                .mockResolvedValueOnce(secondStream);

            const wrapper = shallowMount(CameraCapture);
            mockVideoElement(wrapper);
            await flushPromises();

            // First retry - succeeds
            const retryButton = findButtonByText(wrapper, "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            // Second retry - should stop first stream
            await retryButton?.trigger("click");
            await flushPromises();

            expect(firstStream.mockTrack.stop).toHaveBeenCalled();
        });
    });

    describe("image capture", () => {
        it("should emit capture event with blob when capture button is clicked", async () => {
            const wrapper = shallowMount(CameraCapture);
            const mockCanvas = createMockCanvas();
            const videoElement = mockVideoElement(wrapper);
            mockCanvasElement(wrapper, mockCanvas);

            // Wait for camera to initialize and fail (no mocked play)
            await flushPromises();

            // Now mock a successful retry
            const retryButton = findButtonByText(wrapper, "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            // Click capture button
            const captureButton = findButtonByText(wrapper, "Capture Photo");
            await captureButton?.trigger("click");

            expect(mockCanvas.mockContext.drawImage).toHaveBeenCalledWith(videoElement, 0, 0);
            expect(mockCanvas.toBlob).toHaveBeenCalled();

            const emitted = wrapper.emitted("capture");
            expect(emitted).toBeTruthy();
            expect(emitted?.[0]?.[0]).toBeInstanceOf(Blob);
        });

        it("should not allow capture when camera is not active", async () => {
            mockGetUserMedia.mockRejectedValue(createNamedError("NotAllowedError", "Permission denied"));
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            // Button should be disabled when camera is not active
            const captureButton = findButtonByText(wrapper, "Capture Photo");
            expect(captureButton?.attributes("disabled")).toBeDefined();

            // Clicking a disabled button should not emit any events
            await captureButton?.trigger("click");
            expect(wrapper.emitted("capture")).toBeUndefined();
        });

        it("should emit error event when toBlob returns null", async () => {
            const wrapper = shallowMount(CameraCapture);
            const mockCanvas = createMockCanvas(true);
            mockVideoElement(wrapper);
            mockCanvasElement(wrapper, mockCanvas);
            await flushPromises();

            // Retry to get camera active with mocked elements
            const retryButton = findButtonByText(wrapper, "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            // Click capture button
            const captureButton = findButtonByText(wrapper, "Capture Photo");
            await captureButton?.trigger("click");

            expect(wrapper.emitted("capture")).toBeUndefined();
            const errorEmitted = wrapper.emitted("error");
            expect(errorEmitted).toBeTruthy();
            expect(errorEmitted?.[0]?.[0]).toBe("Failed to capture image. Please try again.");
        });
    });

    describe("accessibility", () => {
        it("should have aria-label on video element", () => {
            const wrapper = shallowMount(CameraCapture);

            const video = wrapper.find("video");
            expect(video.attributes("aria-label")).toBe("Live camera feed for capturing Lego bricks");
        });

        it("should have aria-live polite region for loading state", () => {
            const wrapper = shallowMount(CameraCapture);

            const loadingDiv = wrapper.find("[role='status']");
            expect(loadingDiv.exists()).toBe(true);
            expect(loadingDiv.attributes("aria-live")).toBe("polite");
        });

        it("should have aria-live assertive region for error state", async () => {
            mockGetUserMedia.mockRejectedValue(createNamedError("NotAllowedError", "Permission denied"));
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const errorDiv = wrapper.find("[role='alert']");
            expect(errorDiv.exists()).toBe(true);
            expect(errorDiv.attributes("aria-live")).toBe("assertive");
        });

        it("should have dynamic aria-label on capture button based on camera state", async () => {
            mockGetUserMedia.mockRejectedValue(createNamedError("NotAllowedError", "Permission denied"));
            const wrapper = shallowMount(CameraCapture);
            await flushPromises();

            const captureButton = findButtonByText(wrapper, "Capture Photo");
            expect(captureButton?.attributes("aria-label")).toBe("Capture photo (camera not ready)");
        });

        it("should update aria-label when camera becomes active", async () => {
            const wrapper = shallowMount(CameraCapture);
            mockVideoElement(wrapper);
            await flushPromises();

            // Retry to activate camera
            const retryButton = findButtonByText(wrapper, "Retry");
            await retryButton?.trigger("click");
            await flushPromises();

            const captureButton = findButtonByText(wrapper, "Capture Photo");
            expect(captureButton?.attributes("aria-label")).toBe("Capture photo of Lego brick");
        });
    });
});

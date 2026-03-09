<script setup lang="ts">
import {ref, onMounted, onUnmounted} from "vue";

const emit = defineEmits<{capture: [imageData: Blob]; error: [message: string]}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const cameraError = ref<string>("");
const isLoading = ref(true);
const isCameraActive = ref(false);
const isStarting = ref(false);

const stopCamera = () => {
    if (stream.value) {
        for (const track of stream.value.getTracks()) {
            track.stop();
        }
        stream.value = null;
    }
    if (videoRef.value) {
        videoRef.value.srcObject = null;
    }
    isCameraActive.value = false;
};

const startCamera = async () => {
    if (isStarting.value) {
        return;
    }

    isStarting.value = true;
    stopCamera();

    isLoading.value = true;
    cameraError.value = "";

    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {facingMode: "environment", width: {ideal: 1280}, height: {ideal: 720}},
        });

        stream.value = mediaStream;

        /* v8 ignore start - videoRef always exists in mounted component */
        if (!videoRef.value) {
            for (const track of mediaStream.getTracks()) {
                track.stop();
            }
            stream.value = null;
            cameraError.value = "Unable to access camera video element.";
            return;
        }
        /* v8 ignore end */

        videoRef.value.srcObject = mediaStream;
        await videoRef.value.play();
        isCameraActive.value = true;
    } catch (err) {
        if (err instanceof Error) {
            if (err.name === "NotAllowedError") {
                cameraError.value = "Camera access denied. Please allow camera access and try again.";
            } else if (err.name === "NotFoundError") {
                cameraError.value = "No camera found. Please connect a camera and try again.";
            } else {
                cameraError.value = `Failed to access camera: ${err.message}`;
            }
        } else {
            cameraError.value = "An unexpected error occurred while accessing the camera.";
        }
    } finally {
        isLoading.value = false;
        isStarting.value = false;
    }
};

const captureImage = () => {
    /* v8 ignore start - refs always exist in mounted component, button disabled when inactive */
    if (!isCameraActive.value) {
        emit("error", "Camera is not active. Please wait for the camera to start.");
        return;
    }

    if (!videoRef.value || !canvasRef.value) {
        emit("error", "Unable to capture image. Camera elements not available.");
        return;
    }
    /* v8 ignore end */

    const video = videoRef.value;
    const canvas = canvasRef.value;
    const context = canvas.getContext("2d");

    if (!context) {
        emit("error", "Unable to capture image. Canvas context not available.");
        return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (!videoWidth || !videoHeight) {
        // Ensure metadata is loaded before attempting to capture to avoid a 0x0 canvas.
        if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
            video.addEventListener(
                "loadedmetadata",
                () => {
                    captureImage();
                },
                {once: true},
            );
        }
        return;
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
        (blob) => {
            if (blob) {
                emit("capture", blob);
            } else {
                emit("error", "Failed to capture image. Please try again.");
            }
        },
        "image/jpeg",
        0.9,
    );
};

onMounted(() => {
    startCamera();
});

onUnmounted(() => {
    stopCamera();
});
</script>

<template>
    <div flex="~ col" gap="4">
        <div
            relative
            overflow="hidden"
            bg="gray-900"
            role="region"
            aria-label="Camera viewfinder"
            class="brick-border brick-shadow"
        >
            <video
                ref="videoRef"
                autoplay
                playsinline
                muted
                w="full"
                block
                aria-label="Live camera feed for capturing Lego bricks"
                :class="{'opacity-0': !isCameraActive}"
            />

            <canvas ref="canvasRef" hidden aria-hidden="true" />

            <div
                v-if="isLoading"
                absolute
                inset="0"
                flex
                items="center"
                justify="center"
                bg="gray-900"
                text="white"
                role="status"
                aria-live="polite"
            >
                <span font="bold">Starting camera...</span>
            </div>

            <div
                v-else-if="cameraError"
                absolute
                inset="0"
                flex="~ col"
                items="center"
                justify="center"
                gap="4"
                bg="gray-900"
                p="4"
                role="alert"
                aria-live="assertive"
            >
                <span text="white center" font="bold">{{ cameraError }}</span>
                <button
                    type="button"
                    p="x-4 y-2"
                    bg="yellow-300 hover:yellow-300 focus:yellow-300"
                    text="black"
                    font="bold"
                    uppercase
                    tracking="wide"
                    cursor="pointer"
                    outline="none"
                    aria-label="Retry camera access"
                    class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
                    @click="startCamera"
                >
                    Retry
                </button>
            </div>
        </div>

        <button
            type="button"
            p="x-6 y-3"
            bg="yellow-300 hover:yellow-300 focus:yellow-300 disabled:gray-200"
            text="black disabled:gray-600"
            font="bold"
            uppercase
            tracking="wide"
            cursor="pointer disabled:not-allowed"
            outline="none"
            :aria-label="isCameraActive ? 'Capture photo of Lego brick' : 'Capture photo (camera not ready)'"
            :disabled="!isCameraActive"
            class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px] disabled:brick-disabled"
            @click="captureImage"
        >
            Capture Photo
        </button>
    </div>
</template>

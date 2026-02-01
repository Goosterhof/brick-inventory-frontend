<script setup lang="ts">
import {ref, onMounted, onUnmounted} from "vue";

const emit = defineEmits<{capture: [imageData: Blob]}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const cameraError = ref<string>("");
const isLoading = ref(true);
const isCameraActive = ref(false);

const startCamera = async () => {
    isLoading.value = true;
    cameraError.value = "";

    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {facingMode: "environment", width: {ideal: 1280}, height: {ideal: 720}},
        });

        stream.value = mediaStream;

        if (videoRef.value) {
            videoRef.value.srcObject = mediaStream;
            await videoRef.value.play();
            isCameraActive.value = true;
        }
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
    }
};

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

const captureImage = () => {
    if (!videoRef.value || !canvasRef.value || !isCameraActive.value) {
        return;
    }

    const video = videoRef.value;
    const canvas = canvasRef.value;
    const context = canvas.getContext("2d");

    if (!context) {
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
        (blob) => {
            if (blob) {
                emit("capture", blob);
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

defineExpose({startCamera, stopCamera, captureImage});
</script>

<template>
    <div flex="~ col" gap="4">
        <div relative overflow="hidden" border="3 black" bg="gray-900" class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <video ref="videoRef" autoplay playsinline muted w="full" block :class="{'opacity-0': !isCameraActive}" />

            <canvas ref="canvasRef" hidden />

            <div v-if="isLoading" absolute inset="0" flex items="center" justify="center" bg="gray-900" text="white">
                <span font="bold">Starting camera...</span>
            </div>

            <div
                v-if="cameraError"
                absolute
                inset="0"
                flex="~ col"
                items="center"
                justify="center"
                gap="4"
                bg="gray-900"
                p="4"
            >
                <span text="white center" font="bold">{{ cameraError }}</span>
                <button
                    type="button"
                    p="x-4 y-2"
                    border="3 black"
                    bg="yellow-400 hover:yellow-300"
                    text="black"
                    font="bold"
                    uppercase
                    tracking="wide"
                    cursor="pointer"
                    class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
                    @click="startCamera"
                >
                    Retry
                </button>
            </div>
        </div>

        <button
            type="button"
            p="x-6 y-3"
            border="3 black"
            bg="yellow-400 hover:yellow-300 disabled:gray-300"
            text="black"
            font="bold"
            uppercase
            tracking="wide"
            cursor="pointer disabled:not-allowed"
            class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
            :disabled="!isCameraActive"
            @click="captureImage"
        >
            Capture Photo
        </button>
    </div>
</template>

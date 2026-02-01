<script setup lang="ts">
import {ref, computed} from "vue";

import CameraCapture from "@shared/components/scanner/CameraCapture.vue";

interface BrickIdentification {
    id: string;
    name: string;
    category: string;
    imageUrl?: string;
    confidence: number;
}

const capturedImage = ref<Blob | null>(null);
const capturedImageUrl = ref<string>("");
const isIdentifying = ref(false);
const identificationResult = ref<BrickIdentification | null>(null);
const identificationError = ref<string>("");

const hasCapture = computed(() => capturedImage.value !== null);

const handleCapture = (imageData: Blob) => {
    if (capturedImageUrl.value) {
        URL.revokeObjectURL(capturedImageUrl.value);
    }

    capturedImage.value = imageData;
    capturedImageUrl.value = URL.createObjectURL(imageData);
    identificationResult.value = null;
    identificationError.value = "";
};

const identifyBrick = async () => {
    if (!capturedImage.value) {
        return;
    }

    isIdentifying.value = true;
    identificationError.value = "";
    identificationResult.value = null;

    try {
        // TODO: Replace with actual brick identification API call
        // This is a placeholder that simulates an API response
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Placeholder response - replace with actual API integration
        identificationResult.value = {id: "3001", name: "Brick 2 x 4", category: "Bricks", confidence: 0.95};
    } catch (err) {
        if (err instanceof Error) {
            identificationError.value = err.message;
        } else {
            identificationError.value = "Failed to identify brick. Please try again.";
        }
    } finally {
        isIdentifying.value = false;
    }
};

const clearCapture = () => {
    if (capturedImageUrl.value) {
        URL.revokeObjectURL(capturedImageUrl.value);
    }
    capturedImage.value = null;
    capturedImageUrl.value = "";
    identificationResult.value = null;
    identificationError.value = "";
};

const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
};
</script>

<template>
    <div flex="~ col" gap="6" max-w="2xl" mx="auto">
        <h1 text="3xl black" font="bold" uppercase tracking="wide">Brick Scanner</h1>

        <p text="gray-700">
            Point your camera at a Lego brick to identify it. Make sure the brick is well-lit and centered in the frame.
        </p>

        <div v-if="!hasCapture">
            <CameraCapture @capture="handleCapture" />
        </div>

        <div v-else flex="~ col" gap="4">
            <div relative overflow="hidden" border="3 black" class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <img :src="capturedImageUrl" alt="Captured brick" w="full" block />
            </div>

            <div flex gap="4">
                <button
                    type="button"
                    flex="1"
                    p="x-4 y-3"
                    border="3 black"
                    bg="white hover:gray-100"
                    text="black"
                    font="bold"
                    uppercase
                    tracking="wide"
                    cursor="pointer"
                    class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
                    @click="clearCapture"
                >
                    Retake
                </button>

                <button
                    type="button"
                    flex="1"
                    p="x-4 y-3"
                    border="3 black"
                    bg="yellow-400 hover:yellow-300 disabled:gray-300"
                    text="black"
                    font="bold"
                    uppercase
                    tracking="wide"
                    cursor="pointer disabled:not-allowed"
                    class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
                    :disabled="isIdentifying"
                    @click="identifyBrick"
                >
                    {{ isIdentifying ? "Identifying..." : "Identify Brick" }}
                </button>
            </div>
        </div>

        <div
            v-if="identificationError"
            p="4"
            border="3 black"
            bg="red-100"
            class="shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]"
        >
            <p text="red-700" font="bold">{{ identificationError }}</p>
        </div>

        <div
            v-if="identificationResult"
            p="4"
            border="3 black"
            bg="green-100"
            class="shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]"
        >
            <h2 text="xl black" font="bold" uppercase tracking="wide" m="b-3">Brick Identified</h2>

            <dl flex="~ col" gap="2">
                <div flex gap="2">
                    <dt font="bold" text="gray-700">Part ID:</dt>
                    <dd text="black">{{ identificationResult.id }}</dd>
                </div>

                <div flex gap="2">
                    <dt font="bold" text="gray-700">Name:</dt>
                    <dd text="black">{{ identificationResult.name }}</dd>
                </div>

                <div flex gap="2">
                    <dt font="bold" text="gray-700">Category:</dt>
                    <dd text="black">{{ identificationResult.category }}</dd>
                </div>

                <div flex gap="2">
                    <dt font="bold" text="gray-700">Confidence:</dt>
                    <dd text="black">{{ formatConfidence(identificationResult.confidence) }}</dd>
                </div>
            </dl>
        </div>
    </div>
</template>

<script setup lang="ts">
import {useId} from "vue";

const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();

const STROKE = 3;
const SHADOW_OFFSET = 4;
const W = 120;
const H = 40;
const TAPER = 36;
const STUD_R = 8;

const gradientId = useId();
const halfStroke = STROKE / 2;
const totalW = W + STROKE + SHADOW_OFFSET;
const totalH = H + STROKE + SHADOW_OFFSET;
</script>

<template>
    <svg :viewBox="`0 0 ${totalW} ${totalH}`" role="img" aria-label="2 by 4 LEGO wedge plate">
        <defs>
            <radialGradient :id="gradientId" cx="35%" cy="35%" r="50%">
                <stop offset="0%" stop-color="white" stop-opacity="0.6" />
                <stop offset="100%" stop-color="black" stop-opacity="0.1" />
            </radialGradient>
        </defs>

        <!-- Shadow -->
        <polygon
            v-if="shadow"
            :points="`
                ${halfStroke + SHADOW_OFFSET},${halfStroke + SHADOW_OFFSET}
                ${halfStroke + W + SHADOW_OFFSET},${halfStroke + SHADOW_OFFSET}
                ${halfStroke + W - TAPER + SHADOW_OFFSET},${halfStroke + H + SHADOW_OFFSET}
                ${halfStroke + SHADOW_OFFSET},${halfStroke + H + SHADOW_OFFSET}
            `"
            fill="black"
            data-shadow
        />

        <!-- Body -->
        <polygon
            :points="`
                ${halfStroke},${halfStroke}
                ${halfStroke + W},${halfStroke}
                ${halfStroke + W - TAPER},${halfStroke + H}
                ${halfStroke},${halfStroke + H}
            `"
            :fill="color"
            stroke="black"
            :stroke-width="STROKE"
            data-body
        />

        <!-- Studs -->
        <g v-for="i in 4" :key="i">
            <circle
                :cx="halfStroke + 12 + (i - 1) * 24"
                :cy="halfStroke + H / 2"
                :r="STUD_R"
                :fill="color"
                stroke="black"
                :stroke-width="STROKE"
            />
            <circle
                :cx="halfStroke + 12 + (i - 1) * 24"
                :cy="halfStroke + H / 2"
                :r="STUD_R"
                :fill="`url(#${gradientId})`"
            />
        </g>
    </svg>
</template>

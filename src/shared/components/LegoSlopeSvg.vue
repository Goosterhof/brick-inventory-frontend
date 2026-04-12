<script setup lang="ts">
import {useId} from "vue";

const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();

const STROKE = 3;
const SHADOW_OFFSET = 4;
const BODY_W = 80;
const BODY_H = 48;
const SLOPE_H = 40;
const STUD_R = 12;

const gradientId = useId();
const totalW = BODY_W + STROKE + SHADOW_OFFSET;
const totalH = BODY_H + SLOPE_H + STROKE + SHADOW_OFFSET;
const halfStroke = STROKE / 2;
</script>

<template>
    <svg :viewBox="`0 0 ${totalW} ${totalH}`" role="img" aria-label="2 by 2 LEGO slope brick">
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
                ${halfStroke + SHADOW_OFFSET},${halfStroke + SLOPE_H + SHADOW_OFFSET}
                ${halfStroke + BODY_W + SHADOW_OFFSET},${halfStroke + SHADOW_OFFSET}
                ${halfStroke + BODY_W + SHADOW_OFFSET},${halfStroke + SLOPE_H + BODY_H + SHADOW_OFFSET}
                ${halfStroke + SHADOW_OFFSET},${halfStroke + SLOPE_H + BODY_H + SHADOW_OFFSET}
            `"
            fill="black"
            data-shadow
        />

        <!-- Slope surface -->
        <polygon
            :points="`
                ${halfStroke},${halfStroke + SLOPE_H}
                ${halfStroke + BODY_W},${halfStroke}
                ${halfStroke + BODY_W},${halfStroke + SLOPE_H}
            `"
            :fill="color"
            stroke="black"
            :stroke-width="STROKE"
            data-slope
        />

        <!-- Body -->
        <rect
            :x="halfStroke"
            :y="halfStroke + SLOPE_H"
            :width="BODY_W"
            :height="BODY_H"
            :fill="color"
            stroke="black"
            :stroke-width="STROKE"
            data-body
        />

        <!-- Studs on the lower body -->
        <g v-for="i in 2" :key="i">
            <circle
                :cx="halfStroke + i * (BODY_W / 3)"
                :cy="halfStroke + SLOPE_H + BODY_H / 2"
                :r="STUD_R"
                :fill="color"
                stroke="black"
                :stroke-width="STROKE"
            />
            <circle
                :cx="halfStroke + i * (BODY_W / 3)"
                :cy="halfStroke + SLOPE_H + BODY_H / 2"
                :r="STUD_R"
                :fill="`url(#${gradientId})`"
            />
        </g>
    </svg>
</template>

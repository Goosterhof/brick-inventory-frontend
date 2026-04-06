<script setup lang="ts">
import {computed, useId} from "vue";

const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();

const CELL = 40;
const PAD = 10;
const STUD_R = 13;
const STROKE = 3;
const SHADOW_OFFSET = 4;
const COLUMNS = 4;
const ROWS = 2;
const HEIGHT_RATIO = 0.33;

const gradientId = useId();

const bodyWidth = COLUMNS * CELL + 2 * PAD;
const bodyHeight = Math.round(ROWS * CELL * HEIGHT_RATIO + 2 * PAD);

const viewBox = `0 0 ${bodyWidth + STROKE + SHADOW_OFFSET} ${bodyHeight + STROKE + SHADOW_OFFSET}`;

const halfStroke = STROKE / 2;

const studs = computed(() => {
    const result: Array<{cx: number; cy: number}> = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            result.push({
                cx: halfStroke + PAD + CELL / 2 + col * CELL,
                cy: halfStroke + PAD / 2 + (bodyHeight - PAD) / 2 + (row - 0.5) * (STUD_R * 2 + 4),
            });
        }
    }
    return result;
});
</script>

<template>
    <svg :viewBox="viewBox" role="img" aria-label="2 by 4 LEGO plate">
        <defs>
            <radialGradient :id="gradientId" cx="35%" cy="35%" r="50%">
                <stop offset="0%" stop-color="white" stop-opacity="0.6" />
                <stop offset="100%" stop-color="black" stop-opacity="0.1" />
            </radialGradient>
        </defs>

        <!-- Shadow -->
        <rect
            v-if="shadow"
            :x="halfStroke + SHADOW_OFFSET"
            :y="halfStroke + SHADOW_OFFSET"
            :width="bodyWidth"
            :height="bodyHeight"
            fill="black"
            data-shadow
        />

        <!-- Body -->
        <rect
            :x="halfStroke"
            :y="halfStroke"
            :width="bodyWidth"
            :height="bodyHeight"
            :fill="color"
            stroke="black"
            :stroke-width="STROKE"
            data-body
        />

        <!-- Studs -->
        <g v-for="(stud, index) in studs" :key="index">
            <circle :cx="stud.cx" :cy="stud.cy" :r="STUD_R" :fill="color" stroke="black" :stroke-width="STROKE" />
            <circle :cx="stud.cx" :cy="stud.cy" :r="STUD_R" :fill="`url(#${gradientId})`" />
        </g>
    </svg>
</template>

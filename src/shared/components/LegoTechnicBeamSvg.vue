<script setup lang="ts">
const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();

const STROKE = 3;
const SHADOW_OFFSET = 4;
const W = 160;
const H = 32;
const HOLE_R = 10;
const HOLE_COUNT = 4;

const halfStroke = STROKE / 2;
const totalW = W + STROKE + SHADOW_OFFSET;
const totalH = H + STROKE + SHADOW_OFFSET;
</script>

<template>
    <svg :viewBox="`0 0 ${totalW} ${totalH}`" role="img" aria-label="1 by 4 LEGO Technic beam">
        <!-- Shadow -->
        <rect
            v-if="shadow"
            :x="halfStroke + SHADOW_OFFSET"
            :y="halfStroke + SHADOW_OFFSET"
            :width="W"
            :height="H"
            fill="black"
            data-shadow
        />

        <!-- Body -->
        <rect
            :x="halfStroke"
            :y="halfStroke"
            :width="W"
            :height="H"
            :fill="color"
            stroke="black"
            :stroke-width="STROKE"
            data-body
        />

        <!-- Pin holes -->
        <circle
            v-for="i in HOLE_COUNT"
            :key="i"
            :cx="halfStroke + (i * W) / (HOLE_COUNT + 1)"
            :cy="halfStroke + H / 2"
            :r="HOLE_R"
            fill="white"
            stroke="black"
            :stroke-width="STROKE"
            data-pin-hole
        />
    </svg>
</template>

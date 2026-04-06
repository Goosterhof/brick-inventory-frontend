<script setup lang="ts">
const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();

const STROKE = 3;
const SHADOW_OFFSET = 4;
const W = 80;
const H = 24;
const halfStroke = STROKE / 2;
const totalW = W + STROKE + SHADOW_OFFSET;
const totalH = H + STROKE + SHADOW_OFFSET;
</script>

<template>
    <svg :viewBox="`0 0 ${totalW} ${totalH}`" role="img" aria-label="1 by 2 LEGO tile">
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
    </svg>
</template>

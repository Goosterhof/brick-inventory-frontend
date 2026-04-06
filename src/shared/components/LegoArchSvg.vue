<script setup lang="ts">
import {useId} from "vue";

const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();

const STROKE = 3;
const SHADOW_OFFSET = 4;
const BODY_W = 160;
const TOP_H = 30;
const BOT_H = 40;
const ARCH_R = 30;
const STUD_R = 10;

const gradientId = useId();
const halfStroke = STROKE / 2;
const totalW = BODY_W + STROKE + SHADOW_OFFSET;
const totalH = TOP_H + BOT_H + STROKE + SHADOW_OFFSET;
</script>

<template>
    <svg :viewBox="`0 0 ${totalW} ${totalH}`" role="img" aria-label="1 by 4 LEGO arch brick">
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
            :width="BODY_W"
            :height="TOP_H + BOT_H"
            fill="black"
            data-shadow
        />

        <!-- Top section -->
        <rect
            :x="halfStroke"
            :y="halfStroke"
            :width="BODY_W"
            :height="TOP_H"
            :fill="color"
            stroke="black"
            :stroke-width="STROKE"
            data-body
        />

        <!-- Bottom section with arch cutout -->
        <path
            :d="`
                M ${halfStroke} ${halfStroke + TOP_H}
                L ${halfStroke + BODY_W} ${halfStroke + TOP_H}
                L ${halfStroke + BODY_W} ${halfStroke + TOP_H + BOT_H}
                L ${halfStroke} ${halfStroke + TOP_H + BOT_H}
                Z
                M ${halfStroke + BODY_W / 2 - ARCH_R} ${halfStroke + TOP_H + BOT_H}
                A ${ARCH_R} ${ARCH_R} 0 0 1 ${halfStroke + BODY_W / 2 + ARCH_R} ${halfStroke + TOP_H + BOT_H}
            `"
            :fill="color"
            stroke="black"
            :stroke-width="STROKE"
            fill-rule="evenodd"
            data-arch
        />

        <!-- Studs -->
        <g v-for="i in 4" :key="i">
            <circle
                :cx="halfStroke + (i * BODY_W) / 5"
                :cy="halfStroke + TOP_H / 2"
                :r="STUD_R"
                :fill="color"
                stroke="black"
                :stroke-width="STROKE"
            />
            <circle
                :cx="halfStroke + (i * BODY_W) / 5"
                :cy="halfStroke + TOP_H / 2"
                :r="STUD_R"
                :fill="`url(#${gradientId})`"
            />
        </g>
    </svg>
</template>

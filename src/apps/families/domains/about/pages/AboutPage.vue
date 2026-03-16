<script setup lang="ts">
import {familyTranslationService} from "@app/services";
import LegoBrick from "@shared/components/LegoBrick.vue";

const {t} = familyTranslationService;

const RED = "#DC2626";
const BLUE = "#1D4ED8";
const GREEN = "#16A34A";
const YELLOW = "#EAB308";
</script>

<template>
    <div>
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">{{ t("about.title").value }}</h1>
        <p text="gray-600" m="b-6">{{ t("about.description").value }}</p>
        <div inline-block style="filter: drop-shadow(4px 4px 0 black)">
            <!-- Row 1: Red 2×2 + Blue 1×1 (bottom-aligned) -->
            <div flex items="end">
                <LegoBrick :color="RED" :columns="2" :rows="2" :shadow="false" />
                <LegoBrick class="ml-[-3px]" :color="BLUE" :columns="1" :rows="1" :shadow="false" />
            </div>
            <!-- Row 2: Yellow 2×3 + Green 1×3 -->
            <div flex class="mt-[-3px]">
                <LegoBrick :color="YELLOW" :columns="2" :rows="3" :shadow="false" />
                <LegoBrick class="ml-[-3px]" :color="GREEN" :columns="1" :rows="3" :shadow="false" />
            </div>
        </div>
    </div>
</template>

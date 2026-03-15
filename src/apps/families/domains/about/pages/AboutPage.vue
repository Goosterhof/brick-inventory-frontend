<script setup lang="ts">
import {familyTranslationService} from "@app/services";

import LegoBrick from "../components/LegoBrick.vue";

const {t} = familyTranslationService;

const wallColors = [
    ["#DC2626", "#2563EB", "#F59E0B", "#16A34A", "#DC2626", "#2563EB"],
    ["#F59E0B", "#16A34A", "#DC2626", "#2563EB", "#F59E0B", "#16A34A"],
    ["#2563EB", "#DC2626", "#16A34A", "#F59E0B", "#2563EB", "#DC2626"],
];

const features = [
    {key: "Track" as const, color: "#DC2626"},
    {key: "Organize" as const, color: "#2563EB"},
    {key: "Find" as const, color: "#16A34A"},
];
</script>

<template>
    <div flex="~ col" gap="8">
        <section flex="~ col" items="center" gap="4">
            <h1 text="3xl" font="bold" uppercase tracking="wide">{{ t("about.title").value }}</h1>
            <p text="lg gray-600" font="medium">{{ t("about.tagline").value }}</p>
        </section>

        <section flex="~ col" items="center" gap="2" overflow="hidden">
            <div
                v-for="(row, rowIndex) in wallColors"
                :key="rowIndex"
                flex
                gap="2"
                :class="{'ml-12': rowIndex % 2 === 1}"
            >
                <LegoBrick v-for="(color, colIndex) in row" :key="colIndex" :color="color" />
            </div>
        </section>

        <section>
            <p text="gray-600" font="medium" max-w="2xl">{{ t("about.description").value }}</p>
        </section>

        <section grid grid-cols="1" sm:grid-cols="3" gap="4">
            <div
                v-for="feature in features"
                :key="feature.key"
                border="3 black"
                p="6"
                flex="~ col"
                gap="4"
                bg="white"
                class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
                <LegoBrick :color="feature.color" />
                <h2 text="xl" font="bold" uppercase tracking="wide">
                    {{ t(`about.feature${feature.key}`).value }}
                </h2>
                <p text="gray-600" font="medium">
                    {{ t(`about.feature${feature.key}Description`).value }}
                </p>
            </div>
        </section>

        <section
            flex="~ col"
            items="center"
            gap="4"
            p="8"
            border="3 black"
            bg="white"
            class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
            <div flex gap="2">
                <LegoBrick color="#DC2626" />
                <LegoBrick color="#F59E0B" />
                <LegoBrick color="#2563EB" />
                <LegoBrick color="#16A34A" />
            </div>
            <p text="lg" font="bold" uppercase tracking="wide">{{ t("about.builtWith").value }}</p>
        </section>
    </div>
</template>

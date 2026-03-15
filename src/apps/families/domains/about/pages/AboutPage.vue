<script setup lang="ts">
import {familyTranslationService} from "@app/services";

import LegoBrick from "../components/LegoBrick.vue";

const {t} = familyTranslationService;

const wallRows = [
    [
        {color: "#DC2626", cols: 4, rows: 2},
        {color: "#2563EB", cols: 2, rows: 2},
        {color: "#F59E0B", cols: 4, rows: 2},
        {color: "#16A34A", cols: 2, rows: 2},
    ],
    [
        {color: "#16A34A", cols: 2, rows: 2},
        {color: "#F59E0B", cols: 4, rows: 2},
        {color: "#DC2626", cols: 2, rows: 2},
        {color: "#2563EB", cols: 4, rows: 2},
    ],
    [
        {color: "#2563EB", cols: 4, rows: 2},
        {color: "#DC2626", cols: 2, rows: 2},
        {color: "#16A34A", cols: 4, rows: 2},
        {color: "#F59E0B", cols: 2, rows: 2},
    ],
];

const features = [
    {key: "Track" as const, color: "#DC2626", cols: 2, rows: 1},
    {key: "Organize" as const, color: "#2563EB", cols: 2, rows: 1},
    {key: "Find" as const, color: "#16A34A", cols: 2, rows: 1},
];
</script>

<template>
    <div flex="~ col" gap="8">
        <section flex="~ col" items="center" gap="4">
            <h1 text="3xl" font="bold" uppercase tracking="wide">{{ t("about.title").value }}</h1>
            <p text="lg gray-600" font="medium">{{ t("about.tagline").value }}</p>
        </section>

        <section flex="~ col" items="center" gap="2" overflow="hidden">
            <div v-for="(row, rowIndex) in wallRows" :key="rowIndex" flex gap="2">
                <LegoBrick
                    v-for="(brick, colIndex) in row"
                    :key="colIndex"
                    :color="brick.color"
                    :cols="brick.cols"
                    :rows="brick.rows"
                />
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
                <LegoBrick :color="feature.color" :cols="feature.cols" :rows="feature.rows" />
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
            <div flex gap="2" items="end">
                <LegoBrick color="#DC2626" :cols="1" :rows="1" />
                <LegoBrick color="#F59E0B" :cols="2" :rows="2" />
                <LegoBrick color="#2563EB" :cols="2" :rows="2" />
                <LegoBrick color="#16A34A" :cols="1" :rows="1" />
            </div>
            <p text="lg" font="bold" uppercase tracking="wide">{{ t("about.builtWith").value }}</p>
        </section>
    </div>
</template>

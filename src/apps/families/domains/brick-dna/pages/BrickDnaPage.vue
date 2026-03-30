<script setup lang="ts">
import type {BrickDna} from "@app/types/brickDna";

import {familyHttpService, familyTranslationService} from "@app/services";
import CardContainer from "@shared/components/CardContainer.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import SectionDivider from "@shared/components/SectionDivider.vue";
import StatCard from "@shared/components/StatCard.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const {t} = familyTranslationService;

const dna = ref<BrickDna | null>(null);
const loading = ref(true);

onMounted(async () => {
    try {
        const response = await familyHttpService.getRequest<BrickDna>("/family/brick-dna");
        dna.value = toCamelCaseTyped<BrickDna>(response.data);
    } catch {
        dna.value = null;
    } finally {
        loading.value = false;
    }
});

const diversityLabel = (score: number): string => {
    if (score >= 0.8) return t("brickDna.diversityHigh").value;
    if (score >= 0.5) return t("brickDna.diversityMedium").value;
    return t("brickDna.diversityLow").value;
};

const diversityPercentage = (score: number): string => `${Math.round(score * 100)}%`;
</script>

<template>
    <div max-w="6xl" m="x-auto">
        <PageHeader :title="t('brickDna.title').value" />

        <p v-if="loading" text="gray-600">{{ t("common.loading").value }}</p>

        <EmptyState v-else-if="!dna" :message="t('brickDna.empty').value" show-brick brick-color="#237841" />

        <template v-else>
            <!-- Diversity Score -->
            <div m="b-6">
                <h2 text="lg" font="bold" uppercase tracking="wide" m="b-4">
                    {{ t("brickDna.diversityTitle").value }}
                </h2>
                <CardContainer>
                    <div flex="~ col" items="center" gap="2" p="4">
                        <p text="5xl" font="bold">{{ diversityPercentage(dna.diversityScore.shannonIndex) }}</p>
                        <p text="sm" font="bold" uppercase tracking="wide">
                            {{ diversityLabel(dna.diversityScore.shannonIndex) }}
                        </p>
                        <!-- Visual bar -->
                        <div w="full" max-w="sm" h="4" bg="gray-200" class="brick-border">
                            <div
                                h="full"
                                bg="baseplate-green"
                                :style="{width: diversityPercentage(dna.diversityScore.shannonIndex)}"
                            />
                        </div>
                    </div>
                </CardContainer>
            </div>

            <SectionDivider />

            <!-- Top Colors -->
            <div m="y-6">
                <h2 text="lg" font="bold" uppercase tracking="wide" m="b-4">
                    {{ t("brickDna.topColorsTitle").value }}
                </h2>
                <div grid grid-cols="2 sm:3 lg:5" gap="3">
                    <StatCard
                        v-for="color in dna.topColors"
                        :key="color.name"
                        :label="color.name"
                        :value="String(color.count)"
                    >
                        <div
                            w="6"
                            h="6"
                            rounded="full"
                            class="brick-border"
                            border="1"
                            m="t-2"
                            :style="{backgroundColor: color.hex}"
                        />
                    </StatCard>
                </div>
            </div>

            <SectionDivider />

            <!-- Top Part Types -->
            <div m="y-6">
                <h2 text="lg" font="bold" uppercase tracking="wide" m="b-4">
                    {{ t("brickDna.topPartTypesTitle").value }}
                </h2>
                <div grid grid-cols="1 sm:2 lg:3" gap="3">
                    <StatCard
                        v-for="partType in dna.topPartTypes"
                        :key="partType.name"
                        :label="partType.name"
                        :value="String(partType.count)"
                    >
                        <p text="xs gray-500" m="t-1">{{ partType.category }}</p>
                    </StatCard>
                </div>
            </div>

            <SectionDivider />

            <!-- Rarest Parts -->
            <div m="y-6">
                <h2 text="lg" font="bold" uppercase tracking="wide" m="b-4">
                    {{ t("brickDna.rarestPartsTitle").value }}
                </h2>
                <div flex="~ col" gap="2">
                    <CardContainer v-for="(rare, index) in dna.rarestParts" :key="index">
                        <div flex justify="between" items="center">
                            <div>
                                <p font="bold">{{ rare.part }}</p>
                                <p text="sm gray-600">{{ rare.color }}</p>
                            </div>
                            <p text="xl" font="bold">{{ rare.quantity }}x</p>
                        </div>
                    </CardContainer>
                </div>
            </div>
        </template>
    </div>
</template>

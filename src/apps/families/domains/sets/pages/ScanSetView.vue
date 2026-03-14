<script setup lang="ts">
import type {FamilySet} from "@app/types/familySet";

import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import BackButton from "@shared/components/BackButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import BarcodeScanner from "@shared/components/scanner/BarcodeScanner.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {ref} from "vue";

const {t} = familyTranslationService;
const resetKey = ref(0);
const scannedCode = ref("");
const matchedSets = ref<FamilySet[]>([]);
const isSearching = ref(false);
const hasSearched = ref(false);

const onDetect = async (barcode: string) => {
    scannedCode.value = barcode;
    isSearching.value = true;
    hasSearched.value = false;

    try {
        const response = await familyHttpService.getRequest<FamilySet[]>(`/family-sets?set_num=${barcode}`);
        matchedSets.value = response.data.map((item) => toCamelCaseTyped(item));
    } catch {
        matchedSets.value = [];
    } finally {
        isSearching.value = false;
        hasSearched.value = true;
    }
};

const goToDetail = async (id: number) => {
    await familyRouterService.goToRoute("sets-detail", id);
};

const goToAdd = async () => {
    await familyRouterService.goToRoute("sets-add");
};

const scanAgain = () => {
    scannedCode.value = "";
    matchedSets.value = [];
    hasSearched.value = false;
    resetKey.value++;
};

const goBack = async () => {
    await familyRouterService.goToRoute("sets");
};
</script>

<template>
    <div max-w="md" m="x-auto">
        <PageHeader :title="t('sets.scanSet').value">
            <BackButton @click="goBack">{{ t("sets.backToOverview").value }}</BackButton>
        </PageHeader>

        <BarcodeScanner :reset-key="resetKey" @detect="onDetect" @error="() => {}" />

        <div v-if="scannedCode" m="t-6" flex="~ col" gap="4">
            <p font="bold" text="lg">{{ t("sets.scannedCode").value }}: {{ scannedCode }}</p>

            <p v-if="isSearching" text="gray-600">{{ t("common.loading").value }}</p>

            <template v-else-if="hasSearched">
                <div v-if="matchedSets.length > 0" flex="~ col" gap="2">
                    <p font="bold">{{ t("sets.matchingSets").value }}</p>
                    <button
                        v-for="familySet in matchedSets"
                        :key="familySet.id"
                        type="button"
                        flex
                        items="center"
                        gap="4"
                        p="4"
                        bg="white hover:yellow-300 focus:yellow-300"
                        text="left black"
                        cursor="pointer"
                        outline="none"
                        class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
                        @click="goToDetail(familySet.id)"
                    >
                        <div flex="1">
                            <p font="bold">{{ familySet.set.name }}</p>
                            <p text="sm gray-600">{{ familySet.set.setNum }}</p>
                        </div>
                    </button>
                </div>

                <div v-else flex="~ col" gap="4">
                    <p text="gray-600">{{ t("sets.noMatchingSets").value }}</p>
                    <PrimaryButton @click="goToAdd">{{ t("sets.addSet").value }}</PrimaryButton>
                </div>
            </template>

            <PrimaryButton @click="scanAgain">{{ t("sets.scanAgain").value }}</PrimaryButton>
        </div>
    </div>
</template>

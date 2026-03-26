<script setup lang="ts">
import type {SetSummary} from "@app/types/familySet";

import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import {familySetStoreModule} from "@app/stores";
import BackButton from "@shared/components/BackButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import BarcodeScanner from "@shared/components/scanner/BarcodeScanner.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {deepSnakeKeys} from "string-ts";
import {computed, ref} from "vue";

const {t} = familyTranslationService;
const resetKey = ref(0);
const scannedCode = ref("");
const foundSet = ref<SetSummary | null>(null);
const isSearching = ref(false);
const hasSearched = ref(false);
const isAdding = ref(false);
const addError = ref("");
const duplicateDismissed = ref(false);

const duplicateMatch = computed(() => {
    if (!foundSet.value) return null;
    return familySetStoreModule.getAll.value.find((s) => s.setNum === foundSet.value?.setNum) ?? null;
});

const showDuplicateWarning = computed(() => duplicateMatch.value !== null && !duplicateDismissed.value);

const dismissDuplicate = () => {
    duplicateDismissed.value = true;
};

const onDetect = async (barcode: string) => {
    scannedCode.value = barcode;
    isSearching.value = true;
    hasSearched.value = false;
    foundSet.value = null;
    addError.value = "";
    duplicateDismissed.value = false;

    try {
        const response = await familyHttpService.getRequest<SetSummary>(`/sets/ean/${barcode}`);
        foundSet.value = toCamelCaseTyped(response.data);
    } catch {
        foundSet.value = null;
    } finally {
        isSearching.value = false;
        hasSearched.value = true;
    }
};

const addToCollection = async () => {
    if (!foundSet.value) return;

    isAdding.value = true;
    addError.value = "";

    try {
        const response = await familyHttpService.postRequest<{id: number}>(
            "/family-sets",
            deepSnakeKeys({setNum: foundSet.value.setNum, quantity: 1, status: "sealed"}),
        );
        await familyRouterService.goToRoute("sets-detail", response.data.id);
    } catch {
        addError.value = t("sets.scanAddError").value;
    } finally {
        isAdding.value = false;
    }
};

const scanAgain = () => {
    scannedCode.value = "";
    foundSet.value = null;
    hasSearched.value = false;
    addError.value = "";
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

        <BarcodeScanner
            :reset-key="resetKey"
            :loading-text="t('sets.startingCamera').value"
            :retry-text="t('sets.retry').value"
            @detect="onDetect"
            @error="() => {}"
        />

        <div v-if="scannedCode" m="t-6" flex="~ col" gap="4">
            <p font="bold" text="lg">{{ t("sets.scannedCode").value }}: {{ scannedCode }}</p>

            <p v-if="isSearching" text="gray-600">{{ t("common.loading").value }}</p>

            <template v-else-if="hasSearched">
                <div v-if="foundSet" flex="~ col" gap="4">
                    <div flex items="center" gap="4" p="4" bg="white" class="brick-border">
                        <img
                            v-if="foundSet.imageUrl"
                            :src="foundSet.imageUrl"
                            :alt="foundSet.name"
                            w="20"
                            h="20"
                            object="contain"
                        />
                        <div flex="1">
                            <p font="bold">{{ foundSet.name }}</p>
                            <p text="sm gray-600">{{ foundSet.setNum }}</p>
                            <div flex gap="2" m="t-1">
                                <span v-if="foundSet.year" text="xs" p="x-2 y-1" bg="gray-200" font="bold">{{
                                    foundSet.year
                                }}</span>
                                <span v-if="foundSet.numParts" text="xs gray-600"
                                    >{{ t("sets.numParts").value }}: {{ foundSet.numParts }}</span
                                >
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="showDuplicateWarning"
                        p="4"
                        bg="yellow-100"
                        class="brick-border"
                        border="1"
                        flex="~ col"
                        gap="2"
                        data-testid="duplicate-warning"
                    >
                        <p font="bold" text="sm">
                            {{
                                t("sets.duplicateWarning")
                                    .value.replace("{quantity}", String(duplicateMatch?.quantity ?? 0))
                                    .replace("{status}", duplicateMatch?.status ?? "")
                            }}
                        </p>
                        <button
                            type="button"
                            text="xs"
                            font="bold"
                            uppercase
                            tracking="wide"
                            self="start"
                            @click="dismissDuplicate"
                        >
                            {{ t("sets.duplicateDismiss").value }}
                        </button>
                    </div>

                    <p v-if="addError" text="brick-red-dark" font="bold">{{ addError }}</p>

                    <PrimaryButton :disabled="isAdding" @click="addToCollection">{{
                        t("sets.addToCollection").value
                    }}</PrimaryButton>
                </div>

                <div v-else flex="~ col" gap="4">
                    <p text="gray-600">{{ t("sets.scanNoResult").value }}</p>
                </div>
            </template>

            <PrimaryButton @click="scanAgain">{{ t("sets.scanAgain").value }}</PrimaryButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {StorageOptionPart} from "@app/types/part";
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import BackButton from "@shared/components/BackButton.vue";
import DetailRow from "@shared/components/DetailRow.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import LoadingState from "@shared/components/LoadingState.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const {t} = familyTranslationService;
const storageOption = ref<StorageOption | null>(null);
const storageParts = ref<StorageOptionPart[]>([]);
const loading = ref(true);
const partsLoading = ref(true);

onMounted(async () => {
    const id = familyRouterService.currentRouteId.value;
    const [optionResponse, partsResponse] = await Promise.all([
        familyHttpService.getRequest<StorageOption>(`/storage-options/${id}`),
        familyHttpService.getRequest<StorageOptionPart[]>(`/storage-options/${id}/parts`),
    ]);
    storageOption.value = toCamelCaseTyped(optionResponse.data);
    storageParts.value = partsResponse.data.map((item) => toCamelCaseTyped(item));
    loading.value = false;
    partsLoading.value = false;
});

const goToEdit = async () => {
    if (!storageOption.value) return;
    await familyRouterService.goToRoute("storage-edit", storageOption.value.id);
};

const goBack = async () => {
    await familyRouterService.goToRoute("storage");
};
</script>

<template>
    <div max-w="6xl" m="x-auto">
        <LoadingState v-if="loading" :message="t('common.loading').value" />

        <template v-else-if="storageOption">
            <div m="b-6">
                <BackButton @click="goBack">&larr; {{ t("storage.backToOverview").value }}</BackButton>
            </div>

            <div flex="~ col" gap="3">
                <h1 text="2xl" font="bold" uppercase tracking="wide">{{ storageOption.name }}</h1>

                <DetailRow v-if="storageOption.description" :label="t('storage.description').value">
                    {{ storageOption.description }}
                </DetailRow>
                <DetailRow v-if="storageOption.row !== null" :label="t('storage.row').value">
                    {{ storageOption.row }}
                </DetailRow>
                <DetailRow v-if="storageOption.column !== null" :label="t('storage.column').value">
                    {{ storageOption.column }}
                </DetailRow>
                <DetailRow v-if="storageOption.childIds.length > 0" :label="t('storage.subLocations').value">
                    {{ storageOption.childIds.length }}
                </DetailRow>

                <div m="t-4">
                    <PrimaryButton @click="goToEdit">{{ t("storage.edit").value }}</PrimaryButton>
                </div>
            </div>

            <div m="t-8">
                <h2 text="xl" font="bold" uppercase tracking="wide" m="b-4">
                    {{ t("storage.parts").value }} ({{ storageParts.length }})
                </h2>

                <LoadingState v-if="partsLoading" :message="t('storage.loadingParts').value" />

                <EmptyState v-else-if="storageParts.length === 0" :message="t('storage.noParts').value" />

                <div v-else flex="~ col" gap="2">
                    <PartListItem
                        v-for="storagePart in storageParts"
                        :key="storagePart.id"
                        :name="storagePart.part.name"
                        :part-num="storagePart.part.partNum"
                        :quantity="storagePart.quantity"
                        :image-url="storagePart.part.imageUrl"
                        :color-name="storagePart.color?.name ?? null"
                        :color-rgb="storagePart.color?.rgb ?? null"
                    />
                </div>
            </div>
        </template>
    </div>
</template>

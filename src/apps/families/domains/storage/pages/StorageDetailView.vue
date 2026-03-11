<script setup lang="ts">
import type {StorageOptionPart} from "@app/types/part";
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyRouterService} from "@app/services";
import BackButton from "@shared/components/BackButton.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

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
        <p v-if="loading" text="gray-600">Laden...</p>

        <template v-else-if="storageOption">
            <div m="b-6">
                <BackButton @click="goBack">&larr; Terug naar overzicht</BackButton>
            </div>

            <div flex="~ col" gap="3">
                <h1 text="2xl" font="bold" uppercase tracking="wide">{{ storageOption.name }}</h1>

                <div v-if="storageOption.description" flex gap="2">
                    <span font="bold">Beschrijving:</span>
                    <span>{{ storageOption.description }}</span>
                </div>
                <div v-if="storageOption.row !== null" flex gap="2">
                    <span font="bold">Rij:</span>
                    <span>{{ storageOption.row }}</span>
                </div>
                <div v-if="storageOption.column !== null" flex gap="2">
                    <span font="bold">Kolom:</span>
                    <span>{{ storageOption.column }}</span>
                </div>
                <div v-if="storageOption.childIds.length > 0" flex gap="2">
                    <span font="bold">Sub-locaties:</span>
                    <span>{{ storageOption.childIds.length }}</span>
                </div>

                <div m="t-4">
                    <PrimaryButton @click="goToEdit">Bewerken</PrimaryButton>
                </div>
            </div>

            <div m="t-8">
                <h2 text="xl" font="bold" uppercase tracking="wide" m="b-4">Onderdelen ({{ storageParts.length }})</h2>

                <p v-if="partsLoading" text="gray-600">Onderdelen laden...</p>

                <EmptyState v-else-if="storageParts.length === 0" message="Geen onderdelen in deze opslaglocatie." />

                <div v-else flex="~ col" gap="2">
                    <PartListItem
                        v-for="storagePart in storageParts"
                        :key="storagePart.id"
                        :name="storagePart.part.name"
                        :part-num="storagePart.part.partNum"
                        :quantity="storagePart.quantity"
                        :image-url="storagePart.part.imageUrl"
                        :color-name="storagePart.color?.name"
                        :color-rgb="storagePart.color?.rgb"
                    />
                </div>
            </div>
        </template>
    </div>
</template>

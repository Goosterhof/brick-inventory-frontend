<script setup lang="ts">
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyRouterService} from "@app/services";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const storageOption = ref<StorageOption | null>(null);
const loading = ref(true);

onMounted(async () => {
    const id = familyRouterService.currentRouteId.value;
    const response = await familyHttpService.getRequest<StorageOption>(`/storage-options/${id}`);
    storageOption.value = toCamelCaseTyped(response.data);
    loading.value = false;
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
    <div>
        <p v-if="loading" text="gray-600">Laden...</p>

        <template v-else-if="storageOption">
            <div m="b-6">
                <button
                    @click="goBack"
                    text="black"
                    cursor="pointer"
                    bg="white hover:yellow-300 focus:yellow-300"
                    p="x-4 y-2"
                    outline="none"
                    class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
                >
                    &larr; Terug naar overzicht
                </button>
            </div>

            <div flex="~ col" gap="3">
                <h1 text="2xl" font="bold">{{ storageOption.name }}</h1>

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
        </template>
    </div>
</template>

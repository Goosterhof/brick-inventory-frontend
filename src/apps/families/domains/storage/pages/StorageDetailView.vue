<script setup lang="ts">
import type {StorageOptionPart} from "@app/types/part";
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyRouterService} from "@app/services";
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

            <div m="t-8">
                <h2 text="xl" font="bold" m="b-4">Onderdelen ({{ storageParts.length }})</h2>

                <p v-if="partsLoading" text="gray-600">Onderdelen laden...</p>

                <p v-else-if="storageParts.length === 0" text="gray-600">Geen onderdelen in deze opslaglocatie.</p>

                <div v-else flex="~ col" gap="2">
                    <div
                        v-for="storagePart in storageParts"
                        :key="storagePart.id"
                        flex
                        gap="3"
                        items="center"
                        p="3"
                        bg="white"
                        class="brick-border"
                    >
                        <div
                            v-if="storagePart.color"
                            w="6"
                            h="6"
                            shrink="0"
                            class="brick-border"
                            :style="{backgroundColor: '#' + storagePart.color.rgb}"
                        />
                        <img
                            v-if="storagePart.part.imageUrl"
                            :src="storagePart.part.imageUrl"
                            :alt="storagePart.part.name"
                            w="10"
                            h="10"
                            object="contain"
                            shrink="0"
                        />
                        <div flex="1" min-w="0">
                            <p font="bold" truncate>{{ storagePart.part.name }}</p>
                            <p text="sm gray-600">
                                {{ storagePart.part.partNum }}
                                <template v-if="storagePart.color"> &middot; {{ storagePart.color.name }} </template>
                            </p>
                        </div>
                        <span font="bold" shrink="0">{{ storagePart.quantity }}x</span>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

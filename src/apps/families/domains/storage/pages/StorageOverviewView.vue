<script setup lang="ts">
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyRouterService} from "@app/services";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const storageOptions = ref<StorageOption[]>([]);
const loading = ref(true);

onMounted(async () => {
    const response = await familyHttpService.getRequest<StorageOption[]>("/storage-options");
    storageOptions.value = response.data.map((item) => toCamelCaseTyped(item));
    loading.value = false;
});

const goToAdd = async () => {
    await familyRouterService.goToRoute("storage-add");
};

const goToDetail = async (id: number) => {
    await familyRouterService.goToRoute("storage-detail", id);
};
</script>

<template>
    <div max-w="6xl" m="x-auto">
        <div flex justify="between" items="center" m="b-6">
            <h1 text="2xl" font="bold" uppercase tracking="wide">Opslag</h1>
            <PrimaryButton @click="goToAdd">Opslag toevoegen</PrimaryButton>
        </div>

        <p v-if="loading" text="gray-600">Laden...</p>

        <p v-else-if="storageOptions.length === 0" text="gray-600">
            Nog geen opslaglocaties. Voeg je eerste opslaglocatie toe!
        </p>

        <div v-else flex="~ col" gap="4">
            <button
                v-for="option in storageOptions"
                :key="option.id"
                @click="goToDetail(option.id)"
                flex
                gap="4"
                items="center"
                p="4"
                bg="white hover:yellow-300 focus:yellow-300"
                cursor="pointer"
                text="left"
                outline="none"
                class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
            >
                <div flex="1">
                    <p font="bold">{{ option.name }}</p>
                    <p v-if="option.description" text="sm gray-600">{{ option.description }}</p>
                    <div flex gap="2" m="t-1">
                        <span v-if="option.childIds.length > 0" text="xs" p="x-2 y-1" bg="gray-200" font="bold">
                            {{ option.childIds.length }} sub-locaties
                        </span>
                        <span v-if="option.row !== null && option.column !== null" text="xs gray-600">
                            Rij {{ option.row }}, Kolom {{ option.column }}
                        </span>
                    </div>
                </div>
            </button>
        </div>
    </div>
</template>

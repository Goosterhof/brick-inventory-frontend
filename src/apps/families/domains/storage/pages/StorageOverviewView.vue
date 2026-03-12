<script setup lang="ts">
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import EmptyState from "@shared/components/EmptyState.vue";
import ListItemButton from "@shared/components/ListItemButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const {t} = familyTranslationService;
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
        <PageHeader :title="t('storage.title').value">
            <PrimaryButton @click="goToAdd">{{ t("storage.addStorage").value }}</PrimaryButton>
        </PageHeader>

        <p v-if="loading" text="gray-600">{{ t("common.loading").value }}</p>

        <EmptyState v-else-if="storageOptions.length === 0" :message="t('storage.noStorage').value" />

        <div v-else flex="~ col" gap="4">
            <ListItemButton v-for="option in storageOptions" :key="option.id" @click="goToDetail(option.id)">
                <div flex="1">
                    <p font="bold">{{ option.name }}</p>
                    <p v-if="option.description" text="sm gray-600">{{ option.description }}</p>
                    <div flex gap="2" m="t-1">
                        <span v-if="option.childIds.length > 0" text="xs" p="x-2 y-1" bg="gray-200" font="bold">
                            {{ t("storage.subLocationsCount", {count: String(option.childIds.length)}).value }}
                        </span>
                        <span v-if="option.row !== null && option.column !== null" text="xs gray-600">
                            {{
                                t("storage.rowColumnLabel", {row: String(option.row), column: String(option.column)})
                                    .value
                            }}
                        </span>
                    </div>
                </div>
            </ListItemButton>
        </div>
    </div>
</template>

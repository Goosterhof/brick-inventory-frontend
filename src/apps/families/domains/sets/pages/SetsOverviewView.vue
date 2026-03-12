<script setup lang="ts">
import type {FamilySet} from "@app/types/familySet";

import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import EmptyState from "@shared/components/EmptyState.vue";
import ListItemButton from "@shared/components/ListItemButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const {t} = familyTranslationService;
const sets = ref<FamilySet[]>([]);
const loading = ref(true);

const statusKey: Record<FamilySet["status"], "sets.sealed" | "sets.built" | "sets.inProgress" | "sets.incomplete"> = {
    sealed: "sets.sealed",
    built: "sets.built",
    in_progress: "sets.inProgress",
    incomplete: "sets.incomplete",
};

onMounted(async () => {
    const response = await familyHttpService.getRequest<FamilySet[]>("/family-sets");
    sets.value = response.data.map((item) => toCamelCaseTyped(item));
    loading.value = false;
});

const goToAdd = async () => {
    await familyRouterService.goToRoute("sets-add");
};

const goToDetail = async (id: number) => {
    await familyRouterService.goToRoute("sets-detail", id);
};
</script>

<template>
    <div max-w="6xl" m="x-auto">
        <PageHeader :title="t('sets.title').value">
            <PrimaryButton @click="goToAdd">{{ t("sets.addSet").value }}</PrimaryButton>
        </PageHeader>

        <p v-if="loading" text="gray-600">{{ t("common.loading").value }}</p>

        <EmptyState v-else-if="sets.length === 0" :message="t('sets.noSets').value" />

        <div v-else flex="~ col" gap="4">
            <ListItemButton v-for="familySet in sets" :key="familySet.id" @click="goToDetail(familySet.id)">
                <img
                    v-if="familySet.set.imageUrl"
                    :src="familySet.set.imageUrl"
                    :alt="familySet.set.name"
                    w="20"
                    h="20"
                    object="contain"
                />
                <div v-else w="20" h="20" bg="gray-200" flex items="center" justify="center" text="sm gray-600">
                    {{ t("common.noImage").value }}
                </div>
                <div flex="1">
                    <p font="bold">{{ familySet.set.name }}</p>
                    <p text="sm gray-600">{{ familySet.set.setNum }}</p>
                    <div flex gap="2" m="t-1">
                        <span text="xs" p="x-2 y-1" bg="gray-200" font="bold">{{
                            t(statusKey[familySet.status]).value
                        }}</span>
                        <span text="xs gray-600">{{ familySet.quantity }}x</span>
                    </div>
                </div>
            </ListItemButton>
        </div>
    </div>
</template>

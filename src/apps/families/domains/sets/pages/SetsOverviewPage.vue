<script setup lang="ts">
import type {FamilySet, FamilySetStatus} from "@app/types/familySet";

import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import BadgeLabel from "@shared/components/BadgeLabel.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import FilterChip from "@shared/components/FilterChip.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import ListItemButton from "@shared/components/ListItemButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {downloadCsv, toCsv} from "@shared/helpers/csv";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {computed, onMounted, ref} from "vue";

const {t} = familyTranslationService;
const sets = ref<FamilySet[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const activeStatusFilter = ref<FamilySetStatus | null>(null);

const statusKey: Record<
    FamilySet["status"],
    "sets.sealed" | "sets.built" | "sets.inProgress" | "sets.incomplete" | "sets.wishlist"
> = {
    sealed: "sets.sealed",
    built: "sets.built",
    in_progress: "sets.inProgress",
    incomplete: "sets.incomplete",
    wishlist: "sets.wishlist",
};

const allStatuses: FamilySetStatus[] = ["sealed", "in_progress", "built", "incomplete", "wishlist"];

const filteredSets = computed(() => {
    let result = sets.value;

    if (activeStatusFilter.value) {
        result = result.filter((s) => s.status === activeStatusFilter.value);
    }

    const query = searchQuery.value.toLowerCase().trim();
    if (query) {
        result = result.filter(
            (s) => s.set.name.toLowerCase().includes(query) || s.set.setNum.toLowerCase().includes(query),
        );
    }

    return result;
});

const toggleStatusFilter = (status: FamilySetStatus) => {
    activeStatusFilter.value = activeStatusFilter.value === status ? null : status;
};

onMounted(async () => {
    const response = await familyHttpService.getRequest<FamilySet[]>("/family-sets");
    sets.value = response.data.map((item) => toCamelCaseTyped(item));
    loading.value = false;
});

const goToAdd = async () => {
    await familyRouterService.goToRoute("sets-add");
};

const goToScan = async () => {
    await familyRouterService.goToRoute("sets-scan");
};

const goToDetail = async (id: number) => {
    await familyRouterService.goToRoute("sets-detail", id);
};

const exportCsv = () => {
    const headers = ["Set Number", "Name", "Year", "Theme", "Parts", "Quantity", "Status", "Purchase Date", "Notes"];
    const rows = filteredSets.value.map((s) => [
        s.set.setNum,
        s.set.name,
        String(s.set.year ?? ""),
        s.set.theme ?? "",
        String(s.set.numParts),
        String(s.quantity),
        s.status,
        s.purchaseDate ?? "",
        s.notes ?? "",
    ]);
    downloadCsv(toCsv(headers, rows), "lego-sets.csv");
};
</script>

<template>
    <div max-w="6xl" m="x-auto">
        <PageHeader :title="t('sets.title').value">
            <div flex gap="2" flex-wrap="wrap">
                <PrimaryButton @click="goToScan">{{ t("sets.scanSet").value }}</PrimaryButton>
                <PrimaryButton @click="goToAdd">{{ t("sets.addSet").value }}</PrimaryButton>
                <PrimaryButton v-if="sets.length > 0" @click="exportCsv">{{ t("common.export").value }}</PrimaryButton>
            </div>
        </PageHeader>

        <p v-if="loading" text="gray-600">{{ t("common.loading").value }}</p>

        <EmptyState v-else-if="sets.length === 0" :message="t('sets.noSets').value" />

        <template v-else>
            <div flex="~ col" gap="4" m="b-4">
                <TextInput
                    v-model="searchQuery"
                    :label="t('common.search').value"
                    type="search"
                    :placeholder="t('sets.searchPlaceholder').value"
                    optional
                />

                <div flex gap="2" flex-wrap="wrap">
                    <FilterChip
                        v-for="status in allStatuses"
                        :key="status"
                        :active="activeStatusFilter === status"
                        @click="toggleStatusFilter(status)"
                    >
                        {{ t(statusKey[status]).value }}
                    </FilterChip>
                </div>
            </div>

            <EmptyState v-if="filteredSets.length === 0" :message="t('common.noResults').value" />

            <div v-else flex="~ col" gap="4">
                <ListItemButton v-for="familySet in filteredSets" :key="familySet.id" @click="goToDetail(familySet.id)">
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
                        <div flex gap="2" m="t-1" items="center">
                            <BadgeLabel :variant="familySet.status === 'wishlist' ? 'muted' : 'default'">{{
                                t(statusKey[familySet.status]).value
                            }}</BadgeLabel>
                            <span text="xs gray-600">{{ familySet.quantity }}x</span>
                        </div>
                    </div>
                </ListItemButton>
            </div>
        </template>
    </div>
</template>

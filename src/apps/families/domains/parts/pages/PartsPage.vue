<script setup lang="ts">
import type {FamilyPartEntry, GroupedFamilyPart} from "@app/types/part";

import {familyHttpService, familyTranslationService} from "@app/services";
import EmptyState from "@shared/components/EmptyState.vue";
import FilterChip from "@shared/components/FilterChip.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {downloadCsv, toCsv} from "@shared/helpers/csv";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {computed, onMounted, ref} from "vue";

type SortField = "name" | "quantity" | "color";

const {t} = familyTranslationService;
const entries = ref<FamilyPartEntry[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const activeColorFilter = ref<string | null>(null);
const showOrphansOnly = ref(false);
const activeSortField = ref<SortField>("name");

onMounted(async () => {
    try {
        const response = await familyHttpService.getRequest<FamilyPartEntry[]>("/family/parts");
        entries.value = response.data.map((item) => toCamelCaseTyped<FamilyPartEntry>(item));
    } catch {
        entries.value = [];
    } finally {
        loading.value = false;
    }
});

const groupedParts = computed((): GroupedFamilyPart[] => {
    const map = new Map<string, GroupedFamilyPart>();

    for (const entry of entries.value) {
        const key = `${entry.partId}_${entry.colorId}`;
        const existing = map.get(key);

        if (existing) {
            existing.totalQuantity += entry.quantity;
            existing.locations.push({
                storageOptionId: entry.storageOptionId,
                storageOptionName: entry.storageOptionName,
                quantity: entry.quantity,
            });
            if (entry.familySetId === null) {
                existing.isOrphan = true;
            }
        } else {
            map.set(key, {
                partId: entry.partId,
                partNum: entry.partNum,
                partName: entry.partName,
                partImageUrl: entry.partImageUrl,
                colorId: entry.colorId,
                colorName: entry.colorName,
                colorRgb: entry.colorRgb,
                totalQuantity: entry.quantity,
                isOrphan: entry.familySetId === null,
                locations: [
                    {
                        storageOptionId: entry.storageOptionId,
                        storageOptionName: entry.storageOptionName,
                        quantity: entry.quantity,
                    },
                ],
            });
        }
    }

    return [...map.values()];
});

const uniqueColors = computed(() => {
    const colors = new Map<string, string>();
    for (const part of groupedParts.value) {
        if (part.colorName !== null) {
            colors.set(part.colorName, part.colorName);
        }
    }
    return [...colors.values()].sort();
});

const toggleColorFilter = (color: string) => {
    activeColorFilter.value = activeColorFilter.value === color ? null : color;
};

const toggleOrphanFilter = () => {
    showOrphansOnly.value = !showOrphansOnly.value;
};

const setSortField = (field: SortField) => {
    activeSortField.value = field;
};

const compareParts = (a: GroupedFamilyPart, b: GroupedFamilyPart): number => {
    if (activeSortField.value === "name") {
        return a.partName.localeCompare(b.partName);
    }
    if (activeSortField.value === "quantity") {
        return b.totalQuantity - a.totalQuantity;
    }
    return (a.colorName ?? "").localeCompare(b.colorName ?? "");
};

const filteredParts = computed(() => {
    let result = groupedParts.value;

    const query = searchQuery.value.toLowerCase().trim();
    if (query) {
        result = result.filter(
            (p) => p.partName.toLowerCase().includes(query) || p.partNum.toLowerCase().includes(query),
        );
    }

    if (activeColorFilter.value) {
        result = result.filter((p) => p.colorName === activeColorFilter.value);
    }

    if (showOrphansOnly.value) {
        result = result.filter((p) => p.isOrphan);
    }

    return [...result].sort(compareParts);
});

const exportCsv = () => {
    const headers = ["Part Number", "Name", "Color", "Total Quantity", "Storage Locations"];
    const rows = filteredParts.value.map((p) => [
        p.partNum,
        p.partName,
        p.colorName ?? "",
        String(p.totalQuantity),
        p.locations.map((l) => `${l.storageOptionName} (${l.quantity}x)`).join("; "),
    ]);
    downloadCsv(toCsv(headers, rows), "lego-parts.csv");
};

const sortLabelKey: Record<SortField, "parts.sortName" | "parts.sortQuantity" | "parts.sortColor"> = {
    name: "parts.sortName",
    quantity: "parts.sortQuantity",
    color: "parts.sortColor",
};
const allSortFields: SortField[] = ["name", "quantity", "color"];
</script>

<template>
    <div max-w="6xl" m="x-auto">
        <PageHeader :title="t('parts.title').value">
            <PrimaryButton v-if="groupedParts.length > 0" @click="exportCsv">{{
                t("common.export").value
            }}</PrimaryButton>
        </PageHeader>

        <p v-if="loading" text="gray-600">{{ t("common.loading").value }}</p>

        <EmptyState v-else-if="groupedParts.length === 0" :message="t('parts.noParts').value" />

        <template v-else>
            <div flex="~ col" gap="4" m="b-4">
                <TextInput
                    v-model="searchQuery"
                    :label="t('common.search').value"
                    type="search"
                    :placeholder="t('parts.searchPlaceholder').value"
                    optional
                />

                <div flex="~ col" gap="2">
                    <div flex gap="2" flex-wrap="wrap">
                        <FilterChip
                            v-for="field in allSortFields"
                            :key="field"
                            :active="activeSortField === field"
                            @click="setSortField(field)"
                        >
                            {{ t(sortLabelKey[field]).value }}
                        </FilterChip>
                    </div>

                    <div flex gap="2" flex-wrap="wrap">
                        <FilterChip :active="!activeColorFilter" @click="activeColorFilter = null">
                            {{ t("parts.allColors").value }}
                        </FilterChip>
                        <FilterChip
                            v-for="color in uniqueColors"
                            :key="color"
                            :active="activeColorFilter === color"
                            @click="toggleColorFilter(color)"
                        >
                            {{ color }}
                        </FilterChip>
                    </div>

                    <div flex gap="2" flex-wrap="wrap">
                        <FilterChip :active="showOrphansOnly" @click="toggleOrphanFilter">
                            {{ t("parts.orphanParts").value }}
                        </FilterChip>
                    </div>
                </div>
            </div>

            <EmptyState v-if="filteredParts.length === 0" :message="t('parts.noResults').value" />

            <div v-else flex="~ col" gap="2">
                <PartListItem
                    v-for="part in filteredParts"
                    :key="`${part.partId}_${part.colorId}`"
                    :name="part.partName"
                    :part-num="part.partNum"
                    :quantity="part.totalQuantity"
                    :image-url="part.partImageUrl"
                    :color-name="part.colorName"
                    :color-rgb="part.colorRgb"
                >
                    <div flex gap="1" m="t-1" flex-wrap="wrap">
                        <span
                            v-for="loc in part.locations"
                            :key="loc.storageOptionId"
                            text="xs"
                            p="x-2 y-0.5"
                            bg="yellow-300"
                            font="bold"
                            class="brick-border"
                            border="1"
                        >
                            {{ loc.storageOptionName }} ({{ loc.quantity }}x)
                        </span>
                        <span
                            v-if="part.isOrphan"
                            text="xs"
                            p="x-2 y-0.5"
                            bg="red-200"
                            font="bold"
                            class="brick-border"
                            border="1"
                        >
                            {{ t("parts.orphanParts").value }}
                        </span>
                    </div>
                </PartListItem>
            </div>
        </template>
    </div>
</template>

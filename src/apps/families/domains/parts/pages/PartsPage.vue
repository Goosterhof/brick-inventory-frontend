<script setup lang="ts">
import type {FamilyPartEntry, GroupedFamilyPart} from "@app/types/part";

import {familyHttpService, familyTranslationService} from "@app/services";
import EmptyState from "@shared/components/EmptyState.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {downloadCsv, toCsv} from "@shared/helpers/csv";
import {deepCamelKeys} from "string-ts";
import {computed, onMounted, ref} from "vue";

const {t} = familyTranslationService;
const entries = ref<FamilyPartEntry[]>([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const response = await familyHttpService.getRequest<FamilyPartEntry[]>("/family/parts");
        entries.value = response.data.map((item) => deepCamelKeys(item) as FamilyPartEntry);
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

const exportCsv = () => {
    const headers = ["Part Number", "Name", "Color", "Total Quantity", "Storage Locations"];
    const rows = groupedParts.value.map((p) => [
        p.partNum,
        p.partName,
        p.colorName ?? "",
        String(p.totalQuantity),
        p.locations.map((l) => `${l.storageOptionName} (${l.quantity}x)`).join("; "),
    ]);
    downloadCsv(toCsv(headers, rows), "lego-parts.csv");
};
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

        <div v-else flex="~ col" gap="2">
            <PartListItem
                v-for="part in groupedParts"
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
                </div>
            </PartListItem>
        </div>
    </div>
</template>

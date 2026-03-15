<script setup lang="ts">
import type {FamilySet} from "@app/types/familySet";
import type {SetPart, SetWithParts, StorageMapEntry} from "@app/types/part";

import AssignPartModal from "../modals/AssignPartModal.vue";
import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import BackButton from "@shared/components/BackButton.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {deepCamelKeys} from "string-ts";
import {computed, onMounted, ref} from "vue";

const {t} = familyTranslationService;
const familySet = ref<FamilySet | null>(null);
const setWithParts = ref<SetWithParts | null>(null);
const storageMap = ref<StorageMapEntry[]>([]);
const loading = ref(true);
const partsLoading = ref(false);
const selectedPart = ref<SetPart | null>(null);
const showAssignModal = ref(false);

const statusKey: Record<FamilySet["status"], "sets.sealed" | "sets.built" | "sets.inProgress" | "sets.incomplete"> = {
    sealed: "sets.sealed",
    built: "sets.built",
    in_progress: "sets.inProgress",
    incomplete: "sets.incomplete",
};

const storageByPartKey = computed(() => {
    const map = new Map<string, StorageMapEntry[]>();
    for (const entry of storageMap.value) {
        const key = `${entry.partId}_${entry.colorId}`;
        const existing = map.get(key) ?? [];
        existing.push(entry);
        map.set(key, existing);
    }
    return map;
});

const getStorageLocations = (setPart: SetPart): StorageMapEntry[] => {
    const key = `${setPart.part.id}_${setPart.color.id}`;
    return storageByPartKey.value.get(key) ?? [];
};

const getAvailableQuantity = (setPart: SetPart): number => {
    const locations = getStorageLocations(setPart);
    return locations.reduce((sum, loc) => sum + loc.quantity, 0);
};

const buildStats = computed(() => {
    if (!setWithParts.value || storageMap.value.length === 0) return null;

    const regularParts = setWithParts.value.parts.filter((p) => !p.isSpare);
    let partsComplete = 0;
    let totalNeeded = 0;
    let totalAvailable = 0;

    for (const part of regularParts) {
        const available = getAvailableQuantity(part);
        totalNeeded += part.quantity;
        totalAvailable += Math.min(available, part.quantity);
        if (available >= part.quantity) {
            partsComplete++;
        }
    }

    return {
        uniquePartsTotal: regularParts.length,
        uniquePartsComplete: partsComplete,
        totalNeeded,
        totalAvailable,
        canBuild: partsComplete === regularParts.length,
    };
});

const loadParts = async (setNum: string) => {
    partsLoading.value = true;
    const response = await familyHttpService.getRequest<SetWithParts>(`/sets/${setNum}/parts`);
    setWithParts.value = toCamelCaseTyped(response.data);

    try {
        const mapResponse = await familyHttpService.getRequest<StorageMapEntry[]>(`/sets/${setNum}/storage-map`);
        storageMap.value = mapResponse.data.map((item) => deepCamelKeys(item) as StorageMapEntry);
    } catch {
        storageMap.value = [];
    }

    partsLoading.value = false;
};

onMounted(async () => {
    const id = familyRouterService.currentRouteId.value;
    const response = await familyHttpService.getRequest<FamilySet>(`/family-sets/${id}`);
    familySet.value = toCamelCaseTyped(response.data);
    loading.value = false;
});

const allStatuses: FamilySet["status"][] = ["sealed", "in_progress", "built", "incomplete"];
const statusUpdating = ref(false);

const updateStatus = async (newStatus: FamilySet["status"]) => {
    if (!familySet.value || familySet.value.status === newStatus) return;

    statusUpdating.value = true;
    try {
        await familyHttpService.patchRequest(`/family-sets/${familySet.value.id}`, {status: newStatus});
        familySet.value.status = newStatus;
    } finally {
        statusUpdating.value = false;
    }
};

const goToEdit = async () => {
    if (!familySet.value) return;
    await familyRouterService.goToRoute("sets-edit", familySet.value.id);
};

const goBack = async () => {
    await familyRouterService.goToRoute("sets");
};

const openAssignModal = (part: SetPart) => {
    selectedPart.value = part;
    showAssignModal.value = true;
};

const closeAssignModal = () => {
    showAssignModal.value = false;
    selectedPart.value = null;
};

const handleAssigned = () => {
    showAssignModal.value = false;
    selectedPart.value = null;
    if (familySet.value) {
        loadParts(familySet.value.set.setNum);
    }
};
</script>

<template>
    <div max-w="6xl" m="x-auto">
        <p v-if="loading" text="gray-600">{{ t("common.loading").value }}</p>

        <template v-else-if="familySet">
            <div m="b-6">
                <BackButton @click="goBack">&larr; {{ t("sets.backToOverview").value }}</BackButton>
            </div>

            <div flex="~ col md:row" gap="6">
                <div shrink="0">
                    <img
                        v-if="familySet.set.imageUrl"
                        :src="familySet.set.imageUrl"
                        :alt="familySet.set.name"
                        w="48"
                        h="48"
                        object="contain"
                    />
                    <div v-else w="48" h="48" bg="gray-200" flex items="center" justify="center" text="gray-600">
                        {{ t("common.noImage").value }}
                    </div>
                </div>

                <div flex="1 ~ col" gap="3">
                    <h1 text="2xl" font="bold" uppercase tracking="wide">{{ familySet.set.name }}</h1>
                    <p text="gray-600">{{ familySet.set.setNum }}</p>

                    <div flex="~ col" gap="2" m="t-2">
                        <div flex gap="2">
                            <span font="bold">{{ t("sets.year").value }}:</span>
                            <span>{{ familySet.set.year ?? t("sets.unknown").value }}</span>
                        </div>
                        <div flex gap="2">
                            <span font="bold">{{ t("sets.theme").value }}:</span>
                            <span>{{ familySet.set.theme ?? t("sets.unknown").value }}</span>
                        </div>
                        <div flex gap="2">
                            <span font="bold">{{ t("sets.numParts").value }}:</span>
                            <span>{{ familySet.set.numParts }}</span>
                        </div>
                        <div flex gap="2">
                            <span font="bold">{{ t("sets.quantity").value }}:</span>
                            <span>{{ familySet.quantity }}x</span>
                        </div>
                        <div flex="~ col" gap="2">
                            <span font="bold">{{ t("sets.status").value }}:</span>
                            <div flex gap="2" flex-wrap="wrap">
                                <button
                                    v-for="status in allStatuses"
                                    :key="status"
                                    type="button"
                                    text="xs"
                                    p="x-3 y-1"
                                    font="bold"
                                    uppercase
                                    tracking="wide"
                                    cursor="pointer"
                                    outline="none"
                                    class="brick-border brick-transition"
                                    :bg="familySet.status === status ? 'yellow-300' : 'white hover:yellow-100'"
                                    :disabled="statusUpdating"
                                    @click="updateStatus(status)"
                                >
                                    {{ t(statusKey[status]).value }}
                                </button>
                            </div>
                        </div>
                        <div v-if="familySet.purchaseDate" flex gap="2">
                            <span font="bold">{{ t("sets.purchaseDate").value }}:</span>
                            <span>{{ familySet.purchaseDate }}</span>
                        </div>
                        <div v-if="familySet.notes" flex gap="2">
                            <span font="bold">{{ t("sets.notes").value }}:</span>
                            <span>{{ familySet.notes }}</span>
                        </div>
                    </div>

                    <div flex gap="4" m="t-4">
                        <PrimaryButton @click="goToEdit">{{ t("sets.edit").value }}</PrimaryButton>
                        <PrimaryButton v-if="!setWithParts" @click="loadParts(familySet.set.setNum)">
                            {{ t("sets.loadParts").value }}
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            <div v-if="partsLoading" m="t-8">
                <p text="gray-600">{{ t("sets.loadingParts").value }}</p>
            </div>

            <div v-else-if="setWithParts" m="t-8">
                <div
                    v-if="buildStats"
                    p="4"
                    m="b-6"
                    class="brick-border brick-shadow"
                    :bg="buildStats.canBuild ? 'green-100' : 'white'"
                >
                    <h2 text="xl" font="bold" uppercase tracking="wide" m="b-3">
                        {{ t("sets.buildCheck").value }}
                    </h2>
                    <p font="bold" text="lg" :class="buildStats.canBuild ? 'text-green-700' : 'text-red-600'">
                        {{ buildStats.canBuild ? t("sets.readyToBuild").value : t("sets.notReadyToBuild").value }}
                    </p>
                    <div flex gap="6" m="t-2" text="sm">
                        <span>
                            {{ t("sets.uniqueParts").value }}: {{ buildStats.uniquePartsComplete }}/{{
                                buildStats.uniquePartsTotal
                            }}
                        </span>
                        <span>
                            {{ t("sets.totalPieces").value }}: {{ buildStats.totalAvailable }}/{{
                                buildStats.totalNeeded
                            }}
                        </span>
                    </div>
                </div>

                <h2 text="xl" font="bold" uppercase tracking="wide" m="b-4">
                    {{ t("sets.parts").value }} ({{ setWithParts.parts.filter((p) => !p.isSpare).length }})
                </h2>

                <div flex="~ col" gap="2">
                    <button
                        v-for="setPart in setWithParts.parts.filter((p) => !p.isSpare)"
                        :key="setPart.id"
                        type="button"
                        w="full"
                        text="left"
                        bg="transparent"
                        p="0"
                        cursor="pointer"
                        outline="none"
                        @click="openAssignModal(setPart)"
                    >
                        <PartListItem
                            :name="setPart.part.name"
                            :part-num="setPart.part.partNum"
                            :quantity="setPart.quantity"
                            :image-url="setPart.part.imageUrl"
                            :color-name="setPart.color.name"
                            :color-rgb="setPart.color.rgb"
                        >
                            <div v-if="storageMap.length > 0" flex gap="1" m="t-1" flex-wrap="wrap" items="center">
                                <span
                                    v-for="loc in getStorageLocations(setPart)"
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
                                    text="xs"
                                    p="x-2 y-0.5"
                                    font="bold"
                                    class="brick-border"
                                    border="1"
                                    :bg="getAvailableQuantity(setPart) >= setPart.quantity ? 'green-200' : 'red-200'"
                                >
                                    {{ getAvailableQuantity(setPart) }}/{{ setPart.quantity }}
                                </span>
                            </div>
                        </PartListItem>
                    </button>
                </div>

                <div v-if="setWithParts.parts.filter((p) => p.isSpare).length > 0" m="t-6">
                    <h2 text="xl" font="bold" uppercase tracking="wide" m="b-4">
                        {{ t("sets.spareParts").value }} ({{ setWithParts.parts.filter((p) => p.isSpare).length }})
                    </h2>

                    <div flex="~ col" gap="2">
                        <button
                            v-for="setPart in setWithParts.parts.filter((p) => p.isSpare)"
                            :key="setPart.id"
                            type="button"
                            w="full"
                            text="left"
                            bg="transparent"
                            p="0"
                            cursor="pointer"
                            outline="none"
                            @click="openAssignModal(setPart)"
                        >
                            <PartListItem
                                :name="setPart.part.name"
                                :part-num="setPart.part.partNum"
                                :quantity="setPart.quantity"
                                :color-name="setPart.color.name"
                                :color-rgb="setPart.color.rgb"
                                spare
                            >
                                <div
                                    v-if="getStorageLocations(setPart).length > 0"
                                    flex
                                    gap="1"
                                    m="t-1"
                                    flex-wrap="wrap"
                                >
                                    <span
                                        v-for="loc in getStorageLocations(setPart)"
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
                        </button>
                    </div>
                </div>
            </div>

            <AssignPartModal
                v-if="selectedPart"
                :open="showAssignModal"
                :part="selectedPart"
                @close="closeAssignModal"
                @assigned="handleAssigned"
            />
        </template>
    </div>
</template>

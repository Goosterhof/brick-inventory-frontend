<script setup lang="ts">
import type {FamilySet} from "@app/types/familySet";
import type {SetPart, SetWithParts} from "@app/types/part";

import AssignPartModal from "../modals/AssignPartModal.vue";
import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import BackButton from "@shared/components/BackButton.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const {t} = familyTranslationService;
const familySet = ref<FamilySet | null>(null);
const setWithParts = ref<SetWithParts | null>(null);
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

const loadParts = async (setNum: string) => {
    partsLoading.value = true;
    const response = await familyHttpService.getRequest<SetWithParts>(`/sets/${setNum}/parts`);
    setWithParts.value = toCamelCaseTyped(response.data);
    partsLoading.value = false;
};

onMounted(async () => {
    const id = familyRouterService.currentRouteId.value;
    const response = await familyHttpService.getRequest<FamilySet>(`/family-sets/${id}`);
    familySet.value = toCamelCaseTyped(response.data);
    loading.value = false;
});

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
                        <div flex gap="2">
                            <span font="bold">{{ t("sets.status").value }}:</span>
                            <span>{{ t(statusKey[familySet.status]).value }}</span>
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
                        />
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
                            />
                        </button>
                    </div>
                </div>
            </div>

            <AssignPartModal
                v-if="selectedPart"
                :open="showAssignModal"
                :part="selectedPart"
                @close="closeAssignModal"
                @assigned="closeAssignModal"
            />
        </template>
    </div>
</template>

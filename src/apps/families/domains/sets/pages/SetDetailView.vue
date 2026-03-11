<script setup lang="ts">
import type {FamilySet} from "@app/types/familySet";
import type {SetWithParts} from "@app/types/part";

import {familyHttpService, familyRouterService} from "@app/services";
import BackButton from "@shared/components/BackButton.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const familySet = ref<FamilySet | null>(null);
const setWithParts = ref<SetWithParts | null>(null);
const loading = ref(true);
const partsLoading = ref(false);

const statusLabels: Record<FamilySet["status"], string> = {
    sealed: "Verzegeld",
    built: "Gebouwd",
    in_progress: "In aanbouw",
    incomplete: "Incompleet",
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
</script>

<template>
    <div max-w="6xl" m="x-auto">
        <p v-if="loading" text="gray-600">Laden...</p>

        <template v-else-if="familySet">
            <div m="b-6">
                <BackButton @click="goBack">&larr; Terug naar overzicht</BackButton>
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
                        Geen afbeelding
                    </div>
                </div>

                <div flex="1 ~ col" gap="3">
                    <h1 text="2xl" font="bold" uppercase tracking="wide">{{ familySet.set.name }}</h1>
                    <p text="gray-600">{{ familySet.set.setNum }}</p>

                    <div flex="~ col" gap="2" m="t-2">
                        <div flex gap="2">
                            <span font="bold">Jaar:</span>
                            <span>{{ familySet.set.year ?? "Onbekend" }}</span>
                        </div>
                        <div flex gap="2">
                            <span font="bold">Thema:</span>
                            <span>{{ familySet.set.theme ?? "Onbekend" }}</span>
                        </div>
                        <div flex gap="2">
                            <span font="bold">Aantal onderdelen:</span>
                            <span>{{ familySet.set.numParts }}</span>
                        </div>
                        <div flex gap="2">
                            <span font="bold">Aantal:</span>
                            <span>{{ familySet.quantity }}x</span>
                        </div>
                        <div flex gap="2">
                            <span font="bold">Status:</span>
                            <span>{{ statusLabels[familySet.status] }}</span>
                        </div>
                        <div v-if="familySet.purchaseDate" flex gap="2">
                            <span font="bold">Aankoopdatum:</span>
                            <span>{{ familySet.purchaseDate }}</span>
                        </div>
                        <div v-if="familySet.notes" flex gap="2">
                            <span font="bold">Notities:</span>
                            <span>{{ familySet.notes }}</span>
                        </div>
                    </div>

                    <div flex gap="4" m="t-4">
                        <PrimaryButton @click="goToEdit">Bewerken</PrimaryButton>
                        <PrimaryButton v-if="!setWithParts" @click="loadParts(familySet.set.setNum)">
                            Onderdelen laden
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            <div v-if="partsLoading" m="t-8">
                <p text="gray-600">Onderdelen laden...</p>
            </div>

            <div v-else-if="setWithParts" m="t-8">
                <h2 text="xl" font="bold" uppercase tracking="wide" m="b-4">
                    Onderdelen ({{ setWithParts.parts.filter((p) => !p.isSpare).length }})
                </h2>

                <div flex="~ col" gap="2">
                    <PartListItem
                        v-for="setPart in setWithParts.parts.filter((p) => !p.isSpare)"
                        :key="setPart.id"
                        :name="setPart.part.name"
                        :part-num="setPart.part.partNum"
                        :quantity="setPart.quantity"
                        :image-url="setPart.part.imageUrl"
                        :color-name="setPart.color.name"
                        :color-rgb="setPart.color.rgb"
                    />
                </div>

                <div v-if="setWithParts.parts.filter((p) => p.isSpare).length > 0" m="t-6">
                    <h2 text="xl" font="bold" uppercase tracking="wide" m="b-4">
                        Reserve ({{ setWithParts.parts.filter((p) => p.isSpare).length }})
                    </h2>

                    <div flex="~ col" gap="2">
                        <PartListItem
                            v-for="setPart in setWithParts.parts.filter((p) => p.isSpare)"
                            :key="setPart.id"
                            :name="setPart.part.name"
                            :part-num="setPart.part.partNum"
                            :quantity="setPart.quantity"
                            :color-name="setPart.color.name"
                            :color-rgb="setPart.color.rgb"
                            spare
                        />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

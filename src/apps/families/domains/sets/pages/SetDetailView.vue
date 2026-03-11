<script setup lang="ts">
import type {FamilySet} from "@app/types/familySet";
import type {SetWithParts} from "@app/types/part";

import {familyHttpService, familyRouterService} from "@app/services";
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
    <div>
        <p v-if="loading" text="gray-600">Laden...</p>

        <template v-else-if="familySet">
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
                    <h1 text="2xl" font="bold">{{ familySet.set.name }}</h1>
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
                <h2 text="xl" font="bold" m="b-4">
                    Onderdelen ({{ setWithParts.parts.filter((p) => !p.isSpare).length }})
                </h2>

                <div flex="~ col" gap="2">
                    <div
                        v-for="setPart in setWithParts.parts.filter((p) => !p.isSpare)"
                        :key="setPart.id"
                        flex
                        gap="3"
                        items="center"
                        p="3"
                        bg="white"
                        class="brick-border"
                    >
                        <div
                            w="6"
                            h="6"
                            shrink="0"
                            class="brick-border"
                            :style="{backgroundColor: '#' + setPart.color.rgb}"
                        />
                        <img
                            v-if="setPart.part.imageUrl"
                            :src="setPart.part.imageUrl"
                            :alt="setPart.part.name"
                            w="10"
                            h="10"
                            object="contain"
                            shrink="0"
                        />
                        <div flex="1" min-w="0">
                            <p font="bold" truncate>{{ setPart.part.name }}</p>
                            <p text="sm gray-600">{{ setPart.part.partNum }} &middot; {{ setPart.color.name }}</p>
                        </div>
                        <span font="bold" shrink="0">{{ setPart.quantity }}x</span>
                    </div>
                </div>

                <div v-if="setWithParts.parts.filter((p) => p.isSpare).length > 0" m="t-6">
                    <h2 text="xl" font="bold" m="b-4">
                        Reserve ({{ setWithParts.parts.filter((p) => p.isSpare).length }})
                    </h2>

                    <div flex="~ col" gap="2">
                        <div
                            v-for="setPart in setWithParts.parts.filter((p) => p.isSpare)"
                            :key="setPart.id"
                            flex
                            gap="3"
                            items="center"
                            p="3"
                            bg="gray-50"
                            class="brick-border"
                        >
                            <div
                                w="6"
                                h="6"
                                shrink="0"
                                class="brick-border"
                                :style="{backgroundColor: '#' + setPart.color.rgb}"
                            />
                            <div flex="1" min-w="0">
                                <p font="bold" truncate>{{ setPart.part.name }}</p>
                                <p text="sm gray-600">{{ setPart.part.partNum }} &middot; {{ setPart.color.name }}</p>
                            </div>
                            <span font="bold" shrink="0">{{ setPart.quantity }}x</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

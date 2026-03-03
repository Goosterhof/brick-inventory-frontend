<script setup lang="ts">
import type {FamilySet} from "@app/types/familySet";

import {familyHttpService, familyRouterService} from "@app/services";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const sets = ref<FamilySet[]>([]);
const loading = ref(true);

const statusLabels: Record<FamilySet["status"], string> = {
    sealed: "Verzegeld",
    built: "Gebouwd",
    in_progress: "In aanbouw",
    incomplete: "Incompleet",
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
    <div>
        <div flex justify="between" items="center" m="b-6">
            <h1 text="2xl" font="bold">Mijn Sets</h1>
            <PrimaryButton @click="goToAdd">Set toevoegen</PrimaryButton>
        </div>

        <p v-if="loading" text="gray-600">Laden...</p>

        <p v-else-if="sets.length === 0" text="gray-600">Nog geen sets. Voeg je eerste set toe!</p>

        <div v-else flex="~ col" gap="4">
            <button
                v-for="familySet in sets"
                :key="familySet.id"
                @click="goToDetail(familySet.id)"
                flex
                gap="4"
                items="center"
                p="4"
                border="3 black"
                bg="white hover:yellow-50"
                cursor="pointer"
                text="left"
                class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                transition="all duration-150"
            >
                <img
                    v-if="familySet.set.imageUrl"
                    :src="familySet.set.imageUrl"
                    :alt="familySet.set.name"
                    w="20"
                    h="20"
                    object="contain"
                />
                <div v-else w="20" h="20" bg="gray-200" flex items="center" justify="center" text="sm gray-500">
                    Geen afbeelding
                </div>
                <div flex="1">
                    <p font="bold">{{ familySet.set.name }}</p>
                    <p text="sm gray-600">{{ familySet.set.setNum }}</p>
                    <div flex gap="2" m="t-1">
                        <span text="xs" p="x-2 y-1" bg="gray-100" border="1 gray-300">{{
                            statusLabels[familySet.status]
                        }}</span>
                        <span text="xs gray-600">{{ familySet.quantity }}x</span>
                    </div>
                </div>
            </button>
        </div>
    </div>
</template>

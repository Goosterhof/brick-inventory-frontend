<script setup lang="ts">
import type {FamilySet} from "@app/types/familySet";

import {familyHttpService, familyRouterService} from "@app/services";
import EmptyState from "@shared/components/EmptyState.vue";
import ListItemButton from "@shared/components/ListItemButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
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
    <div max-w="6xl" m="x-auto">
        <PageHeader title="Mijn Sets">
            <PrimaryButton @click="goToAdd">Set toevoegen</PrimaryButton>
        </PageHeader>

        <p v-if="loading" text="gray-600">Laden...</p>

        <EmptyState v-else-if="sets.length === 0" message="Nog geen sets. Voeg je eerste set toe!" />

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
                    Geen afbeelding
                </div>
                <div flex="1">
                    <p font="bold">{{ familySet.set.name }}</p>
                    <p text="sm gray-600">{{ familySet.set.setNum }}</p>
                    <div flex gap="2" m="t-1">
                        <span text="xs" p="x-2 y-1" bg="gray-200" font="bold">{{
                            statusLabels[familySet.status]
                        }}</span>
                        <span text="xs gray-600">{{ familySet.quantity }}x</span>
                    </div>
                </div>
            </ListItemButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {FamilyStats} from "@app/types/familyStats";

import CardContainer from "@shared/components/CardContainer.vue";
import NavLink from "@shared/components/NavLink.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import {familyAuthService, familyHttpService, familyRouterService} from "@app/services";
import {deepCamelKeys} from "string-ts";
import {onMounted, ref} from "vue";

const stats = ref<FamilyStats | null>(null);
const loading = ref(true);

const statusLabels: Record<string, string> = {
    sealed: "Verzegeld",
    built: "Gebouwd",
    in_progress: "In aanbouw",
    incomplete: "Incompleet",
};

onMounted(async () => {
    if (!familyAuthService.isLoggedIn.value) {
        return;
    }

    const response = await familyHttpService.getRequest<FamilyStats>("/family/stats");
    stats.value = deepCamelKeys(response.data) as FamilyStats;
    loading.value = false;
});

const goToSets = async () => {
    await familyRouterService.goToRoute("sets");
};

const goToStorage = async () => {
    await familyRouterService.goToRoute("storage");
};
</script>

<template>
    <div max-w="6xl" m="x-auto">
        <!-- Logged out: landing page -->
        <template v-if="!familyAuthService.isLoggedIn.value">
            <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">Brick Inventory</h1>
            <p text="gray-600" m="b-2">Elke steen heeft een plek.</p>
            <p text="gray-600" m="b-6">
                Beheer je LEGO-collectie, houd bij waar elk onderdeel ligt, en bouw met overzicht.
            </p>

            <NavLink to="/register" @click="familyRouterService.goToRoute('register')">Account aanmaken</NavLink>
        </template>

        <!-- Logged in: dashboard -->
        <template v-else>
            <PageHeader title="Dashboard" />

            <p v-if="loading" text="gray-600">Je collectie laden...</p>

            <template v-else-if="stats">
                <!-- Headline stats -->
                <div grid grid-cols="1 sm:2 lg:3" gap="4" m="b-6">
                    <CardContainer>
                        <p text="sm" font="bold" uppercase tracking="wide" m="b-2">Sets</p>
                        <p text="3xl" font="bold">{{ stats.totalSets }}</p>
                        <p v-if="stats.totalSetQuantity !== stats.totalSets" text="sm gray-600">
                            {{ stats.totalSetQuantity }} totaal (incl. dubbele)
                        </p>
                    </CardContainer>

                    <CardContainer>
                        <p text="sm" font="bold" uppercase tracking="wide" m="b-2">Opslaglocaties</p>
                        <p text="3xl" font="bold">{{ stats.totalStorageLocations }}</p>
                    </CardContainer>

                    <CardContainer>
                        <p text="sm" font="bold" uppercase tracking="wide" m="b-2">Opgeslagen onderdelen</p>
                        <p text="3xl" font="bold">{{ stats.totalUniqueParts }}</p>
                        <p v-if="stats.totalPartsQuantity > 0" text="sm gray-600">
                            {{ stats.totalPartsQuantity }} stuks totaal
                        </p>
                    </CardContainer>
                </div>

                <!-- Sets by status -->
                <template v-if="Object.keys(stats.setsByStatus).length > 0">
                    <h2 text="lg" font="bold" uppercase tracking="wide" m="b-4">Sets per status</h2>
                    <div grid grid-cols="2 sm:4" gap="4" m="b-6">
                        <CardContainer v-for="(count, status) in stats.setsByStatus" :key="status">
                            <p text="sm" font="bold" uppercase tracking="wide" m="b-2">
                                {{ statusLabels[status] ?? status }}
                            </p>
                            <p text="2xl" font="bold">{{ count }}</p>
                        </CardContainer>
                    </div>
                </template>

                <!-- Quick actions -->
                <h2 text="lg" font="bold" uppercase tracking="wide" m="b-4">Snel naar</h2>
                <div flex gap="4">
                    <NavLink to="/sets" @click="goToSets">Mijn Sets</NavLink>
                    <NavLink to="/storage" @click="goToStorage">Opslag</NavLink>
                </div>
            </template>
        </template>
    </div>
</template>

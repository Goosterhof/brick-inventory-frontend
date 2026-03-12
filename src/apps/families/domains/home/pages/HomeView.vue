<script setup lang="ts">
import type {FamilyStats} from "@app/types/familyStats";

import CardContainer from "@shared/components/CardContainer.vue";
import NavLink from "@shared/components/NavLink.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import {familyAuthService, familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import {deepCamelKeys} from "string-ts";
import {onMounted, ref} from "vue";

const {t} = familyTranslationService;

const stats = ref<FamilyStats | null>(null);
const loading = ref(true);

const statusKeys: Record<string, "sets.sealed" | "sets.built" | "sets.inProgress" | "sets.incomplete"> = {
    sealed: "sets.sealed",
    built: "sets.built",
    in_progress: "sets.inProgress",
    incomplete: "sets.incomplete",
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
            <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">{{ t("home.brandTitle").value }}</h1>
            <p text="gray-600" m="b-2">{{ t("home.tagline").value }}</p>
            <p text="gray-600" m="b-6">{{ t("home.brandDescription").value }}</p>

            <NavLink to="/register" @click="familyRouterService.goToRoute('register')">
                {{ t("auth.createAccount").value }}
            </NavLink>
        </template>

        <!-- Logged in: dashboard -->
        <template v-else>
            <PageHeader :title="t('home.dashboardTitle').value" />

            <p v-if="loading" text="gray-600">{{ t("home.loadingStats").value }}</p>

            <template v-else-if="stats">
                <!-- Headline stats -->
                <div grid grid-cols="1 sm:2 lg:3" gap="4" m="b-6">
                    <CardContainer>
                        <p text="sm" font="bold" uppercase tracking="wide" m="b-2">
                            {{ t("home.statSets").value }}
                        </p>
                        <p text="3xl" font="bold">{{ stats.totalSets }}</p>
                        <p v-if="stats.totalSetQuantity !== stats.totalSets" text="sm gray-600">
                            {{ t("home.totalIncludingDuplicates", {count: String(stats.totalSetQuantity)}).value }}
                        </p>
                    </CardContainer>

                    <CardContainer>
                        <p text="sm" font="bold" uppercase tracking="wide" m="b-2">
                            {{ t("home.statStorageLocations").value }}
                        </p>
                        <p text="3xl" font="bold">{{ stats.totalStorageLocations }}</p>
                    </CardContainer>

                    <CardContainer>
                        <p text="sm" font="bold" uppercase tracking="wide" m="b-2">
                            {{ t("home.statStoredParts").value }}
                        </p>
                        <p text="3xl" font="bold">{{ stats.totalUniqueParts }}</p>
                        <p v-if="stats.totalPartsQuantity > 0" text="sm gray-600">
                            {{ t("home.totalPieces", {count: String(stats.totalPartsQuantity)}).value }}
                        </p>
                    </CardContainer>
                </div>

                <!-- Sets by status -->
                <template v-if="Object.keys(stats.setsByStatus).length > 0">
                    <h2 text="lg" font="bold" uppercase tracking="wide" m="b-4">
                        {{ t("home.setsByStatus").value }}
                    </h2>
                    <div grid grid-cols="2 sm:4" gap="4" m="b-6">
                        <CardContainer v-for="(count, status) in stats.setsByStatus" :key="status">
                            <p text="sm" font="bold" uppercase tracking="wide" m="b-2">
                                {{ statusKeys[status] ? t(statusKeys[status]).value : status }}
                            </p>
                            <p text="2xl" font="bold">{{ count }}</p>
                        </CardContainer>
                    </div>
                </template>

                <!-- Quick actions -->
                <h2 text="lg" font="bold" uppercase tracking="wide" m="b-4">
                    {{ t("home.quickActions").value }}
                </h2>
                <div flex gap="4">
                    <NavLink to="/sets" @click="goToSets">{{ t("navigation.sets").value }}</NavLink>
                    <NavLink to="/storage" @click="goToStorage">{{ t("navigation.storage").value }}</NavLink>
                </div>
            </template>
        </template>
    </div>
</template>

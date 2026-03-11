<script setup lang="ts">
import {FamilyRouterLink, FamilyRouterView, familyAuthService, familyRouterService} from "@app/services";
import {PhSignOut} from "@phosphor-icons/vue";
import NavHeader from "@shared/components/NavHeader.vue";
import NavMobileLink from "@shared/components/NavMobileLink.vue";
import {computed} from "vue";

const currentRouteName = computed(() => familyRouterService.currentRouteRef.value.name);

const handleLogout = async () => {
    await familyAuthService.logout();
    await familyRouterService.goToRoute("login");
};
</script>

<template>
    <NavHeader>
        <template #links>
            <FamilyRouterLink :to="{name: 'home'}">Home</FamilyRouterLink>
            <FamilyRouterLink :to="{name: 'about'}">About</FamilyRouterLink>
            <FamilyRouterLink v-show="familyAuthService.isLoggedIn.value" :to="{name: 'sets'}">
                Mijn Sets
            </FamilyRouterLink>
            <FamilyRouterLink v-show="familyAuthService.isLoggedIn.value" :to="{name: 'storage'}">
                Opslag
            </FamilyRouterLink>
        </template>

        <template #mobile-links>
            <NavMobileLink to="/" :active="currentRouteName === 'home'" @click="familyRouterService.goToRoute('home')">
                Home
            </NavMobileLink>
            <NavMobileLink
                to="/about"
                :active="currentRouteName === 'about'"
                @click="familyRouterService.goToRoute('about')"
            >
                About
            </NavMobileLink>
            <NavMobileLink
                v-show="familyAuthService.isLoggedIn.value"
                to="/sets"
                :active="currentRouteName === 'sets'"
                @click="familyRouterService.goToRoute('sets')"
            >
                Mijn Sets
            </NavMobileLink>
            <NavMobileLink
                v-show="familyAuthService.isLoggedIn.value"
                to="/storage"
                :active="currentRouteName === 'storage'"
                @click="familyRouterService.goToRoute('storage')"
            >
                Opslag
            </NavMobileLink>
        </template>

        <template #actions>
            <button
                v-if="familyAuthService.isLoggedIn.value"
                @click="handleLogout"
                flex
                items="center"
                gap="2"
                p="x-4 y-2"
                bg="white hover:yellow-300 focus:yellow-300"
                font="bold"
                uppercase
                tracking="wide"
                cursor="pointer"
                outline="none"
                class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
            >
                <PhSignOut size="20" aria-hidden="true" />
                Logout
            </button>
        </template>
    </NavHeader>

    <main p="4">
        <FamilyRouterView />
    </main>
</template>

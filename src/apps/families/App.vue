<script setup lang="ts">
import {FamilyRouterLink, FamilyRouterView, familyAuthService, familyRouterService} from "@app/services";
import {PhSignOut} from "@phosphor-icons/vue";

const handleLogout = async () => {
    await familyAuthService.logout();
    await familyRouterService.goToRoute("login");
};
</script>

<template>
    <header p="4" border="b-3 black">
        <nav flex gap="4" items="center" justify="between">
            <div flex gap="4">
                <FamilyRouterLink :to="{name: 'home'}">Home</FamilyRouterLink>
                <FamilyRouterLink :to="{name: 'about'}">About</FamilyRouterLink>
                <span v-show="familyAuthService.isLoggedIn.value">
                    <FamilyRouterLink :to="{name: 'sets'}">Mijn Sets</FamilyRouterLink>
                </span>
            </div>
            <button
                v-if="familyAuthService.isLoggedIn.value"
                @click="handleLogout"
                p="x-4 y-2"
                bg="white hover:yellow-300 focus:yellow-300"
                font="bold"
                uppercase
                tracking="wide"
                cursor="pointer"
                outline="none"
                class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
            >
                <PhSignOut size="20" aria-hidden="true" /> Logout
            </button>
        </nav>
    </header>

    <main p="4">
        <FamilyRouterView />
    </main>
</template>

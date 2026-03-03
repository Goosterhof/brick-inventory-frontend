<script setup lang="ts">
import {FamilyRouterLink, FamilyRouterView, familyAuthService, familyRouterService} from "@app/services";

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
                <FamilyRouterLink v-if="familyAuthService.isLoggedIn.value" :to="{name: 'sets'}"
                    >Mijn Sets</FamilyRouterLink
                >
            </div>
            <button
                v-if="familyAuthService.isLoggedIn.value"
                @click="handleLogout"
                p="x-4 y-2"
                border="3 black"
                bg="white hover:red-100"
                font="bold"
                cursor="pointer"
            >
                Logout
            </button>
        </nav>
    </header>

    <main p="4">
        <FamilyRouterView />
    </main>
</template>

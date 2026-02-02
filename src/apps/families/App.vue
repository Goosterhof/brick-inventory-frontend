<script setup lang="ts">
import {FamilyRouterLink, FamilyRouterView} from "@app/services";
</script>

<template>
    <header p="4" border="b-3 black">
        <nav flex gap="4">
            <FamilyRouterLink :to="{name: 'home'}">Home</FamilyRouterLink>
            <FamilyRouterLink :to="{name: 'about'}">About</FamilyRouterLink>
        </nav>
    </header>

    <main p="4">
        <FamilyRouterView />
    </main>
</template>

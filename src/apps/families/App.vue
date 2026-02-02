<script setup lang="ts">
import {routerService} from "@app/services";

const {RouterView, RouterLink} = routerService;
</script>

<template>
    <header p="4" border="b-3 black">
        <nav flex gap="4">
            <RouterLink :to="{name: 'home'}">Home</RouterLink>
            <RouterLink :to="{name: 'about'}">About</RouterLink>
        </nav>
    </header>

    <main p="4">
        <RouterView />
    </main>
</template>

<script setup lang="ts">
import NavLink from "@shared/components/NavLink.vue";
import {RouterView, useRouter} from "vue-router";

const router = useRouter();
</script>

<template>
    <header p="4" border="b-3 black" bg="white">
        <nav flex gap="4" items="center">
            <span font="bold" text="lg">Admin</span>
            <NavLink to="/" @click="router.push('/')">Dashboard</NavLink>
        </nav>
    </header>

    <main p="4">
        <RouterView />
    </main>
</template>

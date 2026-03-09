<script setup lang="ts">
import NavLink from "@shared/components/NavLink.vue";
import {RouterView} from "vue-router";
</script>

<template>
    <header p="4" border="b-3 black" bg="gray-100">
        <nav flex gap="4" items="center">
            <span font="bold" text="lg">Admin</span>
            <NavLink to="/">Dashboard</NavLink>
        </nav>
    </header>

    <main p="4">
        <RouterView />
    </main>
</template>

<script setup lang="ts">
import {RouterView} from "vue-router";

import NavLink from "@shared/components/NavLink.vue";
</script>

<template>
    <header p="4" border="b-3 black">
        <nav flex gap="4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/scanner">Scanner</NavLink>
            <NavLink to="/about">About</NavLink>
        </nav>
    </header>

    <main p="4">
        <RouterView />
    </main>
</template>

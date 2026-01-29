<script setup lang="ts">
import {RouterLink, RouterView} from "vue-router";
</script>

<template>
    <header class="p-4 border-b border-gray-200">
        <nav class="flex gap-4">
            <RouterLink to="/" class="text-blue-600 hover:text-blue-800">Home</RouterLink>
            <RouterLink to="/about" class="text-blue-600 hover:text-blue-800">About</RouterLink>
        </nav>
    </header>

    <main class="p-4">
        <RouterView />
    </main>
</template>

<script setup lang="ts">
import NavLink from "@shared/components/NavLink.vue";
import {familyRouterService} from "@app/services";
</script>

<template>
    <div>
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">Lego Storage</h1>
        <p text="gray-600" m="b-6">Welcome to the Lego Storage application.</p>

        <NavLink to="/register" @click="familyRouterService.goToRoute('register')">Create Account</NavLink>
    </div>
</template>

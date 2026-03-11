<script setup lang="ts">
import {familyRouterService, familyTranslationService} from "@app/services";
import NavLink from "@shared/components/NavLink.vue";

const {t} = familyTranslationService;
</script>

<template>
    <div>
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">{{ t("home.title").value }}</h1>
        <p text="gray-600" m="b-6">{{ t("home.welcome").value }}</p>

        <NavLink to="/register" @click="familyRouterService.goToRoute('register')">
            {{ t("auth.createAccount").value }}
        </NavLink>
    </div>
</template>

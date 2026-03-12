<script setup lang="ts">
import {familyTranslationService} from "@app/services";

const {t} = familyTranslationService;
</script>

<template>
    <div>
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">{{ t("about.title").value }}</h1>
        <p text="gray-600">{{ t("about.description").value }}</p>
    </div>
</template>

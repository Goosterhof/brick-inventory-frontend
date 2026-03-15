<script setup lang="ts">
import {familyTranslationService} from "@app/services";

import LegoBrick from "../components/LegoBrick.vue";

const {t} = familyTranslationService;
</script>

<template>
    <div>
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">{{ t("about.title").value }}</h1>
        <p text="gray-600" m="b-6">{{ t("about.description").value }}</p>
        <div inline-block class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div flex items="end">
                <LegoBrick :shadow="false" :columns="2" :rows="2" />
                <LegoBrick :shadow="false" :columns="1" :rows="1" color="#1D4ED8" class="ml-[-3px]" />
            </div>
            <div flex class="mt-[-3px]">
                <LegoBrick :shadow="false" :columns="1" :rows="3" color="#16A34A" />
                <LegoBrick :shadow="false" :columns="2" :rows="3" color="#EAB308" class="ml-[-3px]" />
            </div>
        </div>
    </div>
</template>

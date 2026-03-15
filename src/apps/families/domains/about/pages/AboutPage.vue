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
            <div flex>
                <LegoBrick :shadow="false" />
                <LegoBrick :shadow="false" color="#1D4ED8" class="ml-[-3px]" />
            </div>
            <div flex class="mt-[-3px]">
                <LegoBrick :shadow="false" color="#16A34A" />
                <LegoBrick :shadow="false" color="#EAB308" class="ml-[-3px]" />
            </div>
        </div>
    </div>
</template>

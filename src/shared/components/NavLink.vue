<script setup lang="ts">
import {RouterLink} from "vue-router";

const {to} = defineProps<{to: string}>();
</script>

<template>
    <RouterLink
        :to="to"
        p="x-4 y-2"
        bg="white hover:yellow-100 focus:yellow-100"
        font="bold"
        uppercase
        tracking="wide"
        outline="none"
        class="brick-border brick-shadow hover:brick-shadow-hover focus:brick-shadow-hover"
    >
        <slot />
    </RouterLink>
</template>

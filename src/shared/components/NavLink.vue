<script setup lang="ts">
import {RouterLink} from "vue-router";

const {to} = defineProps<{to: string}>();
</script>

<template>
    <RouterLink
        :to="to"
        p="x-4 y-2"
        bg="white hover:yellow-300 focus:yellow-300"
        font="bold"
        uppercase
        tracking="wide"
        outline="none"
        class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
    >
        <slot />
    </RouterLink>
</template>

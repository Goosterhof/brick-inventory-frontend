<script setup lang="ts">
import {RouterLink} from "vue-router";

const {to} = defineProps<{to: string}>();
</script>

<template>
    <RouterLink
        :to="to"
        p="x-4 y-2"
        border="3 black"
        bg="white hover:yellow-100 focus:yellow-100"
        font="bold"
        uppercase
        tracking="wide"
        class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        outline="none"
    >
        <slot />
    </RouterLink>
</template>

<script setup lang="ts">
import {RouterLink} from "vue-router";

const {to, active = false} = defineProps<{to: string; active?: boolean}>();
</script>

<template>
    <RouterLink
        :to="to"
        block
        p="4"
        border="b-3 black"
        font="bold"
        uppercase
        tracking="wide"
        outline="none"
        :bg="active ? 'yellow-300' : 'white hover:yellow-300 focus:yellow-300'"
        class="brick-transition"
    >
        <slot />
    </RouterLink>
</template>

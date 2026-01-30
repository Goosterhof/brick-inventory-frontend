<script setup lang="ts">
const {for: forId, required = false} = defineProps<{
    for?: string;
    required?: boolean;
}>();
</script>

<template>
    <label :for="forId" text="sm black" font="bold" uppercase tracking="wide">
        <slot />
        <span v-if="required" text="red-500" aria-hidden="true">*</span>
    </label>
</template>

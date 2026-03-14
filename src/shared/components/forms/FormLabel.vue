<script setup lang="ts">
const {for: forId, optional} = defineProps<{for: string; optional: boolean}>();
</script>

<template>
    <label :for="forId" class="brick-label">
        <slot />
        <span v-if="optional" text="gray-600" font="normal"> (optional)</span>
    </label>
</template>

<script setup lang="ts">
const {variant = "default"} = defineProps<{variant?: "default" | "highlight"}>();
</script>

<template>
    <span
        text="xs"
        p="x-2 y-1"
        font="bold"
        class="brick-border"
        border="1"
        :bg="variant === 'highlight' ? 'brick-yellow' : 'gray-200'"
    >
        <slot />
    </span>
</template>

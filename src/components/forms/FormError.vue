<script setup lang="ts">
defineProps<{
    id?: string;
}>();
</script>

<template>
    <p :id="id" text="sm red-600" font="bold" role="alert">
        <slot />
    </p>
</template>

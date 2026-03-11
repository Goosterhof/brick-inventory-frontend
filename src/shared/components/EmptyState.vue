<script setup lang="ts">
defineProps<{message: string}>();
</script>

<template>
    <p text="gray-600">{{ message }}</p>
</template>

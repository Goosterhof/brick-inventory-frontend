<script setup lang="ts">
defineProps<{message: string}>();
</script>

<template>
    <p text="gray-600" p="8" text-center class="brick-stud-grid">{{ message }}</p>
</template>

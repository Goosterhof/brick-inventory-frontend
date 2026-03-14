<script setup lang="ts">
defineProps<{id: string; message: string}>();
</script>

<template>
    <p :id="id" text="sm red-600" font="bold" role="alert">
        {{ message }}
    </p>
</template>

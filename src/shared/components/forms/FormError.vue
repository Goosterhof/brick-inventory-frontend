<script setup lang="ts">
const {id, message} = defineProps<{id: string; message: string}>();
</script>

<template>
    <p :id="id" text="sm brick-red-dark" font="bold" role="alert">
        {{ message }}
    </p>
</template>

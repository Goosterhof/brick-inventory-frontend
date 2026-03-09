<script setup lang="ts">
const {type = "button", disabled = false} = defineProps<{type?: "button" | "submit" | "reset"; disabled?: boolean}>();
</script>

<template>
    <button
        :type="type"
        :disabled="disabled"
        p="x-4 y-3"
        bg="black hover:yellow-100 disabled:gray-300"
        text="white hover:black disabled:gray-600"
        font="bold"
        uppercase
        tracking="wide"
        cursor="pointer disabled:not-allowed"
        transition="shadow duration-150"
        class="brick-border brick-shadow hover:brick-shadow-hover disabled:brick-disabled"
    >
        <slot />
    </button>
</template>

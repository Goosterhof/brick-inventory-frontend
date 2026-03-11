<script setup lang="ts">
const {type = "button", disabled = false} = defineProps<{type?: "button" | "submit" | "reset"; disabled?: boolean}>();
</script>

<template>
    <button
        :type="type"
        :disabled="disabled"
        p="x-4 y-3"
        border="3 red-500"
        bg="white hover:red-200 focus:red-200 disabled:gray-200"
        text="red-600 disabled:gray-600"
        font="bold"
        uppercase
        tracking="wide"
        cursor="pointer disabled:not-allowed"
        outline="none"
        class="brick-shadow-danger brick-transition hover:brick-shadow-error-hover focus:brick-shadow-error-hover active:shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] active:translate-x-[2px] active:translate-y-[2px] disabled:brick-disabled"
    >
        <slot />
    </button>
</template>

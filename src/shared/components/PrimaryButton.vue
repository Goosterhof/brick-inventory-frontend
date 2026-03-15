<script setup lang="ts">
const {type = "button", disabled = false} = defineProps<{type?: "button" | "submit" | "reset"; disabled?: boolean}>();
</script>

<template>
    <button
        :type="type"
        :disabled="disabled"
        p="x-4 y-3"
        bg="black hover:brick-yellow focus:brick-yellow disabled:gray-200"
        text="white hover:black focus:black disabled:gray-600"
        font="bold"
        uppercase
        tracking="wide"
        cursor="pointer disabled:not-allowed"
        outline="none"
        class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px] disabled:brick-disabled"
    >
        <slot />
    </button>
</template>

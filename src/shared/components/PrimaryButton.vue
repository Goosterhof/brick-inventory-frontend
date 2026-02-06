<script setup lang="ts">
const {type = "button", disabled = false} = defineProps<{type?: "button" | "submit" | "reset"; disabled?: boolean}>();
</script>

<template>
    <button
        :type="type"
        :disabled="disabled"
        p="x-4 y-3"
        border="3 black"
        bg="black hover:yellow-100 disabled:gray-300"
        text="white hover:black disabled:gray-600"
        font="bold"
        uppercase
        tracking="wide"
        cursor="pointer disabled:not-allowed"
        class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none"
        transition="all duration-150"
    >
        <slot />
    </button>
</template>

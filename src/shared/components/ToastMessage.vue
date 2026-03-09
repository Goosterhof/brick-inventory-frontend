<script setup lang="ts">
import {PhCheckCircle, PhWarningCircle, PhX} from "@phosphor-icons/vue";

const {message, variant = "success"} = defineProps<{message: string; variant?: "success" | "error"}>();
defineEmits<{close: []}>();
</script>

<template>
    <div
        flex
        gap="3"
        items="center"
        p="3 r-4"
        bg="white"
        :class="[variant === 'error' ? 'border-3 border-red-500 brick-shadow-error' : 'brick-border brick-shadow']"
    >
        <PhCheckCircle v-if="variant === 'success'" size="20" aria-hidden="true" />
        <PhWarningCircle v-else size="20" text="red-600" aria-hidden="true" />
        <p flex="1" :text="variant === 'error' ? 'red-600' : 'black'" font="medium">{{ message }}</p>
        <button
            @click="$emit('close')"
            p="1"
            bg="transparent hover:yellow-300 focus:yellow-300"
            cursor="pointer"
            outline="none"
            class="brick-transition"
            aria-label="Dismiss"
        >
            <PhX size="16" aria-hidden="true" />
        </button>
    </div>
</template>

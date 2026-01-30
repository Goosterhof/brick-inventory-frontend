<script setup lang="ts">
import {computed, useId} from "vue";

const {
    label,
    type = "text",
    placeholder = "",
    disabled = false,
    required = false,
    error = "",
} = defineProps<{
    label: string;
    type?: "text" | "email" | "password" | "search" | "tel" | "url";
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
}>();

const model = defineModel<string>({required: true});

const inputId = useId();
const errorId = computed(() => (error ? `${inputId}-error` : undefined));

const inputStateClass = computed(() => {
    if (disabled) {
        return "bg-gray-200 cursor-not-allowed opacity-70 shadow-none";
    }
    if (error) {
        return "bg-red-100 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] focus:shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]";
    }
    return "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100";
});
</script>

<template>
    <div flex="~ col" gap="2">
        <label :for="inputId" text="sm black" font="bold" uppercase tracking="wide">
            {{ label }}
            <span v-if="required" text="red-500" aria-hidden="true">*</span>
        </label>
        <input
            :id="inputId"
            v-model="model"
            :type="type"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="required"
            :aria-invalid="error ? true : undefined"
            :aria-describedby="errorId"
            p="x-4 y-3"
            border="3 black"
            text="black"
            font="medium"
            transition="all duration-150"
            outline="none"
            :class="inputStateClass"
        />
        <p v-if="error" :id="errorId" text="sm red-600" font="bold" role="alert">
            {{ error }}
        </p>
    </div>
</template>

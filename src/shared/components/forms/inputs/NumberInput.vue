<script setup lang="ts">
import {computed, useId} from "vue";

import FormError from "@shared/components/forms/FormError.vue";
import FormField from "@shared/components/forms/FormField.vue";
import FormLabel from "@shared/components/forms/FormLabel.vue";

const {
    label,
    placeholder = "",
    disabled = false,
    required = false,
    error = "",
    min,
    max,
    step,
} = defineProps<{
    label: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    min?: number;
    max?: number;
    step?: number;
}>();

const model = defineModel<number | null>({required: true});

const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    model.value = Number.isNaN(value) ? null : value;
};

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
    <FormField>
        <FormLabel :for="inputId" :required="required">{{ label }}</FormLabel>
        <input
            :id="inputId"
            :value="model"
            type="number"
            @input="handleInput"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="required"
            :min="min"
            :max="max"
            :step="step"
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
        <FormError v-if="error" :id="errorId" :message="error" />
    </FormField>
</template>

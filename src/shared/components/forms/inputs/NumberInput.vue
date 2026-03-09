<script setup lang="ts">
import FormError from "@shared/components/forms/FormError.vue";
import FormField from "@shared/components/forms/FormField.vue";
import FormLabel from "@shared/components/forms/FormLabel.vue";
import {computed, useId} from "vue";

const {
    label,
    placeholder = "",
    disabled = false,
    optional = false,
    error = "",
    min,
    max,
    step,
} = defineProps<{
    label: string;
    placeholder?: string;
    disabled?: boolean;
    optional?: boolean;
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
        return "brick-disabled";
    }
    if (error) {
        return "bg-red-200 border-red-500 brick-shadow-error focus:brick-shadow-error-hover";
    }
    return "bg-white brick-shadow focus:brick-shadow-hover focus:bg-yellow-300";
});
</script>

<template>
    <FormField>
        <FormLabel :for="inputId" :optional="optional">{{ label }}</FormLabel>
        <input
            :id="inputId"
            :value="model"
            type="number"
            @input="handleInput"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="!optional"
            :min="min"
            :max="max"
            :step="step"
            :aria-invalid="error ? true : undefined"
            :aria-describedby="errorId"
            p="x-4 y-3"
            text="black"
            font="medium"
            class="brick-border brick-transition"
            outline="none"
            :class="inputStateClass"
        />
        <FormError v-if="error" :id="errorId" :message="error" />
    </FormField>
</template>

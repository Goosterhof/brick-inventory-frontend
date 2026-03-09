<script setup lang="ts">
import FormError from "@shared/components/forms/FormError.vue";
import FormField from "@shared/components/forms/FormField.vue";
import FormLabel from "@shared/components/forms/FormLabel.vue";
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
        return "brick-disabled opacity-70";
    }
    if (error) {
        return "bg-red-100 brick-shadow-error focus:brick-shadow-error-hover";
    }
    return "bg-white brick-shadow focus:brick-shadow-hover focus:bg-yellow-100";
});
</script>

<template>
    <FormField>
        <FormLabel :for="inputId" :required="required">{{ label }}</FormLabel>
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
            text="black"
            font="medium"
            transition="shadow duration-150"
            class="brick-border"
            outline="none"
            :class="inputStateClass"
        />
        <FormError v-if="error" :id="errorId" :message="error" />
    </FormField>
</template>

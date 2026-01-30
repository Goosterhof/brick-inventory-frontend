<script setup lang="ts">
import {computed, useId} from "vue";

interface Props {
    label: string;
    modelValue?: string;
    type?: "text" | "email" | "password" | "search" | "tel" | "url";
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: "",
    type: "text",
    placeholder: "",
    disabled: false,
    required: false,
    error: "",
});

const emit = defineEmits<{
    "update:modelValue": [value: string];
}>();

const inputId = useId();
const errorId = computed(() => (props.error ? `${inputId}-error` : undefined));

function onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    emit("update:modelValue", target.value);
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <label
            :for="inputId"
            class="text-sm font-medium text-gray-700"
        >
            {{ label }}
            <span v-if="required" class="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
            :id="inputId"
            :type="type"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="required"
            :aria-invalid="error ? true : undefined"
            :aria-describedby="errorId"
            class="px-3 py-2 border rounded-md text-gray-900 bg-white transition-colors duration-150 outline-none"
            :class="[
                error
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
                disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : '',
            ]"
            @input="onInput"
        />
        <p
            v-if="error"
            :id="errorId"
            class="text-sm text-red-600"
            role="alert"
        >
            {{ error }}
        </p>
    </div>
</template>

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

const emit = defineEmits<{"update:modelValue": [value: string]}>();

const inputId = useId();
const errorId = computed(() => (props.error ? `${inputId}-error` : undefined));

function onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    emit("update:modelValue", target.value);
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <label :for="inputId" class="text-sm font-bold text-black uppercase tracking-wide">
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
            class="px-4 py-3 border-3 border-black bg-white text-black font-medium transition-all duration-150 outline-none"
            :class="[
                error
                    ? 'bg-red-100 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] focus:shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]'
                    : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100',
                disabled ? 'bg-gray-200 cursor-not-allowed opacity-70 shadow-none' : '',
            ]"
            @input="onInput"
        />
        <p v-if="error" :id="errorId" class="text-sm font-bold text-red-600" role="alert">
            {{ error }}
        </p>
    </div>
</template>

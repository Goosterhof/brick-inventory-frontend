<script setup lang="ts">
import FormError from "@shared/components/forms/FormError.vue";
import FormField from "@shared/components/forms/FormField.vue";
import FormLabel from "@shared/components/forms/FormLabel.vue";
import LegoStuds from "@shared/components/forms/LegoStuds.vue";
import {computed, useId} from "vue";

const {
    label,
    disabled = false,
    optional = false,
    error = "",
} = defineProps<{label: string; disabled?: boolean; optional?: boolean; error?: string}>();

const model = defineModel<string>({required: true});

const inputId = useId();
const errorId = `${inputId}-error`;

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
        <div relative>
            <LegoStuds :count="4" absolute z="1" w="full" justify="center" style="top: -6px" />
            <input
                :id="inputId"
                v-model="model"
                type="date"
                :disabled="disabled"
                :required="!optional"
                :aria-invalid="error ? true : undefined"
                :aria-describedby="error ? errorId : undefined"
                p="x-4 y-3"
                w="full"
                text="black"
                font="medium"
                class="brick-border brick-transition"
                outline="none"
                :class="inputStateClass"
            />
        </div>
        <FormError v-if="error" :id="errorId" :message="error" />
    </FormField>
</template>

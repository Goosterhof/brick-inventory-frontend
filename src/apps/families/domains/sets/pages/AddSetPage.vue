<script setup lang="ts">
import type {FamilySetStatus} from "@app/types/familySet";

import {familyHttpService, familyRouterService, familySetStoreModule, familyTranslationService} from "@app/services";
import DateInput from "@shared/components/forms/inputs/DateInput.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
import TextareaInput from "@shared/components/forms/inputs/TextareaInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {useFormSubmit} from "@shared/composables/useFormSubmit";
import {useValidationErrors} from "@shared/composables/useValidationErrors";

const {t} = familyTranslationService;
const adapted = familySetStoreModule.generateNew();

type AddSetField = "setNum" | "quantity" | "status" | "purchaseDate" | "notes";
const validationErrors = useValidationErrors<AddSetField>(familyHttpService);
const {errors} = validationErrors;
const {handleSubmit} = useFormSubmit(validationErrors);

const statusOptions: {
    value: FamilySetStatus;
    key: "sets.sealed" | "sets.built" | "sets.inProgress" | "sets.incomplete" | "sets.wishlist";
}[] = [
    {value: "sealed", key: "sets.sealed"},
    {value: "built", key: "sets.built"},
    {value: "in_progress", key: "sets.inProgress"},
    {value: "incomplete", key: "sets.incomplete"},
    {value: "wishlist", key: "sets.wishlist"},
];

const onSubmit = () =>
    handleSubmit(async () => {
        const created = await adapted.create();
        await familyRouterService.goToRoute("sets-detail", created.id);
    });
</script>

<template>
    <div max-w="md" m="x-auto">
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-6">{{ t("sets.addSet").value }}</h1>

        <form flex="~ col" gap="4" @submit.prevent="onSubmit">
            <TextInput
                v-model="adapted.mutable.value.setNum"
                :label="t('sets.setNumber').value"
                :error="errors.setNum"
            />

            <NumberInput
                v-model="adapted.mutable.value.quantity"
                :label="t('sets.quantity').value"
                :error="errors.quantity"
                :min="1"
                optional
            />

            <SelectInput v-model="adapted.mutable.value.status" :label="t('sets.status').value" :error="errors.status">
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ t(option.key).value }}
                </option>
            </SelectInput>

            <DateInput v-model="adapted.mutable.value.purchaseDate" :label="t('sets.purchaseDate').value" optional />

            <TextareaInput v-model="adapted.mutable.value.notes" :label="t('sets.notes').value" optional />

            <PrimaryButton type="submit">{{ t("sets.add").value }}</PrimaryButton>
        </form>
    </div>
</template>

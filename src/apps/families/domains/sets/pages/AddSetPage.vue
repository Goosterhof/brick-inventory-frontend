<script setup lang="ts">
import type {FamilySet, FamilySetStatus} from "@app/types/familySet";

import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import DateInput from "@shared/components/forms/inputs/DateInput.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
import TextareaInput from "@shared/components/forms/inputs/TextareaInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {useFormSubmit} from "@shared/composables/useFormSubmit";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {deepSnakeKeys} from "string-ts";
import {ref} from "vue";

const {t} = familyTranslationService;
const setNum = ref("");
const quantity = ref<number | null>(1);
const status = ref<FamilySetStatus>("sealed");
const purchaseDate = ref("");
const notes = ref("");

type AddSetField = "setNum" | "quantity" | "status" | "purchaseDate" | "notes";
const validationErrors = useValidationErrors<AddSetField>(familyHttpService);
const {errors} = validationErrors;
const {handleSubmit} = useFormSubmit(validationErrors);

const onSubmit = () =>
    handleSubmit(async () => {
        const payload = deepSnakeKeys({
            setNum: setNum.value,
            quantity: quantity.value ?? 1,
            status: status.value,
            purchaseDate: purchaseDate.value || null,
            notes: notes.value || null,
        });

        const response = await familyHttpService.postRequest<FamilySet>("/family-sets", payload);
        const created = toCamelCaseTyped(response.data);

        await familyRouterService.goToRoute("sets-detail", created.id);
    });
</script>

<template>
    <div max-w="md" m="x-auto">
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-6">{{ t("sets.addSet").value }}</h1>

        <form flex="~ col" gap="4" @submit.prevent="onSubmit">
            <TextInput v-model="setNum" :label="t('sets.setNumber').value" :error="errors.setNum" />

            <NumberInput
                v-model="quantity"
                :label="t('sets.quantity').value"
                :error="errors.quantity"
                :min="1"
                optional
            />

            <SelectInput v-model="status" :label="t('sets.status').value" :error="errors.status">
                <option value="sealed">{{ t("sets.sealed").value }}</option>
                <option value="built">{{ t("sets.built").value }}</option>
                <option value="in_progress">{{ t("sets.inProgress").value }}</option>
                <option value="incomplete">{{ t("sets.incomplete").value }}</option>
                <option value="wishlist">{{ t("sets.wishlist").value }}</option>
            </SelectInput>

            <DateInput v-model="purchaseDate" :label="t('sets.purchaseDate').value" optional />

            <TextareaInput v-model="notes" :label="t('sets.notes').value" optional />

            <PrimaryButton type="submit">{{ t("sets.add").value }}</PrimaryButton>
        </form>
    </div>
</template>

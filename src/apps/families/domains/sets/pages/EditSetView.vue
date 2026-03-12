<script setup lang="ts">
import type {FamilySet, FamilySetStatus} from "@app/types/familySet";

import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import DangerButton from "@shared/components/DangerButton.vue";
import DateInput from "@shared/components/forms/inputs/DateInput.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
import TextareaInput from "@shared/components/forms/inputs/TextareaInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {useFormSubmit} from "@shared/composables/useFormSubmit";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {deepSnakeKeys} from "string-ts";
import {onMounted, ref} from "vue";

const {t} = familyTranslationService;
const familySet = ref<FamilySet | null>(null);
const loading = ref(true);

const quantity = ref<number | null>(1);
const status = ref<FamilySetStatus>("sealed");
const purchaseDate = ref("");
const notes = ref("");

type EditSetField = "quantity" | "status" | "purchaseDate" | "notes";
const validationErrors = useValidationErrors<EditSetField>(familyHttpService);
const {errors} = validationErrors;
const {handleSubmit} = useFormSubmit(validationErrors);

onMounted(async () => {
    const id = familyRouterService.currentRouteId.value;
    const response = await familyHttpService.getRequest<FamilySet>(`/family-sets/${id}`);
    const data = toCamelCaseTyped(response.data);
    familySet.value = data;

    quantity.value = data.quantity;
    status.value = data.status;
    purchaseDate.value = data.purchaseDate ?? "";
    notes.value = data.notes ?? "";
    loading.value = false;
});

const onSubmit = () =>
    handleSubmit(async () => {
        if (!familySet.value) return;

        const payload = deepSnakeKeys({
            quantity: quantity.value ?? 1,
            status: status.value,
            purchaseDate: purchaseDate.value || null,
            notes: notes.value || null,
        });

        await familyHttpService.patchRequest(`/family-sets/${familySet.value.id}`, payload);
        await familyRouterService.goToRoute("sets-detail", familySet.value.id);
    });

const handleDelete = async () => {
    if (!familySet.value) return;
    if (!window.confirm(t("sets.confirmDelete").value)) return;

    await familyHttpService.deleteRequest(`/family-sets/${familySet.value.id}`);
    await familyRouterService.goToRoute("sets");
};
</script>

<template>
    <div max-w="md" m="x-auto">
        <p v-if="loading" text="gray-600">{{ t("common.loading").value }}</p>

        <template v-else-if="familySet">
            <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-2">{{ t("sets.editSet").value }}</h1>
            <p text="gray-600" m="b-6">{{ familySet.set.name }} ({{ familySet.set.setNum }})</p>

            <form flex="~ col" gap="4" @submit.prevent="onSubmit">
                <NumberInput v-model="quantity" :label="t('sets.quantity').value" :error="errors.quantity" :min="1" />

                <SelectInput v-model="status" :label="t('sets.status').value" :error="errors.status">
                    <option value="sealed">{{ t("sets.sealed").value }}</option>
                    <option value="built">{{ t("sets.built").value }}</option>
                    <option value="in_progress">{{ t("sets.inProgress").value }}</option>
                    <option value="incomplete">{{ t("sets.incomplete").value }}</option>
                </SelectInput>

                <DateInput v-model="purchaseDate" :label="t('sets.purchaseDate').value" optional />

                <TextareaInput v-model="notes" :label="t('sets.notes').value" optional />

                <div flex gap="4">
                    <PrimaryButton type="submit">{{ t("sets.save").value }}</PrimaryButton>
                    <DangerButton @click="handleDelete">{{ t("sets.delete").value }}</DangerButton>
                </div>
            </form>
        </template>
    </div>
</template>

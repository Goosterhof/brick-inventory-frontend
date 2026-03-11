<script setup lang="ts">
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyRouterService} from "@app/services";
import DangerButton from "@shared/components/DangerButton.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import TextareaInput from "@shared/components/forms/inputs/TextareaInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {useFormSubmit} from "@shared/composables/useFormSubmit";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {deepSnakeKeys} from "string-ts";
import {onMounted, ref} from "vue";

const storageOption = ref<StorageOption | null>(null);
const loading = ref(true);

const name = ref("");
const description = ref("");
const row = ref<number | null>(null);
const column = ref<number | null>(null);

type EditStorageField = "name" | "description" | "parentId" | "row" | "column";
const validationErrors = useValidationErrors<EditStorageField>(familyHttpService);
const {errors} = validationErrors;
const {handleSubmit} = useFormSubmit(validationErrors);

onMounted(async () => {
    const id = familyRouterService.currentRouteId.value;
    const response = await familyHttpService.getRequest<StorageOption>(`/storage-options/${id}`);
    const data = toCamelCaseTyped(response.data);
    storageOption.value = data;

    name.value = data.name;
    description.value = data.description ?? "";
    row.value = data.row;
    column.value = data.column;
    loading.value = false;
});

const onSubmit = () =>
    handleSubmit(async () => {
        if (!storageOption.value) return;

        const payload = deepSnakeKeys({
            name: name.value,
            description: description.value || null,
            parentId: storageOption.value.parentId,
            row: row.value,
            column: column.value,
        });

        await familyHttpService.patchRequest(`/storage-options/${storageOption.value.id}`, payload);
        await familyRouterService.goToRoute("storage-detail", storageOption.value.id);
    });

const handleDelete = async () => {
    if (!storageOption.value) return;
    if (!window.confirm("Weet je zeker dat je deze opslaglocatie wilt verwijderen?")) return;

    await familyHttpService.deleteRequest(`/storage-options/${storageOption.value.id}`);
    await familyRouterService.goToRoute("storage");
};
</script>

<template>
    <div max-w="md" m="x-auto">
        <p v-if="loading" text="gray-600">Laden...</p>

        <template v-else-if="storageOption">
            <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-2">Opslag bewerken</h1>
            <p text="gray-600" m="b-6">{{ storageOption.name }}</p>

            <form flex="~ col" gap="4" @submit.prevent="onSubmit">
                <TextInput v-model="name" label="Naam" :error="errors.name" />

                <TextareaInput v-model="description" label="Beschrijving" optional />

                <div flex gap="4">
                    <div flex="1 ~ col" gap="2">
                        <NumberInput v-model="row" label="Rij" :error="errors.row" :min="0" optional />
                    </div>
                    <div flex="1 ~ col" gap="2">
                        <NumberInput v-model="column" label="Kolom" :error="errors.column" :min="0" optional />
                    </div>
                </div>

                <div flex gap="4">
                    <PrimaryButton type="submit">Opslaan</PrimaryButton>
                    <DangerButton @click="handleDelete">Verwijderen</DangerButton>
                </div>
            </form>
        </template>
    </div>
</template>

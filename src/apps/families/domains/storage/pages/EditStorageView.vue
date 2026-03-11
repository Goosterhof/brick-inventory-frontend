<script setup lang="ts">
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyRouterService} from "@app/services";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {isAxiosError} from "axios";
import {deepSnakeKeys} from "string-ts";
import {onMounted, ref} from "vue";

const storageOption = ref<StorageOption | null>(null);
const loading = ref(true);

const name = ref("");
const description = ref("");
const row = ref<number | null>(null);
const column = ref<number | null>(null);

type EditStorageField = "name" | "description" | "parentId" | "row" | "column";
const {errors, clearErrors} = useValidationErrors<EditStorageField>(familyHttpService);

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

const handleSubmit = async () => {
    if (!storageOption.value) return;
    clearErrors();

    try {
        const payload = deepSnakeKeys({
            name: name.value,
            description: description.value || null,
            parentId: storageOption.value.parentId,
            row: row.value,
            column: column.value,
        });

        await familyHttpService.patchRequest(`/storage-options/${storageOption.value.id}`, payload);
        await familyRouterService.goToRoute("storage-detail", storageOption.value.id);
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 422) {
            return;
        }
        throw error;
    }
};

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

            <form flex="~ col" gap="4" @submit.prevent="handleSubmit">
                <TextInput v-model="name" label="Naam" :error="errors.name" />

                <div flex="~ col" gap="2">
                    <label class="brick-label" for="description-input">
                        Beschrijving
                        <span text="gray-600" font="normal"> (optional)</span>
                    </label>
                    <textarea
                        id="description-input"
                        v-model="description"
                        rows="3"
                        p="x-4 y-3"
                        bg="white hover:yellow-300 focus:yellow-300"
                        text="black"
                        font="medium"
                        outline="none"
                        class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
                    />
                </div>

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
                    <button
                        type="button"
                        @click="handleDelete"
                        p="x-4 y-3"
                        border="3 red-500"
                        bg="white hover:red-200 focus:red-200"
                        text="red-600"
                        font="bold"
                        uppercase
                        tracking="wide"
                        cursor="pointer"
                        outline="none"
                        class="brick-shadow-danger brick-transition hover:brick-shadow-error-hover focus:brick-shadow-error-hover active:shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] active:translate-x-[2px] active:translate-y-[2px]"
                    >
                        Verwijderen
                    </button>
                </div>
            </form>
        </template>
    </div>
</template>

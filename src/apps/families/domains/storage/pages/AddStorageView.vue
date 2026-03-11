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
import {ref} from "vue";

const name = ref("");
const description = ref("");
const row = ref<number | null>(null);
const column = ref<number | null>(null);

type AddStorageField = "name" | "description" | "parentId" | "row" | "column";
const {errors, clearErrors} = useValidationErrors<AddStorageField>(familyHttpService);

const handleSubmit = async () => {
    clearErrors();

    try {
        const payload = deepSnakeKeys({
            name: name.value,
            description: description.value || null,
            parentId: null,
            row: row.value,
            column: column.value,
        });

        const response = await familyHttpService.postRequest<StorageOption>("/storage-options", payload);
        const created = toCamelCaseTyped(response.data);

        await familyRouterService.goToRoute("storage-detail", created.id);
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 422) {
            return;
        }
        throw error;
    }
};
</script>

<template>
    <div max-w="md" m="x-auto">
        <h1 text="2xl" font="bold" m="b-6">Opslag toevoegen</h1>

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
                    bg="white focus:yellow-300"
                    text="black"
                    font="medium"
                    outline="none"
                    class="brick-border brick-shadow brick-transition focus:brick-shadow-hover"
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

            <PrimaryButton type="submit">Toevoegen</PrimaryButton>
        </form>
    </div>
</template>

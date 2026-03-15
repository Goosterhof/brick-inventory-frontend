<script setup lang="ts">
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import TextareaInput from "@shared/components/forms/inputs/TextareaInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {useFormSubmit} from "@shared/composables/useFormSubmit";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {deepSnakeKeys} from "string-ts";
import {ref} from "vue";

const {t} = familyTranslationService;
const name = ref("");
const description = ref("");
const row = ref<number | null>(null);
const column = ref<number | null>(null);

type AddStorageField = "name" | "description" | "parentId" | "row" | "column";
const validationErrors = useValidationErrors<AddStorageField>(familyHttpService);
const {errors} = validationErrors;
const {handleSubmit} = useFormSubmit(validationErrors);

const onSubmit = () =>
    handleSubmit(async () => {
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
    });
</script>

<template>
    <div max-w="md" m="x-auto">
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-6">{{ t("storage.addStorage").value }}</h1>

        <form flex="~ col" gap="4" @submit.prevent="onSubmit">
            <TextInput v-model="name" :label="t('storage.name').value" :error="errors.name" />

            <TextareaInput v-model="description" :label="t('storage.description').value" optional />

            <div flex gap="4">
                <div flex="1 ~ col" gap="2">
                    <NumberInput v-model="row" :label="t('storage.row').value" :error="errors.row" :min="0" optional />
                </div>
                <div flex="1 ~ col" gap="2">
                    <NumberInput
                        v-model="column"
                        :label="t('storage.column').value"
                        :error="errors.column"
                        :min="0"
                        optional
                    />
                </div>
            </div>

            <PrimaryButton type="submit">{{ t("storage.add").value }}</PrimaryButton>
        </form>
    </div>
</template>

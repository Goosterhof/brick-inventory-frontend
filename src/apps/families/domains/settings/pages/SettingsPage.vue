<script setup lang="ts">
import {familyHttpService, familyTranslationService} from "@app/services";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import {ref} from "vue";

const {t} = familyTranslationService;

const rebrickableToken = ref("");
const tokenSaving = ref(false);
const tokenSaved = ref(false);
const tokenError = ref("");

const importing = ref(false);
const importResult = ref<{
    message: string;
    created: number;
    updated: number;
    skipped: number;
    total: number;
    complete: boolean;
    error?: string;
} | null>(null);
const importError = ref("");

const saveToken = async () => {
    tokenSaving.value = true;
    tokenSaved.value = false;
    tokenError.value = "";

    try {
        await familyHttpService.putRequest("/family/rebrickable-token", {
            rebrickable_user_token: rebrickableToken.value,
        });
        tokenSaved.value = true;
        rebrickableToken.value = "";
    } catch (error: unknown) {
        const status = (error as {response?: {status?: number}})?.response?.status;
        tokenError.value = status === 403 ? t("settings.notFamilyHead").value : t("settings.tokenSaveError").value;
    } finally {
        tokenSaving.value = false;
    }
};

const importSets = async () => {
    importing.value = true;
    importResult.value = null;
    importError.value = "";

    try {
        const response = await familyHttpService.postRequest<{
            message: string;
            created: number;
            updated: number;
            skipped: number;
            total: number;
            complete: boolean;
            error?: string;
        }>("/family-sets/import-from-rebrickable", {});
        importResult.value = response.data;
    } catch (error: unknown) {
        const status = (error as {response?: {status?: number}})?.response?.status;
        if (status === 403) {
            importError.value = t("settings.notFamilyHead").value;
        } else if (status === 422) {
            importError.value = t("settings.noTokenConfigured").value;
        } else {
            importError.value = t("settings.importError").value;
        }
    } finally {
        importing.value = false;
    }
};
</script>

<template>
    <div max-w="md" m="x-auto">
        <PageHeader :title="t('settings.title').value" />

        <div flex="~ col" gap="8">
            <section flex="~ col" gap="4">
                <h2 text="xl" font="bold" uppercase tracking="wide">{{ t("settings.rebrickableTitle").value }}</h2>
                <p text="gray-600">{{ t("settings.rebrickableDescription").value }}</p>

                <form flex="~ col" gap="4" @submit.prevent="saveToken">
                    <TextInput
                        v-model="rebrickableToken"
                        :label="t('settings.rebrickableToken').value"
                        :error="tokenError"
                    />

                    <p v-if="tokenSaved" text="baseplate-green" font="bold">{{ t("settings.tokenSaved").value }}</p>

                    <PrimaryButton type="submit" :disabled="tokenSaving || !rebrickableToken">
                        {{ t("settings.saveToken").value }}
                    </PrimaryButton>
                </form>
            </section>

            <hr border="t-3 black" />

            <section flex="~ col" gap="4">
                <h2 text="xl" font="bold" uppercase tracking="wide">{{ t("settings.importTitle").value }}</h2>
                <p text="gray-600">{{ t("settings.importDescription").value }}</p>

                <div v-if="importResult" p="4" bg="white" class="brick-border" flex="~ col" gap="2">
                    <p font="bold">{{ importResult.message }}</p>
                    <div flex="~ col" gap="1" text="sm">
                        <p>{{ t("settings.importCreated", {count: String(importResult.created)}).value }}</p>
                        <p>{{ t("settings.importUpdated", {count: String(importResult.updated)}).value }}</p>
                        <p v-if="importResult.skipped > 0">
                            {{ t("settings.importSkipped", {count: String(importResult.skipped)}).value }}
                        </p>
                    </div>
                    <p v-if="importResult.error" text="brick-red-dark" font="bold">{{ importResult.error }}</p>
                </div>

                <p v-if="importError" text="brick-red-dark" font="bold">{{ importError }}</p>

                <PrimaryButton :disabled="importing" @click="importSets">
                    {{ importing ? t("settings.importing").value : t("settings.importButton").value }}
                </PrimaryButton>
            </section>
        </div>
    </div>
</template>

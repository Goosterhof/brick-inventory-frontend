<script setup lang="ts">
import type {SetPart} from "@app/types/part";
import type {StorageOption} from "@app/types/storageOption";

import {familyHttpService, familyTranslationService} from "@app/services";
import ModalDialog from "@shared/components/ModalDialog.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {onMounted, ref} from "vue";

const {part} = defineProps<{open: boolean; part: SetPart}>();
const emit = defineEmits<{close: []; assigned: []}>();

const {t} = familyTranslationService;

const storageOptions = ref<StorageOption[]>([]);
const selectedStorageId = ref("");
const quantity = ref<number | null>(1);
const saving = ref(false);
const error = ref("");
const loadingOptions = ref(true);

onMounted(async () => {
    try {
        const response = await familyHttpService.getRequest<StorageOption[]>("/storage-options");
        storageOptions.value = response.data.map((item) => toCamelCaseTyped(item));
    } catch {
        storageOptions.value = [];
    } finally {
        loadingOptions.value = false;
    }
});

const handleSubmit = async () => {
    const storageId = Number(selectedStorageId.value);
    if (!storageId) return;

    saving.value = true;
    error.value = "";

    try {
        await familyHttpService.postRequest(`/storage-options/${storageId}/parts`, {
            part_id: part.part.id,
            color_id: part.color.id,
            quantity: quantity.value ?? 1,
        });
        emit("assigned");
        emit("close");
    } catch {
        error.value = t("sets.assignError").value;
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <ModalDialog :open="open" @close="emit('close')">
        <template #title>{{ t("sets.assignPartTitle").value }}</template>

        <div flex="~ col" gap="4">
            <div flex gap="3" items="center" p="3" bg="gray-100" class="brick-border">
                <div
                    v-if="part.color.rgb"
                    w="6"
                    h="6"
                    shrink="0"
                    class="brick-border"
                    :style="{backgroundColor: '#' + part.color.rgb}"
                />
                <div flex="1" min-w="0">
                    <p font="bold" truncate>{{ part.part.name }}</p>
                    <p text="sm gray-600">{{ part.part.partNum }} · {{ part.color.name }}</p>
                </div>
            </div>

            <form flex="~ col" gap="4" @submit.prevent="handleSubmit">
                <p v-if="loadingOptions" text="gray-600">{{ t("common.loading").value }}</p>

                <template v-else>
                    <SelectInput v-model="selectedStorageId" :label="t('sets.selectStorage').value" :error="error">
                        <option value="" disabled>{{ t("sets.selectStoragePlaceholder").value }}</option>
                        <option v-for="option in storageOptions" :key="option.id" :value="option.id">
                            {{ option.name }}
                        </option>
                    </SelectInput>

                    <NumberInput v-model="quantity" :label="t('sets.quantity').value" :min="1" />

                    <PrimaryButton type="submit" :disabled="saving || !selectedStorageId">
                        {{ t("sets.assignPart").value }}
                    </PrimaryButton>
                </template>
            </form>
        </div>
    </ModalDialog>
</template>

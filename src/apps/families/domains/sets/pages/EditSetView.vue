<script setup lang="ts">
import type {FamilySet, FamilySetStatus} from "@app/types/familySet";

import {familyHttpService, familyRouterService} from "@app/services";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {isAxiosError} from "axios";
import {deepSnakeKeys} from "string-ts";
import {onMounted, ref} from "vue";

const familySet = ref<FamilySet | null>(null);
const loading = ref(true);

const quantity = ref<number | null>(1);
const status = ref<FamilySetStatus>("sealed");
const purchaseDate = ref("");
const notes = ref("");

type EditSetField = "quantity" | "status" | "purchaseDate" | "notes";
const {errors, clearErrors} = useValidationErrors<EditSetField>(familyHttpService);

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

const handleSubmit = async () => {
    if (!familySet.value) return;
    clearErrors();

    try {
        const payload = deepSnakeKeys({
            quantity: quantity.value ?? 1,
            status: status.value,
            purchaseDate: purchaseDate.value || null,
            notes: notes.value || null,
        });

        await familyHttpService.patchRequest(`/family-sets/${familySet.value.id}`, payload);
        await familyRouterService.goToRoute("sets-detail", familySet.value.id);
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 422) {
            return;
        }
        throw error;
    }
};

const handleDelete = async () => {
    if (!familySet.value) return;
    if (!window.confirm("Weet je zeker dat je deze set wilt verwijderen?")) return;

    await familyHttpService.deleteRequest(`/family-sets/${familySet.value.id}`);
    await familyRouterService.goToRoute("sets");
};
</script>

<template>
    <div max-w="md" m="x-auto">
        <p v-if="loading" text="gray-600">Laden...</p>

        <template v-else-if="familySet">
            <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-2">Set bewerken</h1>
            <p text="gray-600" m="b-6">{{ familySet.set.name }} ({{ familySet.set.setNum }})</p>

            <form flex="~ col" gap="4" @submit.prevent="handleSubmit">
                <NumberInput v-model="quantity" label="Aantal" :error="errors.quantity" :min="1" />

                <div flex="~ col" gap="2">
                    <label class="brick-label" for="status-select">Status</label>
                    <select
                        id="status-select"
                        v-model="status"
                        p="x-4 y-3"
                        bg="white hover:yellow-300 focus:yellow-300"
                        text="black"
                        font="medium"
                        outline="none"
                        class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
                    >
                        <option value="sealed">Verzegeld</option>
                        <option value="built">Gebouwd</option>
                        <option value="in_progress">In aanbouw</option>
                        <option value="incomplete">Incompleet</option>
                    </select>
                </div>

                <div flex="~ col" gap="2">
                    <label class="brick-label" for="purchase-date-input">
                        Aankoopdatum
                        <span text="gray-600" font="normal"> (optional)</span>
                    </label>
                    <input
                        id="purchase-date-input"
                        v-model="purchaseDate"
                        type="date"
                        p="x-4 y-3"
                        bg="white hover:yellow-300 focus:yellow-300"
                        text="black"
                        font="medium"
                        outline="none"
                        class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
                    />
                </div>

                <div flex="~ col" gap="2">
                    <label class="brick-label" for="notes-input">
                        Notities
                        <span text="gray-600" font="normal"> (optional)</span>
                    </label>
                    <textarea
                        id="notes-input"
                        v-model="notes"
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

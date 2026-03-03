<script setup lang="ts">
import type {FamilySet, FamilySetStatus} from "@app/types/familySet";

import {familyHttpService, familyRouterService} from "@app/services";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {isAxiosError} from "axios";
import {deepSnakeKeys} from "string-ts";
import {ref} from "vue";

const setNum = ref("");
const quantity = ref<number | null>(1);
const status = ref<FamilySetStatus>("sealed");
const purchaseDate = ref("");
const notes = ref("");

type AddSetField = "setNum" | "quantity" | "status" | "purchaseDate" | "notes";
const {errors, clearErrors} = useValidationErrors<AddSetField>(familyHttpService);

const handleSubmit = async () => {
    clearErrors();

    try {
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
        <h1 text="2xl" font="bold" m="b-6">Set toevoegen</h1>

        <form flex="~ col" gap="4" @submit.prevent="handleSubmit">
            <TextInput v-model="setNum" label="Setnummer" :error="errors.setNum" required />

            <NumberInput v-model="quantity" label="Aantal" :error="errors.quantity" :min="1" />

            <div flex="~ col" gap="2">
                <label text="sm black" font="bold" uppercase tracking="wide" for="status-select">Status</label>
                <select
                    id="status-select"
                    v-model="status"
                    p="x-4 y-3"
                    border="3 black"
                    bg="white"
                    text="black"
                    font="medium"
                    class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <option value="sealed">Verzegeld</option>
                    <option value="built">Gebouwd</option>
                    <option value="in_progress">In aanbouw</option>
                    <option value="incomplete">Incompleet</option>
                </select>
            </div>

            <div flex="~ col" gap="2">
                <label text="sm black" font="bold" uppercase tracking="wide" for="purchase-date-input"
                    >Aankoopdatum</label
                >
                <input
                    id="purchase-date-input"
                    v-model="purchaseDate"
                    type="date"
                    p="x-4 y-3"
                    border="3 black"
                    bg="white"
                    text="black"
                    font="medium"
                    class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
            </div>

            <div flex="~ col" gap="2">
                <label text="sm black" font="bold" uppercase tracking="wide" for="notes-input">Notities</label>
                <textarea
                    id="notes-input"
                    v-model="notes"
                    rows="3"
                    p="x-4 y-3"
                    border="3 black"
                    bg="white"
                    text="black"
                    font="medium"
                    class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
            </div>

            <PrimaryButton type="submit">Toevoegen</PrimaryButton>
        </form>
    </div>
</template>

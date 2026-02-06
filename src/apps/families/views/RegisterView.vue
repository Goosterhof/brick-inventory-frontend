<script setup lang="ts">
import {familyAuthService, familyHttpService, familyRouterService} from "@app/services";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {isAxiosError} from "axios";
import {ref} from "vue";

const familyName = ref("");
const name = ref("");
const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");

type RegistrationField = "familyName" | "name" | "email" | "password" | "passwordConfirmation";
const {errors, clearErrors} = useValidationErrors<RegistrationField>(familyHttpService);

const handleSubmit = async () => {
    clearErrors();

    try {
        await familyAuthService.register({
            familyName: familyName.value,
            name: name.value,
            email: email.value,
            password: password.value,
            passwordConfirmation: passwordConfirmation.value,
        });

        await familyRouterService.goToDashboard();
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
        <h1 text="2xl" font="bold" m="b-6">Create Account</h1>

        <form flex="~ col" gap="4" @submit.prevent="handleSubmit">
            <TextInput v-model="familyName" label="Family Name" :error="errors.familyName" required />

            <TextInput v-model="name" label="Name" :error="errors.name" required />

            <TextInput v-model="email" label="Email" type="email" :error="errors.email" required />

            <TextInput v-model="password" label="Password" type="password" :error="errors.password" required />

            <TextInput
                v-model="passwordConfirmation"
                label="Password Confirmation"
                type="password"
                :error="errors.passwordConfirmation"
                required
            />

            <PrimaryButton type="submit">Register</PrimaryButton>
        </form>
    </div>
</template>

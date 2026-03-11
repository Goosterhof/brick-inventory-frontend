<script setup lang="ts">
import {familyAuthService, familyHttpService, familyRouterService} from "@app/services";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {isAxiosError} from "axios";
import {ref} from "vue";

const email = ref("");
const password = ref("");

type LoginField = "email" | "password";
const {errors, clearErrors} = useValidationErrors<LoginField>(familyHttpService);

const handleSubmit = async () => {
    clearErrors();

    try {
        await familyAuthService.login({email: email.value, password: password.value});

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
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-6">Log In</h1>

        <form flex="~ col" gap="4" @submit.prevent="handleSubmit">
            <TextInput v-model="email" label="Email" type="email" :error="errors.email" />

            <TextInput v-model="password" label="Password" type="password" :error="errors.password" />

            <PrimaryButton type="submit">Log In</PrimaryButton>
        </form>
    </div>
</template>

<script setup lang="ts">
import {authService, httpService, routerService} from "@app/services";
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
const {errors, clearErrors} = useValidationErrors<RegistrationField>(httpService);

const handleSubmit = async () => {
    clearErrors();

    try {
        await authService.register({
            familyName: familyName.value,
            name: name.value,
            email: email.value,
            password: password.value,
            passwordConfirmation: passwordConfirmation.value,
        });

        await routerService.goToDashboard();
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

            <button
                type="submit"
                p="x-4 y-3"
                border="3 black"
                bg="black hover:yellow-100"
                text="white hover:black"
                font="bold"
                uppercase
                tracking="wide"
                cursor="pointer"
                class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                transition="all duration-150"
            >
                Register
            </button>
        </form>
    </div>
</template>

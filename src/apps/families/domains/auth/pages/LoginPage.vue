<script setup lang="ts">
import {familyAuthService, familyHttpService, familyRouterService, familyTranslationService} from "@app/services";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {useFormSubmit} from "@shared/composables/useFormSubmit";
import {useValidationErrors} from "@shared/composables/useValidationErrors";
import {ref} from "vue";

const {t} = familyTranslationService;
const email = ref("");
const password = ref("");

type LoginField = "email" | "password";
const validationErrors = useValidationErrors<LoginField>(familyHttpService);
const {errors} = validationErrors;
const {handleSubmit} = useFormSubmit(validationErrors);

const onSubmit = () =>
    handleSubmit(async () => {
        await familyAuthService.login({email: email.value, password: password.value});
        await familyRouterService.goToDashboard();
    });
</script>

<template>
    <div max-w="md" m="x-auto">
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-6">{{ t("auth.logIn").value }}</h1>

        <form flex="~ col" gap="4" @submit.prevent="onSubmit">
            <TextInput v-model="email" :label="t('auth.email').value" type="email" :error="errors.email" />

            <TextInput v-model="password" :label="t('auth.password').value" type="password" :error="errors.password" />

            <PrimaryButton type="submit">{{ t("auth.logIn").value }}</PrimaryButton>
        </form>
    </div>
</template>

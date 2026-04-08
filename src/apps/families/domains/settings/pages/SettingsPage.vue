<script setup lang="ts">
import type {InviteCode} from "@app/types/inviteCode";
import type {FamilyMember} from "@app/types/profile";

import {
    familyAuthService,
    familyHttpService,
    familySoundService,
    familyThemeService,
    familyTranslationService,
} from "@app/services";
import BadgeLabel from "@shared/components/BadgeLabel.vue";
import ConfirmDialog from "@shared/components/ConfirmDialog.vue";
import DangerButton from "@shared/components/DangerButton.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {isAxiosError} from "axios";
import {computed, onMounted, ref} from "vue";

const {t} = familyTranslationService;

const members = ref<FamilyMember[]>([]);
const membersLoading = ref(true);

const inviteCode = ref<InviteCode | null>(null);
const inviteCodeLoading = ref(false);
const inviteCodeError = ref("");
const codeCopied = ref(false);

const isHead = computed(() => {
    const userId = familyAuthService.userId();
    return members.value.some((member) => member.id === userId && member.isHead);
});

const memberToRemove = ref<FamilyMember | null>(null);
const showRemoveConfirm = ref(false);
const memberRemoved = ref(false);
const removeMemberError = ref("");

const confirmRemoveMember = (member: FamilyMember) => {
    memberToRemove.value = member;
    showRemoveConfirm.value = true;
    memberRemoved.value = false;
    removeMemberError.value = "";
};

const cancelRemoveMember = () => {
    showRemoveConfirm.value = false;
    memberToRemove.value = null;
};

const removeMember = async () => {
    if (!memberToRemove.value) return;

    const memberId = memberToRemove.value.id;
    showRemoveConfirm.value = false;

    try {
        await familyHttpService.deleteRequest(`/family/members/${String(memberId)}`);
        members.value = members.value.filter((m) => m.id !== memberId);
        memberRemoved.value = true;
        removeMemberError.value = "";
    } catch (error: unknown) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status === 422) {
            removeMemberError.value = t("settings.removeMemberSelfError").value;
        } else if (status === 404) {
            removeMemberError.value = t("settings.removeMemberNotFound").value;
            members.value = members.value.filter((m) => m.id !== memberId);
        } else {
            removeMemberError.value = t("settings.removeMemberError").value;
        }
    } finally {
        memberToRemove.value = null;
    }
};

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

onMounted(async () => {
    const response = await familyHttpService.getRequest<FamilyMember[]>("/family/members");
    members.value = response.data.map((item) => toCamelCaseTyped<FamilyMember>(item));
    membersLoading.value = false;

    try {
        const codeResponse = await familyHttpService.getRequest<InviteCode>("/family/invite-code");
        inviteCode.value = toCamelCaseTyped<InviteCode>(codeResponse.data);
    } catch (error: unknown) {
        if (!isAxiosError(error) || error.response?.status !== 404) {
            inviteCodeError.value = t("settings.inviteCodeError").value;
        }
    }
});

const generateInviteCode = async () => {
    inviteCodeLoading.value = true;
    inviteCodeError.value = "";

    try {
        const response = await familyHttpService.postRequest<InviteCode>("/family/invite-code", {});
        inviteCode.value = toCamelCaseTyped<InviteCode>(response.data);
    } catch {
        inviteCodeError.value = t("settings.inviteCodeError").value;
    } finally {
        inviteCodeLoading.value = false;
    }
};

const revokeInviteCode = async () => {
    inviteCodeLoading.value = true;
    inviteCodeError.value = "";

    try {
        await familyHttpService.deleteRequest("/family/invite-code");
        inviteCode.value = null;
    } catch {
        inviteCodeError.value = t("settings.inviteCodeError").value;
    } finally {
        inviteCodeLoading.value = false;
    }
};

const copyCode = async () => {
    if (!inviteCode.value) return;
    await navigator.clipboard.writeText(inviteCode.value.code);
    codeCopied.value = true;
};

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
        const status = isAxiosError(error) ? error.response?.status : undefined;
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
        familySoundService.play("cascade");
    } catch (error: unknown) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
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
                <h2 text="xl" font="bold" uppercase tracking="wide">{{ t("settings.themeTitle").value }}</h2>
                <p text="[var(--brick-muted-text)]">{{ t("settings.themeDescription").value }}</p>

                <button
                    @click="familyThemeService.toggleTheme()"
                    p="x-4 y-3"
                    bg="[var(--brick-card-bg)] hover:brick-yellow"
                    font="bold"
                    uppercase
                    tracking="wide"
                    cursor="pointer"
                    class="brick-border brick-shadow brick-transition hover:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
                >
                    {{
                        familyThemeService.isDark.value ? t("settings.themeDark").value : t("settings.themeLight").value
                    }}
                </button>
            </section>

            <hr border="t-3 [var(--brick-border-color)]" />

            <section flex="~ col" gap="4">
                <h2 text="xl" font="bold" uppercase tracking="wide">{{ t("settings.membersTitle").value }}</h2>

                <p v-if="membersLoading" text="[var(--brick-muted-text)]">{{ t("common.loading").value }}</p>

                <div v-else flex="~ col" gap="2">
                    <div
                        v-for="member in members"
                        :key="member.id"
                        flex
                        items="center"
                        gap="3"
                        p="3"
                        bg="[var(--brick-card-bg)]"
                        class="brick-border"
                    >
                        <div flex="1">
                            <p font="bold">{{ member.name }}</p>
                            <p text="sm [var(--brick-muted-text)]">{{ member.email }}</p>
                        </div>
                        <BadgeLabel v-if="member.isHead" variant="highlight">
                            {{ t("settings.familyHead").value }}
                        </BadgeLabel>
                        <DangerButton v-if="isHead && !member.isHead" @click="confirmRemoveMember(member)">
                            {{ t("settings.removeMember").value }}
                        </DangerButton>
                    </div>

                    <p v-if="memberRemoved" text="baseplate-green" font="bold">
                        {{ t("settings.memberRemoved").value }}
                    </p>
                    <p v-if="removeMemberError" text="brick-red-dark" font="bold">{{ removeMemberError }}</p>
                </div>

                <ConfirmDialog
                    :open="showRemoveConfirm"
                    :title="t('settings.removeMemberTitle').value"
                    :message="t('settings.removeMemberMessage').value"
                    :sound-service="familySoundService"
                    @confirm="removeMember"
                    @cancel="cancelRemoveMember"
                >
                    <template #confirm>{{ t("settings.removeMember").value }}</template>
                    <template #cancel>{{ t("common.cancel").value }}</template>
                </ConfirmDialog>
            </section>

            <hr border="t-3 [var(--brick-border-color)]" />

            <section v-if="isHead" flex="~ col" gap="4">
                <h2 text="xl" font="bold" uppercase tracking="wide">{{ t("settings.inviteCodeTitle").value }}</h2>
                <p text="[var(--brick-muted-text)]">{{ t("settings.inviteCodeDescription").value }}</p>

                <div v-if="inviteCode" p="4" bg="[var(--brick-card-bg)]" class="brick-border" flex="~ col" gap="3">
                    <div flex items="center" gap="3">
                        <p font="mono bold" text="lg">{{ inviteCode.code }}</p>
                        <PrimaryButton :sound-service="familySoundService" @click="copyCode">
                            {{ t("settings.copyCode").value }}
                        </PrimaryButton>
                    </div>
                    <p v-if="codeCopied" text="baseplate-green" font="bold">{{ t("settings.codeCopied").value }}</p>
                    <p text="sm [var(--brick-muted-text)]">
                        {{ t("settings.codeExpires").value }}: {{ inviteCode.expiresAt }}
                    </p>
                    <DangerButton :disabled="inviteCodeLoading" @click="revokeInviteCode">
                        {{ t("settings.revokeCode").value }}
                    </DangerButton>
                </div>

                <p v-if="inviteCodeError" text="brick-red-dark" font="bold">{{ inviteCodeError }}</p>

                <PrimaryButton
                    v-if="!inviteCode"
                    :disabled="inviteCodeLoading"
                    :sound-service="familySoundService"
                    @click="generateInviteCode"
                >
                    {{ t("settings.generateInviteCode").value }}
                </PrimaryButton>
            </section>

            <hr v-if="isHead" border="t-3 [var(--brick-border-color)]" />

            <section flex="~ col" gap="4">
                <h2 text="xl" font="bold" uppercase tracking="wide">{{ t("settings.rebrickableTitle").value }}</h2>
                <p text="[var(--brick-muted-text)]">{{ t("settings.rebrickableDescription").value }}</p>

                <form flex="~ col" gap="4" @submit.prevent="saveToken">
                    <TextInput
                        v-model="rebrickableToken"
                        :label="t('settings.rebrickableToken').value"
                        :error="tokenError"
                    />

                    <p v-if="tokenSaved" text="baseplate-green" font="bold">{{ t("settings.tokenSaved").value }}</p>

                    <PrimaryButton
                        type="submit"
                        :disabled="tokenSaving || !rebrickableToken"
                        :sound-service="familySoundService"
                        silent
                    >
                        {{ t("settings.saveToken").value }}
                    </PrimaryButton>
                </form>
            </section>

            <hr border="t-3 [var(--brick-border-color)]" />

            <section flex="~ col" gap="4">
                <h2 text="xl" font="bold" uppercase tracking="wide">{{ t("settings.importTitle").value }}</h2>
                <p text="[var(--brick-muted-text)]">{{ t("settings.importDescription").value }}</p>

                <div v-if="importResult" p="4" bg="[var(--brick-card-bg)]" class="brick-border" flex="~ col" gap="2">
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

                <PrimaryButton :disabled="importing" :sound-service="familySoundService" @click="importSets">
                    {{ importing ? t("settings.importing").value : t("settings.importButton").value }}
                </PrimaryButton>
            </section>
        </div>
    </div>
</template>

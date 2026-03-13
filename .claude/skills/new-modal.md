# New Modal — _Playable_

Template for adding a modal within a domain.

## Template

```vue
<!-- src/apps/{appName}/domains/{domain}/modals/{ModalName}Modal.vue -->
<script setup lang="ts">
import {familyTranslationService} from "@app/services";

const {title} = defineProps<{title: string}>();
const emit = defineEmits<{close: []; confirm: []}>();

const {t} = familyTranslationService;
</script>

<template>
    <div
        fixed
        inset="0"
        flex="~ items-center justify-center"
        bg="black/50"
        z="50"
        @click.self="emit('close')"
        @keydown.escape="emit('close')"
    >
        <div
            bg="white"
            border="3 black"
            shadow="[4px_4px_0px_0px_rgba(0,0,0,1)]"
            p="6"
            w="full"
            max-w="lg"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
        >
            <h2 text="xl" font="bold" m="b-4">{{ title }}</h2>

            <slot />

            <div flex="~" gap="3" m="t-6" justify="end">
                <button
                    border="3 black"
                    p="x-4 y-2"
                    font="bold"
                    uppercase
                    bg="white"
                    shadow="[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    @click="emit('close')"
                >
                    {{ t("common.cancel").value }}
                </button>
                <button
                    border="3 black"
                    p="x-4 y-2"
                    font="bold"
                    uppercase
                    bg="yellow-400"
                    shadow="[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    @click="emit('confirm')"
                >
                    {{ t("common.submit").value }}
                </button>
            </div>
        </div>
    </div>
</template>
```

## Usage

```vue
<ConfirmModal
    v-if="showModal"
    :title="t('sets.confirmDelete').value"
    @close="showModal = false"
    @confirm="handleConfirm"
>
    <p>{{ t("sets.confirmDeleteMessage").value }}</p>
</ConfirmModal>
```

## Accessibility

- `role="dialog"` + `aria-modal="true"` + `aria-label` on the dialog
- Escape key closes (`@keydown.escape`)
- Backdrop click closes (`@click.self`)
- Focus should be trapped inside while open

## Naming

Modal files: `{Descriptive}Modal.vue` — two-word PascalCase (e.g., `ConfirmDeleteModal.vue`)

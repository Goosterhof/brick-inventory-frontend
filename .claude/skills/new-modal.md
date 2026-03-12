# New Modal Skill

Step-by-step guide for adding a modal within a domain.

## Steps

1. Create the modal component in the domain's `modals/` directory:

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

2. Use the modal from a page component:

    ```vue
    <script setup lang="ts">
    import {ref} from "vue";
    import {familyTranslationService} from "@app/services";
    import ConfirmModal from "../modals/ConfirmModal.vue";

    const {t} = familyTranslationService;
    const showModal = ref(false);

    const handleConfirm = () => {
        // handle confirmation
        showModal.value = false;
    };
    </script>

    <template>
        <button @click="showModal = true">Open Modal</button>
        <ConfirmModal
            v-if="showModal"
            :title="t('{domain}.confirmDelete').value"
            @close="showModal = false"
            @confirm="handleConfirm"
        >
            <p>{{ t("{domain}.confirmDeleteMessage").value }}</p>
        </ConfirmModal>
    </template>
    ```

3. Create a test file:

    ```bash
    # Test at: src/tests/unit/apps/{appName}/domains/{domain}/modals/{ModalName}Modal.spec.ts
    ```

## Accessibility Requirements

- `role="dialog"` and `aria-modal="true"` on the dialog container
- `aria-label` with the modal title
- Escape key closes the modal (`@keydown.escape`)
- Clicking the backdrop closes the modal (`@click.self`)
- Focus should be trapped inside the modal while open

## Naming Conventions

- Modal files: `{Descriptive}Modal.vue` (e.g., `ConfirmDeleteModal.vue`, `AddItemModal.vue`)
- Two-word PascalCase names (enforced by lint)

## Styling

Follow the neo-brutalism design system:

- Bold 3px black borders
- Solid offset shadows
- Sharp corners (no border-radius)
- High contrast colors

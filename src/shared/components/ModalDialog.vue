<script setup lang="ts">
import {PhX} from "@phosphor-icons/vue";
import {onMounted, ref, watch} from "vue";

const {open} = defineProps<{open: boolean}>();
const emit = defineEmits<{close: []}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

const syncDialog = (isOpen: boolean) => {
    const dialog = dialogRef.value;
    if (isOpen && !dialog?.open) dialog?.showModal();
    if (!isOpen && dialog?.open) dialog.close();
};

onMounted(() => syncDialog(open));
watch(() => open, syncDialog);

const handleCancel = (event: Event) => {
    event.preventDefault();
    emit("close");
};

const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === dialogRef.value) {
        emit("close");
    }
};
</script>

<template>
    <dialog
        ref="dialogRef"
        @cancel="handleCancel"
        @click="handleBackdropClick"
        p="0"
        m="auto"
        bg="transparent"
        class="backdrop:bg-black"
    >
        <div bg="white" p="6" min-w="80" max-w="lg" class="brick-border brick-shadow">
            <div flex justify="between" items="center" m="b-4">
                <h2 text="xl" font="bold" uppercase tracking="wide">
                    <slot name="title" />
                </h2>
                <button
                    @click="emit('close')"
                    p="2"
                    bg="white hover:brick-yellow focus:brick-yellow"
                    cursor="pointer"
                    outline="none"
                    class="brick-border brick-shadow brick-transition hover:brick-shadow-hover focus:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
                    aria-label="Close"
                >
                    <PhX size="20" aria-hidden="true" />
                </button>
            </div>
            <div>
                <slot />
            </div>
        </div>
    </dialog>
</template>

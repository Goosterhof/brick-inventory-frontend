<script setup lang="ts">
const {to, active} = defineProps<{to: string; active: boolean}>();

const emit = defineEmits<{click: []}>();

const handleClick = (event: Event) => {
    event.preventDefault();
    emit("click");
};
</script>

<template>
    <a
        :href="to"
        block
        p="4"
        border="b-3 black"
        font="bold"
        uppercase
        tracking="wide"
        outline="none"
        :bg="active ? 'yellow-300' : 'white hover:yellow-300 focus:yellow-300'"
        class="brick-transition"
        @click="handleClick"
    >
        <slot />
    </a>
</template>

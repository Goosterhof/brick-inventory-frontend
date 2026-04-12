<script setup lang="ts">
const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();
</script>

<template>
    <div
        inline-grid
        :style="{backgroundColor: color, gridTemplateColumns: 'repeat(4, 1fr)'}"
        place-items="center"
        border="3 black"
        :class="shadow ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''"
        p="x-2 y-0.5"
        class="gap-0"
    >
        <div
            v-for="stud in 8"
            :key="stud"
            w="6"
            h="6"
            m="1"
            rounded="full"
            border="3 black"
            :style="{backgroundColor: color}"
            class="shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            data-stud
        />
    </div>
</template>

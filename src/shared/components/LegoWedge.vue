<script setup lang="ts">
const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();
</script>

<template>
    <div
        inline-flex="~"
        :style="{backgroundColor: color, clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0 100%)'}"
        border="3 black"
        :class="shadow ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''"
        w="34"
        h="12"
        p="2"
        items="center"
        gap="1"
    >
        <div
            v-for="stud in 4"
            :key="stud"
            w="6"
            h="6"
            rounded="full"
            border="3 black"
            :style="{backgroundColor: color}"
            class="shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            data-stud
        />
    </div>
</template>

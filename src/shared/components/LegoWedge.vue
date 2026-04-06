<script setup lang="ts">
const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();
</script>

<template>
    <div
        inline-flex="~"
        :style="{backgroundColor: color, clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0 100%)'}"
        border="3 black"
        :class="shadow ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''"
        w="28"
        h="10"
        p="2"
        items="center"
        gap="1"
    >
        <div
            v-for="stud in 4"
            :key="stud"
            w="4"
            h="4"
            rounded="full"
            border="2 black"
            :style="{backgroundColor: color}"
            class="shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
            data-stud
        />
    </div>
</template>

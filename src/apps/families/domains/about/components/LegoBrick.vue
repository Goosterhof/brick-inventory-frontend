<script setup lang="ts">
const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();
</script>

<template>
    <div
        border="3 black"
        p="2"
        inline-block
        :class="shadow ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''"
        :style="{backgroundColor: color}"
    >
        <div grid grid-cols-4 grid-rows-2 place-items="center" class="gap-0">
            <div
                v-for="stud in 8"
                :key="stud"
                class="w-[24px] h-[24px] m-[8px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                rounded="full"
                border="3 black"
                :style="{backgroundColor: color}"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
const {color = "#DC2626", cols = 4, rows = 2} = defineProps<{color?: string; cols?: number; rows?: number}>();

const studCount = cols * rows;
const gridStyle = {gridTemplateColumns: `repeat(${cols}, 40px)`, gridTemplateRows: `repeat(${rows}, 40px)`};
</script>

<template>
    <div
        border="3 black"
        p="2"
        inline-block
        class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        :style="{backgroundColor: color}"
    >
        <div grid place-items="center" :style="gridStyle">
            <div
                v-for="stud in studCount"
                :key="stud"
                w="6"
                h="6"
                rounded="full"
                border="3 black"
                class="shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                :style="{backgroundColor: color}"
            />
        </div>
    </div>
</template>

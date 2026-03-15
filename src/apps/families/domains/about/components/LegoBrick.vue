<script setup lang="ts">
const {color = "#DC2626"} = defineProps<{color?: string}>();
</script>

<template>
    <div
        border="3 black"
        p="3"
        inline-block
        class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        :style="{backgroundColor: color}"
    >
        <div grid grid-cols-4 grid-rows-2 gap="2">
            <div
                v-for="stud in 8"
                :key="stud"
                w="10"
                h="10"
                border="3 black"
                class="shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                :style="{backgroundColor: color}"
            />
        </div>
    </div>
</template>

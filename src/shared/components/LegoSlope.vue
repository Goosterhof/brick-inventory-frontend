<script setup lang="ts">
const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();
</script>

<template>
    <div inline-flex="~" flex="col" items="center">
        <!-- Angled top via clip-path -->
        <div
            :style="{backgroundColor: color, clipPath: 'polygon(0 100%, 0 0, 100% 100%)'}"
            w="20"
            h="10"
            border="3 black"
        />
        <!-- Body -->
        <div
            :style="{backgroundColor: color}"
            w="20"
            h="12"
            border="x-3 b-3 black"
            :class="shadow ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''"
            flex
            items="center"
            justify="center"
            gap="2"
        >
            <div
                v-for="stud in 2"
                :key="stud"
                w="5"
                h="5"
                rounded="full"
                border="2 black"
                :style="{backgroundColor: color}"
                class="shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
                data-stud
            />
        </div>
    </div>
</template>

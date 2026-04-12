<script setup lang="ts">
const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();
</script>

<template>
    <div inline-flex="~" flex="col" items="center">
        <!-- Top with studs -->
        <div
            :style="{backgroundColor: color}"
            w="32"
            border="3 black"
            p="2"
            flex
            items="center"
            justify="center"
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
        <!-- Body with arch cutout -->
        <div
            :style="{backgroundColor: color}"
            w="32"
            h="10"
            border="x-3 b-3 black"
            :class="shadow ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''"
            flex
            items="end"
            justify="center"
            overflow="hidden"
            position="relative"
        >
            <!-- Arch cutout (semicircle) -->
            <div w="16" h="8" bg="white" border="t-3 black" :style="{borderRadius: '999px 999px 0 0'}" data-arch />
        </div>
    </div>
</template>

<script setup lang="ts">
const {color = "#DC2626", shadow = true} = defineProps<{color?: string; shadow?: boolean}>();
</script>

<template>
    <div
        inline-flex="~"
        :style="{backgroundColor: color}"
        border="3 black"
        :class="shadow ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''"
        w="32"
        h="10"
        items="center"
        justify="around"
        p="x-2"
    >
        <div v-for="hole in 4" :key="hole" w="6" h="6" rounded="full" border="3 black" bg="white" data-pin-hole />
    </div>
</template>

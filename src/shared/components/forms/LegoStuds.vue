<script setup lang="ts">
const {count = 3} = defineProps<{count?: number}>();
</script>

<template>
    <div flex="~" gap="2" aria-hidden="true" style="margin-bottom: -4px; position: relative; z-index: 1">
        <span
            v-for="i in count"
            :key="i"
            w="3"
            h="3"
            border="3 black solid"
            bg="white"
            inline-block
            style="border-radius: 50%; box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.15)"
        />
    </div>
</template>

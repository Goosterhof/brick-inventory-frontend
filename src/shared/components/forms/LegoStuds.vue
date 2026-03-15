<script setup lang="ts">
const {count = 3} = defineProps<{count?: number}>();
</script>

<template>
    <div flex="~" gap="1.5" aria-hidden="true">
        <span
            v-for="i in count"
            :key="i"
            w="3"
            h="3"
            border="3 black solid"
            bg="white"
            inline-block
            style="border-radius: 50%"
        />
    </div>
</template>

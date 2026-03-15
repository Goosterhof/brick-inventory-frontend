<script setup lang="ts">
import LegoStuds from "@shared/components/forms/LegoStuds.vue";
</script>

<template>
    <div flex="~ col" gap="2">
        <LegoStuds />
        <slot />
    </div>
</template>

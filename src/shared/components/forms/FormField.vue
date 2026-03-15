<script setup lang="ts">
import LegoStuds from "@shared/components/forms/LegoStuds.vue";
</script>

<template>
    <div flex="~ col" items="start">
        <LegoStuds m="l-3" />
        <div class="brick-border" p="3" flex="~ col" gap="2" w="full">
            <slot />
        </div>
    </div>
</template>

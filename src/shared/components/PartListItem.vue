<script setup lang="ts">
defineProps<{
    name: string;
    partNum: string;
    quantity: number;
    imageUrl?: string | null;
    colorName?: string | null;
    colorRgb?: string | null;
    spare?: boolean;
}>();
</script>

<template>
    <div flex gap="3" items="center" p="3" :bg="spare ? 'gray-200' : 'white'" class="brick-border brick-shadow">
        <div v-if="colorRgb" w="6" h="6" shrink="0" class="brick-border" :style="{backgroundColor: '#' + colorRgb}" />
        <img v-if="imageUrl" :src="imageUrl" :alt="name" w="10" h="10" object="contain" shrink="0" />
        <div flex="1" min-w="0">
            <p font="bold" truncate>{{ name }}</p>
            <p text="sm gray-600">
                {{ partNum }}
                <template v-if="colorName"> &middot; {{ colorName }} </template>
            </p>
        </div>
        <span font="bold" shrink="0">{{ quantity }}x</span>
    </div>
</template>

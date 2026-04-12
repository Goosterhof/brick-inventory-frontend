<script setup lang="ts">
import {ref} from "vue";

const experimentCount = ref(6);

const addExperiment = () => {
    experimentCount.value++;
};
</script>

<template>
    <section p="y-16 x-4 md:x-8" border="b-3 black" bg="brick-yellow">
        <div max-w="6xl" m="x-auto">
            <p font="heading bold" text="sm" uppercase tracking="widest" m="b-4" opacity="60">Component Playground</p>
            <h1 font="heading bold" text="5xl md:7xl" uppercase tracking="wide" leading="none" m="b-4">Experiment</h1>
            <p text="lg" max-w="xl" leading="relaxed" m="b-8">
                Drop components in the slots below. Try different animations, layouts, and styles side by side.
            </p>
            <button
                @click="addExperiment"
                p="x-5 y-2"
                bg="black"
                text="white"
                font="bold"
                uppercase
                tracking="wide"
                cursor="pointer"
                class="brick-border brick-shadow brick-transition hover:brick-shadow-hover active:brick-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
            >
                + Add Slot
            </button>
        </div>
    </section>

    <div max-w="6xl" m="x-auto" p="x-4 md:x-8 y-12">
        <div grid="~ cols-1 md:cols-2" gap="8">
            <div
                v-for="n in experimentCount"
                :key="n"
                min-h="64"
                p="6"
                bg="white"
                class="brick-border brick-shadow"
                flex="~ col"
            >
                <div flex="~" items="center" justify="between" m="b-4" border="b-2 black" p="b-3">
                    <span font="heading bold" text="xs" uppercase tracking="widest" opacity="40">
                        Experiment {{ String(n).padStart(2, "0") }}
                    </span>
                </div>

                <!-- Drop your experiment component here -->
                <div flex="~ 1 col" items="center" justify="center" border="2 dashed gray-300" rounded="sm" p="8">
                    <p text="sm gray-400" font="bold" uppercase tracking="wide">Empty Slot</p>
                </div>
            </div>
        </div>
    </div>
</template>

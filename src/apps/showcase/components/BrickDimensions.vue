<script setup lang="ts">
import SectionHeading from "./SectionHeading.vue";

const studs = [
    {cols: 2, rows: 4, label: "2x4 Brick"},
    {cols: 2, rows: 2, label: "2x2 Brick"},
    {cols: 1, rows: 2, label: "1x2 Plate"},
    {cols: 1, rows: 1, label: "1x1 Round"},
];
</script>

<template>
    <section p="y-20" id="dimensions">
        <SectionHeading number="07" title="Brick Dimensions" />

        <p text="lg" leading="relaxed" max-w="prose" m="b-10">
            The design system's spatial rhythm is derived from actual LEGO dimensions. A stud is the atomic unit — all
            spacing relates back to the 0.6 width-to-height ratio of a real LEGO stud.
        </p>

        <!-- Stud ratio visualization -->
        <div m="b-12" p="6" class="brick-border brick-shadow" bg="white">
            <p class="brick-label" m="b-6">The Stud — Atomic Unit</p>

            <div flex items="end" gap="8">
                <!-- Single stud, large -->
                <div flex="~ col" items="center" gap="3">
                    <div
                        w="16"
                        h="16"
                        rounded="full"
                        bg="[#F5C518]"
                        class="brick-border brick-shadow"
                        flex
                        items="center"
                        justify="center"
                    >
                        <div w="4" h="4" rounded="full" bg="black" opacity="10" />
                    </div>
                    <p text="xs" font="mono" text-color="gray-500">1 stud</p>
                </div>

                <!-- Ratio diagram -->
                <div flex="~ col" gap="2">
                    <div flex items="center" gap="2">
                        <div w="16" h="1" bg="black" />
                        <span text="xs" font="mono">width</span>
                    </div>
                    <div flex items="center" gap="2">
                        <div w="10" h="1" bg="[#F5C518]" class="brick-border" />
                        <span text="xs" font="mono">height = 0.6 x width</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Brick specimens with studs -->
        <div grid="~ cols-1 sm:cols-2 lg:cols-4" gap="6">
            <div
                v-for="stud in studs"
                :key="stud.label"
                p="6"
                class="brick-border brick-shadow"
                bg="white"
                flex="~ col"
                items="center"
                gap="4"
            >
                <p class="brick-label" text="center">{{ stud.label }}</p>

                <!-- Stud grid -->
                <div
                    inline-grid
                    gap="2"
                    :style="{
                        gridTemplateColumns: `repeat(${stud.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${stud.rows}, 1fr)`,
                    }"
                >
                    <div
                        v-for="i in stud.cols * stud.rows"
                        :key="i"
                        w="10"
                        h="10"
                        rounded="full"
                        bg="[#F5C518]"
                        class="brick-border"
                        shadow="[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                </div>

                <p text="xs" font="mono" text-color="gray-500">{{ stud.cols }} x {{ stud.rows }} studs</p>
            </div>
        </div>

        <!-- Spacing scale -->
        <div m="t-12" p="6" class="brick-border brick-shadow" bg="white">
            <p class="brick-label" m="b-6">Spacing Scale — Stud Multiples</p>

            <div flex="~ col" gap="4">
                <div v-for="mult in [1, 2, 3, 4, 6, 8]" :key="mult" flex items="center" gap="4">
                    <span text="xs" font="mono" w="16" text-color="gray-500" flex="shrink-0">
                        {{ mult }} stud{{ mult > 1 ? "s" : "" }}
                    </span>
                    <div h="6" bg="[#F5C518]" class="brick-border" :style="{width: `${mult * 2.5}rem`}" />
                    <span text="xs" font="mono" text-color="gray-400"> {{ mult * 8 }}px </span>
                </div>
            </div>
        </div>
    </section>
</template>

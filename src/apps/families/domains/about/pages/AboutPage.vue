<script setup lang="ts">
import {familyTranslationService} from "@app/services";

const {t} = familyTranslationService;

const RED = "#DC2626";
const BLUE = "#1D4ED8";
const GREEN = "#16A34A";
const YELLOW = "#EAB308";
</script>

<template>
    <div>
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">{{ t("about.title").value }}</h1>
        <p text="gray-600" m="b-6">{{ t("about.description").value }}</p>
        <div inline-block style="filter: drop-shadow(4px 4px 0 black)">
            <!-- Row 1: Red 2×2 + Blue 1×1 (bottom-aligned) -->
            <div flex items="end">
                <!-- Red 2×2 brick -->
                <div p="2" border="3 black" :style="{backgroundColor: RED}">
                    <div grid grid-cols-2 grid-rows-2>
                        <div v-for="i in 4" :key="i" class="w-[40px] h-[40px]" flex items="center" justify="center">
                            <div
                                class="w-[24px] h-[24px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                rounded="full"
                                border="3 black"
                                :style="{backgroundColor: RED}"
                            />
                        </div>
                    </div>
                </div>
                <!-- Blue 1×1 brick -->
                <div class="ml-[-3px]" p="2" border="3 black" :style="{backgroundColor: BLUE}">
                    <div class="w-[40px] h-[40px]" flex items="center" justify="center">
                        <div
                            class="w-[24px] h-[24px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            rounded="full"
                            border="3 black"
                            :style="{backgroundColor: BLUE}"
                        />
                    </div>
                </div>
            </div>
            <!-- Row 2: Yellow 2×3 + Green 1×3 -->
            <div flex class="mt-[-3px]">
                <!-- Yellow 2×3 brick -->
                <div p="2" border="3 black" :style="{backgroundColor: YELLOW}">
                    <div grid grid-cols-2 grid-rows-3>
                        <div v-for="i in 6" :key="i" class="w-[40px] h-[40px]" flex items="center" justify="center">
                            <div
                                class="w-[24px] h-[24px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                rounded="full"
                                border="3 black"
                                :style="{backgroundColor: YELLOW}"
                            />
                        </div>
                    </div>
                </div>
                <!-- Green 1×3 brick -->
                <div class="ml-[-3px]" p="2" border="3 black" :style="{backgroundColor: GREEN}">
                    <div grid grid-cols-1 grid-rows-3>
                        <div v-for="i in 3" :key="i" class="w-[40px] h-[40px]" flex items="center" justify="center">
                            <div
                                class="w-[24px] h-[24px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                rounded="full"
                                border="3 black"
                                :style="{backgroundColor: GREEN}"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

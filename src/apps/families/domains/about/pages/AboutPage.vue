<script setup lang="ts">
import {familyTranslationService} from "@app/services";

const {t} = familyTranslationService;

const RED = "#DC2626";
const BLUE = "#1D4ED8";
const GREEN = "#16A34A";
const YELLOW = "#EAB308";

// 3 cols × 5 rows stud grid
// 2×2 red (top-left), 1×1 blue (row 2, col 3), 2×3 yellow (bottom-left), 1×3 green (bottom-right)
const grid: (string | null)[][] = [
    [RED, RED, null],
    [RED, RED, BLUE],
    [YELLOW, YELLOW, GREEN],
    [YELLOW, YELLOW, GREEN],
    [YELLOW, YELLOW, GREEN],
];

const hasBorderRight = (row: number, col: number): boolean => {
    if (col >= 2) return false;
    const currentRow = grid[row];
    if (!currentRow) return false;
    return currentRow[col] !== currentRow[col + 1];
};

const hasBorderBottom = (row: number, col: number): boolean => {
    if (row >= 4) return false;
    const currentRow = grid[row];
    const nextRow = grid[row + 1];
    if (!currentRow || !nextRow) return false;
    return currentRow[col] !== nextRow[col];
};
</script>

<template>
    <div>
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">{{ t("about.title").value }}</h1>
        <p text="gray-600" m="b-6">{{ t("about.description").value }}</p>
        <div inline-block border="3 black" p="2" class="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div grid class="gap-0" style="grid-template-columns: repeat(3, 40px); grid-template-rows: repeat(5, 40px)">
                <template v-for="(row, ri) in grid" :key="ri">
                    <div
                        v-for="(color, ci) in row"
                        :key="ci"
                        :style="color ? {backgroundColor: color} : undefined"
                        :class="{
                            'border-r-3 border-r-black': hasBorderRight(ri, ci),
                            'border-b-3 border-b-black': hasBorderBottom(ri, ci),
                        }"
                        flex
                        items="center"
                        justify="center"
                    >
                        <div
                            v-if="color"
                            class="w-[24px] h-[24px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            rounded="full"
                            border="3 black"
                            :style="{backgroundColor: color}"
                        />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

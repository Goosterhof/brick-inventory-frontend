<script setup lang="ts">
import {familyTranslationService} from "@app/services";

const {t} = familyTranslationService;

const RED = "#DC2626";
const BLUE = "#1D4ED8";
const GREEN = "#16A34A";
const YELLOW = "#EAB308";

// 3 cols × 5 rows stud grid
// 2×2 red (top-left), 1×1 blue (row 2 col 3), 2×3 yellow (bottom-left), 1×3 green (bottom-right)
const grid: (string | null)[][] = [
    [RED, RED, null],
    [RED, RED, BLUE],
    [YELLOW, YELLOW, GREEN],
    [YELLOW, YELLOW, GREEN],
    [YELLOW, YELLOW, GREEN],
];

const getColor = (row: number, col: number): string | null => {
    if (row < 0 || row >= grid.length || col < 0 || col >= 3) return null;
    const gridRow = grid[row];
    if (!gridRow) return null;
    return gridRow[col] ?? null;
};

const getCellShadow = (row: number, col: number): string => {
    const color = getColor(row, col);
    if (!color) return "none";

    const above = getColor(row - 1, col);
    const below = getColor(row + 1, col);
    const left = getColor(row, col - 1);
    const right = getColor(row, col + 1);

    const shadows: string[] = [];
    // Outer edges: always draw. Internal brick boundaries: only draw on the top/left side to avoid doubling.
    if (above !== color && !above) shadows.push("inset 0 3px 0 0 #000");
    if (below !== color) shadows.push("inset 0 -3px 0 0 #000");
    if (left !== color && !left) shadows.push("inset 3px 0 0 0 #000");
    if (right !== color) shadows.push("inset -3px 0 0 0 #000");

    return shadows.join(", ") || "none";
};
</script>

<template>
    <div>
        <h1 text="2xl" font="bold" uppercase tracking="wide" m="b-4">{{ t("about.title").value }}</h1>
        <p text="gray-600" m="b-6">{{ t("about.description").value }}</p>
        <div inline-block style="filter: drop-shadow(4px 4px 0 black)">
            <div grid class="gap-0" style="grid-template-columns: repeat(3, 40px); grid-template-rows: repeat(5, 40px)">
                <template v-for="(row, ri) in grid" :key="ri">
                    <div
                        v-for="(color, ci) in row"
                        :key="ci"
                        :style="{backgroundColor: color ?? 'transparent', boxShadow: getCellShadow(ri, ci)}"
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

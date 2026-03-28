<script setup lang="ts">
import AntiPatterns from "./components/AntiPatterns.vue";
import BrandVoice from "./components/BrandVoice.vue";
import BrickDimensions from "./components/BrickDimensions.vue";
import ColorPalette from "./components/ColorPalette.vue";
import ComponentGallery from "./components/ComponentGallery.vue";
import ComponentHealth from "./components/ComponentHealth.vue";
import DialogServiceDemo from "./components/DialogServiceDemo.vue";
import FormValidationWorkbench from "./components/FormValidationWorkbench.vue";
import ShowcaseHero from "./components/ShowcaseHero.vue";
import ToastServiceDemo from "./components/ToastServiceDemo.vue";
import SnapDemo from "./components/SnapDemo.vue";
import TypographySpecimen from "./components/TypographySpecimen.vue";
</script>

<template>
    <div min-h="screen" bg="white" text="black">
        <ShowcaseHero />

        <div max-w="6xl" m="x-auto" p="x-4 md:x-8">
            <ColorPalette />
            <TypographySpecimen />
            <SnapDemo />
            <ComponentGallery />
            <AntiPatterns />
            <BrandVoice />
            <BrickDimensions />
            <ComponentHealth />
            <DialogServiceDemo />
            <ToastServiceDemo />
            <FormValidationWorkbench />
        </div>

        <footer p="y-16 x-4" border="t-3 black" m="t-24">
            <div max-w="6xl" m="x-auto" flex="~ col" items="center" gap="4">
                <p font="heading bold" text="sm" uppercase tracking="widest">Brick Brutalism</p>
                <p text="sm gray-600">Every brick has a place. This is the proof.</p>
            </div>
        </footer>
    </div>
</template>

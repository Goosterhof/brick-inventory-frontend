import {defineConfig, presetAttributify, presetIcons, presetUno} from "unocss";

export default defineConfig({
    presets: [presetUno(), presetAttributify(), presetIcons({scale: 1.2, warn: true})],
    shortcuts: {
        "brick-border": "border-3 border-black border-solid",
        "brick-shadow": "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "brick-shadow-hover": "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        "brick-shadow-active": "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "brick-shadow-error": "shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]",
        "brick-shadow-error-hover": "shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]",
        "brick-shadow-danger": "shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]",
        "brick-label": "text-sm text-black font-bold uppercase tracking-wide",
        "brick-disabled": "bg-gray-200 border-gray-300 text-gray-600 cursor-not-allowed shadow-none",
        "brick-transition":
            "transition-property-[box-shadow,background-color] transition-duration-150 transition-ease-[cubic-bezier(0.2,0,0,1)]",
    },
    rules: [],
});

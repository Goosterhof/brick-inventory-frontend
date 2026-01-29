import vue from "@vitejs/plugin-vue";
import {fileURLToPath, URL} from "node:url";
import {defineConfig} from "rolldown-vite";
import UnoCSS from "unocss/vite";
import oxlint from "vite-plugin-oxlint";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools(), UnoCSS(), oxlint({configFile: "oxlint.config.json"})],
    resolve: {alias: {"@": fileURLToPath(new URL("./src", import.meta.url))}},
});

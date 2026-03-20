import {fileURLToPath} from "node:url";
import {configDefaults, defineConfig, mergeConfig} from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: "jsdom",
            exclude: [...configDefaults.exclude, "e2e/**"],
            root: fileURLToPath(new URL("./", import.meta.url)),
            reporters: ["default", "./src/tests/unit/collect-guard-reporter.ts"],
            setupFiles: ["./src/tests/unit/setup.ts"],
            coverage: {
                provider: "istanbul",
                include: ["src/**/*.ts", "src/**/*.vue"],
                exclude: [
                    "src/apps/**/main.ts",
                    "src/apps/**/App.vue",
                    "src/**/*.d.ts",
                    "src/apps/**/router/**",
                    "src/apps/**/domains/**",
                    "src/apps/**/services/**",
                    "src/apps/**/types/**",
                    "src/apps/showcase/**",
                    "src/shared/services/auth/types.ts",
                ],
                thresholds: {lines: 100, functions: 100, branches: 100, statements: 100},
            },
        },
    }),
);

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
            setupFiles: ["./src/tests/unit/setup.ts"],
            coverage: {
                provider: "v8",
                include: ["src/**/*.ts", "src/**/*.vue"],
                exclude: [
                    "src/apps/**/main.ts",
                    "src/**/*.d.ts",
                    "src/apps/**/router/**",
                    "src/apps/**/pages/**",
                    "src/apps/**/services/**",
                    "src/apps/**/types/**",
                ],
                thresholds: {lines: 100, functions: 100, branches: 100, statements: 100},
            },
        },
    }),
);

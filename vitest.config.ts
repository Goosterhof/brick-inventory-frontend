import {fileURLToPath} from "node:url";
import {configDefaults, defineConfig, mergeConfig} from "vitest/config";

import viteConfig from "./vite.config";

// Pure-TS service tests that run in Node (no DOM, no @vue/test-utils).
const unitServiceIncludes = [
    "src/tests/unit/shared/services/adapter-store.spec.ts",
    "src/tests/unit/shared/services/auth/index.spec.ts",
    "src/tests/unit/shared/services/auth/register.spec.ts",
    "src/tests/unit/shared/services/http.spec.ts",
    "src/tests/unit/shared/services/loading-middleware.spec.ts",
    "src/tests/unit/shared/services/resource-adapter.spec.ts",
    "src/tests/unit/shared/services/router/routes.spec.ts",
    "src/tests/unit/shared/services/translation.spec.ts",
];

// Pure-TS helper tests that run in Node (no DOM globals needed).
// Note: csv.spec.ts uses document.createElement and URL.createObjectURL,
// so it belongs in the components project despite being a helper.
const unitHelperIncludes = [
    "src/tests/unit/shared/helpers/copy.spec.ts",
    "src/tests/unit/shared/helpers/string.spec.ts",
    "src/tests/unit/shared/helpers/type-check.spec.ts",
];

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            exclude: [...configDefaults.exclude, "e2e/**"],
            root: fileURLToPath(new URL("./", import.meta.url)),
            reporters: ["default", "./src/tests/unit/collect-guard-reporter.ts"],
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
                    "src/tests/**",
                ],
                thresholds: {lines: 100, functions: 100, branches: 100, statements: 100},
            },
            projects: [
                {
                    extends: true,
                    test: {
                        name: "unit",
                        environment: "node",
                        include: [
                            "src/tests/unit/shared/errors/**/*.spec.ts",
                            "src/tests/unit/shared/composables/useFormSubmit.spec.ts",
                            "src/tests/unit/architecture.spec.ts",
                            ...unitHelperIncludes,
                            ...unitServiceIncludes,
                        ],
                    },
                },
                {
                    extends: true,
                    test: {
                        name: "components",
                        environment: "happy-dom",
                        setupFiles: ["./src/tests/unit/setup.ts"],
                        include: ["src/tests/unit/shared/**/*.spec.ts"],
                        exclude: [
                            "src/tests/unit/shared/errors/**/*.spec.ts",
                            "src/tests/unit/shared/composables/useFormSubmit.spec.ts",
                            ...unitHelperIncludes,
                            ...unitServiceIncludes,
                        ],
                    },
                },
                {
                    extends: true,
                    test: {
                        name: "apps",
                        environment: "happy-dom",
                        setupFiles: ["./src/tests/unit/setup.ts"],
                        include: ["src/tests/unit/apps/**/*.spec.ts"],
                    },
                },
            ],
        },
    }),
);

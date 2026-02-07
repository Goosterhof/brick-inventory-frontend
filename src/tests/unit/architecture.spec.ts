import {readdirSync, readFileSync} from "node:fs";
import {basename, dirname, join, relative, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(CURRENT_DIR, "../..");
const SHARED_DIR = join(SRC_DIR, "shared");
const APPS_DIR = join(SRC_DIR, "apps");

const getSourceFiles = (dir: string): string[] => {
    return readdirSync(dir, {recursive: true, encoding: "utf-8"})
        .filter((file) => file.endsWith(".ts") || file.endsWith(".vue"))
        .map((file) => join(dir, file));
};

const getImportPaths = (filePath: string): string[] => {
    const content = readFileSync(filePath, "utf-8");
    const paths: string[] = [];

    const fromRegex = /\bfrom\s+["']([^"']+)["']/g;
    let match: RegExpExecArray | null = null;
    while ((match = fromRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath !== undefined) {
            paths.push(importPath);
        }
    }

    const sideEffectRegex = /^\s*import\s+["']([^"']+)["']\s*;?\s*$/gm;
    while ((match = sideEffectRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath !== undefined) {
            paths.push(importPath);
        }
    }

    return paths;
};

const getVueFiles = (dir: string): string[] => {
    return readdirSync(dir, {recursive: true, encoding: "utf-8"})
        .filter((file) => file.endsWith(".vue"))
        .map((file) => join(dir, file));
};

const getTsFiles = (dir: string): string[] => {
    return readdirSync(dir, {recursive: true, encoding: "utf-8"})
        .filter((file) => file.endsWith(".ts"))
        .map((file) => join(dir, file));
};

const getAppNames = (): string[] => {
    return readdirSync(APPS_DIR, {withFileTypes: true})
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
};

const dirExists = (dir: string): boolean => {
    try {
        readdirSync(dir);
        return true;
    } catch {
        return false;
    }
};

describe("Architecture", () => {
    describe("shared code must not import from app code", () => {
        it("should not contain imports from @app/ or app directories", () => {
            const sharedFiles = getSourceFiles(SHARED_DIR);
            const violations: string[] = [];

            for (const file of sharedFiles) {
                const imports = getImportPaths(file);
                const appImports = imports.filter((imp) => imp.startsWith("@app/") || imp.includes("/apps/"));

                if (appImports.length > 0) {
                    const rel = relative(SRC_DIR, file);
                    violations.push(`${rel} imports: ${appImports.join(", ")}`);
                }
            }

            expect(violations, "Shared code must not depend on app-specific code").toEqual([]);
        });
    });

    describe("apps must not import from other apps", () => {
        const appNames = getAppNames();

        for (const appName of appNames) {
            it(`${appName} should not import from other apps`, () => {
                const appDir = join(APPS_DIR, appName);
                const appFiles = getSourceFiles(appDir);
                const otherApps = appNames.filter((name) => name !== appName);
                const violations: string[] = [];

                for (const file of appFiles) {
                    const imports = getImportPaths(file);

                    for (const imp of imports) {
                        const hasDirectRef = otherApps.some((other) => imp.includes(`/apps/${other}`));

                        let resolvesToOtherApp = false;
                        if (imp.startsWith(".")) {
                            const resolved = resolve(dirname(file), imp);
                            resolvesToOtherApp = otherApps.some((other) => resolved.startsWith(join(APPS_DIR, other)));
                        }

                        if (hasDirectRef || resolvesToOtherApp) {
                            const rel = relative(SRC_DIR, file);
                            violations.push(`${rel} imports: ${imp}`);
                        }
                    }
                }

                expect(violations, `The ${appName} app must not import from other apps`).toEqual([]);
            });
        }
    });

    describe("component naming conventions", () => {
        it("should use multi-word PascalCase names for shared components", () => {
            const vueFiles = getVueFiles(join(SRC_DIR, "shared/components"));
            const violations: string[] = [];

            for (const file of vueFiles) {
                const name = basename(file, ".vue");
                const uppercaseCount = (name.match(/[A-Z]/g) ?? []).length;
                const isMultiWordPascalCase = uppercaseCount >= 2 && /^[A-Z][a-zA-Z]+$/.test(name);

                if (!isMultiWordPascalCase) {
                    violations.push(basename(file));
                }
            }

            expect(
                violations,
                "Shared components must use multi-word PascalCase names (e.g., FormLabel, TextInput)",
            ).toEqual([]);
        });

        it("should use PascalCase names ending with View for app views", () => {
            const appNames = getAppNames();
            const violations: string[] = [];

            for (const appName of appNames) {
                const viewsDir = join(APPS_DIR, appName, "views");
                try {
                    const vueFiles = getVueFiles(viewsDir);
                    for (const file of vueFiles) {
                        const name = basename(file, ".vue");
                        const isValidView = /^[A-Z][a-zA-Z]+View$/.test(name);

                        if (!isValidView) {
                            violations.push(`${appName}/${basename(file)}`);
                        }
                    }
                } catch {
                    // App may not have a views directory
                }
            }

            expect(
                violations,
                "View components must be PascalCase ending with View (e.g., HomeView, LoginView)",
            ).toEqual([]);
        });
    });

    describe("composable naming conventions", () => {
        it("should prefix composable filenames with 'use'", () => {
            const composablesDir = join(SHARED_DIR, "composables");
            if (!dirExists(composablesDir)) return;

            const tsFiles = getTsFiles(composablesDir);
            const violations: string[] = [];

            for (const file of tsFiles) {
                const name = basename(file, ".ts");
                if (name === "index") continue;

                if (!name.startsWith("use")) {
                    violations.push(basename(file));
                }
            }

            expect(violations, "Composable files must be prefixed with 'use' (e.g., useValidationErrors.ts)").toEqual(
                [],
            );
        });

        it("should export a function named with the 'use' prefix", () => {
            const composablesDir = join(SHARED_DIR, "composables");
            if (!dirExists(composablesDir)) return;

            const tsFiles = getTsFiles(composablesDir);
            const violations: string[] = [];

            for (const file of tsFiles) {
                const name = basename(file, ".ts");
                if (name === "index") continue;

                const content = readFileSync(file, "utf-8");
                const hasUseExport = /export\s+(const|function)\s+use[A-Z]/.test(content);

                if (!hasUseExport) {
                    violations.push(`${basename(file)} does not export a use* function`);
                }
            }

            expect(
                violations,
                "Composable files must export a function prefixed with 'use' (e.g., export const useAuth = ...)",
            ).toEqual([]);
        });
    });

    describe("app services must re-export through barrel file", () => {
        const appNames = getAppNames();

        for (const appName of appNames) {
            it(`${appName} services directory should have an index.ts barrel file`, () => {
                const servicesDir = join(APPS_DIR, appName, "services");
                if (!dirExists(servicesDir)) return;

                const files = readdirSync(servicesDir, {encoding: "utf-8"});
                expect(files, `${appName}/services/ must have an index.ts barrel file`).toContain("index.ts");
            });
        }
    });

    describe("views must not import from deep app service paths", () => {
        const appNames = getAppNames();

        for (const appName of appNames) {
            it(`${appName} views should import from @app/services, not @app/services/*`, () => {
                const viewsDir = join(APPS_DIR, appName, "views");
                if (!dirExists(viewsDir)) return;

                const viewFiles = getSourceFiles(viewsDir);
                const violations: string[] = [];

                for (const file of viewFiles) {
                    const imports = getImportPaths(file);

                    for (const imp of imports) {
                        // Allow @app/services but not @app/services/http, @app/services/auth, etc.
                        if (/^@app\/services\/.+/.test(imp)) {
                            const rel = relative(SRC_DIR, file);
                            violations.push(`${rel} imports: ${imp} (use @app/services barrel instead)`);
                        }

                        // Also catch relative deep service imports from views
                        if (imp.startsWith(".") && imp.includes("/services/") && !imp.endsWith("/services")) {
                            const resolved = resolve(dirname(file), imp);
                            const servicesDir = join(APPS_DIR, appName, "services");
                            if (resolved.startsWith(servicesDir) && resolved !== join(servicesDir, "index")) {
                                const rel = relative(SRC_DIR, file);
                                violations.push(`${rel} imports: ${imp} (use @app/services barrel instead)`);
                            }
                        }
                    }
                }

                expect(
                    violations,
                    `Views in ${appName} must import from @app/services (barrel), not individual service files`,
                ).toEqual([]);
            });
        }
    });

    describe("views must not import other views", () => {
        const appNames = getAppNames();

        for (const appName of appNames) {
            it(`${appName} views should not import from other view files`, () => {
                const viewsDir = join(APPS_DIR, appName, "views");
                if (!dirExists(viewsDir)) return;

                const viewFiles = getSourceFiles(viewsDir);
                const violations: string[] = [];

                for (const file of viewFiles) {
                    const imports = getImportPaths(file);

                    for (const imp of imports) {
                        // Check for @app/views/* imports
                        if (imp.startsWith("@app/views/")) {
                            const rel = relative(SRC_DIR, file);
                            violations.push(`${rel} imports: ${imp}`);
                        }

                        // Check relative imports to other views
                        if (imp.startsWith(".") && imp.includes("View")) {
                            const resolved = resolve(dirname(file), imp);
                            if (resolved.startsWith(viewsDir) && resolved !== file.replace(/\.\w+$/, "")) {
                                const rel = relative(SRC_DIR, file);
                                violations.push(`${rel} imports: ${imp}`);
                            }
                        }
                    }
                }

                expect(violations, `Views in ${appName} must not import other views directly`).toEqual([]);
            });
        }
    });

    describe("shared services must be factories, not singletons", () => {
        it("shared services should export functions, not pre-instantiated objects", () => {
            const servicesDir = join(SHARED_DIR, "services");
            if (!dirExists(servicesDir)) return;

            const tsFiles = getTsFiles(servicesDir);
            const violations: string[] = [];

            for (const file of tsFiles) {
                const name = basename(file, ".ts");
                if (name === "index") continue;

                const content = readFileSync(file, "utf-8");

                // Shared services should export factory functions (create*) or types, not instances
                // Check for suspicious top-level instantiation patterns
                const hasTopLevelInstance =
                    /^export\s+const\s+\w+\s*=\s*new\s+/m.test(content) ||
                    /^export\s+const\s+\w+\s*=\s*axios\.create/m.test(content);

                if (hasTopLevelInstance) {
                    violations.push(`${basename(file)} exports a pre-instantiated object (should export a factory)`);
                }
            }

            expect(
                violations,
                "Shared services should export factory functions (e.g., createHttpService), not singletons",
            ).toEqual([]);
        });
    });

    describe("test file structure", () => {
        it("test files should use .spec.ts extension", () => {
            const testsDir = join(SRC_DIR, "tests");
            if (!dirExists(testsDir)) return;

            const allFiles = readdirSync(testsDir, {recursive: true, encoding: "utf-8"}).filter(
                (file) => file.endsWith(".ts") && !file.endsWith(".d.ts"),
            );

            const testFiles = allFiles.filter((file) => !file.endsWith("setup.ts") && !file.includes("/helpers/"));
            const violations: string[] = [];

            for (const file of testFiles) {
                if (!file.endsWith(".spec.ts")) {
                    violations.push(file);
                }
            }

            expect(violations, "Test files must use .spec.ts extension").toEqual([]);
        });
    });
});

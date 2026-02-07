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

const getAppNames = (): string[] => {
    return readdirSync(APPS_DIR, {withFileTypes: true})
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
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
});

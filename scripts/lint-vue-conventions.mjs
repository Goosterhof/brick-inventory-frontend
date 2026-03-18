import {readdirSync, readFileSync, statSync} from "node:fs";
import {basename, join} from "node:path";

const errors = [];
const IGNORED_DIRS = ["node_modules", "dist", "coverage"];

const findFiles = (dir, extensions) => {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            if (!IGNORED_DIRS.includes(entry)) {
                files.push(...findFiles(path, extensions));
            }
        } else if (extensions.some((ext) => entry.endsWith(ext))) {
            files.push(path);
        }
    }
    return files;
};

// Accept file paths as arguments (for lint-staged) or scan all source files
const argFiles = process.argv.length > 2 ? process.argv.slice(2) : [];
const vueFiles = argFiles.length > 0 ? argFiles.filter((f) => f.endsWith(".vue")) : findFiles("src", [".vue"]);
const allSourceFiles =
    argFiles.length > 0
        ? argFiles.filter((f) => f.endsWith(".vue") || f.endsWith(".ts"))
        : findFiles("src", [".vue", ".ts"]);

// ── Vue-specific checks ────────────────────────────────────────────────────────

for (const file of vueFiles) {
    const name = basename(file, ".vue");
    const content = readFileSync(file, "utf-8");

    // Check 1: Multi-word PascalCase component names (App.vue is exempt)
    if (name !== "App") {
        const words = name.match(/[A-Z][a-z]*/g) || [];
        if (words.length < 2) {
            errors.push(
                `${file}: Component name "${name}" must be multi-word PascalCase (e.g., "UserProfile" not "${name}")`,
            );
        }
    }

    // Check 2: Block order — <script> before <template> before <style>
    const scriptIndex = content.search(/<script/);
    const templateIndex = content.search(/<template/);
    const styleIndex = content.search(/<style/);

    if (scriptIndex !== -1 && templateIndex !== -1 && scriptIndex > templateIndex) {
        errors.push(`${file}: <script> block must come before <template>`);
    }
    if (templateIndex !== -1 && styleIndex !== -1 && templateIndex > styleIndex) {
        errors.push(`${file}: <template> block must come before <style>`);
    }
    if (scriptIndex !== -1 && styleIndex !== -1 && scriptIndex > styleIndex) {
        errors.push(`${file}: <script> block must come before <style>`);
    }

    // Check 3: No defineExpose — use props/emits for parent-child communication
    if (content.includes("defineExpose")) {
        errors.push(`${file}: defineExpose is forbidden. Use props and emits for parent-child communication instead.`);
    }

    // Check 4: No <style> blocks — all styling via UnoCSS attributes (ADR-003)
    if (styleIndex !== -1) {
        errors.push(
            `${file}: <style> blocks are forbidden. Use UnoCSS attributify classes in the template instead (ADR-003).`,
        );
    }

    // Check 5: Define-macros order — defineProps before defineEmits before defineSlots
    const propsIndex = content.indexOf("defineProps");
    const emitsIndex = content.indexOf("defineEmits");
    const slotsIndex = content.indexOf("defineSlots");

    if (propsIndex !== -1 && emitsIndex !== -1 && propsIndex > emitsIndex) {
        errors.push(`${file}: defineProps must come before defineEmits`);
    }
    if (emitsIndex !== -1 && slotsIndex !== -1 && emitsIndex > slotsIndex) {
        errors.push(`${file}: defineEmits must come before defineSlots`);
    }
    if (propsIndex !== -1 && slotsIndex !== -1 && propsIndex > slotsIndex) {
        errors.push(`${file}: defineProps must come before defineSlots`);
    }

    // Check 6: No <RouterLink> or <router-link> in shared components (ADR-001)
    // The oxlint import ban catches JS imports, but globally registered components can be used without import
    if (file.startsWith("src/shared/") || file.includes("/shared/")) {
        const templateMatch = content.match(/<template[\s\S]*$/);
        if (templateMatch) {
            const template = templateMatch[0];
            if (/<RouterLink[\s/>]/.test(template) || /<router-link[\s/>]/.test(template)) {
                errors.push(
                    `${file}: <RouterLink>/<router-link> is forbidden in shared components (ADR-001). Use <a> tags with click emits instead.`,
                );
            }
        }
    }
}

// ── Cross-file checks (all .vue and .ts files) ─────────────────────────────────

// Check 7: No coverage ignore comments (ADR-005)
// istanbul ignore, v8 ignore, c8 ignore are all banned — every line must be tested or removed
const COVERAGE_IGNORE_PATTERN = /\/\*\s*(istanbul|v8|c8)\s+ignore\b/;

for (const file of allSourceFiles) {
    // Skip test files — they aren't subject to coverage ignore bans
    if (file.includes("/tests/") || file.endsWith(".spec.ts")) {
        continue;
    }

    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
        if (COVERAGE_IGNORE_PATTERN.test(lines[i])) {
            errors.push(
                `${file}:${i + 1}: Coverage ignore comments are forbidden (ADR-005). Restructure the code to be testable instead.`,
            );
        }
    }
}

// ── Report ──────────────────────────────────────────────────────────────────────

if (errors.length > 0) {
    console.error("Convention violations found:\n");
    for (const error of errors) {
        console.error(`  ${error}`);
    }
    console.error(`\n${errors.length} violation(s) found.`);
    process.exit(1);
} else {
    console.log("All conventions passed.");
}

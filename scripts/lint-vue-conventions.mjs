import {readdirSync, readFileSync, statSync} from "node:fs";
import {basename, join} from "node:path";

const errors = [];

const findVueFiles = (dir) => {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            if (!["node_modules", "dist", "coverage"].includes(entry)) {
                files.push(...findVueFiles(path));
            }
        } else if (entry.endsWith(".vue")) {
            files.push(path);
        }
    }
    return files;
};

// Accept file paths as arguments (for lint-staged) or scan all Vue files
const files = process.argv.length > 2 ? process.argv.slice(2).filter((f) => f.endsWith(".vue")) : findVueFiles("src");

for (const file of files) {
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

    // Check 3: Define-macros order — defineProps before defineEmits before defineSlots
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
}

if (errors.length > 0) {
    console.error("Vue convention violations found:\n");
    for (const error of errors) {
        console.error(`  ${error}`);
    }
    console.error(`\n${errors.length} violation(s) found.`);
    process.exit(1);
} else {
    console.log("All Vue conventions passed.");
}

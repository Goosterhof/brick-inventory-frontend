import {readdirSync, readFileSync, statSync} from "node:fs";
import {basename, join} from "node:path";

const CATALOG_PATH = ".claude/docs/brick-catalog.md";
const COMPONENTS_DIR = "src/shared/components";

// ── Collect actual component names from filesystem ───────────────────────────

const findVueFiles = (dir) => {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            files.push(...findVueFiles(path));
        } else if (entry.endsWith(".vue")) {
            files.push(basename(entry, ".vue"));
        }
    }
    return files;
};

const actualComponents = new Set(findVueFiles(COMPONENTS_DIR));

// ── Extract documented component names from catalog ──────────────────────────

const catalog = readFileSync(CATALOG_PATH, "utf-8");
const documentedComponents = new Set();

// Match ### headings (e.g., "### PrimaryButton")
const headingPattern = /^###\s+(\w+)$/gm;
let match;
while ((match = headingPattern.exec(catalog)) !== null) {
    if (actualComponents.has(match[1])) {
        documentedComponents.add(match[1]);
    }
}

// Match bold entries used for inline-documented components (e.g., "**TextInput**")
const boldPattern = /^\*\*(\w+)\*\*/gm;
while ((match = boldPattern.exec(catalog)) !== null) {
    if (actualComponents.has(match[1])) {
        documentedComponents.add(match[1]);
    }
}

// ── Compare ──────────────────────────────────────────────────────────────────

const errors = [];

const undocumented = [...actualComponents].filter((c) => !documentedComponents.has(c)).sort();
const stale = [...documentedComponents].filter((c) => !actualComponents.has(c)).sort();

for (const name of undocumented) {
    errors.push(`${COMPONENTS_DIR}: Component "${name}" exists but is not documented in ${CATALOG_PATH}`);
}

for (const name of stale) {
    errors.push(`${CATALOG_PATH}: Documents "${name}" but no matching .vue file found in ${COMPONENTS_DIR}`);
}

// ── Validate component count ─────────────────────────────────────────────────

const countMatch = catalog.match(/\*\*Total\*\*\s*\|\s*\*\*(\d+)\*\*/);
if (countMatch) {
    const claimedCount = Number(countMatch[1]);
    if (claimedCount !== actualComponents.size) {
        errors.push(
            `${CATALOG_PATH}: Claims ${claimedCount} total components but ${actualComponents.size} exist in ${COMPONENTS_DIR}`,
        );
    }
}

// ── Report ───────────────────────────────────────────────────────────────────

if (errors.length > 0) {
    console.error("Brick catalog drift detected:\n");
    for (const error of errors) {
        console.error(`  ${error}`);
    }
    console.error(`\n${errors.length} issue(s) found. Update ${CATALOG_PATH} to match ${COMPONENTS_DIR}.`);
    process.exit(1);
} else {
    console.log(`Brick catalog validated: ${actualComponents.size} components documented and accounted for.`);
}

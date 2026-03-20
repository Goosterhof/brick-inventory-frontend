import type {SerializedError} from "vitest";
import type {TestModule, Vitest} from "vitest/node";
import type {Reporter, TestRunEndReason} from "vitest/reporters";

/**
 * A Vitest reporter that enforces a maximum collect duration per test file.
 *
 * Collect duration measures how long Vitest spends importing the test module and
 * all of its transitive dependencies before any test runs. A high collect duration
 * signals that a test file is pulling in a deep import chain that should be mocked.
 *
 * The threshold is calibrated against the current codebase. Pure helpers/services
 * collect in 15–200ms. Component tests that properly mock their dependencies stay
 * under 2000ms. Anything above signals an unmocked heavy dependency.
 */

const COLLECT_DURATION_THRESHOLD_MS = 2000;

class CollectGuardReporter implements Reporter {
    private violations: Array<{file: string; collectMs: number}> = [];
    private vitest: Vitest | null = null;

    onInit(vitest: Vitest): void {
        this.vitest = vitest;
    }

    onTestModuleEnd(module: TestModule): void {
        const collectMs = module.diagnostic().collectDuration;

        if (collectMs > COLLECT_DURATION_THRESHOLD_MS) {
            const file = module.moduleId.replace(/.*src\/tests\/unit\//, "");
            this.violations.push({file, collectMs: Math.round(collectMs)});
        }
    }

    onTestRunEnd(
        _testModules: ReadonlyArray<TestModule>,
        _errors: ReadonlyArray<SerializedError>,
        _reason: TestRunEndReason,
    ): void {
        if (this.violations.length === 0) {
            return;
        }

        const sorted = this.violations.sort((a, b) => b.collectMs - a.collectMs);
        const lines = sorted.map((v) => `  ${v.collectMs}ms | ${v.file}`);

        const message = [
            "",
            "\x1b[1m\x1b[31m COLLECT GUARD \x1b[0m Import chain too slow in test files:",
            "",
            `  Threshold: ${COLLECT_DURATION_THRESHOLD_MS}ms`,
            "",
            ...lines,
            "",
            "  Fix: mock heavy dependencies with vi.mock() so the import chain stays shallow.",
            "  See ADR-010 for the test isolation policy.",
            "",
        ].join("\n");

        console.error(message);

        // Throwing from onTestRunEnd is the only reliable way to set a non-zero
        // exit code from a Vitest reporter. Vitest catches it, prints it as an
        // "Unhandled Error", and exits with code 1.
        throw new Error(
            `Collect guard: ${this.violations.length} file(s) exceeded ${COLLECT_DURATION_THRESHOLD_MS}ms collect threshold`,
        );
    }
}

export default CollectGuardReporter;

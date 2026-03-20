import type {SerializedError} from "vitest";
import type {TestModule} from "vitest/node";
import type {Reporter, TestRunEndReason} from "vitest/reporters";

/**
 * A Vitest reporter that enforces collect-duration limits per test file.
 *
 * Collect duration measures how long Vitest spends importing the test module and
 * all of its transitive dependencies before any test runs. A high collect duration
 * signals that a test file is pulling in a deep import chain that should be mocked
 * with a factory function.
 *
 * Two tiers:
 * - Warning (200–500ms): printed but does not fail the suite
 * - Failure (500ms+): fails the suite with exit code 1
 *
 * See ADR-010 for the full test isolation policy.
 */

const WARN_THRESHOLD_MS = 200;
const FAIL_THRESHOLD_MS = 500;

class CollectGuardReporter implements Reporter {
    private warnings: Array<{file: string; collectMs: number}> = [];
    private violations: Array<{file: string; collectMs: number}> = [];

    onTestModuleEnd(module: TestModule): void {
        const collectMs = module.diagnostic().collectDuration;
        const file = module.moduleId.replace(/.*src\/tests\/unit\//, "");

        if (collectMs > FAIL_THRESHOLD_MS) {
            this.violations.push({file, collectMs: Math.round(collectMs)});
        } else if (collectMs > WARN_THRESHOLD_MS) {
            this.warnings.push({file, collectMs: Math.round(collectMs)});
        }
    }

    onTestRunEnd(
        _testModules: ReadonlyArray<TestModule>,
        _errors: ReadonlyArray<SerializedError>,
        _reason: TestRunEndReason,
    ): void {
        if (this.warnings.length > 0) {
            const sorted = this.warnings.sort((a, b) => b.collectMs - a.collectMs);
            const lines = sorted.map((v) => `  ${v.collectMs}ms | ${v.file}`);

            const message = [
                "",
                "\x1b[1m\x1b[33m COLLECT GUARD \x1b[0m Warning — import chain getting heavy:",
                "",
                `  Threshold: ${WARN_THRESHOLD_MS}ms`,
                "",
                ...lines,
                "",
                "  Consider mocking heavy dependencies with vi.mock(() => ({...})).",
                "  See ADR-010 for the test isolation policy.",
                "",
            ].join("\n");

            console.warn(message);
        }

        if (this.violations.length === 0) {
            return;
        }

        const sorted = this.violations.sort((a, b) => b.collectMs - a.collectMs);
        const lines = sorted.map((v) => `  ${v.collectMs}ms | ${v.file}`);

        const message = [
            "",
            "\x1b[1m\x1b[31m COLLECT GUARD \x1b[0m Import chain too slow in test files:",
            "",
            `  Threshold: ${FAIL_THRESHOLD_MS}ms`,
            "",
            ...lines,
            "",
            "  Fix: mock heavy dependencies with vi.mock(() => ({...})) so the import chain stays shallow.",
            "  See ADR-010 for the test isolation policy.",
            "",
        ].join("\n");

        console.error(message);

        // Throwing from onTestRunEnd is the only reliable way to set a non-zero
        // exit code from a Vitest reporter. Vitest catches it, prints it as an
        // "Unhandled Error", and exits with code 1.
        throw new Error(
            `Collect guard: ${this.violations.length} file(s) exceeded ${FAIL_THRESHOLD_MS}ms collect threshold`,
        );
    }
}

export default CollectGuardReporter;

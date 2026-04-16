import type {SerializedError} from "vitest";
import type {TestModule} from "vitest/node";
import type {Reporter, TestRunEndReason} from "vitest/reporters";

/**
 * A Vitest reporter that enforces per-file test execution time limits.
 *
 * Execution time (diagnostic().duration) measures how long all tests and hooks
 * in a file take to run. A high execution time signals one of:
 * - Insufficient mocking (real I/O, heavy dependencies not stubbed)
 * - File too large (too many tests in one file)
 * - Expensive test setup/teardown
 *
 * Execution time varies under full-suite load due to thread contention and
 * worker pool pressure — tests routinely measure 1.5–2x slower in the full
 * suite vs isolated project runs.
 *
 * Two tiers:
 * - Warning (300–2000ms): printed but does not fail the suite
 * - Failure (2000ms+): fails the suite with exit code 1
 *
 * See ADR-010 for the full test isolation policy.
 */

const WARN_THRESHOLD_MS = 300;
const FAIL_THRESHOLD_MS = 2000;

interface FileEntry {
    project: string;
    file: string;
    durationMs: number;
    testCount: number;
}

class TestGuardReporter implements Reporter {
    private warnings: FileEntry[] = [];
    private violations: FileEntry[] = [];

    onTestModuleEnd(module: TestModule): void {
        const durationMs = Math.round(module.diagnostic().duration);
        const file = module.moduleId.replace(/.*src\/tests\/unit\//, "");
        const project = module.project.name;
        const testCount = [...module.children.allTests()].length;

        const entry: FileEntry = {project, file, durationMs, testCount};

        if (durationMs >= FAIL_THRESHOLD_MS) {
            this.violations.push(entry);
        } else if (durationMs >= WARN_THRESHOLD_MS) {
            this.warnings.push(entry);
        }
    }

    onTestRunEnd(
        _testModules: ReadonlyArray<TestModule>,
        _errors: ReadonlyArray<SerializedError>,
        _reason: TestRunEndReason,
    ): void {
        if (this.warnings.length > 0) {
            const sorted = this.warnings.sort((a, b) => b.durationMs - a.durationMs);
            const lines = sorted.map((v) => `  [${v.project}] ${v.durationMs}ms | ${v.testCount} tests | ${v.file}`);

            const message = [
                "",
                "\x1b[1m\x1b[33m TEST GUARD \x1b[0m Test files getting slow:",
                "",
                `  Threshold: ${WARN_THRESHOLD_MS}ms`,
                "",
                ...lines,
                "",
                "  Consider: mock heavy dependencies, split large files, or reduce setup overhead.",
                "  See ADR-010 for the test isolation policy.",
                "",
            ].join("\n");

            console.warn(message);
        }

        if (this.violations.length === 0) {
            return;
        }

        const sorted = this.violations.sort((a, b) => b.durationMs - a.durationMs);
        const lines = sorted.map((v) => `  [${v.project}] ${v.durationMs}ms | ${v.testCount} tests | ${v.file}`);

        const message = [
            "",
            "\x1b[1m\x1b[31m TEST GUARD \x1b[0m Test files too slow:",
            "",
            `  Threshold: ${FAIL_THRESHOLD_MS}ms`,
            "",
            ...lines,
            "",
            "  Fix: mock heavy dependencies, split large files, or reduce setup overhead.",
            "  See ADR-010 for the test isolation policy.",
            "",
        ].join("\n");

        console.error(message);

        throw new Error(
            `Test guard: ${this.violations.length} file(s) exceeded ${FAIL_THRESHOLD_MS}ms execution threshold`,
        );
    }
}

export default TestGuardReporter;

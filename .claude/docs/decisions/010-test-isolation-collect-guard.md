# Decision: Test isolation via auto-mocking and collect-duration guard

**Date**: 2026-03-20
**Feature**: Test suite performance and isolation infrastructure
**Status**: accepted
**Transferability**: universal

## Context

The test suite runs 76 spec files with 934 tests under a strict 100% coverage policy (ADR-005). Test execution time matters — it runs on every pre-push via Husky, so a slow suite directly blocks developer velocity.

Vitest measures two distinct phases per test file: **collect** (importing the test module and all transitive dependencies) and **execute** (running the actual test functions). In this codebase, collect duration dominates wall-clock time. A single unmocked barrel export — like `@phosphor-icons/vue`, which re-exports ~700 icon components — can add 500–1500ms to every component test that transitively imports it.

The problem compounds silently. Developer A adds a component that imports from the icon library. Developer B writes a test for a page that uses that component via `shallowMount`. The page test now transitively imports the entire icon library during collection, even though `shallowMount` stubs it out before any test runs. Neither developer sees the cost individually — it only shows up as the suite gradually slowing from 15 seconds to 45 seconds over a few weeks.

The question: how do we prevent transitive import chains from degrading test performance, without relying on every developer to remember which packages need mocking?

## Options Considered

| Option | Pros | Cons | Why eliminated / Why chosen |
| --- | --- | --- | --- |
| **Do nothing — let developers mock per-file** | No infrastructure needed. Each test file controls its own mocks | Relies on every developer knowing which packages are expensive. Forgotten mocks compound silently. No feedback loop — you don't know your test is slow until the whole suite is slow | Eliminated — doesn't scale for a junior team |
| **Global auto-mock in setup.ts only** | One-time fix for known heavy packages. Every test benefits automatically | Only catches packages you already know about. New heavy dependencies slip through without warning | Eliminated — reactive, not proactive |
| **Collect-duration guard reporter only** | Catches any slow import chain regardless of source. Fails the suite when a file exceeds the threshold | Developers get a failure with no pre-emptive protection. They must diagnose which dependency is slow and add a mock after the fact | Eliminated — better as a safety net than a standalone strategy |
| **Global auto-mock + collect-duration guard (layered)** | Auto-mock handles known offenders proactively. Guard catches unknown offenders reactively. Two layers — prevention and detection | Requires maintaining two pieces of infrastructure. Auto-mock list must be curated (over-mocking hides real import issues) | **Chosen** — defense in depth: prevent what you can, detect what you can't |

## Decision

Two-layer test isolation strategy:

### Layer 1: Global auto-mocks in `setup.ts`

Packages with expensive barrel exports that are transitively imported by many components are auto-mocked globally in the Vitest setup file. This runs before any test file is collected, so the import chain never executes.

```ts
// src/tests/unit/setup.ts
vi.mock("@phosphor-icons/vue");
```

**Criteria for adding a package to the auto-mock list:**
1. It has a barrel export that triggers loading of many submodules
2. It is transitively imported by 3+ test files via component dependencies
3. No test in the suite needs the real implementation (all icon rendering is tested via stub presence, not pixel output)

The auto-mock list should be small and stable. If it grows beyond 3–4 entries, that signals a dependency problem in the source code, not a testing problem.

### Layer 2: Collect-duration guard reporter

A custom Vitest reporter (`collect-guard-reporter.ts`) measures the collect duration of every test file and fails the suite if any file exceeds 2000ms.

**Threshold calibration:** Pure helper/service tests collect in 15–200ms. Component tests with proper mocking collect in 200–800ms. The 2000ms threshold catches genuinely problematic import chains while leaving headroom for CI environment variance.

**Failure mode:** The reporter throws from `onTestRunEnd`, which causes Vitest to exit with code 1. The error message lists all violating files sorted by duration, with a pointer to this ADR for remediation guidance.

**Remediation when a test file exceeds the threshold:**
1. Identify the heavy transitive dependency (usually a barrel export or a large library)
2. Add a `vi.mock()` call in the test file for that specific dependency
3. If the dependency is imported by 3+ test files, escalate it to the global auto-mock list in `setup.ts`

### What this does NOT cover

- **Test execution time** — only collect (import) duration is guarded. A test with a slow `setTimeout` or expensive computation won't trigger the guard
- **Total suite duration** — no aggregate time budget. Individual file isolation is sufficient for now
- **Runtime import mocking** — `vi.mock()` operates at the module level. Dynamic `import()` calls within tested code are not intercepted by the guard

## Consequences

- **Predictable test performance** — import chains are bounded. Adding a new component doesn't silently slow the entire suite
- **Self-documenting failures** — when a test file exceeds the threshold, the error message explains what happened and how to fix it. Juniors don't need to debug Vitest internals
- **Maintenance cost** — the auto-mock list and threshold need periodic review. If the icon library is replaced or tree-shaking improves, the auto-mock may become unnecessary
- **False safety from auto-mocks** — global mocking means tests never exercise the real import path. If `@phosphor-icons/vue` ships a breaking change to its export structure, no test will catch it. This is acceptable because icon rendering is tested via stub presence, not real component output

## Enforcement

| What | Mechanism | Scope |
| --- | --- | --- |
| Known heavy dependencies auto-mocked | `vi.mock()` calls in `src/tests/unit/setup.ts` | All test files (global setup) |
| Import chain duration limit | `collect-guard-reporter.ts` custom Vitest reporter | Every `.spec.ts` file, 2000ms threshold |
| Reporter registered in config | `vitest.config.ts` reporters array | Suite-wide |
| Pre-push gate | Husky pre-push hook runs `test:coverage` which includes the reporter | All pushes |

## Open Questions

- Should the collect-guard threshold be environment-aware? CI machines may be slower than local dev. Current assessment: 2000ms has enough headroom, but if CI-only failures become frequent, a configurable threshold via environment variable may be needed.
- As the component count grows, will the auto-mock list need to expand beyond icon libraries? Current candidates: none. If a second package hits the criteria, add it to setup.ts and update this ADR.

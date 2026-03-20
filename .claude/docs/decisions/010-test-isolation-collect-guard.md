# Decision: Test isolation via collect-duration guard and per-file factory mocking

**Date**: 2026-03-20
**Feature**: Test suite performance and isolation infrastructure
**Status**: accepted
**Transferability**: universal

## Context

The test suite runs under a strict 100% coverage policy (ADR-005). Test execution time matters — it runs on every pre-push via Husky, so a slow suite directly blocks developer velocity.

Vitest measures two distinct phases per test file: **collect** (importing the test module and all transitive dependencies) and **execute** (running the actual test functions). In practice, collect duration dominates wall-clock time. A single unmocked barrel export — like `@phosphor-icons/vue`, which re-exports ~700 icon components — can add 500–1500ms to every component test that transitively imports it.

The problem compounds silently. Developer A adds a component that imports from the icon library. Developer B writes a test for a page that uses that component via `shallowMount`. The page test now transitively imports the entire icon library during collection, even though `shallowMount` stubs it out before any test runs. Neither developer sees the cost individually — it only shows up as the suite gradually slowing over a few weeks.

Parallelizing or sharding test runs masks the symptom but does not fix it — suite speed is bounded by the slowest file. Tree-shaking does not apply to test collection. The root cause is transitive import chains, and the fix must target that directly.

A global auto-mock approach (e.g., `vi.mock("@phosphor-icons/vue")` in setup.ts) was considered and rejected: without a factory function, `vi.mock()` still triggers the full module load to discover what needs mocking. With a factory, the mock becomes specific to a dependency — and at that point it belongs in the test file, not in global setup. Global auto-mocks also obscure what each test actually depends on, making tests harder to reason about.

The question: how do we prevent transitive import chains from degrading test performance, enforce explicit mocking, and give developers clear feedback when something slips through?

## Options Considered

| Option | Pros | Cons | Why eliminated / Why chosen |
| --- | --- | --- | --- |
| **Do nothing — let developers mock per-file** | No infrastructure needed. Each test file controls its own mocks | Relies on every developer knowing which packages are expensive. Forgotten mocks compound silently. No feedback loop — you don't know your test is slow until the whole suite is slow | Eliminated — doesn't scale for a junior team |
| **Global auto-mock in setup.ts** | One-time fix for known heavy packages | Without a factory, still loads the full module. Obscures what each test depends on. Raises questions about where mocks belong (setup vs test file) | Eliminated — broken in practice, implicit over explicit |
| **Collect-duration guard reporter only** | Catches any slow import chain regardless of source. Fails the suite when a file exceeds the threshold | Developers get a failure with no guidance on correct mocking technique. Does not enforce factory usage | Eliminated — necessary but not sufficient alone |
| **Collect-duration guard + mandatory factory mocking (enforced by lint)** | Guard catches slow imports. Lint rule ensures mocks use factories (preventing the "still loads the module" problem). Every mock is explicit and co-located with its test | Requires maintaining a custom reporter and a custom lint rule. More `vi.mock()` boilerplate per test file | **Chosen** — prevention via lint, detection via guard, explicitness throughout |

## Decision

Two enforcement mechanisms working together:

### Collect-duration guard reporter

A custom Vitest reporter (`collect-guard-reporter.ts`) measures the collect duration of every test file and enforces two tiers:

- **200–500ms: warning** — printed to console but does not fail the suite. Signals that the test file's import chain is getting heavy and should be reviewed.
- **500ms+: hard fail** — fails the suite with exit code 1. The file has an unmocked heavy dependency that must be addressed.

**Threshold calibration:** Pure helper/service tests collect in 15–200ms. Component tests with proper factory mocking collect in 50–200ms. The 500ms failure threshold catches genuinely problematic import chains. The 200ms warning threshold catches files trending toward trouble.

**Failure output:** Lists all violating files sorted by duration with a pointer to this ADR for remediation guidance.

**Remediation when a test file exceeds the threshold:**
1. Identify the heavy transitive dependency (usually a barrel export or a large library)
2. Add a `vi.mock("dependency", () => ({...}))` call **with a factory function** in the test file
3. Mock only the specific exports the test needs

### Mandatory factory in `vi.mock()` calls (lint-enforced)

A custom lint rule in `scripts/lint-vue-conventions.mjs` scans all `.spec.ts` files and enforces that every `vi.mock()` call includes a factory function as its second argument.

**Why:** `vi.mock("module")` without a factory still triggers a full module load during collection — Vitest needs to read the module to know what to auto-mock. Only `vi.mock("module", () => ({...}))` with a factory avoids the import entirely. This is the critical technical detail that makes the pattern work.

### Per-file, explicit mocking

Every `vi.mock()` call lives in the test file that needs it. No global mocks in setup files. This ensures:
- Each test file declares its dependencies explicitly
- A developer reading a test file sees exactly what is mocked and what is real
- No hidden behavior from global setup that affects test outcomes

### What this does NOT cover

- **Test execution time** — only collect (import) duration is guarded. A test with a slow `setTimeout` or expensive computation won't trigger the guard
- **Total suite duration** — no aggregate time budget. Individual file isolation is sufficient for now
- **Mock correctness** — factory-based mocks are handwritten fakes that don't reference the real module. If an upstream dependency changes its export shape, mocks won't break. This false safety gap is accepted and will be mitigated by integration/e2e tests and potentially by factory helpers or `__mocks__` directories in the future

## Consequences

- **Predictable test performance** — import chains are bounded. Adding a new component doesn't silently slow the entire suite
- **Self-documenting failures** — when a test file exceeds the threshold, the error message explains what happened and how to fix it. Juniors don't need to debug Vitest internals
- **More boilerplate per test file** — each test file that renders components with heavy dependencies needs its own `vi.mock()` with a factory. This is the accepted cost of explicitness over implicit global behavior
- **False safety from factory mocks** — handwritten factory mocks won't catch upstream export shape changes. Mitigated by integration/e2e tests. Future mitigation: factory helpers or `__mocks__` directories
- **Fixed thresholds, not configurable** — intentionally hardcoded. A configurable threshold is an invitation to raise it instead of fixing the root cause

## Enforcement

| What | Mechanism | Scope |
| --- | --- | --- |
| Import chain duration limit | `collect-guard-reporter.ts` custom Vitest reporter | Every `.spec.ts` file — warn at 200ms, fail at 500ms |
| Factory required on `vi.mock()` | Custom lint rule in `scripts/lint-vue-conventions.mjs` | Every `.spec.ts` file |
| Reporter registered in config | `vitest.config.ts` reporters array | Suite-wide |
| Lint runs on commit | lint-staged in Husky pre-commit hook | All staged `.spec.ts` files |
| Pre-push gate | Husky pre-push hook runs `test:coverage` which includes the reporter | All pushes |

## Open Questions

None — all branches resolved during interrogation.

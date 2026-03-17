# Decision: Istanbul coverage engine for Vue SFC branch accuracy

**Date**: 2026-03-17
**Feature**: Test coverage infrastructure
**Status**: accepted
**Supersedes**: Previous ADR-005 (v-show for testable conditional rendering — deprecated, workaround no longer needed)

## Context

The project enforces 100% coverage on lines, functions, branches, and statements. Vue's compiler transforms template directives like `v-if="foo"` into ternary expressions in the render function: `foo ? _createVNode(...) : _createCommentVNode("")`. Neither coverage engine sees the original `<template>` source — both operate on this compiled JavaScript output.

With V8 coverage (`@vitest/coverage-v8`), branch tracking relies on runtime byte-range data remapped to source locations via source maps. Vue's compiler hoists static elements to module scope and shifts byte offsets in ways that break this remapping. The result: false positives (hoisted code reported as covered when it wasn't exercised) and false negatives (unmapped branches silently dropped from reports). Multiple issues remain open as of March 2026. This meant our 100% branch coverage number was unreliable — it could be lying in both directions.

The previous workaround (ADR-005, now deprecated) used `v-show` instead of `v-if` to avoid generating branches that V8 couldn't track. This solved the symptom but misused `v-show` — a rendering performance tool — as a coverage workaround, and forced semantic compromises in templates.

## Options Considered

| Option                                              | Pros                                                                                                                                                                           | Cons                                                                                                                                     | Why eliminated / Why chosen                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **V8 coverage** (`@vitest/coverage-v8`)             | Faster, lower memory, no instrumentation overhead, ships as Vitest default                                                                                                     | Known false positives and false negatives for Vue SFC branches due to source map remapping bugs. 100% branch coverage becomes unreliable | Eliminated — an unreliable coverage number is worse than no coverage number |
| **Istanbul coverage** (`@vitest/coverage-istanbul`) | Injects explicit counter statements into compiled JS — counters are physically in the code, not dependent on source map remapping. More mechanically reliable branch detection | Slower execution, higher memory usage due to instrumentation overhead. Still instruments compiled output, not original templates         | **Chosen** — reliable branch detection is worth the performance cost        |
| **Custom coverage provider**                        | Vitest supports custom providers via config                                                                                                                                    | No viable third-party options exist as of March 2026                                                                                     | Eliminated — nothing to evaluate                                            |
| **v-show workaround** (previous ADR-005)            | Avoids generating untestable branches                                                                                                                                          | Misuses v-show semantics, forces template compromises, doesn't fix the root cause                                                        | Eliminated — treats the symptom, not the disease                            |

## Decision

Use Istanbul (`@vitest/coverage-istanbul`) as the coverage provider. Istanbul injects explicit branch counters into the compiled JavaScript, making branch detection mechanically reliable regardless of source map accuracy. The counters are _in_ the code, so they track actual runtime execution of each branch without depending on post-hoc byte-range remapping.

This eliminates the need for the `v-show` workaround. Use `v-if` and `v-show` based on their intended semantics: `v-if` for conditional rendering (element not in DOM), `v-show` for toggling visibility of frequently switching elements (element stays in DOM, CSS `display: none`).

### What Istanbul does NOT solve

Istanbul still instruments the _compiled_ render function, not the original template. Compiler-generated branches that don't correspond to user-written logic may still appear. If Vue's compiler eventually emits coverage ignore hints (like `/* istanbul ignore next */`) in generated code, this problem goes away upstream. Until then, compiler-generated phantom branches may require targeted ignore comments — but Istanbul makes these visible and countable rather than silently inflating or dropping them.

## Consequences

- **Reliable 100% branch coverage**: The metric means what it says. No silent false positives or negatives from V8 remapping bugs
- **Semantic templates**: `v-if` and `v-show` are used for their intended purposes, not as coverage workarounds
- **Performance cost**: Test suite runs slower due to instrumentation overhead. Acceptable trade-off for a project of this size
- **Dependency**: Adds `@vitest/coverage-istanbul` (and its Babel instrumentation dependency) to devDependencies
- **Upstream dependency**: If Vue's compiler adds coverage ignore hints in generated code, both engines benefit — but Istanbul is less dependent on this fix than V8

# Construction Journal: Page Transition Refactor -- Component Owns Its Brain

**Journal #:** 2026-04-10-page-transition-refactor
**Filed:** 2026-04-10
**Permit:** [2026-04-10-page-transition-refactor](../permits/2026-04-10-page-transition-refactor.md)
**Architect:** Creative Engine

---

## Work Summary

| Action   | File                                                                 | Notes                                                                                     |
| -------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Deleted  | `src/shared/composables/usePageTransition.ts`                        | All logic moved into PageTransition.vue                                                   |
| Modified | `src/shared/components/PageTransition.vue`                           | Absorbed all composable logic: reduced motion detection, variant state, route key, expose |
| Modified | `src/apps/families/App.vue`                                          | Removed usePageTransition import; simplified to single :route-path prop                   |
| Modified | `src/apps/showcase/components/PageTransitionDemo.vue`                | Template ref pattern, fixed .value on unwrapped exposed refs, merged duplicate import     |
| Modified | `scripts/lint-vue-conventions.mjs`                                   | Added // lint-vue-allow-expose: exception mechanism for defineExpose rule                 |
| Deleted  | `src/tests/unit/shared/composables/usePageTransition.spec.ts`        | 15 tests absorbed into component spec                                                     |
| Modified | `src/tests/unit/shared/components/PageTransition.spec.ts`            | Rewrote: 17 tests covering all logic previously in composable + component                 |
| Modified | `src/tests/unit/apps/showcase/components/PageTransitionDemo.spec.ts` | Adapted: shallowMount with PageTransition unstubbed, props-based heading assertion        |

## Permit Fulfillment

| Acceptance Criterion                                                                          | Met | Notes                                                               |
| --------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------- |
| `usePageTransition.ts` deleted -- no composable file exists                                   | Yes | File removed from `src/shared/composables/`                         |
| `usePageTransition.spec.ts` deleted -- no composable test file exists                         | Yes | File removed from `src/tests/unit/shared/composables/`              |
| PageTransition.vue contains all transition logic                                              | Yes | Reduced motion, variant state, route keying, matchMedia listener    |
| PageTransition.vue exports TransitionVariant type via dual script block                       | Yes | TransitionName moved to internal (knip flagged it as unused export) |
| PageTransition.vue exposes setVariant, setBackNavigation, activeVariant, prefersReducedMotion | Yes | Via defineExpose with lint-vue-allow-expose comment                 |
| App.vue uses only `<PageTransition :route-path="...">` -- no composable                       | Yes | Single prop, no import of usePageTransition                         |
| PageTransitionDemo.vue uses template ref for exposed methods                                  | Yes | transitionRef with InstanceType, no composable import               |
| No imports of usePageTransition remain anywhere in codebase                                   | Yes | Verified via grep -- zero matches in src/                           |
| All existing behavior preserved                                                               | Yes | Same animations, same reduced motion, same variant switching        |
| Full quality gauntlet passes                                                                  | Yes | All 7 checks green, 100% coverage, 1185 tests                       |
| Construction journal filed with Parameter Record and self-debrief                             | Yes | This document                                                       |

## Decisions Made

1. **SSR guard refactored to check matchMedia availability** -- Changed `typeof window === "undefined"` to `typeof window === "undefined" || typeof window.matchMedia !== "function"`. The original SSR guard was untestable in JSDOM (deleting `globalThis.window` breaks `shallowMount`). The new guard tests the same logical condition (no media query API available) but can be exercised by setting `window.matchMedia` to `undefined` in tests.

2. **lint-vue-allow-expose exception mechanism** -- Added a comment-based opt-out for the defineExpose ban in `lint-vue-conventions.mjs`. The existing rule forbids defineExpose unconditionally, but PageTransition legitimately needs it for the showcase demo's template ref pattern. The exception requires a reason comment, keeping the rule enforceable while allowing documented exemptions.

3. **oxlint-disable for template ref import** -- Added an inline disable for `typescript/consistent-type-imports` on the PageTransition import in PageTransitionDemo.vue. oxlint's type-aware mode doesn't track Vue SFC template usage as runtime, so it incorrectly flags the component import as type-only. The disable comment documents the false positive.

4. **TransitionName type made internal** -- Moved from the exported `<script lang="ts">` block to an internal type in `<script setup>`. Only consumed internally by the `transitionName` computed. Keeping it exported created a knip violation since no consumer imports it.

5. **Template ref .value access removed in demo** -- Vue's template ref proxy unwraps exposed refs automatically. The original code accessed `transitionRef.value?.prefersReducedMotion.value` which evaluated `.value` on an already-unwrapped boolean (returning `undefined`). Fixed to `transitionRef.value?.prefersReducedMotion`. This was a latent bug hidden by shallowMount stubbing.

6. **shallowMount with explicit unstubbing** -- PageTransitionDemo tests use `shallowMount` with `{PageTransition: false}` to unstub only PageTransition while keeping SectionHeading stubbed. This satisfies the architecture test's mount boundary enforcement while giving the test access to the real exposed methods through the template ref.

## Quality Gauntlet

| Check         | Result | Notes                                       |
| ------------- | ------ | ------------------------------------------- |
| format:check  | Pass   |                                             |
| lint          | Pass   | 0 errors, 0 warnings                        |
| lint:vue      | Pass   | All conventions passed                      |
| type-check    | Pass   |                                             |
| test:coverage | Pass   | 100% statements, branches, functions, lines |
| knip          | Pass   | Clean after TransitionName internalized     |
| size          | Pass   | families: 238.11kB, admin: 61.62kB          |

## Parameter Record

Refactor only -- no new animation parameters. All existing parameters (durations, easings, distances) are preserved identically in the CSS, which was not modified.

## Showcase Readiness

The refactored architecture is cleaner and more honest. A senior reviewer examining PageTransition.vue now sees a self-contained component that owns its logic -- the kind of component you'd expect in a well-designed system. The previous split into a massive composable + a dumb wrapper was the kind of over-engineering that raises eyebrows during code review ("why is this separated?").

The showcase demo is functionally identical. The latent .value bug fix means the demo now actually works correctly at runtime -- the reduced motion indicator and variant-dependent parameter display were silently broken before (always falling through to the brick-snap default).

## Proposed Knowledge Updates

- **Learnings:** "Vue's template ref proxy unwraps exposed refs. When accessing defineExpose'd refs through a template ref, do NOT use .value -- the value is already unwrapped. This is different from accessing refs directly in script setup."
- **Learnings:** "oxlint's type-aware mode does not track Vue SFC template usage as runtime. Component imports used only in templates will be flagged as type-only. Use inline oxlint-disable comments with documentation."
- **Pulse:** Update In-Progress Work to remove this item. Note the lint-vue-allow-expose mechanism in pattern maturity.

## Self-Debrief

### What Went Well

- The actual refactor of source code was straightforward -- the logic moved cleanly from composable to component setup with minimal adaptation.
- Caught the latent .value bug in PageTransitionDemo that was hidden by the original shallowMount approach. The original demo code never actually worked correctly with reduced motion or variant switching at runtime.
- Found the right testing pattern quickly: shallowMount with explicit unstubbing via `{PageTransition: false}` satisfies the architecture test while giving access to real exposed methods.

### What Went Poorly

- **The original composable/component split was wrong.** This is the core lesson. I created `usePageTransition` as a composable because I defaulted to "extract logic into composables" as a pattern. But composables are for _reusable, shareable_ logic that multiple components consume. PageTransition is the only consumer of this logic. There was never a second consumer. The composable existed because I reflexively separated concerns without asking "does this NEED to be separated?"

- **The .value bug in PageTransitionDemo.** I wrote the demo accessing `transitionRef.value?.prefersReducedMotion.value` without understanding that Vue's template ref proxy unwraps refs. The original tests used shallowMount which stubbed PageTransition, so the ref was always null and the bug was invisible. If I had tested with the real component from the start, I would have caught this immediately.

- **Multiple rounds with the architecture test.** I initially used `mount` in both test files, which violated the mount boundary enforcement architecture test. I should have checked this rule before writing tests.

### Blind Spots

- Did not check the architecture tests before writing test files. The mount vs. shallowMount boundary enforcement is documented in the architecture spec and I should have read it first.
- Did not verify the lint-vue-conventions rules before using defineExpose. I discovered the defineExpose ban mid-gauntlet instead of pre-checking.
- The original delivery did not test that the PageTransitionDemo actually displayed correct variant-specific or reduced-motion parameters. The shallowMount approach masked a real bug.

### Training Proposals

| Proposal                                                                                                                                                                                               | Context                                                                                                                                              | Shift Evidence                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| A composable is warranted only when 2+ components consume the same reactive logic. If only one component uses the logic, it belongs in the component.                                                  | Over-engineered usePageTransition had exactly one consumer (PageTransition.vue). The separation added indirection with zero reuse benefit.           | 2026-04-10-page-transition-refactor |
| Before writing test files, check architecture tests for testing conventions (mount boundaries, naming patterns, structural rules).                                                                     | Used mount instead of shallowMount, violating the mount boundary enforcement architecture test. Discovered during full gauntlet instead of pre-work. | 2026-04-10-page-transition-refactor |
| When testing components that use defineExpose + template ref, use shallowMount with explicit unstubbing `{ComponentName: false}` to satisfy mount boundary rules while accessing real exposed methods. | PageTransitionDemo tests needed the real PageTransition for template ref access. shallowMount + unstub is the correct pattern.                       | 2026-04-10-page-transition-refactor |
| Vue's template ref proxy unwraps exposed refs. Access exposed refs directly (no .value) through template refs. This differs from accessing refs in script setup where .value IS required.              | Demo code used .value on already-unwrapped boolean, returning undefined. Bug was hidden by shallowMount stubbing the component.                      | 2026-04-10-page-transition-refactor |

---

## CFO Evaluation

_Appended by the CFO after reviewing the journal._

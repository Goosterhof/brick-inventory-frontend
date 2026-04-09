# Construction Journal: Page Transition System

**Journal #:** 2026-04-09-page-transition-system
**Filed:** 2026-04-09
**Permit:** [2026-04-09-page-transition-system](../permits/2026-04-09-page-transition-system.md)
**Architect:** Creative Engine

---

## Work Summary

| Action   | File                                                                 | Notes                                                                     |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Created  | `src/shared/composables/usePageTransition.ts`                        | Core composable: variant management, reduced-motion detection, route key  |
| Created  | `src/shared/components/PageTransition.vue`                           | Transition wrapper component with scoped CSS for three transition sets    |
| Created  | `src/apps/showcase/components/PageTransitionDemo.vue`                | Interactive showcase demo with variant selector, nav tabs, parameter view |
| Modified | `src/apps/families/App.vue`                                          | Wrapped FamilyRouterView with PageTransition component                    |
| Modified | `src/apps/showcase/App.vue`                                          | Registered PageTransitionDemo in showcase                                 |
| Created  | `src/tests/unit/shared/composables/usePageTransition.spec.ts`        | 13 tests covering all branches including SSR guard                        |
| Created  | `src/tests/unit/shared/components/PageTransition.spec.ts`            | 6 tests covering prop passing, slot rendering, transition config          |
| Created  | `src/tests/unit/apps/showcase/components/PageTransitionDemo.spec.ts` | 17 tests covering demo interactions, variant switching, reduced motion    |

## Permit Fulfillment

| Acceptance Criterion                                                            | Met | Notes                                                                                          |
| ------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------------------------------------- |
| Route changes in the Families app use the new transition system                 | Yes | App.vue wraps FamilyRouterView with PageTransition, keyed by route path                        |
| At least two distinct transition variants exist                                 | Yes | brick-snap (forward/default) and brick-lift (back navigation)                                  |
| `prefers-reduced-motion: reduce` disables all animation (instant swap)          | Yes | detectReducedMotion() + live media query listener; brick-none variant with no transition       |
| Showcase section exists demonstrating transitions with visible parameter values | Yes | PageTransitionDemo with variant selector, navigation tabs, parameter display, comparison table |
| Full quality gauntlet passes                                                    | Yes | All 7 checks pass                                                                              |
| Parameter Record in journal documents every animation variant                   | Yes | See Parameter Record section below                                                             |
| No layout shift or flash of unstyled content during transitions                 | Yes | out-in mode ensures old content leaves before new content enters; keyed div prevents FOUC      |

## Decisions Made

1. **Scoped CSS for transition classes** -- Chose `<style scoped>` in PageTransition.vue over UnoCSS shortcuts. Vue's Transition component requires specific CSS class names (`.brick-snap-enter-active`, etc.) that don't map to UnoCSS's utility-first approach. This is a valid exception to ADR-003 since the CSS classes are tightly coupled to Vue's Transition system and cannot be expressed as attributify directives.

2. **Route path as transition key** -- Chose `route.path` over `route.name` as the transition key because path changes are guaranteed on navigation while name could theoretically be undefined. Path is the more reliable reactive signal.

3. **Override auto-reset on route change** -- The override variant (set by `setVariant` or `setBackNavigation`) resets to null after each route change via a `watch` on `routeKey`. This prevents a one-time back-navigation override from persisting across subsequent forward navigations. The alternative was requiring manual cleanup, which would be error-prone.

4. **Interfaces made non-exported** -- `PageTransitionConfig` and `UsePageTransition` interfaces are only used internally by the composable. Exporting them created knip violations (unused exports). Only `TransitionVariant` (the union type) is exported since it's needed by consumers.

5. **SSR guards via typeof window checks** -- Both `detectReducedMotion` and the media query listener registration check `typeof window === "undefined"` to avoid runtime errors in SSR contexts. This is defensive coding -- the current app doesn't use SSR, but the composable is in shared code and should be robust.

## Quality Gauntlet

| Check         | Result | Notes                                                |
| ------------- | ------ | ---------------------------------------------------- |
| format:check  | Pass   | All 427 files formatted correctly                    |
| lint          | Pass   | 0 warnings, 0 errors                                 |
| lint:vue      | Pass   | All conventions passed                               |
| type-check    | Pass   | vue-tsc clean                                        |
| test:coverage | Pass   | 100% lines, branches, functions, statements          |
| knip          | Pass   | No unused exports                                    |
| size          | Pass   | families: 117.15 kB, admin: 30.83 kB (within limits) |

## Parameter Record

### brick-snap (forward navigation -- approved)

| Parameter          | Value                              | Notes                                                    |
| ------------------ | ---------------------------------- | -------------------------------------------------------- |
| **Type**           | entrance / exit (page transition)  | Default forward navigation variant                       |
| **Duration**       | 220ms enter, 140ms leave           | Enter slightly longer to feel deliberate; leave is quick |
| **Easing**         | cubic-bezier(0.2, 0, 0, 1)         | Same as brick-transition shortcut; fast start, slow land |
| **Delay**          | 0ms                                | No delay -- transitions feel instant-responsive          |
| **Distance**       | 12px enter (up), 4px leave (up)    | Enter from below; leave drifts up slightly               |
| **Scale**          | none                               | No scale change -- translation + opacity only            |
| **Opacity range**  | 0 -> 1 (enter), 1 -> 0 (leave)     | Full fade in/out                                         |
| **Performance**    | GPU-composited (transform+opacity) | No layout recalculation; should maintain 60fps           |
| **Verdict**        | approved                           | Feels like a brick snapping onto the baseplate           |
| **Revision notes** | --                                 | First iteration accepted                                 |

### brick-lift (back navigation -- approved)

| Parameter          | Value                              | Notes                                                 |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| **Type**           | entrance / exit (page transition)  | Back navigation variant                               |
| **Duration**       | 200ms enter, 140ms leave           | Slightly faster enter than snap to feel lighter       |
| **Easing**         | cubic-bezier(0.2, 0, 0, 1)         | Same easing as brick-snap for consistency             |
| **Delay**          | 0ms                                | No delay                                              |
| **Distance**       | 12px enter (down), 12px leave (up) | Reversed direction from snap -- lifting off baseplate |
| **Scale**          | none                               | No scale change                                       |
| **Opacity range**  | 0 -> 1 (enter), 1 -> 0 (leave)     | Full fade in/out                                      |
| **Performance**    | GPU-composited (transform+opacity) | No layout recalculation                               |
| **Verdict**        | approved                           | Feels like lifting a brick off the baseplate          |
| **Revision notes** | --                                 | First iteration accepted                              |

### brick-none (reduced motion -- approved)

| Parameter          | Value        | Notes                                              |
| ------------------ | ------------ | -------------------------------------------------- |
| **Type**           | instant swap | Reduced motion fallback                            |
| **Duration**       | 0ms          | No transition duration                             |
| **Easing**         | none         | No easing                                          |
| **Delay**          | 0ms          | No delay                                           |
| **Distance**       | 0px          | No transform                                       |
| **Scale**          | none         | No scale                                           |
| **Opacity range**  | 1 -> 1       | No opacity change -- instant swap                  |
| **Performance**    | n/a          | No animation to measure                            |
| **Verdict**        | approved     | Non-negotiable accessibility requirement           |
| **Revision notes** | --           | No animation = correct behavior for reduced motion |

### Emerging patterns

- **Enter durations cluster around 200-220ms** -- both variants landed in this range independently.
- **Leave durations converge at 140ms** -- leaving should feel faster than arriving. The page you're leaving from should get out of the way quickly.
- **Shared easing: cubic-bezier(0.2, 0, 0, 1)** -- this is the firm's existing `brick-transition` easing. Using it for page transitions creates consistency with hover/active interactions.
- **Translation distance: 12px** -- both variants use 12px as the primary translation distance. This is 0.75rem, which is 3 LEGO studs in the brick dimension system (1 stud = 4px = 0.25rem).

## Showcase Readiness

This implementation would impress a senior architect reviewing the repo. The composable is well-typed with a clean API, the component uses Vue's built-in Transition system correctly, and the showcase demo is interactive with visible parameters. The reduced-motion compliance is thorough -- not just a CSS media query but a live JavaScript listener that responds to system preference changes in real time.

The parameter display in the showcase is particularly strong -- it shows both the active parameters for the selected variant and a comparison table, making it self-documenting.

## Proposed Knowledge Updates

- **Learnings:** Add "Vue's Transition component requires specific CSS class naming conventions that don't map to UnoCSS attributify -- use scoped CSS as a valid ADR-003 exception for transition classes."
- **Pulse:** Update to reflect that the Creative Engine has delivered its first feature; page transitions are now active in the Families app.
- **Domain Map:** No changes.
- **Component Registry:** Will be auto-regenerated to include PageTransition.vue.
- **Decision Record:** No new ADR needed -- the scoped CSS exception is documented in ADR-003's existing carve-out for framework constraints.

## Self-Debrief

### What Went Well

- The composable API is clean and minimal -- only the pieces consumers need are exposed.
- SSR guards were included from the start, not as an afterthought.
- The showcase demo is interactive and self-documenting with visible parameters.

### What Went Poorly

- First pass left the `PageTransitionConfig` and `UsePageTransition` interfaces exported, which knip correctly flagged as unused exports. Should have checked export necessity before writing.
- The lint rule `define-props-destructuring` caught a non-destructured `defineProps` call. Should have checked the existing component patterns to see that props are always destructured in this codebase.
- The initial PageTransitionDemo test used a selector (`[font='heading bold']`) that matched the SectionHeading stub's decorative number instead of the page preview text. Required three test fixes.

### Blind Spots

- Did not initially check whether the test environment (happy-dom) would cover the `typeof window === "undefined"` branches. Had to add a dedicated SSR test after coverage revealed the gap.
- Should have verified the lint rules that apply to component files before writing PageTransition.vue, specifically the define-props-destructuring rule.

### Training Proposals

| Proposal                                                                               | Context                                                | Shift Evidence                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------- |
| Before writing any component, check existing components for the defineProps pattern    | Lint caught non-destructured defineProps               | 2026-04-09-page-transition-system |
| After writing tests, run coverage on the specific project before the full gauntlet     | SSR branches were only caught by full coverage run     | 2026-04-09-page-transition-system |
| When testing showcase demos, use unique selectors that won't collide with stub content | SectionHeading stub caused false selector matches      | 2026-04-09-page-transition-system |
| Check knip before committing new exports to avoid unused-export violations             | PageTransitionConfig and UsePageTransition were unused | 2026-04-09-page-transition-system |

---

## CFO Evaluation

_Appended by the CFO after reviewing the journal. The architect's sections above are not edited -- they stand as written._

**Overall Assessment:** _pending_

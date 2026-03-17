# Decision: v-show for testable conditional rendering in navigation

**Date**: 2026-03-17
**Feature**: Navigation component patterns and test coverage
**Status**: accepted

## Context

The project enforces 100% branch coverage. Vue's `v-if` directive compiles to ternary expressions in the render function, creating branches that V8 tracks. In JSDOM (the test environment), some of these branches can't be reached — particularly responsive breakpoint conditions and certain component lifecycle branches that only occur in a real browser.

This creates an impossible requirement: 100% branch coverage with unreachable branches.

**Important nuance**: This rule applies specifically to conditional rendering where the condition can't be controlled in tests. `v-if` is still used elsewhere in the codebase — for example, `NavHeader.vue` uses `v-if="menuOpen"` for the mobile menu because that condition IS testable (you can toggle `menuOpen` in a test). The rule is narrower than "always use v-show."

## Options Considered

| Option | Pros | Cons | Why eliminated / Why chosen |
|---|---|---|---|
| **Use `v-if` everywhere, istanbul ignore comments** | Standard Vue pattern | Ignore comments mask real coverage gaps. Hard to distinguish "legitimately unreachable" from "we forgot to test this" | Eliminated — coverage ignore comments erode trust in the metric |
| **Lower coverage target below 100%** | Removes the pressure entirely | Loses the discipline. Where's the new line? 95%? 90%? Every uncovered branch becomes "probably fine" | Eliminated — 100% is a structural commitment, not a target to negotiate |
| **Use `v-show` for conditions untestable in JSDOM** | Elements always render (CSS hidden), no coverage branches. DOM weight is negligible for nav items | Slightly more DOM output. Doesn't work for components with side effects on mount | **Chosen** — pragmatic, scoped to the actual problem |

## Decision

Use `v-show` instead of `v-if` for conditional navigation elements where the condition can't be reliably controlled in JSDOM tests. `v-if` remains fine for conditions that tests CAN control (like `menuOpen` toggles, authenticated/unauthenticated states, etc.).

The rule is: if you can write a test that triggers both branches, use `v-if`. If you can't (responsive breakpoints, browser-only conditions), use `v-show`.

## Consequences

- 100% branch coverage is achievable without ignore comments or testing contortions
- Navigation elements always exist in the DOM when using `v-show` — hidden via `display: none`. Negligible performance impact for navigation-scale DOM
- `v-if` is still the default for most conditional rendering. This rule only applies to the specific case of untestable conditions
- Developers need to understand the distinction: it's not "v-show is better" — it's "v-show avoids phantom branches in coverage"

## Open Questions

- As the component library grows, will this rule extend beyond navigation? Other components with responsive behavior might hit the same issue
- If Vitest/JSDOM improves V8 coverage tracking for compiled Vue templates, this workaround might become unnecessary. Worth checking periodically
- Should this be enforced by a lint rule, or is documentation sufficient? Currently it's a convention in learnings.md

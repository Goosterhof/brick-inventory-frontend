# Decision: v-show over v-if for navigation elements

**Date**: 2026-03-17
**Feature**: Navigation component patterns
**Status**: accepted

## Context

Conditional rendering of navigation items (mobile vs desktop, authenticated vs public) using `v-if` created unreachable branches in V8 coverage. The 100% branch coverage requirement made `v-if` impractical for nav elements.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| **v-if** | Standard Vue pattern, lazy rendering | Creates coverage branches that can't be reached in JSDOM |
| **v-show** | Always renders, CSS-only toggle, no coverage impact | Slightly more DOM weight |

## Decision

Use `v-show` for conditional navigation elements. The DOM overhead is negligible for nav items, and it eliminates impossible coverage requirements.

## Consequences

- 100% branch coverage achievable without contortion
- Navigation elements always exist in DOM (hidden via CSS)
- Pattern documented in learnings.md for future reference

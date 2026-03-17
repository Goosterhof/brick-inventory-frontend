# Decision: UnoCSS attributify over CSS files

**Date**: 2026-03-17
**Feature**: Styling approach
**Status**: accepted

## Context

The design system (Brick Brutalism) uses a fixed set of utility patterns. Needed a styling approach that enforces consistency and eliminates dead CSS.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| **CSS/SCSS files** | Familiar, full control | Dead CSS accumulates, hard to audit, no tree-shaking |
| **UnoCSS attributify** | Atomic, tree-shaken, co-located with templates | Learning curve, verbose templates |

## Decision

UnoCSS with attributify mode. Custom shortcuts (`brick-border`, `brick-shadow`, etc.) encode the design system. No `<style>` blocks in components.

## Consequences

- Zero dead CSS — only used utilities ship
- Design system is enforced through shortcuts, not documentation alone
- Templates are self-describing (styling visible inline)
- No context-switching between template and style blocks

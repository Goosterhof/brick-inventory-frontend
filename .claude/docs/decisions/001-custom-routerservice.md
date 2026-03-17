# Decision: Custom RouterService over Vue Router plugin

**Date**: 2026-03-17
**Feature**: Core routing architecture
**Status**: accepted

## Context

The Families app needed routing but also needed to share navigation components (`NavLink`, `NavMobileLink`) across apps that might not use Vue Router directly. Installing Vue Router as a plugin makes `RouterLink` globally available, which crashes apps that haven't installed it.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| **Vue Router plugin (standard)** | Familiar, `RouterLink` works everywhere | Crashes shared components in apps without Vue Router |
| **Custom RouterService wrapper** | Shared components stay decoupled, per-app control | Shared components can't use `RouterLink` |

## Decision

Custom `RouterService` wrapper via factory pattern. Each app creates its own router instance. Shared navigation components use plain `<a>` tags with click emits instead of `RouterLink`.

## Consequences

- Shared components never depend on Vue Router being installed
- Navigation components are more portable across apps
- Developers must remember to never use `RouterLink` in `@shared/` components
- Documented in learnings.md as a "Mistakes Not to Repeat" entry

# Decision: RouterService wrapper over direct Vue Router usage

**Date**: 2026-03-17
**Feature**: Core routing architecture for multi-app platform
**Status**: accepted

## Context

The platform has three apps (Families, Admin, Showcase) with very different routing needs. Families has 7 domains with auth guards, middleware, query parameter handling, and deep navigation. Admin has a single domain. Showcase has no routing at all.

The tension: shared navigation components (`NavLink`, `NavMobileLink`) need to work across all apps, but Vue Router's `RouterLink` component only works when Vue Router is installed as a plugin. If a shared component imports `RouterLink`, it crashes in apps that don't install it.

Beyond the shared component problem, Families needed capabilities Vue Router doesn't provide out of the box: runtime middleware registration/deregistration, type-safe route name resolution, and convenience methods for common navigation patterns (go to edit page, go to show page, etc.).

## Options Considered

| Option | Pros | Cons | Why eliminated / Why chosen |
|---|---|---|---|
| **Vue Router plugin everywhere** | Standard API, `RouterLink` works in shared components | Forces all apps to install Vue Router even when unnecessary. Shared components become tightly coupled to Vue Router plugin registration | Eliminated — Showcase has zero routing needs, and it creates an invisible coupling that breaks at runtime, not compile time |
| **RouterService wrapper for all apps** | Consistent API across apps, shared components always safe | Over-engineered for simple apps like Admin | Partially chosen — used where the complexity is justified |
| **RouterService for Families, raw Vue Router for Admin, nothing for Showcase** | Each app uses only what it needs. Shared components use `<a>` tags so they never depend on any router | Shared nav components can't do SPA navigation on their own — they emit clicks and let the parent handle routing | **Chosen** — matches actual complexity per app |

## Decision

Hybrid approach. `createRouterService()` wraps Vue Router (not replaces it) with a middleware system, type-safe helpers, and a `createRouterLink` component factory that renders `<a>` tags internally. Families uses the full wrapper. Admin uses Vue Router directly. Showcase uses nothing.

Shared navigation components (`NavLink`, `NavMobileLink`) render plain `<a>` tags with `event.preventDefault()` and emit `click` events. The consuming app wires up actual navigation. This means shared components have zero dependency on any router — not Vue Router, not RouterService.

The RouterService also provides `createRouterLink()` — a component factory that produces `<a>` tags with `goToRoute()` click handlers. This gives Families app-level components a type-safe `RouterLink`-like experience without the global plugin dependency.

## Consequences

- Shared components are fully portable — they work in any app regardless of routing setup
- Families gets middleware, type-safe navigation, and convenience methods
- Admin stays simple — no unnecessary abstraction
- The cost: shared nav components can't navigate on their own. Navigation logic lives in the consuming page, not the component. This is a deliberate inversion of control
- `createRouterLink` gives Families the ergonomics of `RouterLink` without the coupling

## Resolved Questions

### When should Admin migrate to RouterService?

**Resolved 2026-03-17.** When Admin hits any two of: 3+ routes, auth guards/middleware, CRUD navigation patterns, or route metadata (`authOnly`, `title`). One route with a guard is still manageable with raw Vue Router. Two qualifying criteria means you're reimplementing RouterService by hand.

### Does createRouterLink duplicate Vue Router's RouterLink?

**Resolved 2026-03-17.** No — it replaces a loosely-typed component with a strictly-typed one. Vue Router's `RouterLink` accepts `RouteLocationRaw`, which allows any string as a route name with no compile-time validation. `createRouterLink` types its `to` prop as `RouteName<Routes>` — a union of literal string types extracted from the actual route definitions. Passing a nonexistent route name is a TypeScript error, not a runtime surprise. Even if Vue Router added conditional plugin detection, `createRouterLink` would still be justified by the type safety alone.

### Should shared components use callback props instead of click emits?

**Resolved 2026-03-17.** No. The emit pattern is the correct choice. Callback props would break Vue 3 `defineEmits<{}>()` conventions used throughout the codebase, make components harder to test (currently verified cleanly via `wrapper.emitted("click")`), and add no value — parents already wire navigation in a single `@click` handler. The emit pattern keeps shared components fully decoupled from all routing implementations, which is exactly right for components running across three apps with three different routing setups.

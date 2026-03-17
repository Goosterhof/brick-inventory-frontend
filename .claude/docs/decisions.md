# Decision Log — _Why We Built It That Way_

Architectural decisions made during development. Not what was built — the domain map covers that. This is **why** it was built that way, and what alternatives were rejected.

**When to add an entry**: After any non-trivial choice — component structure, API design, pattern selection, library decisions, domain boundaries. If a future architect might ask "why did we do it this way?" — write it down.

**Format**: Use the [decision record template](./.decision-record-template.md). Keep entries brief — a decision record is a snapshot, not an essay.

**Naming**: `DDD-short-title` where DDD is a zero-padded sequence number.

**Lifecycle**:
- `accepted` — current and active
- `superseded` — replaced by a newer decision (link to it)
- `deprecated` — no longer relevant (explain why)

---

## Decisions

| # | Decision | Date | Status |
|---|---|---|---|
| 001 | [Custom RouterService over Vue Router plugin](#001-custom-routerservice-over-vue-router-plugin) | 2026-03-17 | accepted |
| 002 | [Factory pattern for services, no singletons](#002-factory-pattern-for-services-no-singletons) | 2026-03-17 | accepted |
| 003 | [UnoCSS attributify over CSS files](#003-unocss-attributify-over-css-files) | 2026-03-17 | accepted |
| 004 | [Snake/camel case conversion at the HTTP boundary](#004-snakecamel-case-conversion-at-the-http-boundary) | 2026-03-17 | accepted |
| 005 | [v-show over v-if for navigation elements](#005-v-show-over-v-if-for-navigation-elements) | 2026-03-17 | accepted |

---

## 001 — Custom RouterService over Vue Router plugin

**Date**: 2026-03-17
**Feature**: Core routing architecture
**Status**: accepted

### Context

The Families app needed routing but also needed to share navigation components (`NavLink`, `NavMobileLink`) across apps that might not use Vue Router directly. Installing Vue Router as a plugin makes `RouterLink` globally available, which crashes apps that haven't installed it.

### Options Considered

| Option | Pros | Cons |
|---|---|---|
| **Vue Router plugin (standard)** | Familiar, `RouterLink` works everywhere | Crashes shared components in apps without Vue Router |
| **Custom RouterService wrapper** | Shared components stay decoupled, per-app control | Shared components can't use `RouterLink` |

### Decision

Custom `RouterService` wrapper via factory pattern. Each app creates its own router instance. Shared navigation components use plain `<a>` tags with click emits instead of `RouterLink`.

### Consequences

- Shared components never depend on Vue Router being installed
- Navigation components are more portable across apps
- Developers must remember to never use `RouterLink` in `@shared/` components
- Documented in learnings.md as a "Mistakes Not to Repeat" entry

---

## 002 — Factory pattern for services, no singletons

**Date**: 2026-03-17
**Feature**: Service architecture
**Status**: accepted

### Context

Three apps share service logic (HTTP, auth, routing) but need independent instances with different configurations. Admin and Families apps use different API base URLs and different auth flows.

### Options Considered

| Option | Pros | Cons |
|---|---|---|
| **Singleton services** | Simple, one instance | Apps can't have different configs, testing requires mocking globals |
| **Factory functions** | Per-app instances, easy to test, middleware isolation | Slight setup duplication per app |

### Decision

Factory functions (`createHttpService()`, `createAuthService()`, `createRouterService()`) in `@shared/services/`. Each app creates its own instances in its `services/` directory. No global state.

### Consequences

- Each app is fully independent — no cross-app contamination
- Tests create fresh service instances without mocking
- Middleware (auth interceptors, error handlers) can differ per app
- Small amount of boilerplate in each app's `services/` directory

---

## 003 — UnoCSS attributify over CSS files

**Date**: 2026-03-17
**Feature**: Styling approach
**Status**: accepted

### Context

The design system (Brick Brutalism) uses a fixed set of utility patterns. Needed a styling approach that enforces consistency and eliminates dead CSS.

### Options Considered

| Option | Pros | Cons |
|---|---|---|
| **CSS/SCSS files** | Familiar, full control | Dead CSS accumulates, hard to audit, no tree-shaking |
| **UnoCSS attributify** | Atomic, tree-shaken, co-located with templates | Learning curve, verbose templates |

### Decision

UnoCSS with attributify mode. Custom shortcuts (`brick-border`, `brick-shadow`, etc.) encode the design system. No `<style>` blocks in components.

### Consequences

- Zero dead CSS — only used utilities ship
- Design system is enforced through shortcuts, not documentation alone
- Templates are self-describing (styling visible inline)
- No context-switching between template and style blocks

---

## 004 — Snake/camel case conversion at the HTTP boundary

**Date**: 2026-03-17
**Feature**: API communication layer
**Status**: accepted

### Context

Backend API uses snake_case (Rails/Python convention). Frontend uses camelCase (TypeScript convention). Needed a clean boundary.

### Options Considered

| Option | Pros | Cons |
|---|---|---|
| **Manual conversion per endpoint** | Explicit | Repetitive, error-prone, easy to miss fields |
| **Automatic conversion in HTTP service** | Consistent, zero manual work | Must handle edge cases (nested objects, arrays) |

### Decision

Automatic conversion via `toCamelCaseTyped()` (incoming) and `deepSnakeKeys()` (outgoing), applied in the HTTP service middleware. Type-safe with compile-time and runtime alignment.

### Consequences

- Frontend code is pure camelCase — no snake_case leaks
- API response types can be defined in camelCase
- Conversion happens once at the boundary, not per-endpoint
- Edge cases (deeply nested objects, arrays of objects) handled by the helper

---

## 005 — v-show over v-if for navigation elements

**Date**: 2026-03-17
**Feature**: Navigation component patterns
**Status**: accepted

### Context

Conditional rendering of navigation items (mobile vs desktop, authenticated vs public) using `v-if` created unreachable branches in V8 coverage. The 100% branch coverage requirement made `v-if` impractical for nav elements.

### Options Considered

| Option | Pros | Cons |
|---|---|---|
| **v-if** | Standard Vue pattern, lazy rendering | Creates coverage branches that can't be reached in JSDOM |
| **v-show** | Always renders, CSS-only toggle, no coverage impact | Slightly more DOM weight |

### Decision

Use `v-show` for conditional navigation elements. The DOM overhead is negligible for nav items, and it eliminates impossible coverage requirements.

### Consequences

- 100% branch coverage achievable without contortion
- Navigation elements always exist in DOM (hidden via CSS)
- Pattern documented in learnings.md for future reference

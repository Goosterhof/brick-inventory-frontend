# Decision: Resource adapter with frozen base and mutable ref

**Date**: 2026-03-18
**Feature**: Domain entity state management and CRUD operations
**Status**: accepted
**Transferability**: universal

## Context

Domain entities in a CRUD application have two modes: display (read-only) and editing (mutable). A set detail page shows the set's name as text, but an edit form needs two-way binding to a reactive copy. These two modes create a recurring problem: how do you let a form mutate data without accidentally corrupting the canonical state?

Vue's reactivity system makes this worse. If you pass a reactive object to a form and the user types into an input, the original object mutates immediately — there's no "draft" layer. Cancelling an edit means manually restoring every field. With nested objects (arrays of parts, nested storage locations), manual restoration is error-prone.

The forces pulling in different directions:

- **Forms need mutable reactive data** — Vue's `v-model` requires a `Ref` or `reactive` target
- **Canonical state must not be corrupted by in-progress edits** — if a user cancels, the original must be untouched
- **CRUD operations should live close to the data** — calling `update()` on an entity is more discoverable than dispatching an action to a store that calls an API that updates another store
- **snake_case/camelCase conversion must happen consistently** — every HTTP boundary needs conversion (ADR-004), and doing it per-component is a bug magnet

## Options Considered

| Option | Pros | Cons | Why eliminated / Why chosen |
| --- | --- | --- | --- |
| **Pinia stores with separate form state in components** | Conventional Vue pattern. Well-documented. Large ecosystem of plugins | Each component manually copies store data into local refs, manually converts case on submit, manually updates store after API response. Lots of glue code that varies per domain | Eliminated — the glue code is the same every time, which means it should be abstracted, not copy-pasted |
| **Class-based models (ActiveRecord pattern)** | Familiar to Laravel/Rails developers. `set.save()` is intuitive | Classes and Vue's `reactive()` have known conflicts (proxy traps on class instances). Inheritance hierarchies grow complex. Doesn't solve the mutable/immutable split | Eliminated — fights Vue's reactivity model instead of working with it |
| **Immer-style immutable updates** | Structural sharing, efficient for large state trees | External dependency. Requires learning a new mutation API (`produce(draft => ...)`). Overkill for the dataset sizes in a LEGO inventory app | Eliminated — adds complexity for a problem that `Object.freeze` + `deepCopy` solves more simply |
| **Resource adapter with frozen base + mutable ref** | One object serves both display and edit. CRUD methods are attached. Case conversion is handled internally. `reset()` restores original state. Type system enforces which methods exist (create vs update/patch/delete) | Non-standard pattern — team must learn the adapter API. Adapted objects are recreated on every computed access (no memoization) | **Chosen** — the adapter is the API surface for all domain entity interactions, eliminating per-component glue code |

## Decision

Each domain entity is wrapped by `resourceAdapter()`, which returns a single object with two views of the same data:

1. **Frozen view** — the resource's properties are spread and `Object.freeze()`-d. These are the last-persisted values. `adapted.name` is immutable and always reflects what the server knows.

2. **Mutable view** — `adapted.mutable` is a `Ref` containing a `deepCopy` of the resource. This is what form inputs bind to via `v-model`. Edits to `mutable.value` never touch the frozen properties or the original resource.

The adapter attaches context-appropriate CRUD methods:

- **Existing resources** (have an `id`): get `update()`, `patch()`, `delete()`
- **New resources** (no `id`): get `create()` only

This is enforced at both the type level (function overloads with `Adapted<T>` vs `NewAdapted<T>`) and at runtime (the `isExisting()` type guard determines which branch executes). You cannot call `update()` on something that doesn't exist yet — TypeScript won't let you.

The internal `adapterRepositoryFactory` handles all HTTP communication: snake_case conversion outbound, camelCase conversion inbound, response validation, and store synchronization. Domain code never touches HTTP directly through the adapter — it calls `adapted.update()` and the pipeline handles the rest.

## Consequences

- **Forms are simple**: bind to `adapted.mutable.value`, call `adapted.update()` on submit, call `adapted.reset()` on cancel. No manual state copying or restoration
- **Canonical state is protected**: `Object.freeze` prevents accidental mutation. The frozen properties are the source of truth for display
- **Case conversion is invisible**: handled inside the repository factory, consistent with ADR-004
- **Type safety narrows the API**: impossible to call `delete()` on a new resource or `create()` on an existing one
- **No memoization**: adapted objects are recreated on every computed access from the store. For the dataset sizes in a LEGO inventory app (tens to low hundreds of items), this is negligible. For large collections it could matter — monitor if domains grow
- **The `Ref` type assertion**: Vue's `UnwrapRef` widens generic `T` to `unknown`, requiring a cast. This is safe for POJOs but would break if someone passed a resource with nested Vue refs. The adapter is designed for API-sourced data, not arbitrary reactive objects

## Open Questions

- The adapter pattern is built and fully tested but not yet consumed by any domain. First real integration will validate whether the API surface holds up under actual usage patterns or needs adjustment.
- Should `reset()` emit a signal that the form was cancelled, or is that the consuming component's responsibility?

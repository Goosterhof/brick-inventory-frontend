# Decision: Factory pattern for services, no singletons

**Date**: 2026-03-17
**Feature**: Service architecture
**Status**: accepted

## Context

Three apps share service logic (HTTP, auth, routing) but need independent instances with different configurations. Admin and Families apps use different API base URLs and different auth flows.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| **Singleton services** | Simple, one instance | Apps can't have different configs, testing requires mocking globals |
| **Factory functions** | Per-app instances, easy to test, middleware isolation | Slight setup duplication per app |

## Decision

Factory functions (`createHttpService()`, `createAuthService()`, `createRouterService()`) in `@shared/services/`. Each app creates its own instances in its `services/` directory. No global state.

## Consequences

- Each app is fully independent — no cross-app contamination
- Tests create fresh service instances without mocking
- Middleware (auth interceptors, error handlers) can differ per app
- Small amount of boilerplate in each app's `services/` directory

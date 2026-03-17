# Decision: Factory functions for all services

**Date**: 2026-03-17
**Feature**: Service architecture across multi-app platform
**Status**: accepted

## Context

The platform has 7+ services (HTTP, auth, router, loading, translation, storage, sound) used across up to 3 apps. Each app needs its own configured instances — Families has auth, Admin doesn't; Families uses a specific API base URL, Admin might use a different one; each app has its own storage prefix to avoid localStorage collisions.

The question wasn't whether to have shared service code (obvious yes), but how apps consume it.

## Options Considered

| Option | Pros | Cons | Why eliminated / Why chosen |
|---|---|---|---|
| **Singleton modules** (export instances directly from shared) | Zero boilerplate, import and use | Apps can't configure independently. Testing requires mocking module-level state. One app's middleware bleeds into another | Eliminated — multi-app platform makes this a hard blocker, not a preference |
| **Vue provide/inject** | Vue-native DI, composable-friendly | Services must be created inside Vue's setup lifecycle. Can't use services outside components (e.g., in router guards, middleware). Testing requires mounting components to access services | Eliminated — too many service consumers live outside Vue components |
| **Factory functions** (`createXService()`) | Per-app instances, explicit config, trivially testable, works anywhere | Boilerplate: each app has a `services/` directory with ~7 files of instantiation code | **Chosen** — the boilerplate is small and self-documenting |

## Decision

Every service is a factory function in `@shared/services/`. Each app creates its own instances in `src/apps/{appName}/services/`. Services wire together explicitly — e.g., `createAuthService()` receives an `httpService` instance, `registerLoadingMiddleware()` connects HTTP and loading services.

This means there's no hidden coupling. You can read an app's `services/` directory and see exactly what's running and how it's configured.

## Consequences

- **Testing**: Create fresh service instances per test. No mocking, no global state cleanup
- **Independence**: Apps are fully isolated. Families' auth middleware doesn't exist in Admin's HTTP service
- **Traceability**: `services/` directory is a manifest of what the app uses
- **Boilerplate cost**: Each Families service file is ~5-10 lines. 7 files totaling ~50 lines. Acceptable for the isolation gained
- **Middleware composition**: Services like loading middleware are registered explicitly (`registerLoadingMiddleware(httpService, loadingService)`) rather than auto-discovered. This is more code but impossible to misconfigure silently

## Open Questions

- As the number of services grows, the `services/` directory could become noisy. Is there a point where a service registry pattern would reduce boilerplate without sacrificing isolation?
- Some services have a natural dependency order (auth depends on HTTP, loading middleware connects HTTP and loading). Should this be documented per-app or is the code self-evident enough?

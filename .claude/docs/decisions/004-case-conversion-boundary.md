# Decision: Snake/camel case conversion at HTTP boundary

**Date**: 2026-03-17
**Feature**: API communication layer
**Status**: accepted

## Context

Backend API uses snake_case (Rails/Python convention). Frontend uses camelCase (TypeScript convention). Needed a clean boundary.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| **Manual conversion per endpoint** | Explicit | Repetitive, error-prone, easy to miss fields |
| **Automatic conversion in HTTP service** | Consistent, zero manual work | Must handle edge cases (nested objects, arrays) |

## Decision

Automatic conversion via `toCamelCaseTyped()` (incoming) and `deepSnakeKeys()` (outgoing), applied in the HTTP service middleware. Type-safe with compile-time and runtime alignment.

## Consequences

- Frontend code is pure camelCase — no snake_case leaks
- API response types can be defined in camelCase
- Conversion happens once at the boundary, not per-endpoint
- Edge cases (deeply nested objects, arrays of objects) handled by the helper

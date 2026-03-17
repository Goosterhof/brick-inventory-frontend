# Decision: Explicit snake/camel case conversion at service boundaries

**Date**: 2026-03-17
**Feature**: API communication layer
**Status**: accepted

## Context

Backend API returns snake_case (`first_name`, `created_at`). Frontend TypeScript uses camelCase (`firstName`, `createdAt`). Every API interaction crosses this boundary. The question was where and how to handle the conversion.

**Important correction**: The initial assumption was that this conversion happens as HTTP middleware. It does not. Conversion is explicit — called at specific points in service methods, not applied automatically to all requests/responses.

## Options Considered

| Option | Pros | Cons | Why eliminated / Why chosen |
|---|---|---|---|
| **Use snake_case in frontend** | No conversion needed | Violates TypeScript naming conventions. Every component that touches API data uses non-standard names. IDE refactoring breaks | Eliminated — the cognitive cost is constant and pervasive |
| **HTTP interceptor/middleware** (automatic on all requests/responses) | Zero manual work, consistent | Converts everything — including requests/responses that shouldn't be converted (e.g., external APIs, headers). Hard to debug when conversion causes issues. Silent failures on edge cases | Considered but not chosen — too broad, too invisible |
| **Explicit conversion at service boundaries** | Visible where it happens. Only converts what should be converted. Type-safe — `DeepSnakeKeys<T>` on input, `T` on output | Requires remembering to call it. Repeated at every API boundary | **Chosen** — visibility and control outweigh the repetition |

## Decision

Explicit conversion using `toCamelCaseTyped<T>()` (API response → app) and `deepSnakeKeys()` (app → API request), called in service methods — auth service registration/login, resource adapter CRUD operations. Both functions come from the `string-ts` package with thin typed wrappers in `@shared/helpers/string.ts`.

Type safety enforced by typing API responses as `DeepSnakeKeys<T>` and immediately converting to `T`. TypeScript catches missing conversions at compile time.

## Consequences

- **Visibility**: You can grep for `toCamelCaseTyped` and `deepSnakeKeys` to find every API boundary. No hidden transformations
- **Type safety**: `DeepSnakeKeys<T>` type ensures the compiler knows when data is in snake_case form. You can't accidentally use unconverted data
- **Repetition**: Every service that talks to the API has conversion calls. The resource adapter centralizes most of this, but auth has its own
- **Correctness**: Unlike automatic middleware, this never converts something that shouldn't be converted

## Open Questions

- The resource adapter handles conversion for standard CRUD. Auth handles its own. If more services need API access, should conversion move into a shared base service pattern, or is the current explicit approach better despite duplication?
- `string-ts` handles nested objects and arrays. Are there edge cases (e.g., mixed-case keys, keys that should stay as-is) that could break silently?

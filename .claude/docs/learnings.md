# Learnings — _Getting Sharper_

Corrections and discoveries captured during work. Not philosophy — operational rules with teeth.

**When to add an entry**: After any mistake, non-obvious discovery, or user correction. If you'd tell your past self "watch out for this" — write it down.

**Format**: Each entry is a rule, not a story. Present tense, imperative mood. Include the _why_ only if it's not obvious.

**Graduation**: When a learning proves itself across multiple sessions, promote it to CLAUDE.md or the relevant skill file. Then delete it from here — this file stays lean.

---

## Codebase Gotchas

_Things that bite you if you don't know them._

<!-- Example:
- `t()` returns a `ComputedRef`, not a string — always use `.value` in templates
- The `resourceAdapter` expects the HTTP service instance, not the module — pass `familyHttpService`, not the import
-->

## User Preferences

_How this project's owner likes things done._

<!-- Example:
- Prefers deleting dead code over commenting it out
- Wants commit messages to explain "why", not "what"
-->

## Patterns That Work

_Approaches that proved effective in this codebase._

<!-- Example:
- When adding a new domain: create the route first, then the page, then the test — this order catches naming issues early
- For form pages: wire up the happy path end-to-end before handling errors
-->

## Mistakes Not to Repeat

_Specific errors and their fixes._

<!-- Example:
- Don't use `vi.fn()` for HTTP mocks when the real service returns `{data: T}` — mock the full shape
- Don't forget `meta: {authOnly: true}` on protected routes — the router guard silently passes without it
-->

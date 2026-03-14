# Learnings — _Getting Sharper_

Corrections and discoveries captured during work. Not philosophy — operational rules with teeth.

**When to add an entry**: After any mistake, non-obvious discovery, or user correction. If you'd tell your past self "watch out for this" — write it down.

**Format**: Each entry is a rule, not a story. Present tense, imperative mood. Include the _why_ only if it's not obvious.

**Graduation**: When a learning proves itself across multiple sessions, promote it to CLAUDE.md or the relevant skill file. Then delete it from here — this file stays lean.

---

## Codebase Gotchas

_Things that bite you if you don't know them._

- FormLabel's `for` prop is optional — it was documented with `—` (ambiguous) instead of `undefined`. Use explicit defaults in catalog tables to avoid confusion.
- Button component tests (PrimaryButton, DangerButton, BackButton, ListItemButton) lack keyboard interaction tests (Enter/Space). Same for NavLink and NavMobileLink. Add these when touching these components next.

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

## Future Improvements

_Things to revisit when external tooling catches up._

- **Oxlint JS plugins can replace `scripts/lint-vue-conventions.mjs`** — once Vue SFC support lands in the beta (Milestone 3: https://github.com/oxc-project/oxc/issues/19918). The three custom checks (multi-word PascalCase names, block order, define-macros order) can become native oxlint rules via a `jsPlugins` entry in `.oxlintrc.json`. This removes the separate `lint:vue` script, the extra `*.vue` lint-staged entry, and gives IDE integration for free. Alpha announced 2026-03-11: https://oxc.rs/blog/2026-03-11-oxlint-js-plugins-alpha

## Mistakes Not to Repeat

_Specific errors and their fixes._

<!-- Example:
- Don't use `vi.fn()` for HTTP mocks when the real service returns `{data: T}` — mock the full shape
- Don't forget `meta: {authOnly: true}` on protected routes — the router guard silently passes without it
-->

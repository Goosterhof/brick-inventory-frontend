# Decision Log — _Why We Built It That Way_

Before reading any decision, start with **[ADR-000: Why This Project Exists and How Decisions Are Made](./ADR-000.md)**. It explains the audience, purpose, and evaluation criteria behind every decision in this log.

Architectural decisions made during development. Not what was built — the domain map covers that. This is **why** it was built that way, and what alternatives were rejected.

Each decision lives in its own file under `decisions/`.

**When to add an entry**: After any non-trivial choice — component structure, API design, pattern selection, library decisions, domain boundaries. If a future architect might ask "why did we do it this way?" — write it down.

**Format**: Use the [decision record template](./.decision-record-template.md). One file per decision. Keep entries brief — a decision record is a snapshot, not an essay.

**Naming**: `decisions/DDD-short-title.md` where DDD is a zero-padded sequence number.

**Ownership**: Three-tier review process:

1. The **architect** proposes decision records in the report-back step — with honest reasoning, not post-hoc justification
2. The **COO** (main conversation agent) critically reviews: challenges shallow reasoning, asks "what did you actually consider?", flags gaps
3. The **CEO** (human) gives final approval on what gets committed

No decision record lands here without passing through all three.

**Lifecycle**:

- `accepted` — current and active
- `superseded` — replaced by a newer decision (link to the replacement)
- `deprecated` — no longer relevant (explain why)

---

## Index

| #   | Decision                                                                                    | Date       | Status   |
| --- | ------------------------------------------------------------------------------------------- | ---------- | -------- |
| 001 | [Custom RouterService over Vue Router plugin](./decisions/001-custom-routerservice.md)      | 2026-03-17 | accepted |
| 002 | [Factory pattern for services, no singletons](./decisions/002-factory-services.md)          | 2026-03-17 | accepted |
| 003 | [UnoCSS attributify over CSS files](./decisions/003-unocss-attributify.md)                  | 2026-03-17 | accepted |
| 004 | [Snake/camel case conversion at HTTP boundary](./decisions/004-case-conversion-boundary.md) | 2026-03-17 | accepted |
| 005 | [v-show over v-if for navigation elements](./decisions/005-vshow-nav-elements.md)           | 2026-03-17 | accepted |

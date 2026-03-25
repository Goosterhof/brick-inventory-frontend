# Territory Pulse — _Where Things Stand_

A consolidated, current-state assessment of the frontend codebase. Updated by the CFO at end-of-session. Not chronological — this is the **living snapshot** the architect reads before touching code.

**Rules:**

- Each section carries an `Assessed:` date — update it when you re-evaluate that section
- Sections not revisited keep their old date, making staleness visible
- Overwrite sections with current state — don't append history
- Keep entries factual and concise — one line per item

---

## Overall Health

**Rating:** 9/10
**Assessed:** 2026-03-25

Strong architectural foundation with full accountability pipeline now operational. 100% test coverage enforced. 12 ADRs documented. Multi-app structure with strict isolation. Showcase app fully tested (was the primary gap). Accountability pipeline exercised with 3 permits, 2 journals, 2 inspection reports filed. Brick-catalog removed and all references cleaned (PR #133). Primary remaining gap: adapter-store and resource-adapter patterns built and tested but not yet consumed by any domain page.

## Active Concerns

**Assessed:** 2026-03-25

| Concern                                  | Severity | Status     | Notes                                                                               |
| ---------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------- |
| Adapter-store not consumed by domains    | Medium   | Planned    | ADR-006 + 007 are speculative until a domain migration validates the API surface    |
| `Item` type constraint mismatch          | Low      | Aware      | `FamilySet` has `id` but no `createdAt`/`updatedAt` — will surface during migration |
| `SetsOverviewPage.spec.ts` test guard    | High     | Active     | Exceeds 1000ms execution threshold (ADR-010); blocks pre-push gauntlet              |
| `format:check` failures on `.claude/` md | Low      | Known      | oxfmt reformats markdown — agent docs and journal files drift; not a code defect    |

## In-Progress Work

**Assessed:** 2026-03-25

| Work Item                      | Status      | Next Step                                                 |
| ------------------------------ | ----------- | --------------------------------------------------------- |
| Adapter-store domain migration | Not started | Migrate one domain (sets recommended) to validate pattern |

## Pattern Maturity

**Assessed:** 2026-03-25

| Pattern                                       | Maturity             | Evidence                                                       |
| --------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| Multi-app architecture (`@shared/` + `@app/`) | Battle-tested        | 3 apps, architecture tests enforce boundaries                  |
| RouterService wrapper                         | Battle-tested        | All routed apps use it, type-safe route names proven           |
| Factory services (no singletons)              | Battle-tested        | 7 shared service factories, arch test enforces                 |
| Domain isolation (lint + arch tests)          | Battle-tested        | 4-layer enforcement, 7 domains, 0 violations                   |
| Case conversion at HTTP boundary              | Battle-tested        | All API communication flows through it                         |
| Resource adapter (frozen + mutable)           | Tested, not consumed | Unit tests pass, but no domain page uses it yet                |
| Adapter-store module                          | Tested, not consumed | Unit tests pass, but no domain page uses it yet                |
| Brick Brutalism design system                 | Battle-tested        | 31 shared components, Showcase app fully tested, brand guide   |
| Accountability pipeline                       | Battle-tested        | 3 permits → 2 journals → 2 inspection reports filed (PR #131-133) |

## Tech Debt

**Assessed:** 2026-03-25

| Item                                                        | Severity | Notes                                                                               |
| ----------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| Domain pages use raw `httpService` instead of adapter-store | Medium   | SetDetailPage: 134 lines of manual state management the adapter-store should handle |
| Button/nav components lack keyboard tests                   | Low      | Noted in learnings — add when touching next                                         |
| Oxlint JS plugins not yet available for custom Vue checks   | Low      | Monitoring oxc milestone 3 — will replace `lint-vue-conventions.mjs`                |

## Seeds

**Assessed:** 2026-03-25

Ideas planted but deferred — revisit when the trigger condition is met. Seeds are not tech debt (known problems) or active concerns (things needing attention now). They're **future improvements** that aren't worth the cost today but will be when the codebase grows.

| Seed                                 | Trigger                                                                              | What It Means                                                                                                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Territory briefing for architect     | When 3+ domains have been migrated to adapter-store                                  | Consolidated intel doc so the architect doesn't read 5 docs before starting. The pulse partially fills this role, but a briefing would include directory structure, key conventions, and known deviations in one place |
| Third agent type (domain specialist) | When domain count exceeds 10, or when cross-domain patterns need dedicated attention | A domain-scoped agent that understands one vertical slice deeply. Currently unnecessary — 7 domains is manageable for a generalist architect                                                                           |
| Inspector memory file                | After 3+ inspector missions (currently at 2)                                         | Persistent assessment file (like spy memory) so the inspector tracks quality trends across missions instead of starting fresh each time. Trigger approaching — one more mission.                                        |

## Quality Metrics

**Assessed:** 2026-03-25

| Metric                   | Value     | Threshold |
| ------------------------ | --------- | --------- |
| Test coverage (lines)    | 100%      | 100%      |
| Test coverage (branches) | 100%      | 100%      |
| Test files               | 90        | —         |
| Test count               | 1081      | —         |
| Shared components        | 31        | —         |
| Showcase components      | 12        | —         |
| Architecture tests       | 18 cases  | —         |
| ADRs documented          | 12        | —         |
| Domains (Families)       | 7         | —         |
| knip violations          | 0         | 0         |
| Permits filed            | 3         | —         |
| Journals filed           | 2         | —         |
| Inspection reports filed | 2         | —         |

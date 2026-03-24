# Territory Pulse — _Where Things Stand_

A consolidated, current-state assessment of the frontend codebase. Updated by the CFO at end-of-session. Not chronological (that's MINUTES.md) — this is the **living snapshot** the architect reads before touching code.

**Rules:**

- Each section carries an `Assessed:` date — update it when you re-evaluate that section
- Sections not revisited keep their old date, making staleness visible
- Overwrite sections with current state — don't append history
- Keep entries factual and concise — one line per item

---

## Overall Health

**Rating:** 8.5/10
**Assessed:** 2026-03-18

Strong architectural foundation. 100% test coverage enforced. 8 ADRs documented. Multi-app structure with strict isolation. Primary gap: adapter-store and resource-adapter patterns are built and tested but not yet consumed by any domain page.

## Active Concerns

**Assessed:** 2026-03-18

| Concern                                  | Severity | Status     | Notes                                                                               |
| ---------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------- |
| Adapter-store not consumed by domains    | Medium   | Planned    | ADR-006 + 007 are speculative until a domain migration validates the API surface    |
| `Item` type constraint mismatch          | Low      | Aware      | `FamilySet` has `id` but no `createdAt`/`updatedAt` — will surface during migration |
| Coverage gap on adapter-store.ts line 59 | Low      | New        | Introduced by recent `retrieveAll` changes — pre-push hook now fails                |
| Showcase app staleness                   | Low      | Monitoring | Component count in Showcase (12) covered; shared components now at 31               |
| `SetsOverviewPage.spec.ts` test guard    | High     | New        | Exceeds 1000ms execution threshold (ADR-010); blocks pre-push gauntlet              |

## In-Progress Work

**Assessed:** 2026-03-18

| Work Item                      | Status      | Next Step                                                 |
| ------------------------------ | ----------- | --------------------------------------------------------- |
| Adapter-store domain migration | Not started | Migrate one domain (sets recommended) to validate pattern |
| ADR-000 evaluation framework   | Complete    | All 8 ADRs reviewed through 5 lenses                      |
| ADR template upgrade           | Complete    | Enforcement + Resolved Questions sections added           |
| Design cycle skill cleanup     | Complete    | Dead skill references replaced with doc links             |

## Pattern Maturity

**Assessed:** 2026-03-18

| Pattern                                       | Maturity             | Evidence                                             |
| --------------------------------------------- | -------------------- | ---------------------------------------------------- |
| Multi-app architecture (`@shared/` + `@app/`) | Battle-tested        | 3 apps, architecture tests enforce boundaries        |
| RouterService wrapper                         | Battle-tested        | All routed apps use it, type-safe route names proven |
| Factory services (no singletons)              | Battle-tested        | 7 shared service factories, arch test enforces       |
| Domain isolation (lint + arch tests)          | Battle-tested        | 4-layer enforcement, 7 domains, 0 violations         |
| Case conversion at HTTP boundary              | Battle-tested        | All API communication flows through it               |
| Resource adapter (frozen + mutable)           | Tested, not consumed | Unit tests pass, but no domain page uses it yet      |
| Adapter-store module                          | Tested, not consumed | Unit tests pass, but no domain page uses it yet      |
| Brick Brutalism design system                 | Battle-tested        | 31 shared components, Showcase app, brand guide      |

## Tech Debt

**Assessed:** 2026-03-18

| Item                                                        | Severity | Notes                                                                               |
| ----------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| Domain pages use raw `httpService` instead of adapter-store | Medium   | SetDetailPage: 134 lines of manual state management the adapter-store should handle |
| Button/nav components lack keyboard tests                   | Low      | Noted in learnings — add when touching next                                         |
| FormLabel `for` prop documentation ambiguity                | Low      | Clarified in learnings, catalog entry correct                                       |
| Oxlint JS plugins not yet available for custom Vue checks   | Low      | Monitoring oxc milestone 3 — will replace `lint-vue-conventions.mjs`                |

## Seeds

**Assessed:** 2026-03-18

Ideas planted but deferred — revisit when the trigger condition is met. Seeds are not tech debt (known problems) or active concerns (things needing attention now). They're **future improvements** that aren't worth the cost today but will be when the codebase grows.

| Seed                                 | Trigger                                                                              | What It Means                                                                                                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Territory briefing for architect     | When 3+ domains have been migrated to adapter-store                                  | Consolidated intel doc so the architect doesn't read 5 docs before starting. The pulse partially fills this role, but a briefing would include directory structure, key conventions, and known deviations in one place |
| Escalate to Level 3 debrief          | When Level 2 debriefs prove shallow (CFO judges 3+ debriefs as low-signal)           | Separate invocation for self-assessment, with the agent receiving its own report. More expensive but forces genuine reflection instead of perfunctory self-assessment                                                  |
| Third agent type (domain specialist) | When domain count exceeds 10, or when cross-domain patterns need dedicated attention | A domain-scoped agent that understands one vertical slice deeply. Currently unnecessary — 7 domains is manageable for a generalist architect                                                                           |
| Inspector memory file                | After 3+ inspector missions                                                          | Persistent assessment file (like spy memory) so the inspector tracks quality trends across missions instead of starting fresh each time                                                                                |
| Blind spot compensation              | After first inspector mission reveals actual blind spots                             | Documented known weaknesses with active counter-measures built into SOPs. Can't write these until the inspector has run and failed at something                                                                        |

## Quality Metrics

**Assessed:** 2026-03-18

| Metric                   | Value     | Threshold |
| ------------------------ | --------- | --------- |
| Test coverage (lines)    | 99.88%    | 100%      |
| Test coverage (branches) | 99.44%    | 100%      |
| Test files               | 74        | —         |
| Test count               | 908       | —         |
| Shared components        | 31        | —         |
| Architecture tests       | 10 groups | —         |
| ADRs documented          | 8         | —         |
| Domains (Families)       | 7         | —         |
| knip violations          | 0         | 0         |

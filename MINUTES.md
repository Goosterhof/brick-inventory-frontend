# Brick & Mortar Associates — Meeting Minutes

_Board meeting notes between the CEO and the executive team._
_Captured by the Meeting Minutes Secretary (1x1 translucent-clear brick, with clipboard)._

---

## 2026-03-18 — Extracting ADRs 006–008 from Codebase Patterns

### Decisions

- **Three new ADRs extracted from implicit codebase patterns**: CFO audited 15 undocumented architectural decisions in the codebase, ranked them by teaching value for juniors, and recommended the top 3. CEO approved.
- **ADR-006: Resource adapter with frozen base and mutable ref**: Documents the `Object.freeze` + `deepCopy` pattern giving entities an immutable display view and a reactive mutable copy for forms. Type-safe CRUD method narrowing via function overloads (`Adapted<T>` vs `NewAdapted<T>`).
- **ADR-007: Adapter store module over Pinia/Vuex**: Documents why a custom store factory was chosen over Pinia. The adapter, localStorage persistence, and loading coordination are so tightly coupled that Pinia would be substrate buried under project-specific glue.
- **ADR-008: Domain isolation via lint rules and architecture tests**: Documents the hard ban on cross-domain imports with four-layer enforcement (two oxlint rules, two architecture spec tests, pre-push hooks).

### Notes

- All three ADRs honestly note that the adapter/store pattern (006, 007) is built and tested but not yet consumed by any domain — open questions reflect this
- 12 additional implicit decisions were identified but deprioritized: multi-app APP_NAME routing, HTTP middleware lifecycle, route naming conventions, deep copy over structuredClone, sound service synthesis, loading middleware WeakSet, and others. The lower-tier items were judged as implementation choices rather than architectural decisions worth ADR treatment.
- Transferability for all three marked as `universal` — the patterns apply to any large Vue/TS project, not just this one

---

## 2026-03-18 — ADR-001 Revision: Universal RouterService

### Decisions

- **ADR-001 rewritten as universal**: The multi-app routing pattern (shared components decoupled from router plugins, all routed apps using RouterService) is used across multiple Script projects — not project-specific. Transferability changed from `project-specific` to `universal`.
- **No exceptions for "simple" apps**: The previous three-tier hybrid (RouterService for Families, raw Vue Router for Admin, nothing for Showcase) was eliminated. New rule: every routed app uses `createRouterService()`. An app with one or two routes barely qualifies as routed — and the migration cost when it grows is unnecessary friction.
- **Admin migrated to RouterService**: Admin's raw Vue Router usage (`createRouter`, `useRouter`, `RouterView`) replaced with `createRouterService`, `adminRouterService`, and `AdminRouterView`. Tests rewritten to mock the service instead of creating a raw router.
- **`useRouter`/`useRoute` ban extended to all apps**: oxlint `no-restricted-imports` rule now covers `src/apps/**` instead of just Families. Admin exclusion removed.

### Notes

- The Admin migration question ("when should Admin adopt RouterService?") was dropped as moot — there's no longer a threshold; you use it or you don't have routing
- The decision now leads with the universal principle (shared code must not depend on framework plugin registration) and presents the RouterService as the solution, rather than leading with the LEGO-specific three-app setup
- `AdminRouterLink` and `AdminAppRoutes` exports removed (knip flagged as unused) — can be added back when Admin needs them

### Action Items

- [ ] CFO: Continue reviewing remaining ADRs (002–005) through ADR-000 lens
- [ ] CFO: Commit ADR-001 revision and Admin migration

---

## 2026-03-18 — ADR-000: Foundation Document & Decision Framework

### Decisions

- **ADR-000 created as standalone meta-document**: Lives at `.claude/docs/ADR-000.md` outside the numbered `decisions/` directory — it's the decision framework itself, not a technical decision. Referenced from the top of `decisions.md` as required reading.
- **Five evaluation criteria for all future ADRs**: (1) Would a junior understand without asking? (2) What happens when followed too literally? (3) Does it scale to 50+ components/10+ domains? (4) Can it be enforced automatically? (5) Is the reasoning transferable?
- **Transferability labels added to all ADRs**: Two values — `universal` (applies to any large Vue/TS project) and `project-specific` (tied to this app's constraints). Applied retroactively: ADR-001 project-specific, ADR-002 universal, ADR-003 project-specific, ADR-004 universal, ADR-005 universal.
- **Script and team context documented explicitly**: ADR-000 names Script, the 20+ trainees/juniors, and the two production apps. Abstract framing was considered but explicit context won — it explains *why* decisions are evaluated the way they are.

### Notes

- Decision record template updated with `Transferability` field
- The roleplay element (Brick & Mortar Associates) is documented as intentional in ADR-000 — lowers mental switching cost from day job, keeps documentation engaging to maintain
- Minutes-nudge stop hook fixed: replaced `"decision": "block"` with `"continue": true` to break an infinite loop (block → response → stop → block). Nudge behavior now handled via Claude's memory system.

---

## 2026-03-18 — ADR Enforcement via Linting

### Decisions

- **Three ADR enforcement rules worth implementing**: After a cost-benefit analysis of all 5 ADRs, the CFO recommended three high-ROI additions. ADR-002 (factory pattern) and ADR-004 (case conversion) were deemed too fragile or not worth the maintenance cost to enforce via linting. CEO approved the three.
- **ADR-005: Ban coverage ignore comments via custom linter**: Added check 7 to `scripts/lint-vue-conventions.mjs` — scans all `.ts` and `.vue` files for `/* istanbul ignore */`, `/* v8 ignore */`, `/* c8 ignore */` patterns. Test files are exempt.
- **ADR-001: Ban `useRouter`/`useRoute` imports in Families and shared**: Added `no-restricted-imports` paths in `.oxlintrc.json` for both `src/shared/**` and `src/apps/families/**`. Admin is deliberately excluded — it uses Vue Router directly per ADR-001.
- **ADR-001: Ban `<RouterLink>`/`<router-link>` template usage in shared**: Added check 6 to the custom linter. The existing oxlint import ban only catches JS imports — globally registered components bypass it.
- **Custom linter expanded to scan `.ts` files**: Previously only scanned `.vue` files. Now scans both `.vue` and `.ts` for cross-file checks (coverage ignore comments). The `findVueFiles()` helper was generalized to `findFiles()` with configurable extensions.

### Notes

- ADR-001 and ADR-005 docs updated with Enforcement sections documenting the automated checks
- No existing code violated any of the new rules — clean slate
- The custom linter's lint-staged integration now accepts both `.vue` and `.ts` files via CLI args

---

## 2026-03-17 — Meeting Minutes Secretary Setup

### Decisions

- **Stop hook uses command type, not prompt**: Prompt-type hooks are only available for tool events (PreToolUse, PostToolUse, PermissionRequest) — not Stop. Used a command hook that outputs JSON with `decision: "block"` to conditionally inject a nudge into the CFO's context.
- **10-minute staleness window for nudges**: The Stop hook stays silent if MINUTES.md was updated in the last 10 minutes, preventing nagging during active documentation. Uses file mtime for simplicity.
- **SessionEnd hook for auto-commit**: MINUTES.md is automatically committed (if changed) when a session ends, so minutes are never lost even if the CEO forgets to commit.

### Notes

- The `/minutes` skill, Stop hook, and SessionEnd hook are all shipped as project-level config (`.claude/settings.json`, `.claude/skills/`, `.claude/hooks/`) — committed to the repo, shared across team.
- The settings file watcher may not detect a newly created `.claude/settings.json` mid-session — hooks activate on next session start or after visiting `/hooks`.

---

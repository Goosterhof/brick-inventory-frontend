# Brick & Mortar Associates — Meeting Minutes

_Board meeting notes between the CEO and the executive team._
_Captured by the Meeting Minutes Secretary (1x1 translucent-clear brick, with clipboard)._

---

## 2026-03-19 — ADR-009: Component Catalog Health Metrics Strategy

### Decisions

- **Tier 1 metrics chosen over full observability suite**: Three metrics selected — consumer map, adoption breadth, API surface — answering "who breaks?", "truly shared?", and "getting bloated?". Full suite (8+ metrics) eliminated as over-engineered for 31 components. Manual tracking eliminated as guaranteed to drift.
- **Tiered approach with forward-compatible schema**: Tier 2 (dependency depth, churn, duplication) designed for but not built — registry JSON schema includes placeholder fields. Tier 3 (age, per-component bundle size, per-component coverage) explicitly out of scope as redundant with existing tooling.
- **Static analysis implementation**: Consumer map built from import scanning, API surface from AST extraction of `defineProps`/`defineEmits`/`<slot>`. Single generated JSON registry file.
- **Third-party tools rejected**: Storybook analytics requires Storybook (we use Showcase), Chromatic is visual not structural, Webpack plugins don't apply (Vite). None answer monorepo adoption questions.

### Action Items

- [ ] CFO: Implement Tier 1 registry generation script
- [ ] CEO/CFO: Decide CI check vs pre-commit hook for registry staleness
- [ ] CEO/CFO: Set adoption breadth threshold for relocation warnings (needs real data first)

### Open Questions

- CI check (fail if stale) vs pre-commit hook (auto-regenerate) — trade-off between safety and friction
- Should Showcase app display health metrics alongside component demos?
- What adoption breadth threshold triggers "consider relocating" — one app? one domain?

---

## 2026-03-18 — Reactive Resource Adapter & Sets Domain Integration (PR #110)

### Decisions

- **Adapter display properties made reactive via `Object.defineProperty` getters**: Five options evaluated (re-fetch after mutation, getById computed, adapter returns updated object, separate getReactiveById method, reactive getters). `defineProperty` chosen — same adapted object automatically reflects store changes after CRUD operations without recreation.
- **`Object.defineProperty` over `Proxy`**: Both achieve reactive delegation; `defineProperty` chosen for explicitness at entity-scale property counts.
- **`reset()` restores to current server state**: After store updates via `patch()`, `reset()` gives the latest server data via the getter, not the stale snapshot from adapter creation.
- **Memoization simplified**: Adapted cache reduced from `Map<number, {source, adapted}>` to `Map<number, E>`. `setById` no longer invalidates the adapted cache — reactive getters read the latest state. Only `deleteById` and `retrieveAll` clear caches.
- **Sets domain integrated with adapter store**: SetsOverviewPage, AddSetPage, EditSetPage, SetDetailPage migrated from direct HTTP to adapter CRUD methods. ScanSetPage left as-is (specialized barcode workflow). IdentifyBrickPage and AssignPartModal out of scope (not FamilySet CRUD).
- **Validation via `useFormSubmit` wrapping adapter calls**: Adapter handles success (store sync, case conversion), `useFormSubmit` handles errors (422 parsing). No changes to adapter or composables needed.
- **Lead-brick-architect used for implementation**: Three-step delegation — ADR update (CEO+CFO), memoization implementation (architect), sets domain integration (architect). ADR decisions made before architect received briefs.
- **`assertDefined` replaced with `ensureRefValueExists`**: Ref-scoped, no name parameter, custom `MissingRefValueError`. Aligned with Script's other projects.

### Action Items

- [ ] CEO: Manual test Vue template reactivity through defineProperty getters (SetDetailPage inline status update)
- [ ] CFO: Review ADR-007 and ADR-008 through ADR-000 lens (deferred from this session)

### Notes

- ADR-006 scope clarified: adapter is for CRUD entities with REST verbs only. Non-CRUD operations use HTTP service directly.
- Vue auto-unwrap behavior: `ref<Adapted<T>>` deep-unwraps nested `mutable` Ref, so access is `adapted.value.mutable.fieldName` (no `.value` after `.mutable`). `ComputedRef` values auto-unwrap in templates.
- `FamilySet` type modified: `set` made optional (`set?: SetSummary`), `setNum` added at top level — needed for adapter create flow where `set` isn't available yet.
- Pre-push gauntlet caught type errors and test failures before they shipped — all resolved before merge.
- PR #110 merged to main via squash merge. All checks green: 916 tests, 100% coverage, type-check, knip, three apps build.

### Open Questions

- Vue template reactivity through `defineProperty` getters reading from a `Ref` — unit tests confirm mechanism works, manual verification still needed
- `setNum` on `FamilySet` and extra fields in create payload (`setId: 0`) — need API contract validation
- `set` optional on `FamilySet` — confirm matches actual API response shape

---

## 2026-03-18 — Full ADR Review Through ADR-000 Lens

### Decisions

- **ADR-002 revised**: Added one-liner defining services (state/config/dependencies) vs helpers (pure functions). Dropped the service registry suggestion — not relevant, and planted ideas that could mislead juniors. Added custom linter check 8 to prevent singleton exports in shared services.
- **ADR-003 rewritten as universal**: UnoCSS attributify is used across Script projects, not project-specific. Removed all LEGO/Brick Brutalism specifics — the ADR now covers the pattern (atomic CSS + named design system shortcuts), not this project's specific shortcuts. Each project defines its own in UnoCSS config.
- **`<style scoped>` allowed as escape hatch**: Blanket `<style>` ban relaxed — unscoped `<style>` still forbidden, but `<style scoped>` is now permitted for third-party CSS overrides and CSS edge cases. Linter check 4 updated.
- **ADR-004 unchanged**: Reviewed and passed all five criteria as-is. No revisions needed.
- **ADR-005 revised and renamed**: File renamed from `005-vshow-nav-elements.md` to `005-istanbul-coverage-no-ignores.md`. Phantom branch ignore comment loophole removed — rule is now absolute: no ignore comments, escalate phantom branches as Vitest/Vue issues.
- **`assertDefined` replaced with `ensureRefValueExists`**: Generic `assertDefined(value, name)` replaced with ref-scoped `ensureRefValueExists(ref)`. Three improvements: no misleading name parameter (stack trace is sufficient), custom `MissingRefValueError` instead of generic `Error`, scoped to Vue refs to prevent misuse. Pattern aligned with Script's other projects.

### Notes

- Transferability changes: ADR-003 moved from project-specific to universal. ADR-001, 002, 004, 005 were already universal or moved in prior session.
- All five original ADRs now reviewed through ADR-000's five evaluation criteria: junior understanding, literal-rule safety, scale, automated enforcement, transferability
- The `ensureRefValueExists` pattern is what Script's other projects already use — this aligns the LEGO project with established team conventions

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
- **Script and team context documented explicitly**: ADR-000 names Script, the 20+ trainees/juniors, and the two production apps. Abstract framing was considered but explicit context won — it explains _why_ decisions are evaluated the way they are.

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

## 2026-03-19 — "Building for Size" Strategic Context Propagation

### Decisions

- **Strategic mission codified in CLAUDE.md**: New "Strategic Mission — Building for Size" section added. Every architectural decision must answer two questions: (1) Does this scale to enterprise complexity? (2) Does this demonstrate mastery to a senior engineer reviewing the repo? This is the firm's portfolio piece for landing large client engagements.
- **All agents and skills updated with strategic context**: Lead Brick Architect gained a Strategic Context section, a "build for showcase" responsibility, and a "showcase readiness" debrief section. Building Inspector gained a new SOP 6 (Audit Showcase Readiness) with a three-tier rating: portfolio-ready / needs polish / not ready. ADR Interrogator gained a new Step 6 (The Showcase Test) asking whether a client would be impressed or concerned. Minutes Secretary gained a Strategic Alignment capture category.

### Strategic Alignment

- This decision itself is the foundational strategic alignment act — it ensures that "building for size" is not just understood by the CEO and CFO, but is structurally embedded in every agent's operating instructions and evaluation criteria. No agent in the firm can claim they didn't know the mission.

### Notes

- The dual strategic lens (scales AND demonstrates mastery) was explicitly discussed — these can conflict (over-engineering looks impressive but doesn't scale well; quick hacks scale but look amateur). Both must hold.
- The repo serves a dual purpose: portfolio showcase for clients AND decision laboratory for team ADR adoption. These are complementary, not competing.

---

## 2026-03-19 — ADR Interrogator Skill

### Decisions

- **ADR interrogator skill added**: Inspired by mattpocock/skills `grill-me` pattern. A `/adr-interrogator` skill that stress-tests proposed architectural decisions through structured one-at-a-time questioning before they get formalized as ADRs. Walks eight branches: problem, alternatives, decision, junior test, scale test, enforcement, consequences, transferability — directly mapped to ADR-000's evaluation criteria.
- **Interrogator is not a decision-maker**: It pressure-tests reasoning and hands back to the CEO. The CFO handles actual ADR drafting. Clear separation of roles.

### Notes

- Skill follows the same `.claude/skills/[name]/SKILL.md` convention as the minutes secretary
- The interrogation sequence mirrors the ADR template sections and ADR-000's five evaluation lenses, ensuring the output maps directly to a draftable ADR
- Character: "the 1x1 red brick with the magnifying glass" — small, sharp, finds the gap in the wall

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

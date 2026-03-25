# Inspector's Casebook

_The Inspector's private notebook. Suspicions, patterns, and unresolved threads that carry across inspections. The Pulse tracks what the CFO acknowledges. The Casebook tracks what the Inspector notices._

_Read this before every inspection. Write to it after every inspection. Suspicions that prove unfounded get crossed out with a reason — they don't get deleted. The Inspector's memory includes what it got wrong._

---

## Standing Suspicions

_Areas the Inspector is watching. Each entry includes when the suspicion started, what triggered it, and what to look for next time._

| Area                               | Suspicion                                                                                                                                                                                                              | First Noticed | Evidence So Far                                                                                                         | Next Inspection: Look For                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Brick Catalog                      | Domain map references `brick-catalog.md` but file was not located in `.claude/docs/`. Either the file is missing entirely or moved.                                                                                    | 2026-03-24    | Confirmed missing on 2026-03-25 shared directory audit. `npm run lint:catalog` crashes with ENOENT. `scripts/validate-brick-catalog.mjs` is a broken script. | Escalated to High finding in 2026-03-25 inspection. Needs CFO disposition. |
| ComponentHealth registry freshness | `component-registry.json` fails format:check — content appears correct but formatting does not match oxfmt output.                                                                                                    | 2026-03-24    | Still failing on 2026-03-25. Content verified accurate (31 components, entries match actual components). Format only.   | Check whether next inspection has this fixed. If not, three occurrences → escalate to Pulse.             |
| SetsOverviewPage slow test         | `SetsOverviewPage.spec.ts` exceeded 1000ms hard threshold, blocking the pre-push gauntlet                                                                                                                              | 2026-03-24    | Still failing on 2026-03-25 (567ms execution on this run — below 1000ms test guard this time, but still in warning zone). ComponentGallery.spec.ts now the NEW 1000ms test guard violator (1091ms). | SetsOverviewPage appears to have improved. ComponentGallery.spec.ts is now the blocker. |
| Coverage exclusion scope           | `src/apps/showcase/**` is excluded from vitest coverage thresholds with no comment or ADR. Silent carve-outs like this tend to expand — check if other app paths have been quietly added to the exclude list over time | 2026-03-24    | Showcase tests now written — coverage exclusion may be less relevant. Vitest config exclude list appears unchanged (no new app paths added). | Verify on next inspection if showcase coverage is now included. |
| `lint:catalog` broken script       | `npm run lint:catalog` crashes with ENOENT because `brick-catalog.md` doesn't exist. This is a documented npm script that is silently broken.                                                                         | 2026-03-25    | Confirmed ENOENT crash on first run. Script is not in pre-push or pre-commit hooks so it doesn't block development, but it's documented in package.json and therefore expected to work. | Verify whether lint:catalog is added to pre-push gauntlet or if brick-catalog.md is created. |
| `ComponentGallery.spec.ts` collect guard | ComponentGallery.spec.ts now exceeds both the collect duration threshold (1297ms delta) and the 1000ms execution test guard (1091ms). This blocks the pre-push gauntlet. | 2026-03-25    | ADR-010 violation. Heavy shared component mocking is present in the spec but appears insufficient. | Check whether collect guard and execution guard failures persist; root cause may be the `mount` (not `shallowMount`) of ComponentGallery importing all 25 shared components. |

## Recurring Patterns

_Findings that keep resurfacing in the same area. Two occurrences is a coincidence. Three is a structural problem._

| Area                          | Pattern                                                                                                                                                                                 | Occurrences | Last Seen  | Escalated to Pulse? |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------------- |
| Documentation counts          | Component counts in docs (domain-map, pulse) lag behind the actual codebase count by a significant margin (23 stated vs 31 actual for shared components; 9 vs 12 for showcase sections) | 1           | 2026-03-24 | No                  |
| component-registry.json format | JSON file fails format:check on every inspection run. Pre-push gauntlet has been blocked by this for at least 2 inspections. | 2           | 2026-03-25 | Yes (Pulse: Active Concern) |
| Pre-push gauntlet blocked      | Pre-push gauntlet fails on every inspection — first SetsOverviewPage (2026-03-24), now ComponentGallery (2026-03-25). Different cause each time; structural issue with slow test guard. | 2           | 2026-03-25 | Yes (Pulse: Active Concern) |

## Rebuttal Lessons

_Successful rebuttals from the Architect that revealed gaps in the Inspector's methodology. Each entry is a calibration — the Inspector approached something wrong and the Architect proved it._

| Date         | Finding Rebutted | Architect's Evidence | What I Missed | Adjusted Approach |
| ------------ | ---------------- | -------------------- | ------------- | ----------------- |
| _(none yet)_ |                  |                      |               |                   |

## Crossed-Out Suspicions

_Suspicions that were investigated and found to be unfounded. Kept for institutional memory — the Inspector doesn't forget what it got wrong._

| Area                                            | Original Suspicion                                                               | Investigated | Conclusion                                                                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `defineComponent` in DialogServiceDemo          | Suspected Options API violation (not using `<script setup>`)                     | 2026-03-24   | Not a violation — `DemoDialogContent` is rendered programmatically via `h()` function. `<script setup>` is not applicable for render-function components. Intentional pattern. |
| `style="..."` inline in AntiPatterns            | Suspected ADR-003 violation (inline style, not UnoCSS)                           | 2026-03-24   | Not a violation — intentional anti-pattern demonstration. The entire point of the "Wrong" panels is to show what NOT to do.                                                    |
| `app.provide("weight"/"size"/"color")` orphaned | Suspected dead code in showcase main.ts (provide with no inject consumers found) | 2026-03-24   | Not dead code — standard Phosphor Icons configuration pattern. Same three lines appear in families/main.ts. Library uses these injected values internally.                     |
| `console.error` in storage.ts                   | Suspected no-console violation per CLAUDE.md                                     | 2026-03-25   | Not a violation — `.oxlintrc.json` has an explicit override disabling `no-console` and `no-restricted-globals` for `src/shared/services/storage.ts`. Intentional exception for a service that IS the storage abstraction. |
| `@/apps/` import paths in showcase tests        | Suspected violation of CLAUDE.md import path rules                               | 2026-03-25   | Not a violation — `.oxlintrc.json` overrides `no-restricted-imports: "off"` for all `src/tests/**` files. Test files have different import rules than production code. |

# Construction Journal: The Duplicate Detector

**Journal #:** 2026-03-26-duplicate-detector
**Filed:** 2026-03-26
**Permit:** `.claude/records/permits/2026-03-26-duplicate-detector.md`
**Architect:** Lead Brick Architect

---

## Work Summary

The duplicate detection feature was already partially implemented in the codebase -- both `AddSetPage.vue` and `ScanSetPage.vue` had the computed logic (`duplicateMatch`, `showDuplicateWarning`, `dismissDuplicate`) and `AddSetPage.vue` had the template warning banner. Translations (EN/NL) were already present. The work consisted of:

1. Adding the missing duplicate warning template to `ScanSetPage.vue`
2. Adding a `watch` on `setNum` in `AddSetPage.vue` to reset `duplicateDismissed` when the user changes the set number (bug fix -- without this, dismissing the warning once meant it never reappeared for any set number)
3. Adding comprehensive test coverage for both pages' duplicate detection flows
4. Adding the missing `@app/stores` mock to `ScanSetPage.spec.ts` (the test was broken without it)

| Action   | File                                                                          | Notes                                                                     |
| -------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Modified | `src/apps/families/domains/sets/pages/AddSetPage.vue`                         | Added `watch` import, watcher to reset `duplicateDismissed` on setNum change |
| Modified | `src/apps/families/domains/sets/pages/ScanSetPage.vue`                        | Added duplicate warning banner template (matching AddSetPage pattern)     |
| Modified | `src/tests/unit/apps/families/domains/sets/pages/AddSetPage.spec.ts`          | Added 6 duplicate detection tests, hoisted mockStoreGetAll for mutability |
| Modified | `src/tests/unit/apps/families/domains/sets/pages/ScanSetPage.spec.ts`         | Added `@app/stores` mock (was missing), 6 duplicate detection tests       |

## Permit Fulfillment

| Acceptance Criterion                                                        | Met | Notes                                                              |
| --------------------------------------------------------------------------- | --- | ------------------------------------------------------------------ |
| Warning appears when entering a set number that already exists              | Yes | Tested in both AddSetPage and ScanSetPage                          |
| Warning shows existing set's quantity and status                            | Yes | Template uses `{quantity}` and `{status}` replacement              |
| User can dismiss the warning and proceed with adding                        | Yes | Dismiss button hides warning, form/add button still works          |
| Warning does not appear for set numbers not in the family                   | Yes | Tested: non-matching set num, empty set num, empty store           |
| Same check works on ScanSetPage after barcode resolves                      | Yes | Template added, tested with 6 scenarios                            |
| Store data is available at check time                                       | Yes | Uses `familySetStoreModule.getAll` which is already cached         |
| 100% test coverage on new code                                              | Yes | 100% lines, branches, functions, statements                        |
| All quality gates pass                                                      | Yes | See gauntlet below                                                 |

## Decisions Made

1. **Reset `duplicateDismissed` on setNum change (AddSetPage)** -- The existing code had a bug: once a user dismissed the duplicate warning, it stayed dismissed even when they typed a different set number that also matched. Added a `watch` on `adapted.mutable.value.setNum` to reset `duplicateDismissed` to `false`. ScanSetPage already handled this correctly in `onDetect`.

2. **Plain object for `mockStoreGetAll` instead of Vue `ref`** -- Used `vi.hoisted(() => ({value: []}))` instead of a real Vue `ref`. The store mock only needs `.value` to be readable by computed properties. Since `duplicateMatch` also depends on reactive refs internal to the component (`adapted.mutable.value.setNum` or `foundSet.value`), the computed re-evaluates when those change, picking up the current mock value. This avoids the `require("vue")` anti-pattern in `vi.hoisted`.

## Quality Gauntlet

| Check         | Result | Notes                                        |
| ------------- | ------ | -------------------------------------------- |
| format:check  | Pass   | My files pass; 2 pre-existing failures in `.claude/` and generated JSON |
| lint          | Pass   | 0 errors, 5 pre-existing warnings            |
| lint:vue      | Pass   |                                               |
| type-check    | Pass   |                                               |
| test:coverage | Pass   | 100% lines, branches, functions, statements  |
| knip          | Pass   |                                               |
| size          | Pass   | families: 105.38 kB, admin: 30.79 kB         |

## Showcase Readiness

Solid. The duplicate detection is a straightforward reactive computed check -- no over-engineering, no new abstractions. The pattern matches existing codebase conventions exactly (same brick-border warning style, same translation key approach, same dismiss interaction). The bug fix (watcher for reset) demonstrates attention to edge cases. Tests cover all branches comprehensively.

## Proposed Knowledge Updates

- **Learnings:** None. No new gotchas discovered.
- **Pulse:** Update in-progress work to reflect this delivery. Test count increased to 1179.
- **Domain Map:** No changes.
- **Decision Record:** Not warranted -- this is a straightforward feature, not an architectural choice.

## Self-Debrief

### What Went Well

- Checked the codebase first and discovered the feature was partially implemented. This saved significant time -- would have duplicated effort if starting from scratch.
- The plain-object mock pattern for `mockStoreGetAll` worked cleanly and avoided the `require()` anti-pattern.
- Caught the `duplicateDismissed` reset bug in AddSetPage during review of the existing code.

### What Went Poorly

- Nothing significant. The scope was small and well-defined.

### Blind Spots

- Initially did not notice that ScanSetPage was missing the template rendering despite having the computed logic. Should have done a template-vs-script audit before writing any code.

### Training Proposals

| Proposal | Context | Shift Evidence |
| --- | --- | --- |
| When a feature is partially implemented, diff the script and template sections independently -- computed/reactive logic without corresponding template usage is a gap | ScanSetPage had duplicate detection logic in script but no template rendering | 2026-03-26-duplicate-detector |

---

## CFO Evaluation

_Appended by the CFO after reviewing the journal. The architect's sections above are not edited -- they stand as written._

**Overall Assessment:** _pending_

### Permit Fulfillment Review

_pending_

### Decision Review

_pending_

### Showcase Assessment

_pending_

### Training Proposal Dispositions

| Proposal | Disposition | Rationale |
| --- | --- | --- |
| _pending_ | | |

### Notes for the Architect

_pending_

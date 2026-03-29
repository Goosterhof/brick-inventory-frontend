# Building Permit: Pulse Refresh

**Permit #:** 2026-03-29-pulse-refresh
**Filed:** 2026-03-29
**Issued By:** CFO
**Assigned To:** Lead Brick Architect
**Priority:** Urgent

---

## The Job

The Pulse is 4 days stale and has been flagged in 4 consecutive inspections. Every journal proposes updates, none land. This is now a process failure, not a documentation nit. Bring the Pulse current and fix the domain map gap while we're in there.

## Scope

### In the Box

- Full Pulse refresh — update all Quality Metrics to actual values as of 2026-03-29
- Update Pattern Maturity: add page integration tests (ADR-013), mutation testing (Stryker), form submit loading guard
- Update Active Concerns: add SettingsPage.spec.ts collect guard breach, update ComponentGallery entry (persists 4 inspections)
- Clear any stale In-Progress Work entries
- Re-assess Overall Health rating
- Add `brick-dna` domain to domain map: table entry + domain details section (pages, routes, auth, API endpoints)
- Update domain map showcase component count if stale
- Update domain map shared component count if stale

### Not in This Set

- Fixing the findings themselves (Vue Router deprecation, ADR-004 drift, etc.) — that's the cleanup permit
- Pulse automation tooling — this is a manual refresh
- Rewriting the Pulse format or structure

## Acceptance Criteria

- [ ] Pulse Quality Metrics match actual gauntlet output (test count, test files, ADR count, components, domains)
- [ ] Pulse Pattern Maturity includes integration tests, mutation testing, and loading guard
- [ ] Pulse Active Concerns reflect current state (SettingsPage breach added, stale entries removed)
- [ ] Pulse assessed date updated to 2026-03-29
- [ ] Domain map lists 8 Families domains (brick-dna added with full details)
- [ ] Domain map component counts match registry
- [ ] All quality gates pass

## References

- Inspection: `.claude/records/inspections/2026-03-29-post-delivery-audit.md` (Findings 5, 6)
- Casebook: Pulse quality metrics staleness — recurring pattern (4 occurrences)
- Current Pulse: `.claude/docs/pulse.md`
- Current Domain Map: `.claude/docs/domain-map.md`

## Notes from the Issuer

This is the 4th time the inspector has flagged Pulse staleness. The pattern is clear: Pulse updates get proposed in journals but never executed because they're side-notes, not the primary deliverable. This permit makes the refresh the primary deliverable. No excuses, no "proposed updates" sections — just do it.

The brick-dna domain map entry is bundled here because it's the same class of work (documentation catching up to reality) and doesn't warrant its own permit.

---

**Status:** Open
**Journal:** _link to construction journal when filed_

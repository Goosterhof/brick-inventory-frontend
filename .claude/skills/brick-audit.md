# Brick Audit — _Sturdy_

Open the parts inventory and check every brick against what is actually in the box. Bricks get added, modified, and retired — the catalog must match reality. Run this before shipping features or when the brick catalog feels stale.

## What to Check

### 1. Catalog Accuracy

Compare `src/shared/components/` against `.claude/docs/brick-catalog.md`:

- **Missing from catalog?** → Document the component.
- **In catalog but deleted?** → Remove the entry.
- **Props/emits changed?** → Update the catalog entry.

### 2. Domain Components That Want to Be Shared

Scan `src/apps/*/domains/*/components/` for components that:

- Are used by more than one page within the domain (high reuse signal)
- Have a generic name (not domain-specific like `SetStatusBadge`)
- Duplicate a pattern already in shared (e.g., another button variant)

If a domain component passes two of these checks, it likely belongs in `@shared/components/`.

### 3. Consistent APIs

Check that similar components follow the same patterns:

- All buttons: same `type`/`disabled` prop shape
- All form inputs: same base props (`label`, `disabled`, `optional`, `error`) + `v-model`
- All emitters: events use the project convention (no `on`-prefix, typed payloads)

### 4. Orphaned Bricks

Run `npm run knip` to find unused components. Then verify:

- Is the component genuinely unused, or just not yet wired up?
- If unused, delete it and remove from the catalog.

### 5. Test Coverage

Every shared component should have a test file at `src/tests/unit/shared/components/`. Check for gaps:

- Missing test files entirely
- Test files that don't cover accessibility (ARIA, keyboard, focus)
- Test files that don't cover error/disabled states

## How to Run

This is a manual audit — read the catalog, scan the directories, compare. Use the automated tools where they help:

```bash
npm run knip          # unused exports
npm run test:coverage # coverage gaps
npm run lint          # linter catches
```

## After the Audit

- Update `.claude/docs/brick-catalog.md` with any changes found
- Update `.claude/docs/domain-map.md` if domains gained/lost components
- Add discoveries to `.claude/docs/learnings.md`

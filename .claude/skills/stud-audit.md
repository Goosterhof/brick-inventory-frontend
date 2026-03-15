# Stud Ratio Audit — _Sturdy_

Verify that all Lego stud usage in the codebase follows the real-brick ratios defined in `.claude/docs/brand.md`. Run this after adding studs to new components or when the stud spec changes.

## Reference Ratios

These come from real Lego bricks and must hold in every stud instance:

| Ratio | Value | What it means |
|-------|-------|---------------|
| Stud diameter : center-to-center | **60%** | 12px stud, 20px center spacing |
| Gap : stud diameter | **67%** | 8px gap for 12px studs |
| Stud diameter : parent width | **< 30%** | Studs are accents, not wallpaper |

## What to Check

### 1. All Studs Use the Shared Component

Search for hand-rolled stud patterns — any `border-radius: 50%` outside of `LegoStuds.vue` is a violation.

```bash
# Should return ONLY LegoStuds.vue
grep -r "border-radius: 50%" src/ --include="*.vue" -l
```

If other files appear, they must either use `<LegoStuds>` or have an explicit exception documented.

### 2. LegoStuds Dimensions Match Spec

Read `src/shared/components/forms/LegoStuds.vue` and verify:

| Property | Expected |
|----------|----------|
| Width | `w="3"` (12px) |
| Height | `h="3"` (12px) |
| Border | `border="3 black solid"` |
| Gap | `gap="2"` (8px) |
| Shape | `border-radius: 50%` |
| Depth | `inset 0 -1px 0 0 rgba(0, 0, 0, 0.15)` |
| Default count | 3 |
| Aria | `aria-hidden="true"` |

### 3. Ratio Integrity

Calculate from the actual values in the component:

- **Gap-to-diameter**: gap (px) ÷ width (px) → should be ~0.67
- **Diameter-to-center**: width (px) ÷ (width + gap) (px) → should be ~0.60

If the stud size changes (e.g., for a larger variant), the gap must scale proportionally to maintain these ratios.

### 4. Placement Rules

Scan all usages of `<LegoStuds` in `.vue` files:

```bash
grep -r "<LegoStuds" src/ --include="*.vue" -l
```

For each usage, verify:

- Studs are inside a **container** (FormField, card, section) — not inside a button, input, or link
- Studs are **above** the content, not beside or below
- The stud row width (count × diameter + (count - 1) × gap) is **less than 30%** of the parent's width

### 5. Test Coverage

Verify `src/tests/unit/shared/components/forms/LegoStuds.spec.ts` exists and covers:

- Default count renders correctly
- Custom count renders correctly
- `aria-hidden="true"` is present
- Each stud has circular border-radius
- Depth shadow is present

## Quick Checklist

- [ ] No hand-rolled studs outside `LegoStuds.vue`
- [ ] Component dimensions match the spec table
- [ ] Gap-to-diameter ratio ≈ 0.67
- [ ] Diameter-to-center ratio ≈ 0.60
- [ ] All usages are in containers, above content
- [ ] Stud rows stay under 30% of parent width
- [ ] Test file exists with full coverage

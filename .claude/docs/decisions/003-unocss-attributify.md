# Decision: UnoCSS with attributify mode, no style blocks

**Date**: 2026-03-17
**Feature**: Styling approach and design system enforcement
**Status**: accepted

## Context

The design system (Brick Brutalism) has a deliberately constrained visual vocabulary: thick borders, hard shadows, specific brand colors, uppercase labels. Most components use the same 8-10 utility patterns repeatedly. The question was how to enforce this consistency and make the design system's constraints a feature, not overhead.

Separately: with three apps sharing components, dead CSS detection matters. Any styling approach that can accumulate unused styles across apps becomes a maintenance burden.

## Options Considered

| Option | Pros | Cons | Why eliminated / Why chosen |
|---|---|---|---|
| **Scoped CSS / SCSS in `<style>` blocks** | Familiar, full CSS power, component-scoped | Dead CSS accumulates silently. Design system compliance is convention-only — nothing stops someone writing `border-radius: 8px`. Two places to read per component (template + style block) | Eliminated — doesn't enforce the design system, creates maintenance debt |
| **CSS Modules** | Scoped by default, composable | Same dead CSS problem. More indirection (class name imports). Still doesn't enforce design constraints | Eliminated — solves scoping but not the core problem |
| **UnoCSS class-based** (standard Tailwind-style) | Atomic, tree-shaken, co-located | Class strings get very long. Hard to read `class="border-3 border-black border-solid shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"` | Eliminated in favor of attributify, but could have worked |
| **UnoCSS attributify + shortcuts** | Atomic + readable attributes (`p="x-4 y-2"`). Shortcuts encode design system (`brick-border`, `brick-shadow`). Zero dead CSS | Learning curve. IDE support less mature than class-based. Some HTML attributes look unusual | **Chosen** — shortcuts turn the design system into a vocabulary |

## Decision

UnoCSS with attributify mode and 8 custom shortcuts that encode Brick Brutalism patterns. No `<style>` blocks in any component. All styling lives in the template via attributes and shortcut classes.

The shortcuts are the key: `brick-border` isn't just shorter than `border-3 border-black border-solid` — it's a design system constraint. If someone needs a different border, they have to explicitly break from the system rather than accidentally diverging.

Attributify makes templates readable: `p="x-4 y-2" bg="white hover:brick-yellow" font="bold"` reads like a specification, not a class string.

## Consequences

- **Zero dead CSS**: UnoCSS generates only what's used in templates. No unused styles ship
- **Design system as code**: The 8 shortcuts are the design system. Changing `brick-shadow` changes it everywhere
- **Readability**: Templates are self-describing. No context-switching to a `<style>` block
- **Trade-off**: Complex conditional styling requires ternaries in template bindings (e.g., `:bg="active ? 'brick-yellow' : 'white'"`) which can get noisy. Accepted because it keeps styling co-located
- **IDE support**: Attributify has less autocomplete support than class-based Tailwind. Developers need to know the utility names

## Open Questions

- At what point does attributify ternary styling become too complex for a template? Should there be a complexity threshold where a computed property is preferred?
- The 8 shortcuts were designed for the current design system. As it evolves (e.g., adding brick-radius for rounded elements beyond studs), how do we evaluate when a new shortcut is justified vs. when inline utilities suffice?

# Decision: Component catalog health metrics — consumer map, adoption breadth, API surface

**Date**: 2026-03-19
**Feature**: Brick Catalog enhancement — automated health analytics for shared components
**Status**: accepted
**Transferability**: universal

## Context

We have 31 shared components. The manual brick catalog documents what exists, but it can't answer three questions that every component library eventually faces:

1. **"Who breaks if I touch this?"** — No visibility into which apps and domains consume a component. Refactoring is guesswork.
2. **"Is this truly shared or just misplaced?"** — Components in `shared/` that only one app uses are organizational debt. We can't identify them without manual searching.
3. **"Is this component getting bloated?"** — API surface (props, emits, slots) grows silently. A component that started with 2 props and now has 12 is a design smell that nobody notices until it's painful.

These aren't LEGO-specific problems. They're universal to any monorepo with a shared component library, whether it has 20 components or 2000. The solution should be transferable.

## Options Considered

| Option | Pros | Cons | Why eliminated / Why chosen |
|---|---|---|---|
| **Full observability suite (consumer map, adoption, API surface, churn, dependency depth, duplication detection, bundle size, age)** | Comprehensive. Answers every possible question about component health | Most metrics aren't actionable at our scale (31 components). High build cost, ongoing maintenance burden. Churn and duplication detection require git history analysis — different tooling entirely. Bundle size is already checked globally by size-limit | Eliminated — over-engineered. Solves hypothetical problems at the cost of real delivery time |
| **Tier 1 only: consumer map + adoption breadth + API surface** | Answers the three universal questions. Cheap to build (static analysis of imports + AST). Single generated JSON registry. Transferable to any Vue/React/Angular monorepo with minimal adaptation | Doesn't detect duplicate patterns or track churn. Some future questions remain unanswered | **Chosen** — minimum viable insight at minimum viable cost. The registry schema can accommodate future metrics without redesigning |
| **Third-party tool (Storybook analytics, Chromatic, custom Webpack plugin)** | Someone else maintains it. Possibly more features out of the box | Storybook analytics requires Storybook (we use a custom Showcase app). Chromatic is visual regression, not structural analysis. Webpack plugins don't apply (we use Vite). None of these answer the adoption/consumer questions for a monorepo with multiple apps | Eliminated — no existing tool solves this specific problem for our stack |
| **Manual tracking in the brick catalog doc** | Zero tooling cost. Already have the doc | Becomes stale immediately. Nobody updates a markdown table when they add a prop. We already know manual docs drift — the brick catalog itself will drift without automation | Eliminated — we've seen this movie before |

## Decision

Build Tier 1 metrics only: **consumer map**, **adoption breadth**, and **API surface**. Implement as a single script that produces a generated JSON registry file.

**What's in scope (Tier 1):**

- **Consumer count + map**: For each shared component, which files import it, grouped by app and domain. Answers "who breaks if I touch this?"
- **Adoption breadth**: How many apps and domains use the component. A component used by 1 app and 1 domain is a candidate for relocation. Answers "is this truly shared?"
- **API surface**: Props, emits, and slots extracted from each component's `defineProps`, `defineEmits`, and `<slot>` usage. Answers "is this getting bloated?"

**What's designed for but not built (Tier 2):**

The registry JSON schema includes placeholder fields for dependency depth, churn rate, and duplicate detection. These are documented as future additions, not current deliverables. The schema is extensible so adding them later doesn't require restructuring.

**What's out of scope (Tier 3):**

Component age, bundle size per component, test coverage per component. These are either redundant with existing tooling (size-limit, Istanbul) or not actionable on their own.

## Consequences

- **Refactoring becomes informed** — before touching a component, check its consumer map. High consumer count = high blast radius = more careful review
- **Misplaced components get surfaced** — a component with adoption breadth of 1 app / 1 domain should probably move out of `shared/`
- **API bloat becomes visible** — tracking prop/emit/slot counts over time shows which components are accumulating complexity
- **One more generated file to maintain** — the registry must be regenerated when components change. This should be automated (CI or pre-commit) to prevent staleness
- **The registry schema is forward-compatible** — Tier 2 metrics can be added without breaking consumers of the registry

## Open Questions

- Should the registry generation run as a CI check (fail if registry is stale) or as a pre-commit hook (auto-regenerate)? CI check is safer but adds friction. Pre-commit is smoother but requires the script to be fast.
- Should the Showcase app consume the registry to display health metrics alongside component demos? This would make the data visible to the team but adds a UI deliverable to the scope.
- At what threshold should adoption breadth trigger a "consider relocating" warning? One app? One domain? This needs real data before we set a policy.

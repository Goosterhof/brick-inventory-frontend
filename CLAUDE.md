# Lego Storage Frontend

## You Are a Lego Designer

Think of this codebase as a Lego set you are designing. These four principles are not just philosophy — they are design constraints. Every section in this document traces back to one of them. When you face a decision this document doesn't cover, these are your tiebreakers.

- **Sturdy** — Every brick must click firmly into place. Reliable, well-tested, won't fall apart under pressure. Type safety, error handling, and solid architecture are your clutch power. _This is why we have architecture rules, import boundaries, and 100% test coverage._
- **Beautiful** — A great set looks good on the shelf. Clean, consistent, readable code. A well-designed UI is like a finished Lego display — every piece has a purpose and looks right where it is. _This is why we follow Brick Brutalism, enforce formatting, and use conventions._
- **User-friendly** — The best Lego sets are a joy to build. Smooth developer experience: clear naming, intuitive APIs. Delightful end-user experience: responsive, accessible, fast. _This is why we have 150 kB bundle budgets, translation coverage, and accessibility rules._
- **Playable** — Lego isn't just for display — it's for play. Interactive, engaging, fun to use. The app should invite exploration, not frustrate it. _This is why every interactive element has physical feedback: shadows that lift, yellow that glows, borders that snap._

Just like a real Lego designer, you care about the full experience: from opening the box (onboarding), to following the instructions (documentation), to the finished model (production), to rebuilding it into something new (maintainability).

## Design Instincts

When the instructions don't cover your situation, lean on these biases:

- **Composition over configuration.** Small pieces that combine are better than big pieces with options.
- **Obvious over clever.** If a junior developer can't read it in 10 seconds, simplify it.
- **Delete over abstract.** Three similar lines are better than a premature helper. Extract only when a pattern appears three times with identical intent.
- **Narrow over flexible.** A component that does one thing well beats one that does three things okay. If a component needs more than 3-4 props, the API is probably wrong — split it.
- **Inline over indirection.** Keep logic close to where it's used. A 6-line computed property in a component is better than importing a 6-line utility.
- **Fail loud over fail silent.** If something is wrong, make it obvious. Don't swallow errors, don't return defaults for missing data, don't hide broken states behind loading spinners.

## Brand & Design

This project follows **Brick Brutalism** — a design system combining brutalist architecture with Lego physicality. See `.claude/docs/brand.md` for the full brand document, including color palette, shadow system, border rules, interactive states, and anti-patterns.

Key rules: 3px black borders, hard offset shadows (no blur), sharp corners (no border-radius), high contrast, yellow for interaction feedback, red for errors only.

## Project Overview

This is a Vue 3 multi-app monorepo for the Lego Storage API. Built with modern tooling and TypeScript. The architecture supports multiple independent apps sharing common code.

## API

- **Base URL**: `https://api.brick-inventory.com/api`
- **Authentication**: Credentials-based (cookies with `withCredentials: true`)
- **Data Format**: JSON with snake_case keys (automatically converted to/from camelCase in frontend)

## App Services

Each app has its own `services/` folder with instantiated services that can be imported directly (no provide/inject). Services are prefixed with the app name to avoid conflicts when multiple apps share code.

**Pattern**: `import { familyAuthService, familyRouterService } from "@app/services";`

Available services follow the naming convention `{appName}{ServiceType}Service` (e.g., `familyAuthService`, `familyHttpService`, `familyRouterService`, `familyStorageService`, `familyLoadingService`, `familyTranslationService`). Router also exports `FamilyRouterView` and `FamilyRouterLink` components.

```ts
// Authentication
await familyAuthService.login({email, password});
const {isLoggedIn, user} = familyAuthService;

// Navigation
await familyRouterService.goToDashboard();
await familyRouterService.goToRoute("about");
```

## Tech Stack

- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: Vue Router
- **Styling**: UnoCSS (utility-first CSS, similar to Tailwind)
- **Testing**: Vitest
- **Linting**: oxlint (fast Rust-based linter) + custom Vue conventions script
- **Formatting**: oxfmt (fast Rust-based formatter)
- **Commit Conventions**: commitlint with Conventional Commits
- **Bundle Budgets**: size-limit (150 kB per app)

## Path Aliases

- `@/*` → `./src/*` (general access to src)
- `@shared/*` → `./src/shared/*` (shared code)
- `@app/*` → `./src/apps/{currentApp}/*` (current app, resolved at build time)

## Domain-Based Page Structure — _Sturdy_

Pages are organized into **domains** within each app's `domains/` directory. Each domain is a self-contained folder that groups related pages together. The goal is **encapsulation**: a domain can be understood, tested, and refactored without touching anything outside it.

### Structure

```
src/apps/{appName}/
  domains/
    {domain}/
      index.ts           # Only export: routes
      pages/
        SomeView.vue
      components/
        SomeComponent.vue
      modals/
        SomeModal.vue
```

### Rules (enforced by oxlint + architecture tests)

- Each domain has an `index.ts` that exports only `routes` — this is its public API
- **Cross-domain imports are forbidden** — domains are independent bricks. If two domains need shared logic, it belongs in `@shared/`. _Why: this keeps domains independently deployable and prevents hidden coupling that makes refactoring scary._
- Within a domain, use relative imports (e.g., `./pages/HomeView.vue`)
- The router service imports routes from each domain via `@app/domains/{domain}`

### Adding a New Domain

```ts
// src/apps/families/domains/items/index.ts
import type {RouteRecordRaw} from "vue-router";

export const routes = [
    {path: "/items", name: "items", component: () => import("./pages/ItemsView.vue")},
] as const satisfies readonly RouteRecordRaw[];
```

Then register in `src/apps/families/services/router.ts` by importing and spreading into the routes array.

### Naming & Route Conventions

- Page files: `{Descriptive}View.vue` (e.g., `SetsOverviewView.vue`, `AddSetView.vue`)
- Route names: kebab-case (e.g., `sets-add`, `sets-detail`)
- Route paths: kebab-case (e.g., `/sets/add`, `/sets/:id/edit`)
- Route meta: `authOnly: true` for authenticated routes, `canSeeWhenLoggedIn: false` for guest-only routes (login, register)

## Architecture Rules — _Sturdy_

### Import Boundaries (enforced by oxlint)

These boundaries exist to keep the dependency graph clean and predictable. Think of them like the walls in a Lego set — they define the shape.

- **Shared → Apps**: forbidden. Shared code is the foundation; it can't depend on what's built on top of it.
- **App → Sibling App**: forbidden. Apps are independent sets in the same box — they share bricks from `@shared/`, not from each other.
- **Domain → Sibling Domain**: forbidden. Domains are self-contained sub-builds within an app (see above).
- **All code** must use path aliases (`@shared/`, `@app/`) instead of relative paths crossing module boundaries. _Why: aliases make dependencies explicit and greppable._
- **Tests** (`src/tests/`) are exempt from import restrictions.

### Storage Access (enforced by oxlint)

Direct `localStorage` and `sessionStorage` access is forbidden — use the app storage service (e.g., `familyStorageService`). Only `src/shared/services/storage.ts` is exempt. _Why: centralizing storage access lets us prefix keys per-app, mock in tests, and swap backends without a shotgun refactor._

### Tooling-Enforced Quality

oxlint enforces complexity limits, accessibility rules (jsx-a11y), Vue conventions (props/emits declarations, SFC block order, define-macros order), and component naming. The Vue conventions script enforces two-word PascalCase names and block order. **Trust the linter** — if it passes, you're good. If you're curious about specific thresholds, check `oxlint.json`.

## Translations (i18n) — _User-friendly_

All user-facing text **must** use the app's translation service — never hardcode strings. _Why: the app supports English and Dutch, and hardcoded strings are invisible to translators._

### Usage

```ts
import {familyTranslationService} from "@app/services";
const {t} = familyTranslationService;
```

```vue
<template>
    <h1>{{ t("home.title").value }}</h1>
    <button :aria-label="t('common.delete').value">{{ t('common.delete').value }}</button>
    <p>{{ t("errors.minLength", {min: 8}).value }}</p>
</template>
```

Note: `t()` returns a `ComputedRef` — use `.value` to unwrap in templates.

### Rules

- **No bare strings in templates** — all visible text must come from the translation service
- **Keys use "section.name" format** — e.g., `t("common.save")`, `t("auth.logIn")`
- **Add new keys to both locales** — `en` and `nl` in the app's `services/translation.ts`
- **Reuse existing keys** — check the translation file before creating duplicates

## Coding Conventions — _Beautiful_

- Always run `npm run format` before committing changes
- Use Composition API with `<script setup>` syntax
- Use TypeScript for all `.ts` and `.vue` files
- Use UnoCSS attributify syntax for styling (see `.claude/skills/unocss-styling.md`)
- Place all tests in `src/tests/` (unit tests in `src/tests/unit/`)
- See `.claude/skills/testing.md` for testing patterns
- Use two-word PascalCase for component names (e.g., FormLabel, TextInput, NavLink)
- Use camelCase for variables and functions
- Use arrow functions (`const fn = () => {}`) instead of function declarations
- Avoid nested ternaries — use computed properties with if/else instead
- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start families app dev server |
| `npm run dev:admin` | Start admin app dev server |
| `npm run build` | Build all apps (with type-check) |
| `npm run lint` | Run oxlint with type-aware rules |
| `npm run lint:vue` | Check Vue conventions (naming, block order, macros order) |
| `npm run format` | Format all files with oxfmt |
| `npm run format:check` | Check formatting without writing |
| `npm run knip` | Check for unused exports |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test:unit` | Run unit tests (watch mode) |
| `npm run test:coverage` | Run tests with 100% coverage threshold |
| `npm run size` | Check bundle sizes against budgets |

## Learnings — _Getting Sharper_

After every mistake, non-obvious discovery, or user correction — update `.claude/docs/learnings.md`. This is your memory between sessions. Read it. Use it. Keep it lean. When a learning proves itself, promote it here or to a skill file and delete it from learnings.

## Git Hooks — _Sturdy_

- **pre-commit** (lint-staged): formats and lints staged `.ts`/`.vue` files, runs Vue conventions on `.vue` files
- **pre-push**: runs type-check, knip, test coverage, and build — the full safety net before code leaves your machine
- **commit-msg**: validates commit message format via commitlint

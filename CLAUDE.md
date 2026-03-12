# Lego Storage Frontend

## You Are a Lego Designer

Think of this codebase as a Lego set you are designing. Every decision you make should follow the principles of a master Lego designer:

- **Sturdy** — Every brick must click firmly into place. Write code that is reliable, well-tested, and won't fall apart under pressure. No loose connections: type safety, proper error handling, and solid architecture are your clutch power.
- **Beautiful** — A great set looks good on the shelf. Write clean, consistent, readable code. Follow the established patterns and conventions. A well-designed UI is like a finished Lego display — every piece has a purpose and looks right where it is.
- **User-friendly** — The best Lego sets are a joy to build. Make the developer experience smooth: clear naming, intuitive APIs, helpful abstractions. Make the end-user experience delightful: responsive, accessible, fast.
- **Playable** — Lego isn't just for display — it's for play. Build features that are interactive, engaging, and fun to use. The app should invite exploration, not frustrate it.

Just like a real Lego designer, you care about the full experience: from opening the box (onboarding), to following the instructions (documentation), to the finished model (production), to rebuilding it into something new (maintainability).

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

Each app has its own `services/` folder with instantiated services that can be imported directly (no provide/inject). Services are prefixed with the app name to avoid conflicts.

### Available Services (families app)

| Service | Description |
|---------|-------------|
| `familyHttpService` | Axios-based HTTP client configured with API base URL |
| `familyAuthService` | Authentication (login, logout, register, checkIfLoggedIn) |
| `familyRouterService` | Navigation methods (goToRoute, goToDashboard, etc.) |
| `FamilyRouterView` | Router view component for rendering routes |
| `FamilyRouterLink` | Router link component for navigation |
| `familyStorageService` | localStorage wrapper with app-specific prefix |
| `familyLoadingService` | Loading state management |
| `familyTranslationService` | i18n with locale support |

### Usage

```ts
import {
    familyAuthService,
    familyHttpService,
    familyRouterService,
    FamilyRouterView,
    FamilyRouterLink,
} from "@app/services";

// Authentication
await familyAuthService.login({email, password});
await familyAuthService.register({familyName, name, email, password, passwordConfirmation});
const {isLoggedIn, user} = familyAuthService;

// Navigation
await familyRouterService.goToDashboard();
await familyRouterService.goToRoute("about");

// In templates, use the extracted router components
// <FamilyRouterView />
// <FamilyRouterLink :to="{name: 'home'}">Home</FamilyRouterLink>
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

```ts
import NavLink from "@shared/components/NavLink.vue";
import {createHttpService} from "@shared/services/http";
```

## Domain-Based Page Structure

Pages are organized into **domains** within each app's `domains/` directory. Each domain is a self-contained folder that groups related pages together.

### Structure

```
src/apps/{appName}/
  domains/
    {domain}/
      index.ts           # Only export: routes
      pages/
        SomeView.vue
        AnotherView.vue
      components/
        SomeComponent.vue
      modals/
        SomeModal.vue
    {domain}/
      index.ts
      pages/
        ...
```

### Rules (enforced by oxlint + architecture tests)

- Each domain has an `index.ts` that serves as its public API
- The **only export** from a domain's `index.ts` is `routes`
- **Cross-domain imports are forbidden** — a domain cannot import from another domain
- Within a domain, use relative imports (e.g., `./pages/HomeView.vue`)
- Domain-specific components go in `components/`, modals in `modals/`
- The router service imports routes from each domain via `@app/domains/{domain}`

### Example: Adding a New Domain

```ts
// src/apps/families/domains/items/index.ts
import type {RouteRecordRaw} from "vue-router";

export const routes = [
    {path: "/items", name: "items", component: () => import("./pages/ItemsView.vue")},
] as const satisfies readonly RouteRecordRaw[];

// Then register in src/apps/families/services/router.ts
import {routes as itemRoutes} from "@app/domains/items";
const routes = [...homeRoutes, ...itemRoutes, ...otherRoutes] as const satisfies readonly RouteRecordRaw[];
```

## Architecture Rules

### Import Boundaries (enforced by oxlint)

- **Shared code** (`src/shared/`) must not import from any app (`@app/` is forbidden)
- **Apps** must not import from sibling apps (e.g., `families` cannot import from `admin`)
- **Domains** (`domains/{domain}/`) must not import from other domains (`@app/domains/` is forbidden within domain files)
- **All code** must use path aliases (`@shared/`, `@app/`) instead of relative paths crossing module boundaries
- **Tests** (`src/tests/`) are exempt from import restrictions

### Storage Access (enforced by oxlint)

- Direct `localStorage` and `sessionStorage` access is forbidden globally
- Use the app storage service instead (e.g., `familyStorageService`)
- Only `src/shared/services/storage.ts` is exempt (it wraps `localStorage`)

### Complexity Limits (enforced by oxlint, warn level)

- Max cyclomatic complexity: 15
- Max function parameters: 4
- Max nesting depth: 4
- Max nested callbacks: 3
- Max lines per function: 80 (excluding blank lines and comments)

### Accessibility (enforced by oxlint via jsx-a11y)

- Images must have alt text
- Anchors must have content and valid href
- Headings must have content
- Interactive elements need keyboard event handlers
- No positive tabindex values

## Translations (i18n)

All user-facing text **must** use the app's translation service — never hardcode strings in templates or script code.

### Usage

```ts
import {familyTranslationService} from "@app/services";

const {t} = familyTranslationService;
```

```vue
<template>
    <!-- In text content — use .value to unwrap the ComputedRef -->
    <h1>{{ t("home.title").value }}</h1>

    <!-- In attribute bindings -->
    <button :aria-label="t('common.delete').value">{{ t('common.delete').value }}</button>

    <!-- With parameters -->
    <p>{{ t("errors.minLength", {min: 8}).value }}</p>
</template>
```

### Rules

- **No bare strings in templates** — all visible text (headings, labels, buttons, placeholders, error messages, aria-labels) must come from the translation service
- **Keys use "section.name" format** — e.g., `t("common.save")`, `t("auth.logIn")`, `t("errors.required")`
- **Add new keys to both locales** — when adding a translation key, add it to both `en` and `nl` in the app's `services/translation.ts`
- **Reuse existing keys** — check the translation file before creating duplicates (e.g., use `common.save` instead of adding `sets.save` if the meaning is the same)
- **Translation file location**: `src/apps/{appName}/services/translation.ts`

## Coding Conventions

- Always run `npm run format` before committing changes
- Use Composition API with `<script setup>` syntax
- Use TypeScript for all `.ts` and `.vue` files
- Use UnoCSS attributify syntax for styling (see `.claude/skills/unocss-styling.md`)
- Place all tests in `src/tests/` (unit tests in `src/tests/unit/`)
- See `.claude/skills/component-unit-test.md` for testing patterns
- Use two-word PascalCase for component names (e.g., FormLabel, TextInput, NavLink) — enforced by `npm run lint:vue`
- Use camelCase for variables and functions
- Use arrow functions (`const fn = () => {}`) instead of function declarations
- Avoid nested ternaries - use computed properties with if/else instead
- Vue SFC block order: `<script>` → `<template>` → `<style>` — enforced by `npm run lint:vue`
- Define-macros order: `defineProps` → `defineEmits` → `defineSlots` — enforced by `npm run lint:vue`
- Use type-based props/emits declarations (enforced by oxlint `vue/define-props-declaration`, `vue/define-emits-declaration`)
- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint on commit)

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

## Git Hooks

- **pre-commit** (lint-staged): formats and lints staged `.ts`/`.vue` files, runs Vue conventions on `.vue` files
- **pre-push**: runs type-check, knip, test coverage, and build
- **commit-msg**: validates commit message format via commitlint

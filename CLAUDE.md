# Lego Storage Frontend

## Project Overview

This is a Vue 3 multi-app monorepo for the Lego Storage API. Built with modern tooling and TypeScript. The architecture supports multiple independent apps sharing common code.

## API

- **Base URL**: `https://api.brick-inventory.com/api`
- **Authentication**: Credentials-based (cookies with `withCredentials: true`)
- **Data Format**: JSON with snake_case keys (automatically converted to/from camelCase in frontend)
- **OpenAPI Spec**: Available at `/docs/api.json` - use this for endpoint details

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
- **Linting**: oxlint (fast Rust-based linter)
- **Formatting**: oxfmt (fast Rust-based formatter)

## Path Aliases

- `@/*` → `./src/*` (general access to src)
- `@shared/*` → `./src/shared/*` (shared code)
- `@app/*` → `./src/apps/{currentApp}/*` (current app, resolved at build time)

```ts
import NavLink from "@shared/components/NavLink.vue";
import {createHttpService} from "@shared/services/http";
```

## Coding Conventions

- Always run `npm run format` before committing changes
- Use Composition API with `<script setup>` syntax
- Use TypeScript for all `.ts` and `.vue` files
- Use UnoCSS attributify syntax for styling (see `.claude/skills/unocss-styling.md`)
- Place all tests in `src/tests/` (unit tests in `src/tests/unit/`)
- See `.claude/skills/component-unit-test.md` for testing patterns
- Use two-word PascalCase for component names (e.g., FormLabel, TextInput, NavLink)
- Use camelCase for variables and functions
- Use arrow functions (`const fn = () => {}`) instead of function declarations
- Avoid nested ternaries - use computed properties with if/else instead

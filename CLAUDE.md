# Lego Storage Frontend

## Project Overview

This is a Vue 3 multi-app monorepo for the Lego Storage API. Built with modern tooling and TypeScript. The architecture supports multiple independent apps sharing common code.

## API

- **Base URL**: `https://api.brick-inventory.com/api`
- **Authentication**: Credentials-based (cookies with `withCredentials: true`)
- **Data Format**: JSON with snake_case keys (automatically converted to/from camelCase in frontend)
- **OpenAPI Spec**: Available at `/docs/api.json`

### Endpoints

#### General
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check (returns status + timestamp) |

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user (requires: family_name, name, email, password, password_confirmation) |

#### Family
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/family/rebrickable-token` | Set Rebrickable user token |

#### Family Sets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/family-sets` | List all family sets |
| POST | `/family-sets` | Create family set (requires: set_num; optional: quantity, status, purchase_date, notes) |
| GET | `/family-sets/{id}` | Get family set by ID |
| PUT | `/family-sets/{id}` | Update family set (requires: quantity, status) |
| DELETE | `/family-sets/{id}` | Delete family set |
| POST | `/family-sets/import-from-rebrickable` | Import sets from Rebrickable |

#### Sets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sets/{setNum}/parts` | Get parts for a set by set number |

#### Storage Options
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/storage-options` | List all storage options |
| POST | `/storage-options` | Create storage option (requires: name; optional: description, parent_id, row, column) |
| GET | `/storage-options/{id}` | Get storage option by ID |
| PUT | `/storage-options/{id}` | Update storage option |
| DELETE | `/storage-options/{id}` | Delete storage option |
| GET | `/storage-options/{id}/parts` | List parts in storage option |
| POST | `/storage-options/{id}/parts` | Assign part to storage (requires: part_id, quantity; optional: color_id) |
| DELETE | `/storage-options/{id}/parts/{partId}` | Remove part from storage |

### Enums

**FamilySet Status**: `sealed` | `built` | `in_progress` | `incomplete`

### HTTP Service Usage

```ts
import {createHttpService} from "@shared/services/http";

const http = createHttpService("https://api.brick-inventory.com/api");

// Available methods
http.getRequest<T>(endpoint, options);
http.postRequest<T>(endpoint, data, options);
http.putRequest<T>(endpoint, data, options);
http.patchRequest<T>(endpoint, data, options);
http.deleteRequest<T>(endpoint, options);
```

### Resource Adapter Pattern

The `resourceAdapter` provides CRUD operations for domain resources:

```ts
import {resourceAdapter} from "@shared/services/resource-adapter";

// For existing resources (with id)
const adapted = resourceAdapter(resource, "family-sets", storeModule, httpService);
adapted.update();  // PUT /family-sets/{id}
adapted.patch({status: "built"});  // PATCH /family-sets/{id}
adapted.delete();  // DELETE /family-sets/{id}

// For new resources (without id)
const newAdapted = resourceAdapter(newResource, "family-sets", storeModule, httpService);
newAdapted.create();  // POST /family-sets
```

### API Conventions

- All resources have `id`, `createdAt`, and `updatedAt` fields
- API uses snake_case (`created_at`), frontend uses camelCase (`createdAt`)
- Conversion is handled automatically by `deepSnakeKeys` and `toCamelCaseTyped` helpers
- 401 responses indicate authentication required
- 404 responses indicate resource not found

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

### Creating Services for a New App

1. Create service files in `src/apps/{appname}/services/`:
   - `http.ts` - Instantiate HTTP service with API URL
   - `auth.ts` - Instantiate auth service with profile type
   - `router.ts` - Define routes and create router service, extract RouterView/RouterLink
   - `storage.ts` - Instantiate storage service with app prefix
   - `loading.ts` - Instantiate loading service
   - `translation.ts` - Define translations and instantiate translation service
   - `index.ts` - Re-export all services

2. Prefix all exports with the app name (e.g., `newappHttpService`, `NewappRouterView`)

3. In `main.ts`, call `{appname}RouterService.install()` instead of `app.use(router)`

4. In `App.vue`, import and use the extracted `{Appname}RouterView` and `{Appname}RouterLink` components

## Tech Stack

- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: Vue Router
- **Styling**: UnoCSS (utility-first CSS, similar to Tailwind)
- **Testing**: Vitest
- **Linting**: oxlint (fast Rust-based linter)
- **Formatting**: oxfmt (fast Rust-based formatter)

## Commands

```bash
# Install dependencies
npm install

# Start development server (families app)
npm run dev
npm run dev:families

# Build for production (all apps)
npm run build

# Build specific app
npm run build:families

# Preview production build
npm run preview

# Run unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
src/
├── apps/                    # Application entry points
│   └── families/            # Families app
│       ├── App.vue          # Root component
│       ├── main.ts          # Application entry point
│       ├── index.html       # App-specific HTML
│       ├── services/        # App-specific service instances
│       │   ├── index.ts     # Re-exports all services
│       │   ├── http.ts      # familyHttpService
│       │   ├── auth.ts      # familyAuthService
│       │   ├── router.ts    # familyRouterService, FamilyRouterView, FamilyRouterLink
│       │   ├── storage.ts   # familyStorageService
│       │   ├── loading.ts   # familyLoadingService
│       │   └── translation.ts # familyTranslationService
│       ├── types/           # App-specific types
│       │   └── profile.ts   # User profile type
│       └── views/           # Page-level components (routed views)
│           ├── HomeView.vue
│           └── AboutView.vue
├── shared/                  # Shared code across all apps
│   ├── assets/              # Static assets (images, fonts, etc.)
│   ├── components/          # Reusable Vue components
│   │   ├── NavLink.vue
│   │   └── forms/           # Form-related components
│   │       ├── FormError.vue
│   │       ├── FormField.vue
│   │       ├── FormLabel.vue
│   │       └── inputs/
│   │           ├── NumberInput.vue
│   │           └── TextInput.vue
│   ├── errors/              # Custom error classes
│   ├── helpers/             # Utility functions
│   ├── services/            # Service factory functions
│   └── types/               # TypeScript type definitions
└── tests/
    └── unit/
        ├── setup.ts
        ├── apps/            # App-specific tests
        │   └── families/
        └── shared/          # Shared code tests
            ├── components/
            ├── helpers/
            └── services/
```

## Path Aliases

The project uses path aliases for clean imports:

- `@/*` → `./src/*` (general access to src)
- `@shared/*` → `./src/shared/*` (shared code)
- `@app/*` → `./src/apps/{currentApp}/*` (current app, resolved at build time)

Use `@shared/` for imports in shared code and app code:

```ts
import NavLink from "@shared/components/NavLink.vue";
import {createHttpService} from "@shared/services/http";
```

Use `@app/` for app-specific imports within the same app:

```ts
import App from "@app/App.vue";
```

## Adding a New App

1. Create the app directory structure:
   ```bash
   mkdir -p src/apps/newapp/services src/apps/newapp/types src/apps/newapp/views
   ```

2. Create required files:
   - `src/apps/newapp/index.html` - App HTML entry
   - `src/apps/newapp/main.ts` - Vue app initialization
   - `src/apps/newapp/App.vue` - Root component
   - `src/apps/newapp/services/` - App-specific service instances (see App Services section)
   - `src/apps/newapp/types/` - App-specific types

3. Add npm scripts to `package.json`:
   ```json
   "dev:newapp": "cross-env APP_NAME=newapp vite",
   "build:newapp": "cross-env APP_NAME=newapp vite build"
   ```

4. Update the build script to include the new app:
   ```json
   "build": "run-p type-check \"build:families {@}\" \"build:newapp {@}\" --"
   ```

5. Create test directory:
   ```bash
   mkdir -p src/tests/unit/apps/newapp
   ```

## Coding Conventions

- Always run `npm run format` before committing changes
- Use Composition API with `<script setup>` syntax
- Use TypeScript for all `.ts` and `.vue` files
- Use UnoCSS attributify syntax for styling (see UnoCSS section)
- Place all tests in `src/tests/` (unit tests in `src/tests/unit/`)
- Use `shallowMount` for unit testing Vue components (isolates component from children)
- When testing components that use child components, use `findComponent()` to check props passed to stubs
- Tests must be self-contained - do not use helper functions (they can unintentionally affect other tests)
- Use AAA pattern with comments: `// Arrange`, `// Act`, `// Assert` (or `// Arrange & Act` for simple tests)
- Test components through UI interactions (button clicks, events), not by exposing internal methods via `defineExpose`
- See `.claude/skills/component-unit-test.md` for detailed testing patterns
- Use two-word PascalCase for component names (e.g., FormLabel, TextInput, NavLink)
- Use camelCase for variables and functions
- Use arrow functions (`const fn = () => {}`) instead of function declarations (only use `function` for overloading)
- Avoid nested ternaries - use computed properties with if/else instead

## Vue Component Patterns

### Props with Destructuring

Use prop destructuring with inline defaults (no `withDefaults` needed):

```ts
const {
    label,
    type = "text",
    disabled = false,
} = defineProps<{
    label: string;
    type?: "text" | "email" | "password";
    disabled?: boolean;
}>();
```

### v-model with defineModel

Use `defineModel` for two-way binding instead of manual prop + emit:

```ts
const model = defineModel<string>({required: true});
```

Then bind directly in template:

```vue
<input v-model="model" />
```

### Form Component Composition

Input components should compose the form primitives (FormField, FormLabel, FormError):

```vue
<template>
    <FormField>
        <FormLabel :for="inputId" :required="required">{{ label }}</FormLabel>
        <input :id="inputId" v-model="model" ... />
        <FormError v-if="error" :id="errorId" :message="error" />
    </FormField>
</template>
```

## UnoCSS

This project uses UnoCSS with the following presets:

- `presetUno`: Default preset (Tailwind-compatible utilities)
- `presetAttributify`: Attributify mode for cleaner templates
- `presetIcons`: Icon support

Configuration is in `uno.config.ts`.

### Attributify Mode

Prefer attributify syntax over `class` for static utilities:

```vue
<!-- Preferred: attributify -->
<div flex="~ col" gap="2" p="x-4 y-3">
<label text="sm black" font="bold" uppercase tracking="wide">

<!-- Avoid: class strings -->
<div class="flex flex-col gap-2 px-4 py-3">
<label class="text-sm text-black font-bold uppercase tracking-wide">
```

Common patterns:

- `flex="~ col"` - `~` enables base utility, additional values modify it
- `text="sm black"` - groups related utilities (size + color)
- `p="x-4 y-3"` - padding shorthand
- `border="3 black"` - border width + color
- Single values work as boolean attributes: `uppercase`, `outline="none"`

Use `:class` for dynamic/conditional styles only.

## Design System

This project uses a **neo-brutalism** style with the following characteristics:

- **Borders**: Bold 3px black borders (`border-3 border-black`)
- **Shadows**: Solid offset box shadows, no blur (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`)
- **Focus states**: Shadow grows on focus (`focus:shadow-[6px_6px_0px_0px_...]`), yellow background highlight (`focus:bg-yellow-100`)
- **Error states**: Red-tinted background (`bg-red-100`) with red offset shadow
- **Labels**: Uppercase, bold, wide tracking (`uppercase font-bold tracking-wide`)
- **Corners**: Sharp corners (no border-radius)
- **Colors**: High contrast - black on white with bright accents (yellow, red)

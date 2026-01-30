# Lego Storage Frontend

## Project Overview

This is a Vue 3 Single Page Application (SPA) for the Lego Storage API. Built with modern tooling and TypeScript.

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

# Start development server
npm run dev

# Build for production
npm run build

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
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable Vue components
├── router/          # Vue Router configuration
├── tests/           # All tests
│   └── unit/        # Unit tests
├── views/           # Page-level components (routed views)
├── App.vue          # Root component
└── main.ts          # Application entry point
```

## Coding Conventions

- Use Composition API with `<script setup>` syntax
- Use TypeScript for all `.ts` and `.vue` files
- Use UnoCSS attributify syntax for styling (see UnoCSS section)
- Place all tests in `src/tests/` (unit tests in `src/tests/unit/`)
- Use `shallowMount` for unit testing Vue components (isolates component from children)
- Use PascalCase for component names
- Use camelCase for variables and functions

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

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
- Use UnoCSS utility classes for styling
- Place all tests in `src/tests/` (unit tests in `src/tests/unit/`)
- Use PascalCase for component names
- Use camelCase for variables and functions

## UnoCSS

This project uses UnoCSS with the following presets:

- `presetUno`: Default preset (Tailwind-compatible utilities)
- `presetAttributify`: Attributify mode for cleaner templates
- `presetIcons`: Icon support

Configuration is in `uno.config.ts`.

## Design System

This project uses a **neo-brutalism** style with the following characteristics:

- **Borders**: Bold 3px black borders (`border-3 border-black`)
- **Shadows**: Solid offset box shadows, no blur (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`)
- **Focus states**: Shadow grows on focus (`focus:shadow-[6px_6px_0px_0px_...]`), yellow background highlight (`focus:bg-yellow-100`)
- **Error states**: Red-tinted background (`bg-red-100`) with red offset shadow
- **Labels**: Uppercase, bold, wide tracking (`uppercase font-bold tracking-wide`)
- **Corners**: Sharp corners (no border-radius)
- **Colors**: High contrast - black on white with bright accents (yellow, red)

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
- **Linting**: ESLint with Vue and TypeScript configs

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

# Lint and fix
npm run lint
```

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable Vue components
│   └── __tests__/   # Component tests
├── router/          # Vue Router configuration
├── views/           # Page-level components (routed views)
├── App.vue          # Root component
└── main.ts          # Application entry point
```

## Coding Conventions

- Use Composition API with `<script setup>` syntax
- Use TypeScript for all `.ts` and `.vue` files
- Use UnoCSS utility classes for styling
- Place tests in `__tests__` directories adjacent to the code they test
- Use PascalCase for component names
- Use camelCase for variables and functions

## UnoCSS

This project uses UnoCSS with the following presets:
- `presetUno`: Default preset (Tailwind-compatible utilities)
- `presetAttributify`: Attributify mode for cleaner templates
- `presetIcons`: Icon support

Configuration is in `uno.config.ts`.

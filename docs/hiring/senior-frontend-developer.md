# Senior Frontend Developer — Brick & Mortar Associates

**Department:** Engineering
**Reports to:** Chief Executive Minifig
**Location:** LEGOLAND HQ (Remote-friendly — we ship bricks, not butts-in-seats)
**Type:** Full-time

---

## About Us

Brick & Mortar Associates is the most prestigious architecture firm in all of LEGOLAND. We're building the **LEGO Storage Inventory Management System** — a multi-app Vue 3 platform where families catalog their sets, track parts, and organize storage. Every stud clicks. Every brick aligns. No loose pieces on the floor.

Our Families tower is standing tall with 7 domains, 31 shared components, and 73 test files at 100% coverage. Now we need someone to build out the **Admin dashboard** — the corner office of our operation.

---

## The Role

You'll be the lead architect on our Admin app, turning scaffolding into a fully functional command center. You'll also contribute to the shared component library and help maintain our ruthlessly high quality bar.

### What You'll Build

- **Admin Dashboard** — analytics, user management, system health monitoring
- **Inventory Reporting** — aggregated views across families, sets, and parts
- **User Administration** — account management, permissions, activity logs
- **System Configuration** — app settings, feature management, maintenance tools
- **Shared Components** — extend the neo-brutalist LEGO design system as needed

---

## Requirements

### Must-Have (Load-Bearing Skills)

- **Vue 3** with Composition API and `<script setup>` — this is non-negotiable
- **TypeScript 5+** in strict mode — we don't do `any`, ever
- **Testing discipline** — 100% coverage on lines, functions, branches, and statements (Vitest + @vue/test-utils)
- Experience with **atomic CSS** frameworks (we use UnoCSS, but Tailwind experience translates)
- Comfort with **factory-based service architecture** — no singletons, no global state libraries
- Familiarity with **Vue Router** and domain-based route organization
- Understanding of **API integration patterns** — snake_case/camelCase conversion, middleware-based HTTP services, 422 validation handling

### Nice-to-Have (Decorative Bricks)

- Experience with **Vite** build tooling
- Familiarity with **oxlint/oxfmt** or similar Rust-based linting/formatting tools
- Background in **neo-brutalist or bold UI design** systems
- Experience with **barcode/scanner integrations**
- Prior work on **multi-app monorepo** architectures
- Knowledge of **knip** for dead code detection and **size-limit** for bundle analysis

---

## Our Standards

This is structural engineering — we don't guess if a wall will hold. Here's how we work:

| Standard | Expectation |
|---|---|
| Coverage | 100% — no exceptions |
| Formatting | oxfmt-enforced (120 char width, 4-space indent, double quotes, semicolons) |
| Linting | oxlint with type-aware checking — zero warnings |
| Complexity | Max cyclomatic complexity of 10, max nesting depth of 4 |
| Commits | Conventional Commits enforced by commitlint |
| Pre-push | type-check, knip, test:coverage, and build must all pass |
| Dead code | None. knip runs on every push. No unused exports. |
| Console logs | Forbidden in production code |

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Vue 3 (Composition API) |
| Language | TypeScript 5.9 (strict) |
| Build | Vite 8 |
| Styling | UnoCSS 66 (attributify mode) |
| Icons | Phosphor Icons |
| HTTP | Axios + custom middleware-based HttpService |
| Testing | Vitest + @vue/test-utils (JSDOM) |
| Linting | oxlint |
| Formatting | oxfmt |
| Git Hooks | Husky + lint-staged + commitlint |

---

## What We Offer

- A codebase that's already clean — you won't spend your first month untangling spaghetti
- A component library with 31 battle-tested pieces ready to use
- A design system that actually makes sense (bricks have studs, buttons have shadows)
- Autonomy to architect the Admin app from the ground up
- The satisfaction of building something where every piece fits

---

## How to Apply

Submit a PR. Seriously. Fork our showcase app, build a small admin widget using our component library, and show us your bricks. We value working code over whiteboard algorithms.

---

*Brick & Mortar Associates is an equal opportunity builder. We welcome minifigs of all colors, sizes, and head accessories.*

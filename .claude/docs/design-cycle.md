# Design Cycle

A lightweight 5-phase loop for designing and building features, inspired by the Lego designer philosophy.

## The Phases

### 1. Unbox — Define the Feature

**Goal**: Understand what we're building and why.

- Create a [Feature Brief](./.feature-brief-template.md) for the feature
- Identify the user problem and desired outcome
- Write acceptance criteria (clear pass/fail conditions)
- Define scope boundaries (what's in, what's out)

**Output**: A completed feature brief document.

### 2. Sort — Map the Architecture

**Goal**: Figure out where the feature lives and what pieces are needed.

- Consult the [Domain Map](./domain-map.md) — does this fit in an existing domain or need a new one?
- Identify required pieces: pages, components, modals, API endpoints
- Create [Component Specs](./.component-spec-template.md) for non-trivial components
- Update the domain map if adding a new domain

**Output**: Architecture decisions documented, component specs for complex pieces.

### 3. Build — Implement

**Goal**: Write the code, following established patterns.

- Work domain-by-domain, component-by-component
- Use the relevant skills as guides:
    - `vue-component` for component patterns
    - `unocss-styling` for Brick Brutalism styling (see also `.claude/docs/brand.md`)
    - `api` for HTTP requests, resource adapters, and loading/error patterns
    - `new-modal` for modal templates
- Write tests alongside code (not after):
    - `testing` for both Vue component and TypeScript tests
- Commit early and often with conventional commit messages

**Output**: Working implementation with tests.

### 4. Inspect — Review Quality

**Goal**: Verify the build meets standards.

Run the [Design Review Checklist](../skills/design-review.md):

```bash
npm run format:check
npm run lint
npm run lint:vue
npm run type-check
npm run test:coverage
npm run size
npm run knip
```

**Output**: All checks green, review checklist complete.

### 5. Display — Ship It

**Goal**: Present the finished work.

- Create a PR with:
    - Summary of what was built and why
    - Before/after screenshots (if UI changes)
    - Acceptance criteria checked off
    - Link to feature brief
- Update the domain map if new domains were added
- Update CLAUDE.md if new services or patterns were introduced

**Output**: Merged PR, updated documentation.

## Quick Reference

| Phase   | Lego Analogy        | Key Question              | Key Output       |
| ------- | ------------------- | ------------------------- | ---------------- |
| Unbox   | Open the box        | What are we building?     | Feature brief    |
| Sort    | Sort the bricks     | Where does it go?         | Architecture map |
| Build   | Follow instructions | How do we build it?       | Code + tests     |
| Inspect | Check the model     | Is it sturdy & beautiful? | All checks pass  |
| Display | Put it on the shelf | Is it ready to show?      | Merged PR        |

## When to Skip Phases

- **Bug fixes**: Skip Unbox (the bug IS the brief). Start at Sort.
- **Tiny changes** (copy, config): Skip Unbox and Sort. Start at Build.
- **Refactors**: Skip Display PR ceremony if internal-only. Still do Inspect.

## Skills Reference

| Skill            | Used In                    |
| ---------------- | -------------------------- |
| `vue-component`  | Build (component patterns) |
| `unocss-styling` | Build (styling)            |
| `api`            | Build (HTTP & resources)   |
| `new-modal`      | Build (modal templates)    |
| `testing`        | Build (all tests)          |
| `design-review`  | Inspect (quality check)    |

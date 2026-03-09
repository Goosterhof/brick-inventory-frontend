# Design Review Skill

Checklist for reviewing a feature before shipping. Use this during the **Inspect** phase of the design cycle.

## Automated Checks

Run all automated checks first. Every check must pass.

```bash
npm run format:check  # Code formatting
npm run lint          # Linting (architecture rules, a11y, complexity)
npm run lint:vue      # Vue conventions (naming, block order, macros)
npm run type-check    # TypeScript type checking
npm run test:coverage # Tests with 100% coverage threshold
npm run size          # Bundle size under 150 kB per app
npm run knip          # No unused exports
```

## Manual Checklist

### Accessibility

- [ ] Interactive elements are keyboard-accessible (Tab, Enter, Escape)
- [ ] Images have alt text
- [ ] Form inputs have associated labels (via `for`/`id`)
- [ ] ARIA attributes are correct (`role`, `aria-label`, `aria-live`)
- [ ] Focus management works (modals trap focus, page transitions move focus)
- [ ] Color contrast meets WCAG AA (especially with neo-brutalism palette)

### Responsiveness

- [ ] Layout works on mobile (320px+)
- [ ] Layout works on tablet (768px+)
- [ ] Layout works on desktop (1024px+)
- [ ] No horizontal overflow on small screens
- [ ] Touch targets are at least 44x44px on mobile

### Neo-Brutalism Consistency

- [ ] Bold 3px black borders on interactive elements
- [ ] Solid offset shadows (no blur, no rounded corners)
- [ ] Focus states: shadow grows + yellow background highlight
- [ ] Error states: red background + red offset shadow
- [ ] Labels: uppercase, bold, wide tracking
- [ ] High contrast colors throughout

### Code Quality

- [ ] No `any` types — proper TypeScript throughout
- [ ] No cross-domain imports
- [ ] Path aliases used consistently (`@shared/`, `@app/`)
- [ ] Composition API with `<script setup>` syntax
- [ ] Two-word PascalCase component names
- [ ] Arrow functions (no function declarations)
- [ ] No nested ternaries
- [ ] SFC block order: script → template → style

### Architecture

- [ ] Domain `index.ts` only exports `routes`
- [ ] No direct localStorage/sessionStorage access
- [ ] Services used correctly (auth, http, router, storage)
- [ ] New routes registered in router service
- [ ] Domain map updated (if new domain or pages added)

### Testing

- [ ] All new code has tests
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] Tests are self-contained (no shared helpers)
- [ ] Accessibility tested (ARIA, roles, labels)
- [ ] Edge cases covered (error states, empty states, loading)
- [ ] `shallowMount` used (not `mount`)

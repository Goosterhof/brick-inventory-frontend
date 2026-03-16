# Design Review — _Inspect_

The final inspection before boxing the set. Every piece gets checked against the instruction booklet. If something wobbles, it does not ship.

## Automated Checks

Run all of these. Every one must pass.

```bash
npm run format:check
npm run lint
npm run lint:vue
npm run type-check
npm run test:coverage
npm run size
npm run knip
```

## Manual Checklist

### Accessibility — _User-friendly_

- [ ] Interactive elements are keyboard-accessible (Tab, Enter, Escape)
- [ ] Form inputs have associated labels
- [ ] Focus management works (modals trap focus, page transitions move focus)
- [ ] ARIA attributes are correct where needed

### Responsiveness — _User-friendly_

- [ ] Layout works on mobile (320px+), tablet (768px+), desktop (1024px+)
- [ ] No horizontal overflow on small screens
- [ ] Touch targets are at least 44x44px

### Brick Brutalism — _Beautiful_

- [ ] 3px black borders on interactive elements (never 1px, never rounded)
- [ ] Hard offset shadows (4px default, 6px hover/focus, 2px active)
- [ ] Focus: shadow grows + yellow background
- [ ] Error: red background + red shadow + red border
- [ ] No gradients, no opacity tricks, no border-radius

### Architecture — _Sturdy_

- [ ] Domain `index.ts` only exports `routes`
- [ ] No cross-domain imports
- [ ] No direct localStorage/sessionStorage
- [ ] Domain map updated (if new domain or pages added)

### Testing — _Sturdy_

- [ ] All new code has tests with 100% coverage
- [ ] Tests follow AAA pattern, are self-contained
- [ ] Edge cases covered (error states, empty states, loading)

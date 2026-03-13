# UnoCSS Styling — _Beautiful_

Styling patterns using UnoCSS with attributify mode.

## Attributify Mode

Prefer attributify syntax over class strings:

```vue
<!-- Preferred -->
<div flex="~ col" gap="2" p="x-4 y-3">
<label text="sm black" font="bold" uppercase tracking="wide">

<!-- Avoid -->
<div class="flex flex-col gap-2 px-4 py-3">
```

## Common Patterns

- `flex="~ col"` — `~` enables the base utility, additional values modify it
- `text="sm black"` — groups related utilities (size + color)
- `p="x-4 y-3"` — padding shorthand
- `border="3 black"` — border width + color
- Single values as boolean attributes: `uppercase`, `outline="none"`
- Use `:class` for dynamic/conditional styles only

## Brick Brutalism Quick Reference

See `.claude/docs/brand.md` for the full design system.

| Element | Pattern |
|---|---|
| **Borders** | `border="3 black"` — never 1px, never rounded |
| **Shadows** | `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` — 6px hover/focus, 2px active |
| **Focus** | Shadow grows + `bg-yellow-300` |
| **Error** | `bg-red-200` + `shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]` + `border-red-500` |
| **Labels** | `uppercase font-bold tracking-wide` |
| **Corners** | Sharp — never use `rounded` |
| **Colors** | Black/white primary, yellow for interaction, red for errors only |

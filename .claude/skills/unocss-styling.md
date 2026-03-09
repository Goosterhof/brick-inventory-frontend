# UnoCSS Styling Skill

Styling patterns using UnoCSS in this project.

## Presets

This project uses UnoCSS with:

- `presetUno`: Default preset (Tailwind-compatible utilities)
- `presetAttributify`: Attributify mode for cleaner templates
- `presetIcons`: Icon support

Configuration is in `uno.config.ts`.

## Attributify Mode

Prefer attributify syntax over `class` for static utilities:

```vue
<!-- Preferred: attributify -->
<div flex="~ col" gap="2" p="x-4 y-3">
<label text="sm black" font="bold" uppercase tracking="wide">

<!-- Avoid: class strings -->
<div class="flex flex-col gap-2 px-4 py-3">
<label class="text-sm text-black font-bold uppercase tracking-wide">
```

## Common Patterns

- `flex="~ col"` - `~` enables base utility, additional values modify it
- `text="sm black"` - groups related utilities (size + color)
- `p="x-4 y-3"` - padding shorthand
- `border="3 black"` - border width + color
- Single values work as boolean attributes: `uppercase`, `outline="none"`

Use `:class` for dynamic/conditional styles only.

## Design System (Brick Brutalism)

This project uses **Brick Brutalism**. See `.claude/docs/brand.md` for the full brand document (color palette, anti-patterns, interactive states, voice guidelines).

Quick reference for styling:

- **Borders**: Bold 3px black borders (`border="3 black"`) — never 1px, never rounded
- **Shadows**: Solid offset, no blur — default `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`, hover/focus `6px`, active/pressed `2px`
- **Focus states**: Shadow grows + yellow highlight (`focus:bg-yellow-100`)
- **Error states**: Red background (`bg-red-100`) + red offset shadow (`rgba(239,68,68,1)`)
- **Labels**: Uppercase, bold, wide tracking (`uppercase font-bold tracking-wide`)
- **Corners**: Sharp corners — **never** use `rounded` or `border-radius`
- **Colors**: Black/white primary, yellow accent (interaction only), red (errors only). No gradients, no opacity tricks

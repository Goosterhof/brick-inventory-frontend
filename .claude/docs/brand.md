# Brand & Design Document

## Brand Identity

**Name**: Brick Inventory
**Tagline**: Every brick has a place.
**Voice**: Confident, playful, direct. Like the bold text on a Lego box — no fluff, all fun.

## Design Philosophy: Brick Brutalism

Brick Brutalism takes the raw honesty of brutalist architecture and the tactile joy of Lego bricks, and smashes them together. The result is an interface that feels like snapping real bricks into place: chunky, satisfying, impossible to misunderstand.

### Core Principles

1. **Weight** — Every element has physical presence. Borders are thick. Shadows are solid. Nothing floats in ambiguous whitespace. If you can see it, you can almost feel it.

2. **Contrast** — Black on white. Bold on plain. Big on small. The interface communicates through stark differences, not subtle gradients. Information hierarchy is obvious at a glance.

3. **Honesty** — No fake depth, no decorative blur, no rounded-corner softness pretending things are gentler than they are. Shadows are hard offsets — they show exactly where the light is and where it isn't. Corners are sharp because bricks have edges.

4. **Playfulness** — Brutalism doesn't mean joyless. Bright yellow highlights, snappy interactions, uppercase labels that shout with enthusiasm. The interface is bold because it's excited to be used, not because it's trying to intimidate.

## Color Palette

The palette is intentionally constrained. Like a monochrome Lego set with a few accent bricks, every color has a specific job.

### Primary

| Role | Color | Value | Usage |
|------|-------|-------|-------|
| **Ink** | Black | `black` / `#000000` | Text, borders, shadows, primary buttons |
| **Surface** | White | `white` / `#FFFFFF` | Backgrounds, cards, input fields |

### Accents

| Role | Color | Value | Usage |
|------|-------|-------|-------|
| **Highlight** | Yellow | `yellow-100` / `#FEF9C3` | Focus states, hover feedback, active indicators |
| **Danger** | Red | `red-100` / `#FEE2E2` | Error backgrounds, destructive action hints |
| **Danger Text** | Red | `red-600` / `#DC2626` | Error messages, validation text |

### Neutrals

| Role | Color | Value | Usage |
|------|-------|-------|-------|
| **Muted** | Gray 200 | `gray-200` / `#E5E7EB` | Disabled backgrounds |
| **Disabled** | Gray 300 | `gray-300` / `#D1D5DB` | Disabled borders |
| **Secondary Text** | Gray 600 | `gray-600` / `#4B5563` | Placeholder text, subtle labels |

### Color Rules

- **Never use gradients.** Flat fills only. Bricks are solid plastic, not watercolor.
- **Never use opacity for emphasis.** Change the color, not the transparency.
- **Accent colors are rewards.** Yellow appears when you interact. It's feedback, not decoration.
- **Red means something is wrong.** Don't use it for branding or decoration.

## Typography

### Style

- **Labels and headings**: `uppercase font-bold tracking-wide` — like embossed text on a brick. Loud, clear, unapologetic.
- **Body text**: `font-medium text-black` — readable, no-nonsense.
- **Error text**: `text-sm text-red-600` — small but impossible to ignore.

### Rules

- Use the system font stack (UnoCSS default). No custom fonts — performance over personality.
- Never center long text. Left-align for readability.
- Use size to create hierarchy, not color. Black text at different sizes beats colored text at the same size.

## Borders & Edges

Borders are the most defining feature of Brick Brutalism. They are the studs on top of the brick — the part that makes it snap together.

### Specifications

| Property | Value | UnoCSS |
|----------|-------|--------|
| **Width** | 3px | `border="3 black"` |
| **Color** | Black | (included above) |
| **Radius** | 0 | None — never add `rounded` |
| **Style** | Solid | Default |

### Rules

- **Every interactive element gets a border.** Buttons, inputs, links, cards — if you can click it or type in it, it has a 3px black border.
- **Never use border-radius.** Sharp corners are the brand. Rounding an edge is like filing down a Lego stud.
- **Never use hairline borders** (1px). If a border exists, it must be 3px. Thin borders look indecisive.

## Shadows

Shadows in Brick Brutalism are not about realism — they're about physicality. A hard offset shadow says "this element is a brick sitting on a surface."

### Specifications

| State | Shadow | CSS |
|-------|--------|-----|
| **Default** | 4px offset | `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` |
| **Hover / Focus** | 6px offset | `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]` |
| **Active / Pressed** | 2px offset | `shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` |
| **Error** | 4px red offset | `shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]` |

### Rules

- **No blur. Ever.** Blur radius is always 0. Blurred shadows are for flat design. We build with bricks.
- **No spread.** Spread radius is always 0.
- **Offset direction is always down-right** (positive X, positive Y). Consistent lighting.
- **Shadow grows on hover/focus.** The brick lifts off the surface — it's about to be picked up and placed.
- **Shadow shrinks on active/press.** The brick is being pushed down into position. Click. Snap.

## Interactive States

Every interactive element must communicate its state clearly. No ambiguity.

| State | Visual Treatment |
|-------|-----------------|
| **Default** | 3px black border, 4px offset shadow |
| **Hover** | Shadow grows to 6px, background may shift (e.g., yellow highlight) |
| **Focus** | Shadow grows to 6px, `bg-yellow-100` highlight, `outline="none"` |
| **Active / Pressed** | Shadow shrinks to 2px (brick snaps into place) |
| **Disabled** | `bg-gray-200`, `border-gray-300`, `text-gray-600`, no shadow, `cursor-not-allowed` |
| **Error** | `bg-red-100`, red shadow, `border-red-500` |

### The Snap Principle

Interactions should feel like connecting Lego bricks:
- **Hover** = picking up the brick (it lifts — shadow grows)
- **Press** = pushing it down (it snaps — shadow shrinks)
- **Focus** = highlighting the stud you're about to connect (yellow glow)

## Layout

### Spacing

Use a consistent spacing scale. Like the grid on a Lego baseplate, spacing should be uniform and predictable.

- Use multiples of `4` for spacing (`gap-2`, `p-4`, `m-6`, etc.)
- Minimum touch target: 44x44px on mobile
- Group related elements with `gap-2` (8px)
- Separate sections with `gap-6` (24px) or more

### Containers

- Max content width for readability — don't stretch text edge-to-edge
- Use `flex="~ col"` for vertical stacking (the default building direction)
- Cards and panels get the full treatment: 3px border, offset shadow, sharp corners

## Accessibility

Brick Brutalism is inherently accessible by design — high contrast and bold visual cues help everyone.

### Requirements

- **Color contrast**: All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text). Black on white exceeds this.
- **Focus indicators**: Every focusable element has a visible focus state (yellow highlight + shadow growth). Never remove focus outlines without replacing them.
- **Error identification**: Errors use color (red), position (below the field), and text (descriptive message) — never color alone.
- **Touch targets**: Minimum 44x44px on mobile. Chunky buttons are a feature, not a compromise.
- **Keyboard navigation**: All interactions work with keyboard. Tab order follows visual order.
- **ARIA**: Use semantic HTML first. Add ARIA only when semantics alone aren't enough.

## Anti-Patterns

Things that violate the Brick Brutalism identity. If you see these in a PR, flag them.

| Don't | Why | Do Instead |
|-------|-----|------------|
| `rounded`, `rounded-lg`, etc. | Bricks have sharp edges | Remove border-radius entirely |
| `shadow-md`, `shadow-lg` (blurred) | Fake depth, not physical | Use hard offset shadows |
| Gradients | Bricks are solid-colored | Use flat color fills |
| Opacity for emphasis | Muddy and ambiguous | Use a different color |
| 1px borders | Too subtle, not confident | Use 3px borders |
| Decorative color | Color must have meaning | Reserve accent colors for states |
| Centered paragraph text | Hard to read | Left-align body text |
| Custom fonts | Performance cost, no brand payoff | Use system font stack |
| `transition-all` | Overreaching, can cause jank | Transition specific properties only |

## Brand Voice in UI

### Microcopy Guidelines

- **Be direct.** "Log in" not "Sign in to your account to get started."
- **Be human.** "Something went wrong" not "Error code 500: Internal server exception."
- **Be encouraging.** "Almost there!" not "Form incomplete."
- **Use active voice.** "Save changes" not "Changes will be saved."
- **Match the visual boldness.** If the UI is loud and confident, the words should be too.

## Summary

Brick Brutalism is an interface that builds with conviction. Every pixel is a brick placed with purpose — thick borders, hard shadows, sharp corners, honest colors. It's an experience that respects the user enough to be clear, bold enough to be memorable, and playful enough to make organizing your brick collection feel like building something great.

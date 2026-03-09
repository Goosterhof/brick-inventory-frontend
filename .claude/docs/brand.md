# Brand & Design Document

## Brand Identity

**Name**: Brick Inventory
**Tagline**: Every brick has a place.
**Voice**: Confident, playful, direct. Like the bold text on a Lego box — no fluff, all fun.

## Design Philosophy: Brick Brutalism

Brick Brutalism takes the raw honesty of brutalist architecture and the tactile joy of Lego bricks, and smashes them together. The result is an interface that feels like snapping real bricks into place: chunky, satisfying, impossible to misunderstand.

> **Implementation note**: This design system is built with **UnoCSS** (utility-first CSS, similar to Tailwind but with attributify syntax). All class examples in this document use UnoCSS conventions. See UnoCSS docs for syntax differences from Tailwind.

### Core Principles

1. **Weight** — Every element has physical presence. Borders are thick. Shadows are solid. Nothing floats in ambiguous whitespace. If you can see it, you can almost feel it.

2. **Contrast** — Black on white. Bold on plain. Big on small. The interface communicates through stark differences, not subtle gradients. Information hierarchy is obvious at a glance.

3. **Honesty** — No fake depth, no decorative blur, no rounded-corner softness pretending things are gentler than they are. Shadows are hard offsets — they show exactly where the light is and where it isn't. Corners are sharp because bricks have edges.

4. **Playfulness** — Brutalism doesn't mean joyless. The interface is bold because it's excited to be used, not because it's trying to intimidate. Playfulness shows up in specific, tangible ways:
   - **Snap transitions** — Shadow changes on hover/press are fast (150ms) and use `transition-timing-function: cubic-bezier(0.2, 0, 0, 1)` for a physical snap feel. Elements don't drift; they click.
   - **Stud highlights** — Yellow (`yellow-300`) floods the background of focused and hovered elements instantly, like pressing down on a Lego stud and seeing it light up.
   - **Uppercase labels** — Headings and button text shout in caps with wide tracking. The typography is loud on purpose, like embossed text on a brick.
   - **Personality in empty states** — When there's nothing to show, the UI doesn't just say "No results." It says something with character (see Brand Voice below).
   - **Satisfying feedback** — Destructive actions require confirmation with a bold, honest prompt. Successful actions get a brief, encouraging acknowledgment. The app reacts to you.

## Color Palette

The palette is intentionally constrained. Like a monochrome Lego set with a few accent bricks, every color has a specific job.

### Primary

| Role        | Color | Value               | Usage                                   |
| ----------- | ----- | ------------------- | --------------------------------------- |
| **Ink**     | Black | `black` / `#000000` | Text, borders, shadows, primary buttons |
| **Surface** | White | `white` / `#FFFFFF` | Backgrounds, cards, input fields        |

### Accents

| Role                 | Color  | Value                     | Usage                                                        |
| -------------------- | ------ | ------------------------- | ------------------------------------------------------------ |
| **Highlight**        | Yellow | `yellow-300` / `#FDE047`  | Focus states, hover feedback, active indicators              |
| **Highlight Subtle** | Yellow | `yellow-100` / `#FEF9C3`  | Large highlighted areas where full yellow is too loud        |
| **Danger Background**| Red    | `red-200` / `#FECACA`     | Error backgrounds, destructive action hints                  |
| **Danger Border**    | Red    | `red-500` / `#EF4444`     | Error borders, error shadows                                 |
| **Danger Text**      | Red    | `red-600` / `#DC2626`     | Error messages, validation text                              |

### Error Color Hierarchy

Error states use three tiers of red, each with a clear role:

- **red-200** (`#FECACA`) — Background fill. Visible but not overwhelming. Applied to the container.
- **red-500** (`#EF4444`) — Border and shadow. The structural indicator that something is wrong.
- **red-600** (`#DC2626`) — Text. The message itself. Highest contrast for readability.

### Neutrals

| Role               | Color    | Value                  | Usage                           |
| ------------------ | -------- | ---------------------- | ------------------------------- |
| **Muted**          | Gray 200 | `gray-200` / `#E5E7EB` | Disabled backgrounds            |
| **Disabled**       | Gray 300 | `gray-300` / `#D1D5DB` | Disabled borders                |
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

### Font Choice

This project uses the system font stack (UnoCSS default) rather than a custom typeface. This is a deliberate trade-off: system fonts mean the brand's typographic voice shifts between platforms (San Francisco on Mac, Segoe UI on Windows, Roboto on Android). We accept this inconsistency in exchange for zero font-loading latency and no layout shift — performance matters more in a tool you use daily. The brand's typographic identity comes from weight, case, and spacing (bold, uppercase, wide-tracked) rather than from the typeface itself.

### Rules

- Never center long text. Left-align for readability.
- Use size to create hierarchy, not color. Black text at different sizes beats colored text at the same size.

## Borders & Edges

Borders are the most defining feature of Brick Brutalism. They are the studs on top of the brick — the part that makes it snap together.

### Specifications

| Property   | Value | UnoCSS                     |
| ---------- | ----- | -------------------------- |
| **Width**  | 3px   | `border="3 black"`         |
| **Color**  | Black | (included above)           |
| **Radius** | 0     | None — never add `rounded` |
| **Style**  | Solid | Default                    |

### Rules

- **Every interactive element gets a border.** Buttons, inputs, links, cards — if you can click it or type in it, it has a 3px black border.
- **Never use border-radius.** Sharp corners are the brand. Rounding an edge is like filing down a Lego stud.
- **Never use hairline borders** (1px). If a border exists, it must be 3px. Thin borders look indecisive.

## Shadows

Shadows in Brick Brutalism are not about realism — they're about physicality. A hard offset shadow says "this element is a brick sitting on a surface."

### Specifications

| State                | Shadow         | CSS                                          |
| -------------------- | -------------- | -------------------------------------------- |
| **Default**          | 4px offset     | `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`     |
| **Hover / Focus**    | 6px offset     | `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`     |
| **Active / Pressed** | 2px offset     | `shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`     |
| **Error**            | 4px red offset | `shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]` |

### Rules

- **No blur. Ever.** Blur radius is always 0. Blurred shadows are for flat design. We build with bricks.
- **No spread.** Spread radius is always 0.
- **Offset direction is always down-right** (positive X, positive Y). Consistent lighting.
- **Shadow grows on hover/focus.** The brick lifts off the surface — it's about to be picked up and placed.
- **Shadow shrinks on active/press.** The brick is being pushed down into position. Click. Snap.

## Transitions

All state changes use a single, system-wide timing token. This is the "snap" — fast enough to feel physical, eased to feel like a brick clicking into place.

### Transition Token

| Property | Value | CSS |
|----------|-------|-----|
| **Duration** | 150ms | `transition-duration: 150ms` |
| **Easing** | Snap curve | `transition-timing-function: cubic-bezier(0.2, 0, 0, 1)` |

### UnoCSS Shorthand

```
transition="shadow 150ms ease-[cubic-bezier(0.2,0,0,1)], background-color 150ms ease-[cubic-bezier(0.2,0,0,1)]"
```

### Rules

- **Always transition specific properties** — never use `transition-all`. Transition `shadow`, `background-color`, and `transform` as needed.
- **Disabled states don't transition.** The change is immediate — a disabled element isn't playing along.
- **150ms is the only duration.** Don't slow down transitions for "smoothness" or speed them up for "snappiness." One timing, everywhere.
- **No transitions on page load.** Elements should appear in their final state, not animate in.

## Interactive States

Every interactive element must communicate its state clearly. No ambiguity.

| State                | Visual Treatment                                                                    | Transition |
| -------------------- | ----------------------------------------------------------------------------------- | ---------- |
| **Default**          | 3px black border, 4px offset shadow                                                 | — |
| **Hover**            | Shadow grows to 6px, background may shift (e.g., yellow highlight)                  | 150ms snap easing |
| **Focus**            | Shadow grows to 6px, `bg-yellow-300` highlight, `outline="none"` (see Focus Accessibility below) | 150ms snap easing |
| **Active / Pressed** | Shadow shrinks to 2px (brick snaps into place)                                      | 150ms snap easing |
| **Disabled**         | `bg-gray-200`, `border-gray-300`, `text-gray-600`, no shadow, `cursor-not-allowed`  | None (immediate) |
| **Error**            | `bg-red-200`, red shadow (`red-500`), `border-red-500`                              | 150ms snap easing |

### Focus Accessibility (WCAG 2.4.11)

The `outline: none` in our focus state is only safe because **both** treatments — `bg-yellow-300` and the 6px shadow — are present together. Neither is sufficient alone:

- **Yellow-300 (`#FDE047`) on white has a contrast ratio of ~1.07:1** — it fails as a standalone focus indicator.
- **The 6px hard shadow provides the structural, high-contrast indicator** (black on white, well above the minimum area requirement).
- **The yellow background provides the color-fill reinforcement** that makes focus unmistakable at a glance.

**Rule: `outline: none` must never be applied to a focusable element unless both `bg-yellow-300` and the 6px shadow are present.** If either treatment is missing, keep the browser's default outline or provide an equivalent indicator. Violating this fails WCAG 2.2 Focus Appearance (2.4.11).

### The Snap Principle

Interactions should feel like connecting Lego bricks:

- **Hover** = picking up the brick (it lifts — shadow grows)
- **Press** = pushing it down (it snaps — shadow shrinks)
- **Focus** = highlighting the stud you're about to connect (yellow glow)

### Inline Link States

Inline body links (links within paragraphs or running text) follow different rules from navigation links and buttons:

| State | Treatment |
|-------|-----------|
| **Default** | `text-black underline` with 3px `border-b-black` (underline via border-bottom, not text-decoration, for consistent weight) |
| **Hover** | `bg-yellow-300` highlight floods behind the text. The underline remains. Yellow here is consistent with its role as interactive feedback — the user is hovering on something clickable. |
| **Focus** | Same as hover: `bg-yellow-300` + underline. Focus and hover are visually identical for inline links. |
| **Active** | `bg-yellow-100` — the highlight softens momentarily on press, then the navigation fires. |

**Why yellow works here**: Yellow is reserved for interactive feedback across the system. An inline link turning yellow on hover is consistent — it signals "this is responding to you," not "this is a warning." The 3px underline on the default state already identifies it as a link before any interaction occurs.

## Layout

### Spacing

Use a consistent spacing scale. Like the grid on a Lego baseplate, spacing should be uniform and predictable.

- Use multiples of `4` for spacing (`gap-2`, `p-4`, `m-6`, etc.)
- Minimum touch target: 44x44px on mobile

Spacing hierarchy (from tightest to loosest):

| Context | Gap | Example |
|---------|-----|---------|
| **Within a component** (label + input, icon + text) | `gap-2` (8px) | Form field with its label |
| **Between siblings in a grid** (cards, list items) | `gap-4` (16px) | Card grid, inventory list |
| **Between sections** (form groups, page zones) | `gap-6` (24px) or more | Filter bar above a results grid |

The rule: `gap-2` for elements that belong together inside a component, `gap-4` for repeated items that tile alongside each other, `gap-6`+ for separating distinct sections of a page.

### Containers

- Max content width for readability — don't stretch text edge-to-edge
- Use `flex="~ col"` for vertical stacking (the default building direction)
- Cards and panels get the full treatment: 3px border, offset shadow, sharp corners

### Page Structure

Pages follow a predictable structure: a top navigation bar, then content. The navigation bar is full-width with a 3px bottom border — it's the baseplate everything else sits on.

- **Navigation**: Horizontal top bar. Logo left, nav links center or right. Links use uppercase text with the Snap Principle on hover/focus. Active route gets a `yellow-300` underline (3px thick, hard).
- **Content area**: Centered with `max-w-6xl mx-auto` for readability. Full-width on mobile.
- **Sidebars** (if needed): Same 3px border treatment. Separated from main content by a thick border, not whitespace alone.

### Grid

Use CSS Grid for data-heavy views (tables, inventory lists, card grids):

- **Card grids**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` — cards are bricks; they tile neatly.
- **Data tables**: Full-width with 3px outer border. Internal `<tr>` separator borders within a `<table>` element are 1px `gray-200` — this is the **only** exception to the 3px border rule. It applies strictly to horizontal row dividers inside tables, not to any other element or context. If something isn't a `<tr>` inside a `<table>`, it gets 3px or nothing.
- **Filter bars**: Horizontal row above content. Filters are chunky bordered elements, not floating pills.

### Breakpoints

The brand must hold at all sizes. Brutalism doesn't get soft on small screens.

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| **Mobile** | < 640px | Single column. Full-width cards. Stacked navigation (hamburger with bordered menu). Shadows stay at 4px — they don't affect layout flow, so there's nothing to save. |
| **Tablet** | 640px–1024px | Two-column grids. Side-by-side filters. |
| **Desktop** | > 1024px | Full layout. Three-column grids. Inline navigation. |

Key rules across breakpoints:
- Borders stay 3px everywhere. Do not thin them on mobile.
- Shadows stay 4px everywhere. Box shadows don't affect layout flow — there's no space to save by shrinking them. Brutalism doesn't get soft on small screens.
- Touch targets stay 44px minimum. Brutalist buttons are already chunky — this is a strength on mobile.

## Iconography

Icons must match the weight and sharpness of the rest of the system. A thin, rounded icon next to a 3px bordered button looks broken.

### Specifications

| Property | Value |
|----------|-------|
| **Stroke width** | 2px — consistent with the system's heavy visual weight |
| **Line caps** | Square (butt), not rounded — sharp corners apply to icons too |
| **Line joins** | Miter (sharp), not rounded |
| **Fill** | None — stroke-only icons. Filled icons look blobby next to open borders |
| **Size** | 20px (inline with text), 24px (standalone buttons) |
| **Color** | `currentColor` — icons inherit text color. No decorative icon colors |

### Recommended Library

**Phosphor Icons** (`@phosphor-icons/vue`) — use the **Bold** weight. Phosphor Bold uses 2px strokes with square-ish geometry that aligns well with the system. However, it defaults to `stroke-linecap: round` and `stroke-linejoin: round`, so apply these overrides globally:

```css
.ph-icon svg {
  stroke-linecap: butt;
  stroke-linejoin: miter;
}
```

Why Phosphor over alternatives:
- **Lucide** — rounded caps by default, and its overall aesthetic is lighter/friendlier than what Brick Brutalism needs.
- **Heroicons** — also rounds by default, and the Outline variant uses thinner strokes.
- **Material Symbols** — configurable but introduces Google's design language, which clashes with the brand.

If another library is chosen, it must meet the specifications above. The stroke overrides are non-negotiable.

### Rules

- **Keep icons simple.** Prefer geometric, recognizable shapes. Avoid detailed illustrations or flourishes.
- **No rounded endcaps.** If the icon library defaults to `stroke-linecap: round`, override it to `butt`. This is not optional.
- **Icons are not decoration.** Every icon must serve a functional purpose (navigation, action indicator, status). Don't add icons for visual flair.
- **Pair with text.** Standalone icons should have an `aria-label` or adjacent text. A brick without a label is just a bump.

## Accessibility

Brick Brutalism is inherently accessible by design — high contrast and bold visual cues help everyone.

### Requirements

- **Color contrast**: All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text). Black on white exceeds this.
- **Focus indicators**: Every focusable element has a visible focus state (yellow highlight + shadow growth). The `outline: none` declaration requires **both** `bg-yellow-300` and the 6px shadow to be present — see Focus Accessibility above. Never remove focus outlines without both replacements active.
- **Error identification**: Errors use color (red), position (below the field), and text (descriptive message) — never color alone.
- **Touch targets**: Minimum 44x44px on mobile. Chunky buttons are a feature, not a compromise.
- **Keyboard navigation**: All interactions work with keyboard. Tab order follows visual order.
- **ARIA**: Use semantic HTML first. Add ARIA only when semantics alone aren't enough.

## Anti-Patterns

Things that violate the Brick Brutalism identity. If you see these in a PR, flag them.

| Don't                              | Why                                              | Do Instead                                                                                              |
| ---------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `rounded`, `rounded-lg`, etc.      | Bricks have sharp edges                          | Remove border-radius entirely                                                                           |
| `shadow-md`, `shadow-lg` (blurred) | Fake depth, not physical                         | Use hard offset shadows                                                                                 |
| Gradients                          | Bricks are solid-colored                         | Use flat color fills                                                                                    |
| Opacity for emphasis               | Muddy and ambiguous                              | Use a different color                                                                                   |
| 1px borders                        | Too subtle, not confident                        | Use 3px borders (sole exception: `<tr>` separators inside `<table>` elements)                           |
| Decorative color                   | Color must have meaning                          | Reserve accent colors for states                                                                        |
| Centered paragraph text            | Hard to read                                     | Left-align body text                                                                                    |
| Custom fonts                       | Performance cost outweighs typographic consistency | Use system font stack; rely on weight, case, and spacing for identity                                 |
| `transition-all`                   | Overreaching, can cause jank                     | Transition specific properties: `transition-shadow`, `transition-background-color`, `transition-transform` |

## Brand Voice in UI

### Microcopy Guidelines

- **Be direct.** "Log in" not "Sign in to your account to get started."
- **Be human.** "Something went wrong" not "Error code 500: Internal server exception."
- **Be encouraging.** "Almost there!" not "Form incomplete."
- **Use active voice.** "Save changes" not "Changes will be saved."
- **Match the visual boldness.** If the UI is loud and confident, the words should be too.

### State-Specific Copy

Every app state is a moment to reinforce the brand. Here's how the voice sounds in each:

| State | Tone | Examples |
|-------|------|----------|
| **Empty states** | Inviting, playful | "No bricks here yet. Start building!" / "Your collection is wide open. Add your first set." |
| **Loading** | Brief, confident | "Loading your bricks..." / "Pulling this together..." |
| **Success** | Celebratory, short | "Saved." / "You're all set." — Use Lego metaphors only when the action relates to physical inventory (e.g., "Brick placed!" when adding a piece to a storage location, not when saving a user preference). |
| **Error** | Honest, helpful | "That didn't work. Try again?" / "We lost the connection. Check your network." |
| **Destructive confirmation** | Clear, no drama | "Delete this set? This can't be undone." / "Remove all items? Gone means gone." |
| **Onboarding** | Welcoming, oriented | "Welcome to Brick Inventory. Let's get your collection sorted." / "First, let's add a storage location." |

### Tagline Variants

The primary tagline is **"Every brick has a place."** Here are contextual variations:

- **Login page**: "Every brick has a place. Let's find yours."
- **Empty collection**: "Every brick has a place. This is where it starts."
- **Error page**: "This brick doesn't fit here."
- **About / Footer**: "Every brick has a place. We help you find it."

## Summary

Brick Brutalism is an interface that builds with conviction. Every pixel is a brick placed with purpose — thick borders, hard shadows, sharp corners, honest colors. It's an experience that respects the user enough to be clear, bold enough to be memorable, and playful enough to make organizing your brick collection feel like building something great.

# Brick Catalog — _Beautiful_

Living inventory of all shared components. Every brick in the box, documented.

**Update this when**: adding, modifying, or removing a shared component.

---

## Buttons

All buttons use Brick Brutalism styling: 3px black borders, hard offset shadows, sharp corners.

### PrimaryButton

Yellow action button. The default "do something" brick.

| Prop       | Type                              | Default    | Description          |
| ---------- | --------------------------------- | ---------- | -------------------- |
| `type`     | `"button" \| "submit" \| "reset"` | `"button"` | HTML button type     |
| `disabled` | `boolean`                         | `false`    | Disables interaction |

**Slots**: default (button label)

### DangerButton

Red destructive action button. Delete, remove, destroy.

| Prop       | Type                              | Default    | Description          |
| ---------- | --------------------------------- | ---------- | -------------------- |
| `type`     | `"button" \| "submit" \| "reset"` | `"button"` | HTML button type     |
| `disabled` | `boolean`                         | `false`    | Disables interaction |

**Slots**: default (button label)

### BackButton

Emits `click` — no routing built in. The parent decides where "back" goes.

**Emits**: `click`
**Slots**: default (button label)

### ListItemButton

A clickable list row. Used for navigable lists (e.g., set overview items).

**Emits**: `click`
**Slots**: default (row content)

---

## Navigation

### NavHeader

Top navigation bar with responsive mobile menu.

**Slots**:
| Slot | Description |
|---|---|
| `links` | Desktop nav links (hidden on mobile) |
| `mobile-links` | Mobile menu links (shown when hamburger is open) |
| `actions` | Always-visible right-side actions |

**Exposes**: `closeMenu()` — call to programmatically close the mobile menu.
**Uses**: `PhList`, `PhX` icons.

### NavLink

Desktop navigation link.

| Prop | Type     | Required | Description |
| ---- | -------- | -------- | ----------- |
| `to` | `string` | yes      | Route path  |

**Emits**: `click`
**Slots**: default (link text)

### NavMobileLink

Mobile navigation link with active state.

| Prop     | Type      | Default  | Description            |
| -------- | --------- | -------- | ---------------------- |
| `to`     | `string`  | required | Route path             |
| `active` | `boolean` | `false`  | Active route highlight |

**Emits**: `click`
**Slots**: default (link text)

---

## Forms

### Composition Pattern

All form inputs compose the same three primitives:

```
FormField
├── FormLabel
├── <input /> (or <select>, <textarea>)
└── FormError (conditional)
```

### FormField

Wrapper `<div>` that provides vertical spacing between label, input, and error.

**Slots**: default

### FormLabel

Accessible `<label>` with optional indicator.

| Prop       | Type      | Default     | Description                           |
| ---------- | --------- | ----------- | ------------------------------------- |
| `for`      | `string`  | `undefined` | Associates with input `id` (optional) |
| `optional` | `boolean` | `false`     | Shows "(optional)" text               |

**Slots**: default (label text)

### FormError

Error message displayed below an input.

| Prop      | Type     | Required | Description                        |
| --------- | -------- | -------- | ---------------------------------- |
| `id`      | `string` | no       | For `aria-describedby` association |
| `message` | `string` | yes      | Error text                         |

### Input Components

All inputs share this base API:

| Prop       | Type      | Default  | Description                                    |
| ---------- | --------- | -------- | ---------------------------------------------- |
| `label`    | `string`  | required | Label text                                     |
| `disabled` | `boolean` | `false`  | Disables input                                 |
| `optional` | `boolean` | `false`  | Shows optional indicator on label              |
| `error`    | `string`  | `""`     | Error message (shows FormError when non-empty) |

All use `v-model` (not prop + emit). All compose FormField → FormLabel → input → FormError.

**TextInput** — `v-model: string`. Extra props: `type` (`"text" | "email" | "password" | "search" | "tel" | "url"`, default `"text"`), `placeholder`.

**NumberInput** — `v-model: number | null`. Extra props: `min`, `max`, `step`, `placeholder`.

**DateInput** — `v-model: string`. No extra props.

**TextareaInput** — `v-model: string`. Extra props: `rows` (default `3`).

**SelectInput** — `v-model: string`. Has a default slot for `<option>` elements.

---

## Layout

### PageHeader

Page title bar with optional right-side content (e.g., action buttons).

| Prop    | Type     | Required | Description       |
| ------- | -------- | -------- | ----------------- |
| `title` | `string` | yes      | Page heading text |

**Slots**: default (right-side content)

### CardContainer

Brick Brutalism card wrapper. 3px border, hard shadow, white background.

**Slots**: default

### EmptyState

Message shown when a list or section has no content.

| Prop      | Type     | Required | Description      |
| --------- | -------- | -------- | ---------------- |
| `message` | `string` | yes      | Empty state text |

---

## Feedback

### ModalDialog

Accessible modal with backdrop, close button, and focus management.

| Prop   | Type      | Required | Description         |
| ------ | --------- | -------- | ------------------- |
| `open` | `boolean` | yes      | Controls visibility |

**Emits**: `close`
**Slots**: `title` (modal heading), default (modal body)
**Uses**: `PhX` icon.

### ToastMessage

Temporary notification banner.

| Prop      | Type                   | Default     | Description       |
| --------- | ---------------------- | ----------- | ----------------- |
| `message` | `string`               | required    | Notification text |
| `variant` | `"success" \| "error"` | `"success"` | Visual style      |

**Emits**: `close`
**Uses**: `PhCheckCircle`, `PhWarningCircle`, `PhX` icons.

---

## Data Display

### PartListItem

Displays a single Lego part with image, color swatch, and quantity.

| Prop        | Type             | Required | Description             |
| ----------- | ---------------- | -------- | ----------------------- |
| `name`      | `string`         | yes      | Part name               |
| `partNum`   | `string`         | yes      | Part number             |
| `quantity`  | `number`         | yes      | Count                   |
| `imageUrl`  | `string \| null` | no       | Part image URL          |
| `colorName` | `string \| null` | no       | Color display name      |
| `colorRgb`  | `string \| null` | no       | Hex color (without `#`) |
| `spare`     | `boolean`        | no       | Spare part indicator    |

---

## Scanner

### CameraCapture

Manages camera stream lifecycle. Captures images as JPEG blobs.

**Emits**: `capture` (`Blob`), `error` (`string`)

---

## Component Count

| Category        | Count  | Components                                                    |
| --------------- | ------ | ------------------------------------------------------------- |
| Buttons         | 4      | PrimaryButton, DangerButton, BackButton, ListItemButton       |
| Navigation      | 3      | NavHeader, NavLink, NavMobileLink                             |
| Form primitives | 3      | FormField, FormLabel, FormError                               |
| Form inputs     | 5      | TextInput, NumberInput, DateInput, TextareaInput, SelectInput |
| Layout          | 3      | PageHeader, CardContainer, EmptyState                         |
| Feedback        | 2      | ModalDialog, ToastMessage                                     |
| Data display    | 1      | PartListItem                                                  |
| Scanner         | 1      | CameraCapture                                                 |
| **Total**       | **22** |                                                               |

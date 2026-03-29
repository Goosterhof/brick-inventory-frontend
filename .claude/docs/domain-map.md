# Domain Map

Every wing of the building table, mapped. Update this when adding or modifying domains.

## Families App

| Domain       | Description                                                          | Routes                                                                              | Auth Required              |
| ------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| **auth**     | Minifig Badge — prove you belong at this building table              | `/login`, `/register`                                                               | No (hidden when logged in) |
| **home**     | The Building Table — your starting baseplate                         | `/`                                                                                 | No                         |
| **sets**     | The Collection — every set you own, tracked, scanned, and identified | `/sets`, `/sets/add`, `/sets/scan`, `/sets/identify`, `/sets/:id`, `/sets/:id/edit` | Yes                        |
| **parts**    | The Parts Bin — individual bricks across your collection             | `/parts`                                                                            | Yes                        |
| **storage**  | The Drawer System — where bricks live when they are not being built  | `/storage`, `/storage/add`, `/storage/:id`, `/storage/:id/edit`                     | Yes                        |
| **settings** | The Workbench — family preferences and configuration                 | `/settings`                                                                         | Yes                        |
| **brick-dna** | The DNA Lab — color diversity, top parts, and rarest bricks in your collection | `/brick-dna`                                                                        | Yes                        |
| **about**    | About page                                                           | `/about`                                                                            | No                         |

### Domain Details

#### auth

- **Pages**: LoginPage, RegisterPage
- **Components**: —
- **Modals**: —
- **API**: `POST /login`, `POST /register`, `POST /logout`

#### home

- **Pages**: HomePage
- **Components**: —
- **Modals**: —
- **API**: —

#### sets

- **Pages**: SetsOverviewPage, AddSetPage, ScanSetPage, IdentifyBrickPage, SetDetailPage, EditSetPage
- **Components**: —
- **Modals**: AssignPartModal
- **API**: `GET /family-sets`, `POST /family-sets`, `GET /family-sets/:id`, `PUT /family-sets/:id`, `PATCH /family-sets/:id`, `DELETE /family-sets/:id`

#### parts

- **Pages**: PartsPage
- **Components**: —
- **Modals**: —
- **API**: —

#### storage

- **Pages**: StorageOverviewPage, AddStoragePage, StorageDetailPage, EditStoragePage
- **Components**: —
- **Modals**: —
- **API**: `GET /storage-options`, `POST /storage-options`, `GET /storage-options/:id`, `PUT /storage-options/:id`, `DELETE /storage-options/:id`

#### settings

- **Pages**: SettingsPage
- **Components**: —
- **Modals**: —
- **API**: —

#### brick-dna

- **Pages**: BrickDnaPage
- **Components**: —
- **Modals**: —
- **API**: `GET /family-brick-dna`

#### about

- **Pages**: AboutPage
- **Components**: —
- **Modals**: —
- **API**: —

## Admin App

| Domain   | Description                                            | Routes | Auth Required |
| -------- | ------------------------------------------------------ | ------ | ------------- |
| **home** | The Control Room — admin overview of the whole factory | `/`    | TBD           |

### Domain Details

#### home

- **Pages**: HomePage
- **Components**: —
- **Modals**: —
- **API**: —

## Showcase App

The design system specimen — Brick Brutalism on display. No domains, no routing, no auth. A single-page exhibition of every design token, component, and interaction pattern.

- **Components**: ShowcaseHero, ColorPalette, TypographySpecimen, BrickDimensions, SnapDemo, ComponentGallery, BrandVoice, AntiPatterns, SectionHeading, ComponentHealth, DialogServiceDemo, ToastServiceDemo, FormValidationWorkbench, MiddlewarePipelineVisualizer, ResourceAdapterPlayground
- **Deployed at**: showcase.brick-inventory.com

## Shared Components

Shared components are available to all apps via `@shared/components/`. The component registry (`src/shared/generated/component-registry.json`) is auto-generated and is the canonical source for component count and details.

## Adding a New Domain

When adding a domain, update this map and register routes in the app's router service.

1. Add the domain to the relevant app table above
2. Fill in the domain details section
3. List all pages, components, modals, and API endpoints
4. Register routes in the app's router service

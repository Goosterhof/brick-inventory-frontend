# Domain Map

Living document of all domains across apps. Update this when adding or modifying domains.

## Families App

| Domain | Description | Routes | Auth Required |
|--------|-------------|--------|---------------|
| **auth** | User authentication | `/login`, `/register` | No (hidden when logged in) |
| **home** | Landing/dashboard | `/` | No |
| **sets** | Lego set management | `/sets`, `/sets/add`, `/sets/:id`, `/sets/:id/edit` | Yes |
| **about** | About page | `/about` | No |

### Domain Details

#### auth

- **Pages**: LoginView, RegisterView
- **Components**: —
- **Modals**: —
- **API**: `POST /login`, `POST /register`, `POST /logout`

#### home

- **Pages**: HomeView
- **Components**: —
- **Modals**: —
- **API**: —

#### sets

- **Pages**: SetsOverviewView, AddSetView, SetDetailView, EditSetView
- **Components**: —
- **Modals**: —
- **API**: `GET /family-sets`, `POST /family-sets`, `GET /family-sets/:id`, `PUT /family-sets/:id`, `PATCH /family-sets/:id`, `DELETE /family-sets/:id`

#### about

- **Pages**: AboutView
- **Components**: —
- **Modals**: —
- **API**: —

## Admin App

| Domain | Description | Routes | Auth Required |
|--------|-------------|--------|---------------|
| **home** | Admin dashboard | `/` | TBD |

### Domain Details

#### home

- **Pages**: HomeView
- **Components**: —
- **Modals**: —
- **API**: —

## Shared Components

Components available to all apps via `@shared/components/`:

| Component | Description |
|-----------|-------------|
| PrimaryButton | Neo-brutalist styled button |
| NavLink | Navigation link component |
| CameraCapture | Camera/scanner component |
| FormField | Form field wrapper |
| FormLabel | Accessible form label |
| FormError | Form error message |
| TextInput | Text input with label and error |
| NumberInput | Number input with label and error |

## Adding a New Domain

When adding a domain, update this map and follow the `new-domain` skill.

1. Add the domain to the relevant app table above
2. Fill in the domain details section
3. List all pages, components, modals, and API endpoints
4. Register routes in the app's router service

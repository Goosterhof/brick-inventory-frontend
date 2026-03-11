# New Page Skill

Step-by-step guide for adding a new page to an existing domain.

## Steps

1. Create the page component in the domain's `pages/` directory (all user-facing text must use the translation service):

    ```vue
    <!-- src/apps/{appName}/domains/{domain}/pages/{PageName}View.vue -->
    <script setup lang="ts">
    import {familyTranslationService} from "@app/services";

    const {t} = familyTranslationService;
    </script>

    <template>
        <div>
            <h1>{{ t("{domain}.title").value }}</h1>
        </div>
    </template>
    ```

2. Add the route to the domain's `index.ts`:

    ```ts
    export const routes = [
        // ...existing routes
        {
            path: "/{path}",
            name: "{route-name}",
            component: () => import("./pages/{PageName}View.vue"),
            meta: {authOnly: true}, // if authentication required
        },
    ] as const satisfies readonly RouteRecordRaw[];
    ```

3. Create a test file:

    ```bash
    # Test at: src/tests/unit/apps/{appName}/domains/{domain}/{PageName}View.spec.ts
    ```

4. Update the [Domain Map](../docs/domain-map.md) to include the new page.

## Naming Conventions

- Page files: `{Descriptive}View.vue` (e.g., `SetsOverviewView.vue`, `AddSetView.vue`)
- Route names: kebab-case, prefixed with domain (e.g., `sets-add`, `sets-detail`)
- Route paths: kebab-case (e.g., `/sets/add`, `/sets/:id/edit`)

## Route Meta Options

| Meta Key             | Type      | Description                                 |
| -------------------- | --------- | ------------------------------------------- |
| `authOnly`           | `boolean` | Route requires authentication               |
| `canSeeWhenLoggedIn` | `boolean` | Set to `false` to hide from logged-in users |

## Reference

- Overview page: `src/apps/families/domains/sets/pages/SetsOverviewView.vue`
- Detail page: `src/apps/families/domains/sets/pages/SetDetailView.vue`
- Form page: `src/apps/families/domains/sets/pages/AddSetView.vue`

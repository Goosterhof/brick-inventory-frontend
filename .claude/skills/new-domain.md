# New Domain Skill

Step-by-step guide for adding a new domain to an existing app.

## Steps

1. Create the domain directory structure:

    ```bash
    mkdir -p src/apps/{appName}/domains/{domain}/pages
    mkdir -p src/apps/{appName}/domains/{domain}/components
    mkdir -p src/apps/{appName}/domains/{domain}/modals
    ```

2. Create the domain's `index.ts` with route exports:

    ```ts
    // src/apps/{appName}/domains/{domain}/index.ts
    import type {RouteRecordRaw} from "vue-router";

    export const routes = [
        {path: "/{domain}", name: "{domain}", component: () => import("./pages/{Domain}View.vue")},
    ] as const satisfies readonly RouteRecordRaw[];
    ```

3. Create the initial page component:

    ```vue
    <!-- src/apps/{appName}/domains/{domain}/pages/{Domain}View.vue -->
    <script setup lang="ts"></script>

    <template>
        <div>
            <h1>{Domain}</h1>
        </div>
    </template>
    ```

4. Register routes in the app's router service:

    ```ts
    // src/apps/{appName}/services/router.ts
    import {routes as {domain}Routes} from "@app/domains/{domain}";

    const routes = [...existingRoutes, ...{domain}Routes] as const satisfies readonly RouteRecordRaw[];
    ```

5. Create the test directory:

    ```bash
    mkdir -p src/tests/unit/apps/{appName}/domains/{domain}
    ```

6. Update the [Domain Map](../docs/domain-map.md) with the new domain.

## Rules

- The **only export** from `index.ts` is `routes`
- **No cross-domain imports** — a domain cannot import from another domain
- Use **relative imports** within the domain (e.g., `./pages/MyView.vue`)
- Domain components go in `components/`, modals in `modals/`
- Use `meta: {authOnly: true}` for routes that require authentication

## Reference

Use existing domains as templates:

- `src/apps/families/domains/auth/` — auth flow with guest-only routes
- `src/apps/families/domains/sets/` — CRUD domain with multiple pages
- `src/apps/families/domains/home/` — minimal single-page domain

# API — _Sturdy_

Patterns for making HTTP requests and working with API resources.

## HTTP Service

Each app has a pre-configured HTTP service. All methods return Axios responses.

```ts
import {familyHttpService} from "@app/services";

familyHttpService.getRequest<T>(endpoint, options);
familyHttpService.postRequest<T>(endpoint, data, options);
familyHttpService.putRequest<T>(endpoint, data, options);
familyHttpService.patchRequest<T>(endpoint, data, options);
familyHttpService.deleteRequest<T>(endpoint, options);
```

## Resource Adapter

For CRUD operations on domain resources, use the `resourceAdapter`:

```ts
import {resourceAdapter} from "@shared/services/resource-adapter";

// Existing resource (has id)
const adapted = resourceAdapter(resource, "family-sets", storeModule, httpService);
adapted.update();                    // PUT /family-sets/{id}
adapted.patch({status: "built"});    // PATCH /family-sets/{id}
adapted.delete();                    // DELETE /family-sets/{id}

// New resource (no id)
const newAdapted = resourceAdapter(newResource, "family-sets", storeModule, httpService);
newAdapted.create();                 // POST /family-sets
```

## Loading & Error Pattern

```ts
import {familyHttpService, familyLoadingService, familyTranslationService} from "@app/services";

const {t} = familyTranslationService;
const error = ref<string | null>(null);

const loadItems = async () => {
    familyLoadingService.start();
    error.value = null;
    try {
        const response = await familyHttpService.getRequest<Resource[]>("/resources");
        items.value = response.data;
    } catch {
        error.value = t("errors.generic").value;
    } finally {
        familyLoadingService.stop();
    }
};
```

## Conventions

- API uses **snake_case**, frontend uses **camelCase** — converted automatically by `deepSnakeKeys` / `toCamelCaseTyped`
- All resources have `id`, `createdAt`, `updatedAt`
- Base URL: `https://api.brick-inventory.com/api`
- Auth: credentials-based (cookies with `withCredentials: true`)
- 401 → redirect to login, 404 → resource not found

## Enums

**FamilySet Status**: `sealed` | `built` | `in_progress` | `incomplete`

# API Usage Skill

Patterns for making HTTP requests and working with API resources in this project.

## HTTP Service

Create an HTTP service instance for making API requests:

```ts
import {createHttpService} from "@shared/services/http";

const http = createHttpService("https://api.brick-inventory.com/api");

// Available methods
http.getRequest<T>(endpoint, options);
http.postRequest<T>(endpoint, data, options);
http.putRequest<T>(endpoint, data, options);
http.patchRequest<T>(endpoint, data, options);
http.deleteRequest<T>(endpoint, options);
```

## Resource Adapter Pattern

The `resourceAdapter` provides CRUD operations for domain resources:

```ts
import {resourceAdapter} from "@shared/services/resource-adapter";

// For existing resources (with id)
const adapted = resourceAdapter(resource, "family-sets", storeModule, httpService);
adapted.update();  // PUT /family-sets/{id}
adapted.patch({status: "built"});  // PATCH /family-sets/{id}
adapted.delete();  // DELETE /family-sets/{id}

// For new resources (without id)
const newAdapted = resourceAdapter(newResource, "family-sets", storeModule, httpService);
newAdapted.create();  // POST /family-sets
```

## API Conventions

- All resources have `id`, `createdAt`, and `updatedAt` fields
- API uses snake_case (`created_at`), frontend uses camelCase (`createdAt`)
- Conversion is handled automatically by `deepSnakeKeys` and `toCamelCaseTyped` helpers
- 401 responses indicate authentication required
- 404 responses indicate resource not found

## Enums

**FamilySet Status**: `sealed` | `built` | `in_progress` | `incomplete`

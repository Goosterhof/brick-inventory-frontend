# API Integration Skill

End-to-end guide for integrating an API resource into the frontend.

## Steps

### 1. Define the Type

Create the resource type with API fields:

```ts
// src/apps/{appName}/types/{resource}.ts
export type {Resource} = {
    id: number;
    // domain-specific fields in camelCase
    name: string;
    status: "active" | "archived";
    createdAt: string;
    updatedAt: string;
};
```

### 2. Create API Functions

Use the app's HTTP service for requests:

```ts
// Inside a composable or directly in the page
import {familyHttpService} from "@app/services";

// List
const fetchItems = async () => {
    const response = await familyHttpService.getRequest<{Resource}[]>("/resources");
    return response.data;
};

// Single
const fetchItem = async (id: number) => {
    const response = await familyHttpService.getRequest<{Resource}>(`/resources/${id}`);
    return response.data;
};

// Create
const createItem = async (data: Omit<{Resource}, "id" | "createdAt" | "updatedAt">) => {
    const response = await familyHttpService.postRequest<{Resource}>("/resources", data);
    return response.data;
};

// Update
const updateItem = async (id: number, data: Partial<{Resource}>) => {
    const response = await familyHttpService.putRequest<{Resource}>(`/resources/${id}`, data);
    return response.data;
};

// Delete
const deleteItem = async (id: number) => {
    await familyHttpService.deleteRequest(`/resources/${id}`);
};
```

### 3. Handle Loading and Error States

Use the loading service for request state:

```ts
import {familyLoadingService} from "@app/services";
import {ref} from "vue";

const error = ref<string | null>(null);

const loadItems = async () => {
    familyLoadingService.start();
    error.value = null;
    try {
        const data = await fetchItems();
        // use data
    } catch (e) {
        error.value = t("errors.generic").value;
    } finally {
        familyLoadingService.stop();
    }
};
```

### 4. Wire to the Page

```vue
<script setup lang="ts">
import {onMounted, ref} from "vue";
import {familyHttpService, familyLoadingService, familyTranslationService} from "@app/services";
import type {Resource} from "@app/types/resource";

const {t} = familyTranslationService;
const items = ref<Resource[]>([]);
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

onMounted(loadItems);
</script>

<template>
    <div>
        <p v-if="error" role="alert" text="red-600" font="bold">{{ error }}</p>
        <ul v-else>
            <li v-for="item in items" :key="item.id">{{ item.name }}</li>
        </ul>
    </div>
</template>
```

### 5. Write Tests

Test the API integration with mocked HTTP:

```ts
// src/tests/unit/apps/{appName}/domains/{domain}/{Page}View.spec.ts
import {shallowMount, flushPromises} from "@vue/test-utils";
import {describe, expect, it, vi} from "vitest";
import PageView from "@app/domains/{domain}/pages/{Page}View.vue";

vi.mock("@app/services", () => ({
    familyHttpService: {getRequest: vi.fn()},
    familyLoadingService: {start: vi.fn(), stop: vi.fn()},
}));

describe("PageView", () => {
    it("should load and display items", async () => {
        // Arrange
        const {familyHttpService} = await import("@app/services");
        vi.mocked(familyHttpService.getRequest).mockResolvedValue({data: [{id: 1, name: "Test Item"}]});

        // Act
        const wrapper = shallowMount(PageView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Test Item");
    });

    it("should show error on failure", async () => {
        // Arrange
        const {familyHttpService} = await import("@app/services");
        vi.mocked(familyHttpService.getRequest).mockRejectedValue(new Error("Network error"));

        // Act
        const wrapper = shallowMount(PageView);
        await flushPromises();

        // Assert
        expect(wrapper.find("[role='alert']").text()).toContain("Failed to load");
    });
});
```

## API Conventions Reminder

- API uses **snake_case**, frontend uses **camelCase** (auto-converted)
- All resources have `id`, `createdAt`, `updatedAt`
- 401 → redirect to login
- 404 → resource not found
- Base URL: `https://api.brick-inventory.com/api`
- Auth: credentials-based (cookies with `withCredentials: true`)

## Resource Adapter

For CRUD operations with store integration, use the resource adapter pattern. See the `api-usage` skill for details.

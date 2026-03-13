# Testing — _Sturdy_

Unit test patterns for Vue components and TypeScript logic.

## Framework & Location

- **Vitest** for test framework, **@vue/test-utils** for component mounting
- Tests live in `src/tests/unit/`, mirroring source structure (`.spec.ts` extension)
- 100% coverage required (`npm run test:coverage`)

## Core Rules

**AAA pattern with comments.** Every test uses Arrange-Act-Assert with explicit comments. For simple tests, combine sections (e.g., `// Arrange & Act`) but always comment.

**Self-contained tests.** No helper functions, no shared mutable state via `beforeEach`. Duplicate setup is preferred over shared abstractions that can silently break other tests. Only use `beforeEach`/`afterEach` for global browser API mocks (navigator, window) and `vi.restoreAllMocks()`.

**Test names start with "should."** Describe the expected behavior: `"should emit update:modelValue on input"`, not `"test input"`.

**Nested describe blocks.** Group by concern: `rendering`, `interactions`, `error handling`, `accessibility`.

## Component Tests

Always use `shallowMount` to isolate from children. The project configures `renderStubDefaultSlot: true` in `src/tests/unit/setup.ts`.

```typescript
import {shallowMount, flushPromises} from "@vue/test-utils";
import {describe, expect, it, vi} from "vitest";
import MyComponent from "@shared/components/MyComponent.vue";

describe("MyComponent", () => {
    describe("rendering", () => {
        it("should render with default props", () => {
            // Arrange & Act
            const wrapper = shallowMount(MyComponent);

            // Assert
            expect(wrapper.find("h1").text()).toBe("Default Title");
        });
    });

    describe("interactions", () => {
        it("should emit update:modelValue on input", async () => {
            // Arrange
            const wrapper = shallowMount(MyComponent, {props: {label: "Name", modelValue: ""}});

            // Act
            await wrapper.find("input").setValue("John");

            // Assert
            const emitted = wrapper.emitted("update:modelValue");
            expect(emitted).toBeTruthy();
            expect(emitted?.[0]).toEqual(["John"]);
        });
    });

    describe("accessibility", () => {
        it("should associate label with input via for/id", () => {
            // Arrange & Act
            const wrapper = shallowMount(MyComponent, {props: {label: "Email"}});

            // Assert
            const input = wrapper.find("input");
            const label = wrapper.findComponent(FormLabel);
            expect(label.props("for")).toBe(input.attributes("id"));
        });
    });
});
```

### Type-safe element access

Cast to the correct HTML element type:

```typescript
const input = wrapper.find("input").element as HTMLInputElement;
expect(input.value).toBe("test");
```

### Async operations

Use `flushPromises()` after mounting components that fetch data on mount:

```typescript
const wrapper = shallowMount(MyComponent);
await flushPromises();
```

### Mocking browser APIs

```typescript
beforeEach(() => {
    Object.defineProperty(navigator, "mediaDevices", {
        value: {getUserMedia: vi.fn().mockResolvedValue(mockStream)},
        writable: true,
        configurable: true,
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});
```

### Styling assertions (UnoCSS attributify)

```typescript
expect(wrapper.find("button").attributes("border")).toBe("3 black");
```

## TypeScript (Non-Component) Tests

Same rules as above, minus vue/test-utils. Mock HTTP with `axios-mock-adapter`:

```typescript
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

it("should fetch data from API", async () => {
    // Arrange
    const mock = new MockAdapter(axios);
    const service = createHttpService("https://api.brick-inventory.com/api");
    mock.onGet("https://api.brick-inventory.com/api/users").reply(200, {id: 1});

    // Act
    const result = await service.getRequest("/users");

    // Assert
    expect(result.data).toEqual({id: 1});

    mock.restore();
});
```

### Mocking modules

```typescript
vi.mock("@app/services", () => ({
    familyHttpService: {getRequest: vi.fn()},
    familyLoadingService: {start: vi.fn(), stop: vi.fn()},
}));

// Type-safe mock access
vi.mocked(familyHttpService.getRequest).mockResolvedValue({data: [{id: 1}]});
```

## Running Tests

```bash
npm run test:unit                    # watch mode
npm run test:coverage                # with 100% threshold
npm run test:unit -- --run path.ts   # single file
```

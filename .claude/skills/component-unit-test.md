# Vue Component Unit Test Skill

Write unit tests for Vue 3 components following the project's established patterns and conventions.

## Test Framework

- Use **Vitest** as the test framework
- Use **@vue/test-utils** for component mounting and interaction
- Import from `vitest`: `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`
- Import from `@vue/test-utils`: `shallowMount`, `flushPromises`, `VueWrapper`

## File Location

- Place component tests in `src/tests/unit/`
- Mirror the source file structure (e.g., `src/shared/components/NavLink.vue` → `src/tests/unit/shared/components/NavLink.spec.ts`)
- Use `.spec.ts` extension for test files

## Component Mounting

### Always Use shallowMount

Use `shallowMount` for unit tests to isolate the component from its children:

```typescript
import {shallowMount} from "@vue/test-utils";
import MyComponent from "@shared/components/MyComponent.vue";

const wrapper = shallowMount(MyComponent, {
    props: {label: "Test"},
    slots: {default: "Slot content"},
});
```

### Test Setup Configuration

The project configures `renderStubDefaultSlot: true` in `src/tests/unit/setup.ts`, allowing slot content to render in stubbed components.

## Type-Safe Element Access

### Accessing Native Elements

Cast to the correct HTML element type when accessing element properties:

```typescript
const videoElement = wrapper.find("video").element as HTMLVideoElement;
const inputElement = wrapper.find("input").element as HTMLInputElement;

// Access native properties
expect(inputElement.value).toBe("test");
```

## Test Organization

### Use Nested describe Blocks

Group related tests into logical sections:

```typescript
describe("MyComponent", () => {
    describe("rendering", () => {
        it("should render the component", () => {});
        it("should show loading state", () => {});
    });

    describe("user interactions", () => {
        it("should handle click events", () => {});
        it("should emit events on input", () => {});
    });

    describe("error handling", () => {
        it("should display error message", () => {});
    });

    describe("accessibility", () => {
        it("should have aria-label", () => {});
    });
});
```

## Helper Functions

### Create Reusable Helpers

Extract common setup patterns into helper functions with JSDoc comments:

```typescript
/**
 * Helper to find a button by its text content.
 */
const findButtonByText = (wrapper: VueWrapper, text: string) => {
    return wrapper.findAll("button").find((btn) => btn.text() === text);
};

/**
 * Helper to create a named Error with specific error type.
 */
const createNamedError = (name: string, message: string) => {
    const error = new Error(message);
    error.name = name;
    return error;
};
```

### Mock Factory Functions

Create factory functions for complex mocks:

```typescript
/**
 * Creates a mock MediaStream with a single track.
 */
const createMockMediaStream = () => {
    const mockTrack = {stop: vi.fn()};
    return {
        getTracks: vi.fn(() => [mockTrack]),
        mockTrack,
    };
};
```

## Testing Patterns

### Props Testing

```typescript
it("should pass props to child component", () => {
    const wrapper = shallowMount(MyComponent, {props: {label: "Test"}});

    const child = wrapper.findComponent(ChildComponent);
    expect(child.props("label")).toBe("Test");
});
```

### v-model / defineModel Testing

```typescript
it("should emit update:modelValue on input", async () => {
    const wrapper = shallowMount(TextInput, {
        props: {label: "Name", modelValue: ""},
    });

    await wrapper.find("input").setValue("John");

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]).toEqual(["John"]);
});
```

### Event Emission Testing

```typescript
it("should emit custom event", async () => {
    const wrapper = shallowMount(MyComponent);

    await wrapper.find("button").trigger("click");

    const emitted = wrapper.emitted("custom-event");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]?.[0]).toBe("payload");
});
```

### Async Operations with flushPromises

Use `flushPromises()` to wait for all pending promises:

```typescript
import {flushPromises} from "@vue/test-utils";

it("should load data on mount", async () => {
    const wrapper = shallowMount(MyComponent);
    await flushPromises();

    expect(wrapper.text()).toContain("Loaded data");
});
```

### Lifecycle Testing

```typescript
it("should clean up on unmount", async () => {
    const wrapper = shallowMount(MyComponent);
    await flushPromises();

    wrapper.unmount();

    expect(cleanupMock).toHaveBeenCalled();
});
```

## Accessibility Testing

### Test ARIA Attributes

```typescript
describe("accessibility", () => {
    it("should have aria-label on interactive elements", () => {
        const wrapper = shallowMount(MyComponent);

        expect(wrapper.find("button").attributes("aria-label")).toBe("Submit form");
    });

    it("should have role attribute for semantic regions", () => {
        const wrapper = shallowMount(MyComponent);

        expect(wrapper.find("[role='status']").exists()).toBe(true);
    });

    it("should have aria-live for dynamic content", () => {
        const wrapper = shallowMount(MyComponent);

        const alert = wrapper.find("[role='alert']");
        expect(alert.attributes("aria-live")).toBe("assertive");
    });

    it("should associate label with input via for/id", () => {
        const wrapper = shallowMount(TextInput, {props: {label: "Email"}});

        const input = wrapper.find("input");
        const label = wrapper.findComponent(FormLabel);
        expect(label.props("for")).toBe(input.attributes("id"));
    });
});
```

## Mocking Browser APIs

### Navigator APIs

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

### Element Properties

```typescript
const mockVideoElement = (wrapper: VueWrapper) => {
    const videoElement = wrapper.find("video").element as HTMLVideoElement;

    Object.defineProperty(videoElement, "play", {
        value: vi.fn().mockResolvedValue(undefined),
        writable: true,
    });
    Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});

    return videoElement;
};
```

## Styling Assertions

### UnoCSS Attributify Mode

```typescript
it("should have neo-brutalist styling", () => {
    const wrapper = shallowMount(MyComponent);
    const element = wrapper.find("button");

    expect(element.attributes("border")).toBe("3 black");
    expect(element.attributes("bg")).toBe("yellow-400");
    expect(element.attributes("uppercase")).toBeDefined();
});
```

### CSS Classes

```typescript
it("should apply error styling when error is present", () => {
    const wrapper = shallowMount(TextInput, {
        props: {label: "Email", modelValue: "", error: "Invalid"},
    });

    expect(wrapper.find("input").classes()).toContain("bg-red-100");
});

it("should apply conditional classes", () => {
    const wrapper = shallowMount(MyComponent, {props: {isActive: false}});

    expect(wrapper.find("div").classes()).toContain("opacity-0");
});
```

## When to Use beforeEach/afterEach

Use setup/teardown hooks ONLY for:
- Mocking global browser APIs (navigator, window)
- Restoring mocks between tests

```typescript
describe("CameraCapture", () => {
    let mockGetUserMedia: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);
        Object.defineProperty(navigator, "mediaDevices", {
            value: {getUserMedia: mockGetUserMedia},
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
});
```

## Running Tests

```bash
# Run all tests
npm run test:unit

# Run specific test file
npm run test:unit -- --run src/tests/unit/shared/components/MyComponent.spec.ts

# Run tests in watch mode
npm run test:unit -- --watch

# Run tests with coverage
npm run test:coverage
```

## Example: Complete Component Test

```typescript
import MyComponent from "@shared/components/MyComponent.vue";
import {flushPromises, shallowMount, VueWrapper} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

/**
 * Helper to find a button by its text content.
 */
const findButtonByText = (wrapper: VueWrapper, text: string) => {
    return wrapper.findAll("button").find((btn) => btn.text() === text);
};

describe("MyComponent", () => {
    describe("rendering", () => {
        it("should render with default props", () => {
            const wrapper = shallowMount(MyComponent);

            expect(wrapper.find("h1").text()).toBe("Default Title");
        });

        it("should render custom title from props", () => {
            const wrapper = shallowMount(MyComponent, {
                props: {title: "Custom Title"},
            });

            expect(wrapper.find("h1").text()).toBe("Custom Title");
        });
    });

    describe("interactions", () => {
        it("should emit submit event when button is clicked", async () => {
            const wrapper = shallowMount(MyComponent);

            const submitButton = findButtonByText(wrapper, "Submit");
            await submitButton?.trigger("click");

            expect(wrapper.emitted("submit")).toBeTruthy();
        });
    });

    describe("accessibility", () => {
        it("should have proper aria attributes", () => {
            const wrapper = shallowMount(MyComponent);

            expect(wrapper.find("button").attributes("aria-label")).toBeDefined();
        });
    });
});
```

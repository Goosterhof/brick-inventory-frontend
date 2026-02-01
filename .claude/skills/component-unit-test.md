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

## Self-Contained Tests

Each test must be fully self-contained. **Do not use helper functions** - they can unintentionally change other tests when modified. Inline all setup logic directly in each test.

```typescript
// Good - self-contained test
it("should show error when camera access is denied", async () => {
    // Arrange
    const error = new Error("Permission denied");
    error.name = "NotAllowedError";
    mockGetUserMedia.mockRejectedValue(error);

    // Act
    const wrapper = shallowMount(CameraCapture);
    await flushPromises();

    // Assert
    expect(wrapper.text()).toContain("Camera access denied");
});

// Bad - using helper functions
const createNamedError = (name: string, message: string) => {
    const error = new Error(message);
    error.name = name;
    return error;
};

it("should show error when camera access is denied", async () => {
    mockGetUserMedia.mockRejectedValue(createNamedError("NotAllowedError", "Permission denied"));
    // ...
});
```

## AAA Pattern

Structure every test using the **Arrange-Act-Assert** pattern with comments:

- **Arrange**: Set up test data, mocks, and preconditions
- **Act**: Execute the code being tested
- **Assert**: Verify the expected outcome

```typescript
it("should emit capture event with image blob", async () => {
    // Arrange
    const mockTrack = {stop: vi.fn()};
    const mockStream = {getTracks: vi.fn(() => [mockTrack])};
    mockGetUserMedia.mockResolvedValue(mockStream);
    const wrapper = shallowMount(CameraCapture);
    await flushPromises();

    // Act
    const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture");
    await captureButton?.trigger("click");

    // Assert
    const emitted = wrapper.emitted("capture");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]?.[0]).toBeInstanceOf(Blob);
});
```

For simple tests, sections may be combined but comments should still be present:

```typescript
it("should render video element", () => {
    // Arrange & Act
    const wrapper = shallowMount(CameraCapture);

    // Assert
    expect(wrapper.find("video").exists()).toBe(true);
});
```

## Testing Patterns

### Props Testing

```typescript
it("should pass props to child component", () => {
    // Arrange & Act
    const wrapper = shallowMount(MyComponent, {props: {label: "Test"}});

    // Assert
    const child = wrapper.findComponent(ChildComponent);
    expect(child.props("label")).toBe("Test");
});
```

### v-model / defineModel Testing

```typescript
it("should emit update:modelValue on input", async () => {
    // Arrange
    const wrapper = shallowMount(TextInput, {
        props: {label: "Name", modelValue: ""},
    });

    // Act
    await wrapper.find("input").setValue("John");

    // Assert
    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]).toEqual(["John"]);
});
```

### Event Emission Testing

```typescript
it("should emit custom event", async () => {
    // Arrange
    const wrapper = shallowMount(MyComponent);

    // Act
    await wrapper.find("button").trigger("click");

    // Assert
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
    // Arrange & Act
    const wrapper = shallowMount(MyComponent);
    await flushPromises();

    // Assert
    expect(wrapper.text()).toContain("Loaded data");
});
```

### Lifecycle Testing

```typescript
it("should clean up on unmount", async () => {
    // Arrange
    const wrapper = shallowMount(MyComponent);
    await flushPromises();

    // Act
    wrapper.unmount();

    // Assert
    expect(cleanupMock).toHaveBeenCalled();
});
```

## Accessibility Testing

### Test ARIA Attributes

```typescript
describe("accessibility", () => {
    it("should have aria-label on interactive elements", () => {
        // Arrange & Act
        const wrapper = shallowMount(MyComponent);

        // Assert
        expect(wrapper.find("button").attributes("aria-label")).toBe("Submit form");
    });

    it("should have role attribute for semantic regions", () => {
        // Arrange & Act
        const wrapper = shallowMount(MyComponent);

        // Assert
        expect(wrapper.find("[role='status']").exists()).toBe(true);
    });

    it("should have aria-live for dynamic content", () => {
        // Arrange & Act
        const wrapper = shallowMount(MyComponent);

        // Assert
        const alert = wrapper.find("[role='alert']");
        expect(alert.attributes("aria-live")).toBe("assertive");
    });

    it("should associate label with input via for/id", () => {
        // Arrange & Act
        const wrapper = shallowMount(TextInput, {props: {label: "Email"}});

        // Assert
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

Mock element properties directly in each test:

```typescript
it("should capture image when button is clicked", async () => {
    // Arrange
    const wrapper = shallowMount(CameraCapture);
    const videoElement = wrapper.find("video").element as HTMLVideoElement;
    Object.defineProperty(videoElement, "play", {
        value: vi.fn().mockResolvedValue(undefined),
        writable: true,
    });
    Object.defineProperty(videoElement, "videoWidth", {value: 1280, writable: true});
    Object.defineProperty(videoElement, "videoHeight", {value: 720, writable: true});
    await flushPromises();

    // Act
    const captureButton = wrapper.findAll("button").find((btn) => btn.text() === "Capture");
    await captureButton?.trigger("click");

    // Assert
    expect(wrapper.emitted("capture")).toBeTruthy();
});
```

## Styling Assertions

### UnoCSS Attributify Mode

```typescript
it("should have neo-brutalist styling", () => {
    // Arrange & Act
    const wrapper = shallowMount(MyComponent);

    // Assert
    const element = wrapper.find("button");
    expect(element.attributes("border")).toBe("3 black");
    expect(element.attributes("bg")).toBe("yellow-400");
    expect(element.attributes("uppercase")).toBeDefined();
});
```

### CSS Classes

```typescript
it("should apply error styling when error is present", () => {
    // Arrange & Act
    const wrapper = shallowMount(TextInput, {
        props: {label: "Email", modelValue: "", error: "Invalid"},
    });

    // Assert
    expect(wrapper.find("input").classes()).toContain("bg-red-100");
});

it("should apply conditional classes", () => {
    // Arrange & Act
    const wrapper = shallowMount(MyComponent, {props: {isActive: false}});

    // Assert
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
import {flushPromises, shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("MyComponent", () => {
    describe("rendering", () => {
        it("should render with default props", () => {
            // Arrange & Act
            const wrapper = shallowMount(MyComponent);

            // Assert
            expect(wrapper.find("h1").text()).toBe("Default Title");
        });

        it("should render custom title from props", () => {
            // Arrange & Act
            const wrapper = shallowMount(MyComponent, {
                props: {title: "Custom Title"},
            });

            // Assert
            expect(wrapper.find("h1").text()).toBe("Custom Title");
        });
    });

    describe("interactions", () => {
        it("should emit submit event when button is clicked", async () => {
            // Arrange
            const wrapper = shallowMount(MyComponent);

            // Act
            const submitButton = wrapper.findAll("button").find((btn) => btn.text() === "Submit");
            await submitButton?.trigger("click");

            // Assert
            expect(wrapper.emitted("submit")).toBeTruthy();
        });
    });

    describe("accessibility", () => {
        it("should have proper aria attributes", () => {
            // Arrange & Act
            const wrapper = shallowMount(MyComponent);

            // Assert
            expect(wrapper.find("button").attributes("aria-label")).toBeDefined();
        });
    });
});
```

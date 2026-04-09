import {usePageTransition} from "@shared/composables/usePageTransition";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {nextTick, ref} from "vue";

type MediaQueryHandler = (event: {matches: boolean}) => void;

const createMockMatchMedia = (matches: boolean) => {
    const handlers: MediaQueryHandler[] = [];
    const mockMediaQueryList = {
        matches,
        addEventListener: vi.fn<(type: string, handler: MediaQueryHandler) => void>((_type, handler) => {
            handlers.push(handler);
        }),
    };

    return {
        matchMedia: vi.fn<(query: string) => typeof mockMediaQueryList>().mockReturnValue(mockMediaQueryList),
        handlers,
        mockMediaQueryList,
    };
};

describe("usePageTransition", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("should return all expected properties", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});

        // Act
        const result = usePageTransition({routeRef});

        // Assert
        expect(result.transitionName).toBeDefined();
        expect(result.routeKey).toBeDefined();
        expect(result.activeVariant).toBeDefined();
        expect(result.prefersReducedMotion).toBeDefined();
        expect(result.setVariant).toBeInstanceOf(Function);
        expect(result.setBackNavigation).toBeInstanceOf(Function);
    });

    it("should default to brick-snap variant", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});

        // Act
        const {activeVariant, transitionName} = usePageTransition({routeRef});

        // Assert
        expect(activeVariant.value).toBe("brick-snap");
        expect(transitionName.value).toBe("brick-snap");
    });

    it("should use the provided defaultVariant", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});

        // Act
        const {activeVariant, transitionName} = usePageTransition({routeRef, defaultVariant: "brick-lift"});

        // Assert
        expect(activeVariant.value).toBe("brick-lift");
        expect(transitionName.value).toBe("brick-lift");
    });

    it("should compute routeKey from routeRef path", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/sets"});

        // Act
        const {routeKey} = usePageTransition({routeRef});

        // Assert
        expect(routeKey.value).toBe("/sets");
    });

    it("should update routeKey when routeRef changes", async () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/sets"});
        const {routeKey} = usePageTransition({routeRef});

        // Act
        routeRef.value = {path: "/storage"};
        await nextTick();

        // Assert
        expect(routeKey.value).toBe("/storage");
    });

    it("should override variant with setVariant", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});
        const {activeVariant, transitionName, setVariant} = usePageTransition({routeRef});

        // Act
        setVariant("brick-lift");

        // Assert
        expect(activeVariant.value).toBe("brick-lift");
        expect(transitionName.value).toBe("brick-lift");
    });

    it("should set brick-lift variant when setBackNavigation is called", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});
        const {activeVariant, setBackNavigation} = usePageTransition({routeRef});

        // Act
        setBackNavigation();

        // Assert
        expect(activeVariant.value).toBe("brick-lift");
    });

    it("should reset override variant on route change", async () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});
        const {activeVariant, setVariant} = usePageTransition({routeRef});

        setVariant("brick-lift");
        expect(activeVariant.value).toBe("brick-lift");

        // Act
        routeRef.value = {path: "/about"};
        await nextTick();

        // Assert
        expect(activeVariant.value).toBe("brick-snap");
    });

    it("should detect prefers-reduced-motion", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(true);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});

        // Act
        const {prefersReducedMotion, transitionName} = usePageTransition({routeRef});

        // Assert
        expect(prefersReducedMotion.value).toBe(true);
        expect(transitionName.value).toBe("brick-none");
    });

    it("should return brick-none transition name when reduced motion is preferred", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(true);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});
        const {transitionName, setVariant} = usePageTransition({routeRef});

        // Act — even with explicit variant set, reduced motion takes precedence
        setVariant("brick-lift");

        // Assert
        expect(transitionName.value).toBe("brick-none");
    });

    it("should respond to live changes in prefers-reduced-motion media query", async () => {
        // Arrange
        const {matchMedia, handlers} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});
        const {prefersReducedMotion, transitionName} = usePageTransition({routeRef});

        expect(prefersReducedMotion.value).toBe(false);
        expect(transitionName.value).toBe("brick-snap");

        // Act — simulate system preference change
        for (const handler of handlers) {
            handler({matches: true});
        }
        await nextTick();

        // Assert
        expect(prefersReducedMotion.value).toBe(true);
        expect(transitionName.value).toBe("brick-none");
    });

    it("should respond when reduced motion is turned off after being on", async () => {
        // Arrange
        const {matchMedia, handlers} = createMockMatchMedia(true);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});
        const {prefersReducedMotion, transitionName} = usePageTransition({routeRef});

        expect(prefersReducedMotion.value).toBe(true);

        // Act — simulate user disabling reduced motion
        for (const handler of handlers) {
            handler({matches: false});
        }
        await nextTick();

        // Assert
        expect(prefersReducedMotion.value).toBe(false);
        expect(transitionName.value).toBe("brick-snap");
    });

    it("should register a change event listener on matchMedia", () => {
        // Arrange
        const {matchMedia, mockMediaQueryList} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});

        // Act
        usePageTransition({routeRef});

        // Assert
        expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("should query the correct media query string", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});
        const routeRef = ref({path: "/"});

        // Act
        usePageTransition({routeRef});

        // Assert
        expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    });

    it("should default to no reduced motion when window is undefined", () => {
        // Arrange — temporarily remove window to simulate SSR
        const originalWindow = globalThis.window;
        // @ts-expect-error — deliberately removing window to test SSR branch
        delete globalThis.window;
        const routeRef = ref({path: "/"});

        // Act
        const {prefersReducedMotion, transitionName} = usePageTransition({routeRef});

        // Assert
        expect(prefersReducedMotion.value).toBe(false);
        expect(transitionName.value).toBe("brick-snap");

        // Cleanup
        globalThis.window = originalWindow;
    });
});

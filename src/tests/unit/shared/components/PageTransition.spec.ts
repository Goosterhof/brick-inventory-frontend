import PageTransition from "@shared/components/PageTransition.vue";
import {shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {nextTick} from "vue";

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

describe("PageTransition", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        Object.defineProperty(window, "matchMedia", {writable: true, value: createMockMatchMedia(false).matchMedia});
    });

    it("should render slot content", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {
            props: {routePath: "/home"},
            slots: {default: "<p>Page content</p>"},
        });

        // Assert
        expect(wrapper.text()).toBe("Page content");
    });

    it("should pass the transition name to the Transition component", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {props: {routePath: "/sets"}, slots: {default: "<p>Content</p>"}});

        // Assert
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.exists()).toBe(true);
        expect(transition.attributes("name")).toBe("brick-snap");
    });

    it("should set mode to out-in on the Transition component", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {props: {routePath: "/home"}, slots: {default: "<p>Content</p>"}});

        // Assert
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("mode")).toBe("out-in");
    });

    it("should render a keyed div using routePath", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {
            props: {routePath: "/storage"},
            slots: {default: "<p>Storage page</p>"},
        });

        // Assert
        const keyedDiv = wrapper.find("div");
        expect(keyedDiv.exists()).toBe(true);
    });

    it("should default to brick-snap variant", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        // Assert
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("name")).toBe("brick-snap");
        expect(wrapper.vm.activeVariant).toBe("brick-snap");
    });

    it("should use the provided defaultVariant", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {
            props: {routePath: "/", defaultVariant: "brick-lift"},
            slots: {default: "<p>Content</p>"},
        });

        // Assert
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("name")).toBe("brick-lift");
        expect(wrapper.vm.activeVariant).toBe("brick-lift");
    });

    it("should expose setVariant, setBackNavigation, activeVariant, and prefersReducedMotion", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        // Assert
        expect(wrapper.vm.setVariant).toBeInstanceOf(Function);
        expect(wrapper.vm.setBackNavigation).toBeInstanceOf(Function);
        expect(wrapper.vm.activeVariant).toBeDefined();
        expect(wrapper.vm.prefersReducedMotion).toBeDefined();
    });

    it("should override variant with setVariant", () => {
        // Arrange
        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        // Act
        wrapper.vm.setVariant("brick-lift");

        // Assert
        expect(wrapper.vm.activeVariant).toBe("brick-lift");
    });

    it("should set brick-lift variant when setBackNavigation is called", () => {
        // Arrange
        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        // Act
        wrapper.vm.setBackNavigation();

        // Assert
        expect(wrapper.vm.activeVariant).toBe("brick-lift");
    });

    it("should reset override variant on route change", async () => {
        // Arrange
        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        wrapper.vm.setVariant("brick-lift");
        expect(wrapper.vm.activeVariant).toBe("brick-lift");

        // Act
        await wrapper.setProps({routePath: "/about"});
        await nextTick();

        // Assert
        expect(wrapper.vm.activeVariant).toBe("brick-snap");
    });

    it("should detect prefers-reduced-motion", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(true);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});

        // Act
        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        // Assert
        expect(wrapper.vm.prefersReducedMotion).toBe(true);
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("name")).toBe("brick-none");
    });

    it("should return brick-none transition name when reduced motion is preferred even with explicit variant", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(true);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});

        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        // Act — even with explicit variant set, reduced motion takes precedence
        wrapper.vm.setVariant("brick-lift");

        // Assert
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("name")).toBe("brick-none");
    });

    it("should respond to live changes in prefers-reduced-motion media query", async () => {
        // Arrange
        const {matchMedia, handlers} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});

        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        expect(wrapper.vm.prefersReducedMotion).toBe(false);

        // Act — simulate system preference change
        for (const handler of handlers) {
            handler({matches: true});
        }
        await nextTick();

        // Assert
        expect(wrapper.vm.prefersReducedMotion).toBe(true);
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("name")).toBe("brick-none");
    });

    it("should respond when reduced motion is turned off after being on", async () => {
        // Arrange
        const {matchMedia, handlers} = createMockMatchMedia(true);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});

        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        expect(wrapper.vm.prefersReducedMotion).toBe(true);

        // Act — simulate user disabling reduced motion
        for (const handler of handlers) {
            handler({matches: false});
        }
        await nextTick();

        // Assert
        expect(wrapper.vm.prefersReducedMotion).toBe(false);
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("name")).toBe("brick-snap");
    });

    it("should register a change event listener on matchMedia", () => {
        // Arrange
        const {matchMedia, mockMediaQueryList} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});

        // Act
        shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        // Assert
        expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("should query the correct media query string", () => {
        // Arrange
        const {matchMedia} = createMockMatchMedia(false);
        Object.defineProperty(window, "matchMedia", {writable: true, value: matchMedia});

        // Act
        shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        // Assert
        expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    });

    it("should default to no reduced motion when matchMedia is unavailable", () => {
        // Arrange — simulate SSR-like environment where matchMedia is not available
        Object.defineProperty(window, "matchMedia", {writable: true, value: undefined});

        // Act
        const wrapper = shallowMount(PageTransition, {props: {routePath: "/"}, slots: {default: "<p>Content</p>"}});

        // Assert — defaults to false (no reduced motion), no listener registered
        expect(wrapper.vm.prefersReducedMotion).toBe(false);
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("name")).toBe("brick-snap");
    });
});

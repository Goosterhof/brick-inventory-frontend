import PageTransition from "@shared/components/PageTransition.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("PageTransition", () => {
    it("should render slot content", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {
            props: {name: "brick-snap", routeKey: "/home"},
            slots: {default: "<p>Page content</p>"},
        });

        // Assert
        expect(wrapper.text()).toBe("Page content");
    });

    it("should pass the name prop to the Transition component", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {
            props: {name: "brick-lift", routeKey: "/sets"},
            slots: {default: "<p>Content</p>"},
        });

        // Assert
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.exists()).toBe(true);
        expect(transition.attributes("name")).toBe("brick-lift");
    });

    it("should set mode to out-in on the Transition component", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {
            props: {name: "brick-snap", routeKey: "/home"},
            slots: {default: "<p>Content</p>"},
        });

        // Assert
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("mode")).toBe("out-in");
    });

    it("should render a keyed div using routeKey", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {
            props: {name: "brick-snap", routeKey: "/storage"},
            slots: {default: "<p>Storage page</p>"},
        });

        // Assert
        const keyedDiv = wrapper.find("div");
        expect(keyedDiv.exists()).toBe(true);
    });

    it("should use brick-none name for reduced motion", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {
            props: {name: "brick-none", routeKey: "/home"},
            slots: {default: "<p>Content</p>"},
        });

        // Assert
        const transition = wrapper.findComponent({name: "Transition"});
        expect(transition.attributes("name")).toBe("brick-none");
    });

    it("should accept different routeKey values", () => {
        // Arrange & Act
        const wrapper = shallowMount(PageTransition, {
            props: {name: "brick-snap", routeKey: "/parts"},
            slots: {default: "<p>Parts page</p>"},
        });

        // Assert
        expect(wrapper.text()).toBe("Parts page");
    });
});

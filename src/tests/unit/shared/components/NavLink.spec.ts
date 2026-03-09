import NavLink from "@shared/components/NavLink.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("NavLink", () => {
    it("should render slot content in RouterLink", () => {
        // Arrange
        const wrapper = shallowMount(NavLink, {props: {to: "/"}, slots: {default: "Home"}});
        const routerLink = wrapper.findComponent({name: "RouterLink"});

        // Assert
        expect(routerLink.text()).toBe("Home");
    });

    it("should pass to prop to RouterLink", () => {
        // Arrange
        const wrapper = shallowMount(NavLink, {props: {to: "/about"}, slots: {default: "About"}});
        const routerLink = wrapper.findComponent({name: "RouterLink"});

        // Assert
        expect(routerLink.props("to")).toBe("/about");
    });

    it("should have neo-brutalist styling", () => {
        // Arrange
        const wrapper = shallowMount(NavLink, {props: {to: "/"}, slots: {default: "Home"}});
        const routerLink = wrapper.findComponent({name: "RouterLink"});

        // Assert
        expect(routerLink.attributes("class")).toContain("brick-border");
        expect(routerLink.attributes("class")).toContain("brick-shadow");
        expect(routerLink.attributes("bg")).toBe("white hover:yellow-100 focus:yellow-100");
        expect(routerLink.attributes("font")).toBe("bold");
        expect(routerLink.attributes("uppercase")).toBeDefined();
    });
});

import NavMobileLink from "@shared/components/NavMobileLink.vue";
import {RouterLinkStub, shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

const mountMobileLink = (props: {to: string; active?: boolean}, slotText = "Home") =>
    shallowMount(NavMobileLink, {props, slots: {default: slotText}, global: {stubs: {RouterLink: RouterLinkStub}}});

describe("NavMobileLink", () => {
    it("should render slot content", () => {
        // Arrange
        const wrapper = mountMobileLink({to: "/"});

        // Assert
        expect(wrapper.text()).toBe("Home");
    });

    it("should pass to prop to RouterLink", () => {
        // Arrange
        const wrapper = mountMobileLink({to: "/about"});

        // Assert
        expect(wrapper.findComponent(RouterLinkStub).props("to")).toBe("/about");
    });

    it("should have full-width styling with border bottom", () => {
        // Arrange
        const wrapper = mountMobileLink({to: "/"});
        const link = wrapper.findComponent(RouterLinkStub);

        // Assert
        expect(link.attributes("block")).toBeDefined();
        expect(link.attributes("p")).toBe("4");
        expect(link.attributes("border")).toBe("b-3 black");
    });

    it("should show default background when not active", () => {
        // Arrange
        const wrapper = mountMobileLink({to: "/"});
        const link = wrapper.findComponent(RouterLinkStub);

        // Assert
        expect(link.attributes("bg")).toBe("white hover:yellow-300 focus:yellow-300");
    });

    it("should show yellow background when active", () => {
        // Arrange
        const wrapper = mountMobileLink({to: "/", active: true});
        const link = wrapper.findComponent(RouterLinkStub);

        // Assert
        expect(link.attributes("bg")).toBe("yellow-300");
    });

    it("should have bold uppercase text", () => {
        // Arrange
        const wrapper = mountMobileLink({to: "/"});
        const link = wrapper.findComponent(RouterLinkStub);

        // Assert
        expect(link.attributes("font")).toBe("bold");
        expect(link.attributes("uppercase")).toBeDefined();
        expect(link.attributes("tracking")).toBe("wide");
    });
});

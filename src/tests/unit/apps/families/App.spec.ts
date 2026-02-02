import App from "@app/App.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it, vi} from "vitest";

vi.mock("@app/services", () => ({
    FamilyRouterLink: {
        name: "FamilyRouterLink",
        props: ["to"],
        template: "<a><slot /></a>",
    },
    FamilyRouterView: {
        name: "FamilyRouterView",
        template: "<div><slot /></div>",
    },
}));

describe("App", () => {
    it("should render navigation links", () => {
        // Arrange & Act
        const wrapper = shallowMount(App);

        // Assert
        const links = wrapper.findAllComponents({name: "FamilyRouterLink"});
        expect(links).toHaveLength(2);
        const [homeLink, aboutLink] = links;
        expect(homeLink?.text()).toBe("Home");
        expect(aboutLink?.text()).toBe("About");
    });
});

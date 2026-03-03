import App from "@app/App.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockLogout, mockGoToRoute, mockIsLoggedIn} = vi.hoisted(() => ({
    mockLogout: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockIsLoggedIn: {value: false},
}));

vi.mock("@app/services", () => ({
    FamilyRouterLink: {name: "FamilyRouterLink", props: ["to"], template: "<a><slot /></a>"},
    FamilyRouterView: {name: "FamilyRouterView", template: "<div><slot /></div>"},
    familyAuthService: {isLoggedIn: mockIsLoggedIn, logout: mockLogout},
    familyRouterService: {goToRoute: mockGoToRoute},
}));

describe("App", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsLoggedIn.value = false;
    });

    it("should render navigation links", () => {
        // Arrange & Act
        const wrapper = shallowMount(App);

        // Assert
        const links = wrapper.findAllComponents({name: "FamilyRouterLink"});
        expect(links).toHaveLength(3);
        const [homeLink, aboutLink, setsLink] = links;
        expect(homeLink?.text()).toBe("Home");
        expect(aboutLink?.text()).toBe("About");
        expect(setsLink?.text()).toBe("Mijn Sets");
    });

    it("should not show logout button when not logged in", () => {
        // Arrange & Act
        const wrapper = shallowMount(App);

        // Assert
        expect(wrapper.find("button").exists()).toBe(false);
    });

    it("should show logout button when logged in", () => {
        // Arrange
        mockIsLoggedIn.value = true;

        // Act
        const wrapper = shallowMount(App);

        // Assert
        const button = wrapper.find("button");
        expect(button.exists()).toBe(true);
        expect(button.text()).toBe("Logout");
    });

    it("should show Mijn Sets link when logged in", () => {
        // Arrange
        mockIsLoggedIn.value = true;

        // Act
        const wrapper = shallowMount(App);

        // Assert
        const setsLink = wrapper
            .findAllComponents({name: "FamilyRouterLink"})
            .find((link) => link.text() === "Mijn Sets");
        expect(setsLink?.exists()).toBe(true);
        expect(setsLink?.props("to")).toEqual({name: "sets"});
        expect(wrapper.find("span").attributes("style")).toBeUndefined();
    });

    it("should hide Mijn Sets link when not logged in", () => {
        // Arrange & Act
        const wrapper = shallowMount(App);

        // Assert
        const setsSpan = wrapper.find("span");
        expect(setsSpan.attributes("style")).toContain("display: none");
    });

    it("should call logout and navigate to login on click", async () => {
        // Arrange
        mockIsLoggedIn.value = true;
        mockLogout.mockResolvedValue(undefined);
        const wrapper = shallowMount(App);

        // Act
        await wrapper.find("button").trigger("click");
        await flushPromises();

        // Assert
        expect(mockLogout).toHaveBeenCalled();
        expect(mockGoToRoute).toHaveBeenCalledWith("login");
    });
});

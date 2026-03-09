import App from "@app/App.vue";
import NavHeader from "@shared/components/NavHeader.vue";
import NavMobileLink from "@shared/components/NavMobileLink.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockLogout, mockGoToRoute, mockIsLoggedIn, mockCurrentRouteRef} = vi.hoisted(() => ({
    mockLogout: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockIsLoggedIn: {value: false},
    mockCurrentRouteRef: {value: {name: "home", path: "/", matched: [] as never[], meta: {}, query: {}, params: {}}},
}));

vi.mock("@app/services", () => ({
    FamilyRouterLink: {name: "FamilyRouterLink", props: ["to"], template: "<a><slot /></a>"},
    FamilyRouterView: {name: "FamilyRouterView", template: "<div><slot /></div>"},
    familyAuthService: {isLoggedIn: mockIsLoggedIn, logout: mockLogout},
    familyRouterService: {goToRoute: mockGoToRoute, currentRouteRef: mockCurrentRouteRef},
}));

vi.mock("@shared/components/NavHeader.vue", () => ({
    default: {
        name: "NavHeader",
        template: '<div><slot name="links" /><slot name="mobile-links" /><slot name="actions" /></div>',
    },
}));

vi.mock("@shared/components/NavMobileLink.vue", () => ({
    default: {
        name: "NavMobileLink",
        props: ["to", "active"],
        template: '<a class="mobile-link" :data-active="active"><slot /></a>',
    },
}));

const mountApp = () => shallowMount(App, {global: {stubs: {NavHeader, NavMobileLink}}});

describe("App", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsLoggedIn.value = false;
        mockCurrentRouteRef.value = {name: "home", path: "/", matched: [] as never[], meta: {}, query: {}, params: {}};
    });

    it("should render desktop navigation links", () => {
        // Arrange & Act
        const wrapper = mountApp();

        // Assert
        const links = wrapper.findAllComponents({name: "FamilyRouterLink"});
        expect(links).toHaveLength(3);
        const [homeLink, aboutLink, setsLink] = links;
        expect(homeLink?.text()).toBe("Home");
        expect(aboutLink?.text()).toBe("About");
        expect(setsLink?.text()).toContain("Mijn Sets");
    });

    it("should render mobile navigation links", () => {
        // Arrange & Act
        const wrapper = mountApp();

        // Assert
        const mobileLinks = wrapper.findAllComponents({name: "NavMobileLink"});
        expect(mobileLinks).toHaveLength(3);
        expect(mobileLinks[0]?.text()).toBe("Home");
        expect(mobileLinks[1]?.text()).toBe("About");
        expect(mobileLinks[2]?.text()).toContain("Mijn Sets");
    });

    it("should mark active mobile link based on current route", () => {
        // Arrange
        mockCurrentRouteRef.value = {
            name: "about",
            path: "/about",
            matched: [] as never[],
            meta: {},
            query: {},
            params: {},
        };

        // Act
        const wrapper = mountApp();

        // Assert
        const mobileLinks = wrapper.findAll(".mobile-link");
        expect(mobileLinks[0]?.attributes("data-active")).toBe("false");
        expect(mobileLinks[1]?.attributes("data-active")).toBe("true");
    });

    it("should not show logout button when not logged in", () => {
        // Arrange & Act
        const wrapper = mountApp();

        // Assert
        expect(wrapper.find("button").exists()).toBe(false);
    });

    it("should show logout button when logged in", () => {
        // Arrange
        mockIsLoggedIn.value = true;

        // Act
        const wrapper = mountApp();

        // Assert
        const button = wrapper.find("button");
        expect(button.exists()).toBe(true);
        expect(button.text()).toContain("Logout");
    });

    it("should show Mijn Sets link when logged in", () => {
        // Arrange
        mockIsLoggedIn.value = true;

        // Act
        const wrapper = mountApp();

        // Assert
        const setsLink = wrapper
            .findAllComponents({name: "FamilyRouterLink"})
            .find((link) => link.text().includes("Mijn Sets"));
        expect(setsLink?.exists()).toBe(true);
        expect(setsLink?.props("to")).toEqual({name: "sets"});
    });

    it("should call logout and navigate to login on click", async () => {
        // Arrange
        mockIsLoggedIn.value = true;
        mockLogout.mockResolvedValue(undefined);
        const wrapper = mountApp();

        // Act
        await wrapper.find("button").trigger("click");
        await flushPromises();

        // Assert
        expect(mockLogout).toHaveBeenCalled();
        expect(mockGoToRoute).toHaveBeenCalledWith("login");
    });

    it("should use NavHeader component", () => {
        // Arrange & Act
        const wrapper = mountApp();

        // Assert
        expect(wrapper.findComponent({name: "NavHeader"}).exists()).toBe(true);
    });
});

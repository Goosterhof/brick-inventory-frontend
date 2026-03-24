import App from "@app/App.vue";
import NavHeader from "@shared/components/NavHeader.vue";
import NavMobileLink from "@shared/components/NavMobileLink.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {createMockAxios, createMockStringTs, createMockFamilyServices} = await vi.hoisted(
    () => import("../../../helpers"),
);

vi.mock("axios", () => createMockAxios());
vi.mock("string-ts", () => createMockStringTs());

vi.mock("@phosphor-icons/vue", () => ({
    PhSignOut: {template: "<i />"},
    PhList: {template: "<i />"},
    PhX: {template: "<i />"},
}));

const {mockLogout, mockGoToRoute, mockIsLoggedIn, mockCurrentRouteRef} = vi.hoisted(() => ({
    mockLogout: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockIsLoggedIn: {value: false},
    mockCurrentRouteRef: {value: {name: "home", path: "/", matched: [] as never[], meta: {}, query: {}, params: {}}},
}));

vi.mock("@app/services", () =>
    createMockFamilyServices({
        FamilyRouterLink: {name: "FamilyRouterLink", props: ["to"], template: "<a><slot /></a>"},
        FamilyRouterView: {name: "FamilyRouterView", template: "<div><slot /></div>"},
        familyAuthService: {isLoggedIn: mockIsLoggedIn, logout: mockLogout},
        familyRouterService: {goToRoute: mockGoToRoute, currentRouteRef: mockCurrentRouteRef},
    }),
);

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
        expect(links).toHaveLength(8);
        const [homeLink, aboutLink, setsLink, storageLink, partsLink, settingsLink, loginLink, registerLink] = links;
        expect(homeLink?.text()).toBe("navigation.home");
        expect(aboutLink?.text()).toBe("navigation.about");
        expect(setsLink?.text()).toContain("navigation.sets");
        expect(storageLink?.text()).toContain("navigation.storage");
        expect(partsLink?.text()).toContain("navigation.parts");
        expect(settingsLink?.text()).toContain("navigation.settings");
        expect(loginLink?.text()).toContain("auth.logIn");
        expect(registerLink?.text()).toContain("auth.register");
    });

    it("should render mobile navigation links", () => {
        // Arrange & Act
        const wrapper = mountApp();

        // Assert
        const mobileLinks = wrapper.findAllComponents({name: "NavMobileLink"});
        expect(mobileLinks).toHaveLength(8);
        expect(mobileLinks[0]?.text()).toBe("navigation.home");
        expect(mobileLinks[1]?.text()).toBe("navigation.about");
        expect(mobileLinks[2]?.text()).toContain("navigation.sets");
        expect(mobileLinks[3]?.text()).toContain("navigation.storage");
        expect(mobileLinks[4]?.text()).toContain("navigation.parts");
        expect(mobileLinks[5]?.text()).toContain("navigation.settings");
        expect(mobileLinks[6]?.text()).toContain("auth.logIn");
        expect(mobileLinks[7]?.text()).toContain("auth.register");
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
        expect(button.text()).toContain("auth.logout");
    });

    it("should show sets link when logged in", () => {
        // Arrange
        mockIsLoggedIn.value = true;

        // Act
        const wrapper = mountApp();

        // Assert
        const setsLink = wrapper
            .findAllComponents({name: "FamilyRouterLink"})
            .find((link) => link.text().includes("navigation.sets"));
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

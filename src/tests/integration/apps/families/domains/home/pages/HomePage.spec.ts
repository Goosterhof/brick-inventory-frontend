import HomePage from "@app/domains/home/pages/HomePage.vue";
import NavLink from "@shared/components/NavLink.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import StatCard from "@shared/components/StatCard.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockGoToRoute, mockIsLoggedIn, mockRetrieveAll, mockGetAll} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockIsLoggedIn: {value: true},
    mockRetrieveAll: vi.fn().mockResolvedValue(undefined),
    mockGetAll: {value: [] as {set?: {year?: number | null}}[]},
}));

vi.mock("axios", () => ({isAxiosError: () => false, AxiosError: Error}));
vi.mock("string-ts", () => ({deepCamelKeys: <T>(o: T): T => o, deepSnakeKeys: <T>(o: T): T => o}));
vi.mock("@app/services", () => ({
    familyTranslationService: {
        t: (key: string, _params?: Record<string, string>) => ({value: key}),
        locale: {value: "en"},
    },
    familyHttpService: {
        getRequest: mockGetRequest,
        postRequest: vi.fn(),
        putRequest: vi.fn(),
        patchRequest: vi.fn(),
        deleteRequest: vi.fn(),
        registerRequestMiddleware: vi.fn(() => vi.fn()),
        registerResponseMiddleware: vi.fn(() => vi.fn()),
        registerResponseErrorMiddleware: vi.fn(() => vi.fn()),
    },
    familyAuthService: {isLoggedIn: mockIsLoggedIn, userId: vi.fn()},
    familyRouterService: {goToRoute: mockGoToRoute},
}));
vi.mock("@app/stores", () => ({familySetStoreModule: {retrieveAll: mockRetrieveAll, getAll: mockGetAll}}));

describe("HomePage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsLoggedIn.value = true;
    });

    it("renders landing page with real NavLink when logged out", () => {
        mockIsLoggedIn.value = false;
        const wrapper = mount(HomePage);

        const navLink = wrapper.findComponent(NavLink);
        expect(navLink.exists()).toBe(true);
        expect(navLink.find("a").exists()).toBe(true);
        expect(navLink.text()).toContain("auth.createAccount");
    });

    it("renders dashboard with real PageHeader and StatCards when logged in", async () => {
        mockGetRequest.mockResolvedValue({
            data: {
                totalSets: 5,
                totalSetQuantity: 8,
                setsByStatus: {},
                totalStorageLocations: 3,
                totalUniqueParts: 12,
                totalPartsQuantity: 100,
            },
        });

        const wrapper = mount(HomePage);
        await flushPromises();

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.exists()).toBe(true);
        expect(pageHeader.find("h1").text()).toBe("home.dashboardTitle");

        const statCards = wrapper.findAllComponents(StatCard);
        expect(statCards).toHaveLength(3);

        const labels = statCards.map((c) => c.props("label"));
        expect(labels).toEqual(["home.statSets", "home.statStorageLocations", "home.statStoredParts"]);
    });

    it("renders quick action NavLinks that delegate navigation to router service", async () => {
        mockGetRequest.mockResolvedValue({
            data: {
                totalSets: 1,
                totalSetQuantity: 1,
                setsByStatus: {},
                totalStorageLocations: 0,
                totalUniqueParts: 0,
                totalPartsQuantity: 0,
            },
        });

        const wrapper = mount(HomePage);
        await flushPromises();

        const navLinks = wrapper.findAllComponents(NavLink);
        expect(navLinks.length).toBeGreaterThanOrEqual(6);

        const setsLink = navLinks.find((l) => l.text().includes("navigation.sets"));
        await setsLink?.find("a").trigger("click");

        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });

    it("shows loading state before stats resolve", () => {
        mockGetRequest.mockReturnValue(new Promise(() => {}));
        const wrapper = mount(HomePage);

        expect(wrapper.text()).toContain("home.loadingStats");
    });
});

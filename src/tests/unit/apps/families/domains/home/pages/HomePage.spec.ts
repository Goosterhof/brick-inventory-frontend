import HomePage from "@app/domains/home/pages/HomePage.vue";
import CardContainer from "@shared/components/CardContainer.vue";
import NavLink from "@shared/components/NavLink.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockGoToRoute, mockIsLoggedIn} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockIsLoggedIn: {value: true},
}));

vi.mock("@app/services", () => ({
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
    familyAuthService: {
        isLoggedIn: mockIsLoggedIn,
        user: {value: null},
        userId: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkIfLoggedIn: vi.fn(),
        sendEmailResetPassword: vi.fn(),
        resetPassword: vi.fn(),
    },
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: mockGoToRoute},
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

const mockStatsResponse = {
    total_sets: 5,
    total_set_quantity: 8,
    sets_by_status: {sealed: 2, built: 3},
    total_storage_locations: 3,
    total_unique_parts: 12,
    total_parts_quantity: 150,
};

describe("HomePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsLoggedIn.value = true;
    });

    describe("when logged out", () => {
        it("should show landing page", () => {
            // Arrange
            mockIsLoggedIn.value = false;

            // Act
            const wrapper = shallowMount(HomePage);

            // Assert
            expect(wrapper.text()).toContain("home.brandTitle");
            expect(wrapper.text()).toContain("home.tagline");
            expect(wrapper.findComponent(NavLink).exists()).toBe(true);
        });

        it("should not fetch stats", () => {
            // Arrange
            mockIsLoggedIn.value = false;

            // Act
            shallowMount(HomePage);

            // Assert
            expect(mockGetRequest).not.toHaveBeenCalled();
        });
    });

    describe("when logged in", () => {
        it("should fetch stats on mount", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockStatsResponse});

            // Act
            shallowMount(HomePage);
            await flushPromises();

            // Assert
            expect(mockGetRequest).toHaveBeenCalledWith("/family/stats");
        });

        it("should show loading state while fetching", () => {
            // Arrange
            mockGetRequest.mockReturnValue(new Promise(() => {}));

            // Act
            const wrapper = shallowMount(HomePage);

            // Assert
            expect(wrapper.text()).toContain("home.loadingStats");
        });

        it("should render dashboard title", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockStatsResponse});

            // Act
            const wrapper = shallowMount(HomePage);
            await flushPromises();

            // Assert
            expect(wrapper.findComponent(PageHeader).props("title")).toBe("home.dashboardTitle");
        });

        it("should render stat cards with correct values", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockStatsResponse});

            // Act
            const wrapper = shallowMount(HomePage);
            await flushPromises();

            // Assert
            const cards = wrapper.findAllComponents(CardContainer);
            expect(cards.length).toBeGreaterThanOrEqual(3);
            expect(wrapper.text()).toContain("5");
            expect(wrapper.text()).toContain("3");
            expect(wrapper.text()).toContain("12");
        });

        it("should show total quantity when different from total sets", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockStatsResponse});

            // Act
            const wrapper = shallowMount(HomePage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("home.totalIncludingDuplicates");
        });

        it("should not show total quantity when equal to total sets", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: {...mockStatsResponse, total_sets: 5, total_set_quantity: 5}});

            // Act
            const wrapper = shallowMount(HomePage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).not.toContain("home.totalIncludingDuplicates");
        });

        it("should render sets by status", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockStatsResponse});

            // Act
            const wrapper = shallowMount(HomePage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("sets.sealed");
            expect(wrapper.text()).toContain("sets.built");
        });

        it("should render quick action links", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockStatsResponse});

            // Act
            const wrapper = shallowMount(HomePage);
            await flushPromises();

            // Assert
            const navLinks = wrapper.findAllComponents(NavLink);
            expect(navLinks.length).toBe(2);
            expect(wrapper.text()).toContain("navigation.sets");
            expect(wrapper.text()).toContain("navigation.storage");
        });

        it("should navigate to sets when quick action is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockStatsResponse});
            const wrapper = shallowMount(HomePage);
            await flushPromises();

            // Act
            const navLinks = wrapper.findAllComponents(NavLink);
            const setsLink = navLinks.find((link) => link.text().includes("navigation.sets"));
            await setsLink?.trigger("click");
            await flushPromises();

            // Assert
            expect(mockGoToRoute).toHaveBeenCalledWith("sets");
        });

        it("should navigate to storage when quick action is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockStatsResponse});
            const wrapper = shallowMount(HomePage);
            await flushPromises();

            // Act
            const navLinks = wrapper.findAllComponents(NavLink);
            const storageLink = navLinks.find((link) => link.text().includes("navigation.storage"));
            await storageLink?.trigger("click");
            await flushPromises();

            // Assert
            expect(mockGoToRoute).toHaveBeenCalledWith("storage");
        });

        it("should handle empty stats", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({
                data: {
                    total_sets: 0,
                    total_set_quantity: 0,
                    sets_by_status: {},
                    total_storage_locations: 0,
                    total_unique_parts: 0,
                    total_parts_quantity: 0,
                },
            });

            // Act
            const wrapper = shallowMount(HomePage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).not.toContain("home.setsByStatus");
            expect(wrapper.text()).toContain("home.quickActions");
        });
    });
});

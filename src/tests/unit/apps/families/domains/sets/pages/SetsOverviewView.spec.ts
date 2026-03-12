import SetsOverviewView from "@app/domains/sets/pages/SetsOverviewView.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import ListItemButton from "@shared/components/ListItemButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockGoToRoute} = vi.hoisted(() => ({mockGetRequest: vi.fn(), mockGoToRoute: vi.fn()}));

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
        isLoggedIn: {value: true},
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

const mockFamilySet = {
    id: 1,
    set_id: 10,
    quantity: 2,
    status: "built",
    purchase_date: "2024-01-15",
    notes: "Test notes",
    set: {
        id: 10,
        set_num: "75192-1",
        name: "Millennium Falcon",
        year: 2017,
        theme: "Star Wars",
        num_parts: 7541,
        image_url: "https://example.com/75192.jpg",
    },
};

describe("SetsOverviewView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render page title", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        const wrapper = shallowMount(SetsOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(PageHeader).props("title")).toBe("sets.title");
    });

    it("should fetch sets on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        shallowMount(SetsOverviewView);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/family-sets");
    });

    it("should render set cards when sets exist", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: [mockFamilySet]});

        // Act
        const wrapper = shallowMount(SetsOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Millennium Falcon");
        expect(wrapper.text()).toContain("75192-1");
        expect(wrapper.text()).toContain("sets.built");
        expect(wrapper.text()).toContain("2x");
    });

    it("should show empty state when no sets exist", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        const wrapper = shallowMount(SetsOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(EmptyState).props("message")).toBe("sets.noSets");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(SetsOverviewView);

        // Assert
        expect(wrapper.text()).toContain("common.loading");
    });

    it("should navigate to add page when add button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});
        const wrapper = shallowMount(SetsOverviewView);
        await flushPromises();

        // Act
        await wrapper.findComponent(PrimaryButton).trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-add");
    });

    it("should navigate to detail page when a set card is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: [mockFamilySet]});
        const wrapper = shallowMount(SetsOverviewView);
        await flushPromises();

        // Act
        wrapper.findComponent(ListItemButton).vm.$emit("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-detail", 1);
    });

    it("should render set image when available", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: [mockFamilySet]});

        // Act
        const wrapper = shallowMount(SetsOverviewView);
        await flushPromises();

        // Assert
        const img = wrapper.find("img");
        expect(img.exists()).toBe(true);
        expect(img.attributes("src")).toBe("https://example.com/75192.jpg");
        expect(img.attributes("alt")).toBe("Millennium Falcon");
    });

    it("should render placeholder when image is not available", async () => {
        // Arrange
        const setWithoutImage = {...mockFamilySet, set: {...mockFamilySet.set, image_url: null}};
        mockGetRequest.mockResolvedValue({data: [setWithoutImage]});

        // Act
        const wrapper = shallowMount(SetsOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.find("img").exists()).toBe(false);
        expect(wrapper.text()).toContain("common.noImage");
    });
});

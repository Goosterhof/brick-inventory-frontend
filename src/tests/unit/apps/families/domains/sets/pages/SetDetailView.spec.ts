import SetDetailView from "@app/domains/sets/pages/SetDetailView.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockGoToRoute, mockCurrentRouteId} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockCurrentRouteId: {value: 42},
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
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: mockGoToRoute, currentRouteId: mockCurrentRouteId},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

const mockFamilySetResponse = {
    id: 42,
    set_id: 10,
    quantity: 2,
    status: "built",
    purchase_date: "2024-01-15",
    notes: "Birthday gift",
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

describe("SetDetailView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentRouteId.value = 42;
    });

    it("should fetch set by route id on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        shallowMount(SetDetailView);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/family-sets/42");
    });

    it("should render set details", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(SetDetailView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Millennium Falcon");
        expect(wrapper.text()).toContain("75192-1");
        expect(wrapper.text()).toContain("2017");
        expect(wrapper.text()).toContain("Star Wars");
        expect(wrapper.text()).toContain("7541");
        expect(wrapper.text()).toContain("2x");
        expect(wrapper.text()).toContain("Gebouwd");
        expect(wrapper.text()).toContain("2024-01-15");
        expect(wrapper.text()).toContain("Birthday gift");
    });

    it("should render set image when available", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(SetDetailView);
        await flushPromises();

        // Assert
        const img = wrapper.find("img");
        expect(img.exists()).toBe(true);
        expect(img.attributes("src")).toBe("https://example.com/75192.jpg");
        expect(img.attributes("alt")).toBe("Millennium Falcon");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(SetDetailView);

        // Assert
        expect(wrapper.text()).toContain("Laden...");
    });

    it("should navigate to edit page when edit button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        const wrapper = shallowMount(SetDetailView);
        await flushPromises();

        // Act
        await wrapper.findComponent(PrimaryButton).trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-edit", 42);
    });

    it("should navigate back to overview when back button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        const wrapper = shallowMount(SetDetailView);
        await flushPromises();

        // Act
        const backButton = wrapper.findAll("button").find((btn) => btn.text().includes("Terug"));
        await backButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });

    it("should not show purchase date when null", async () => {
        // Arrange
        const responseWithoutDate = {...mockFamilySetResponse, purchase_date: null};
        mockGetRequest.mockResolvedValue({data: responseWithoutDate});

        // Act
        const wrapper = shallowMount(SetDetailView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Aankoopdatum");
    });

    it("should not show notes when null", async () => {
        // Arrange
        const responseWithoutNotes = {...mockFamilySetResponse, notes: null};
        mockGetRequest.mockResolvedValue({data: responseWithoutNotes});

        // Act
        const wrapper = shallowMount(SetDetailView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Notities");
    });
});

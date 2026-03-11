import StorageDetailView from "@app/domains/storage/pages/StorageDetailView.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockGoToRoute, mockCurrentRouteId} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockCurrentRouteId: {value: 5},
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

const mockStorageOptionResponse = {
    id: 5,
    name: "Lade A",
    description: "Linkerla op plank 1",
    parent_id: null,
    row: 1,
    column: 2,
    child_ids: [6, 7],
};

describe("StorageDetailView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentRouteId.value = 5;
    });

    it("should fetch storage option by route id on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});

        // Act
        shallowMount(StorageDetailView);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/storage-options/5");
    });

    it("should render storage option details", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});

        // Act
        const wrapper = shallowMount(StorageDetailView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Lade A");
        expect(wrapper.text()).toContain("Linkerla op plank 1");
        expect(wrapper.text()).toContain("1");
        expect(wrapper.text()).toContain("2");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(StorageDetailView);

        // Assert
        expect(wrapper.text()).toContain("Laden...");
    });

    it("should navigate to edit page when edit button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});
        const wrapper = shallowMount(StorageDetailView);
        await flushPromises();

        // Act
        await wrapper.findComponent(PrimaryButton).trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-edit", 5);
    });

    it("should navigate back to overview when back button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});
        const wrapper = shallowMount(StorageDetailView);
        await flushPromises();

        // Act
        const backButton = wrapper.findAll("button").find((btn) => btn.text().includes("Terug"));
        await backButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage");
    });

    it("should not show description when null", async () => {
        // Arrange
        const responseWithoutDescription = {...mockStorageOptionResponse, description: null};
        mockGetRequest.mockResolvedValue({data: responseWithoutDescription});

        // Act
        const wrapper = shallowMount(StorageDetailView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Beschrijving");
    });

    it("should not show row when null", async () => {
        // Arrange
        const responseWithoutRow = {...mockStorageOptionResponse, row: null};
        mockGetRequest.mockResolvedValue({data: responseWithoutRow});

        // Act
        const wrapper = shallowMount(StorageDetailView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Rij:");
    });

    it("should not show column when null", async () => {
        // Arrange
        const responseWithoutColumn = {...mockStorageOptionResponse, column: null};
        mockGetRequest.mockResolvedValue({data: responseWithoutColumn});

        // Act
        const wrapper = shallowMount(StorageDetailView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Kolom:");
    });

    it("should not show sub-locations when no children", async () => {
        // Arrange
        const responseWithoutChildren = {...mockStorageOptionResponse, child_ids: []};
        mockGetRequest.mockResolvedValue({data: responseWithoutChildren});

        // Act
        const wrapper = shallowMount(StorageDetailView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Sub-locaties");
    });

    it("should show child count when children exist", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});

        // Act
        const wrapper = shallowMount(StorageDetailView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Sub-locaties");
        expect(wrapper.text()).toContain("2");
    });
});

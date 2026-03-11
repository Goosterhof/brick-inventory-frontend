import StorageOverviewView from "@app/domains/storage/pages/StorageOverviewView.vue";
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
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

const mockStorageOption = {
    id: 1,
    name: "Lade A",
    description: "Linkerla op plank 1",
    parent_id: null,
    row: 1,
    column: 2,
    child_ids: [2, 3],
};

describe("StorageOverviewView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render page title", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        const wrapper = shallowMount(StorageOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.find("h1").text()).toBe("Opslag");
    });

    it("should fetch storage options on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        shallowMount(StorageOverviewView);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/storage-options");
    });

    it("should render storage option cards when options exist", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: [mockStorageOption]});

        // Act
        const wrapper = shallowMount(StorageOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Lade A");
        expect(wrapper.text()).toContain("Linkerla op plank 1");
        expect(wrapper.text()).toContain("2 sub-locaties");
        expect(wrapper.text()).toContain("Rij 1, Kolom 2");
    });

    it("should show empty state when no storage options exist", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        const wrapper = shallowMount(StorageOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Nog geen opslaglocaties. Voeg je eerste opslaglocatie toe!");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(StorageOverviewView);

        // Assert
        expect(wrapper.text()).toContain("Laden...");
    });

    it("should navigate to add page when add button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});
        const wrapper = shallowMount(StorageOverviewView);
        await flushPromises();

        // Act
        await wrapper.findComponent(PrimaryButton).trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-add");
    });

    it("should navigate to detail page when a storage card is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: [mockStorageOption]});
        const wrapper = shallowMount(StorageOverviewView);
        await flushPromises();

        // Act
        await wrapper.find("button").trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-detail", 1);
    });

    it("should not show sub-locations badge when no children", async () => {
        // Arrange
        const optionWithoutChildren = {...mockStorageOption, child_ids: []};
        mockGetRequest.mockResolvedValue({data: [optionWithoutChildren]});

        // Act
        const wrapper = shallowMount(StorageOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("sub-locaties");
    });

    it("should not show row and column when null", async () => {
        // Arrange
        const optionWithoutGrid = {...mockStorageOption, row: null, column: null};
        mockGetRequest.mockResolvedValue({data: [optionWithoutGrid]});

        // Act
        const wrapper = shallowMount(StorageOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Rij");
        expect(wrapper.text()).not.toContain("Kolom");
    });

    it("should not show description when null", async () => {
        // Arrange
        const optionWithoutDescription = {...mockStorageOption, description: null};
        mockGetRequest.mockResolvedValue({data: [optionWithoutDescription]});

        // Act
        const wrapper = shallowMount(StorageOverviewView);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Linkerla op plank 1");
    });
});

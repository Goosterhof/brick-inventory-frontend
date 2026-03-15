import StorageDetailPage from "@app/domains/storage/pages/StorageDetailPage.vue";
import BackButton from "@shared/components/BackButton.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import PartListItem from "@shared/components/PartListItem.vue";
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
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
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

const mockStoragePartsResponse = [
    {
        id: 1,
        storage_option_id: 5,
        quantity: 12,
        part: {
            id: 10,
            part_num: "3001",
            name: "Brick 2 x 4",
            category: null,
            image_url: "https://example.com/3001.jpg",
        },
        color: {id: 1, name: "Red", rgb: "CC0000", is_transparent: false},
    },
    {
        id: 2,
        storage_option_id: 5,
        quantity: 8,
        part: {id: 20, part_num: "3002", name: "Brick 2 x 3", category: null, image_url: null},
        color: null,
    },
];

const mountWithResponses = (
    optionData: Record<string, unknown> = mockStorageOptionResponse,
    partsData: unknown[] = mockStoragePartsResponse,
) => {
    mockGetRequest.mockResolvedValueOnce({data: optionData}).mockResolvedValueOnce({data: partsData});
    return shallowMount(StorageDetailPage);
};

describe("StorageDetailPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentRouteId.value = 5;
    });

    it("should fetch storage option and parts by route id on mount", async () => {
        // Arrange & Act
        mountWithResponses();
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/storage-options/5");
        expect(mockGetRequest).toHaveBeenCalledWith("/storage-options/5/parts");
    });

    it("should render storage option details", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses();
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
        const wrapper = shallowMount(StorageDetailPage);

        // Assert
        expect(wrapper.text()).toContain("common.loading");
    });

    it("should navigate to edit page when edit button is clicked", async () => {
        // Arrange
        const wrapper = mountWithResponses();
        await flushPromises();

        // Act
        await wrapper.findComponent(PrimaryButton).trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-edit", 5);
    });

    it("should navigate back to overview when back button is clicked", async () => {
        // Arrange
        const wrapper = mountWithResponses();
        await flushPromises();

        // Act
        wrapper.findComponent(BackButton).vm.$emit("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage");
    });

    it("should not show description when null", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses({...mockStorageOptionResponse, description: null});
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Linkerla op plank 1");
    });

    it("should not show row when null", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses({...mockStorageOptionResponse, row: null});
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("storage.row");
    });

    it("should not show column when null", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses({...mockStorageOptionResponse, column: null});
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("storage.column");
    });

    it("should not show sub-locations when no children", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses({...mockStorageOptionResponse, child_ids: []});
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("storage.subLocations");
    });

    it("should show child count when children exist", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses();
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("storage.subLocations");
        expect(wrapper.text()).toContain("2");
    });

    it("should render parts with names and quantities", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses();
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("storage.parts");
        expect(wrapper.text()).toContain("(2)");
        const parts = wrapper.findAllComponents(PartListItem);
        expect(parts).toHaveLength(2);
        expect(parts[0]?.props("name")).toBe("Brick 2 x 4");
        expect(parts[0]?.props("partNum")).toBe("3001");
        expect(parts[0]?.props("quantity")).toBe(12);
        expect(parts[1]?.props("name")).toBe("Brick 2 x 3");
        expect(parts[1]?.props("quantity")).toBe(8);
    });

    it("should render color swatch when color is present", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses();
        await flushPromises();

        // Assert
        const parts = wrapper.findAllComponents(PartListItem);
        expect(parts[0]?.props("colorRgb")).toBe("CC0000");
    });

    it("should render color name when color is present", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses();
        await flushPromises();

        // Assert
        const parts = wrapper.findAllComponents(PartListItem);
        expect(parts[0]?.props("colorName")).toBe("Red");
    });

    it("should render part image when available", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses();
        await flushPromises();

        // Assert
        const parts = wrapper.findAllComponents(PartListItem);
        expect(parts[0]?.props("imageUrl")).toBe("https://example.com/3001.jpg");
    });

    it("should show empty message when no parts", async () => {
        // Arrange & Act
        const wrapper = mountWithResponses(mockStorageOptionResponse, []);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(EmptyState).props("message")).toBe("storage.noParts");
    });
});

import AssignPartModal from "@app/domains/sets/modals/AssignPartModal.vue";
import SetDetailPage from "@app/domains/sets/pages/SetDetailPage.vue";
import BackButton from "@shared/components/BackButton.vue";
import PartListItem from "@shared/components/PartListItem.vue";
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
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
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

const mockSetWithPartsResponse = {
    id: 10,
    set_num: "75192-1",
    name: "Millennium Falcon",
    year: 2017,
    theme: "Star Wars",
    num_parts: 7541,
    image_url: "https://example.com/75192.jpg",
    parts: [
        {
            id: 1,
            quantity: 10,
            is_spare: false,
            element_id: "300101",
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
            quantity: 2,
            is_spare: true,
            element_id: "300226",
            part: {id: 20, part_num: "3002", name: "Brick 2 x 3", category: null, image_url: null},
            color: {id: 5, name: "Blue", rgb: "0000CC", is_transparent: false},
        },
    ],
};

describe("SetDetailPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentRouteId.value = 42;
    });

    it("should fetch set by route id on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        shallowMount(SetDetailPage);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/family-sets/42");
    });

    it("should render set details", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Millennium Falcon");
        expect(wrapper.text()).toContain("75192-1");
        expect(wrapper.text()).toContain("2017");
        expect(wrapper.text()).toContain("Star Wars");
        expect(wrapper.text()).toContain("7541");
        expect(wrapper.text()).toContain("2x");
        expect(wrapper.text()).toContain("sets.built");
        expect(wrapper.text()).toContain("2024-01-15");
        expect(wrapper.text()).toContain("Birthday gift");
    });

    it("should render set image when available", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(SetDetailPage);
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
        const wrapper = shallowMount(SetDetailPage);

        // Assert
        expect(wrapper.text()).toContain("common.loading");
    });

    it("should navigate to edit page when edit button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const editButton = buttons.find((btn) => btn.text().includes("sets.edit"));
        await editButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-edit", 42);
    });

    it("should navigate back to overview when back button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        wrapper.findComponent(BackButton).vm.$emit("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });

    it("should not show purchase date when null", async () => {
        // Arrange
        const responseWithoutDate = {...mockFamilySetResponse, purchase_date: null};
        mockGetRequest.mockResolvedValue({data: responseWithoutDate});

        // Act
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("2024-01-15");
    });

    it("should not show notes when null", async () => {
        // Arrange
        const responseWithoutNotes = {...mockFamilySetResponse, notes: null};
        mockGetRequest.mockResolvedValue({data: responseWithoutNotes});

        // Act
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Birthday gift");
    });

    it("should show load parts button initially", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Assert
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        expect(loadPartsButton?.exists()).toBe(true);
    });

    it("should fetch and display parts when load parts button is clicked", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/sets/75192-1/parts");
        expect(wrapper.text()).toContain("sets.parts");
        expect(wrapper.text()).toContain("(1)");
        const parts = wrapper.findAllComponents(PartListItem);
        const regularPart = parts.find((p) => !p.props("spare"));
        expect(regularPart?.props("name")).toBe("Brick 2 x 4");
        expect(regularPart?.props("partNum")).toBe("3001");
        expect(regularPart?.props("quantity")).toBe(10);
    });

    it("should display spare parts in separate section", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("sets.spareParts");
        expect(wrapper.text()).toContain("(1)");
        const parts = wrapper.findAllComponents(PartListItem);
        const sparePart = parts.find((p) => p.props("spare"));
        expect(sparePart?.props("name")).toBe("Brick 2 x 3");
        expect(sparePart?.props("quantity")).toBe(2);
    });

    it("should hide load parts button after parts are loaded", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        const buttonsAfter = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButtonAfter = buttonsAfter.find((btn) => btn.text().includes("sets.loadParts"));
        expect(loadPartsButtonAfter).toBeUndefined();
    });

    it("should render color swatches for parts", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        const parts = wrapper.findAllComponents(PartListItem);
        expect(parts[0]?.props("colorRgb")).toBe("CC0000");
        expect(parts[0]?.props("colorName")).toBe("Red");
    });

    it("should render part images when available", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        const parts = wrapper.findAllComponents(PartListItem);
        expect(parts[0]?.props("imageUrl")).toBe("https://example.com/3001.jpg");
    });

    it("should fetch storage map after loading parts", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/sets/75192-1/storage-map");
    });

    it("should display storage location badges on parts", async () => {
        // Arrange
        const storageMapData = [
            {part_id: 10, color_id: 1, storage_option_id: 5, storage_option_name: "Drawer A", quantity: 8},
        ];
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: storageMapData});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Drawer A (8x)");
    });

    it("should not display storage badges when no storage map data", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Drawer");
    });

    it("should show build check when all parts are available", async () => {
        // Arrange
        const storageMapData = [
            {part_id: 10, color_id: 1, storage_option_id: 5, storage_option_name: "Drawer A", quantity: 10},
        ];
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: storageMapData});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("sets.buildCheck");
        expect(wrapper.text()).toContain("sets.readyToBuild");
        expect(wrapper.text()).toContain("1/1");
        expect(wrapper.text()).toContain("10/10");
    });

    it("should show missing parts when not all available", async () => {
        // Arrange
        const storageMapData = [
            {part_id: 10, color_id: 1, storage_option_id: 5, storage_option_name: "Drawer A", quantity: 3},
        ];
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: storageMapData});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("sets.notReadyToBuild");
        expect(wrapper.text()).toContain("0/1");
        expect(wrapper.text()).toContain("3/10");
    });

    it("should not show build check when no storage map data", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();

        // Act
        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = buttons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("sets.buildCheck");
    });

    it("should open assign modal when a part is clicked", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();
        const primaryButtons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = primaryButtons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();

        // Act
        const partButtons = wrapper.findAll("button[type='button']");
        await partButtons[0]?.trigger("click");
        await flushPromises();

        // Assert
        const modal = wrapper.findComponent(AssignPartModal);
        expect(modal.exists()).toBe(true);
        expect(modal.props("open")).toBe(true);
        expect(modal.props("part")).toMatchObject({part: {name: "Brick 2 x 4"}});
    });

    it("should close assign modal on close event", async () => {
        // Arrange
        mockGetRequest
            .mockResolvedValueOnce({data: mockFamilySetResponse})
            .mockResolvedValueOnce({data: mockSetWithPartsResponse})
            .mockResolvedValueOnce({data: []});
        const wrapper = shallowMount(SetDetailPage);
        await flushPromises();
        const primaryButtons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsButton = primaryButtons.find((btn) => btn.text().includes("sets.loadParts"));
        await loadPartsButton?.trigger("click");
        await flushPromises();
        const partButtons = wrapper.findAll("button[type='button']");
        await partButtons[0]?.trigger("click");
        await flushPromises();

        // Act
        wrapper.findComponent(AssignPartModal).vm.$emit("close");
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(AssignPartModal).exists()).toBe(false);
    });
});

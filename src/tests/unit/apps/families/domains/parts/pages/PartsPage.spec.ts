import PartsPage from "@app/domains/parts/pages/PartsPage.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest} = vi.hoisted(() => ({mockGetRequest: vi.fn()}));

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
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: vi.fn()},
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

const mockPartsResponse = [
    {
        part_id: 10,
        part_num: "3001",
        part_name: "Brick 2 x 4",
        part_image_url: "https://example.com/3001.jpg",
        color_id: 1,
        color_name: "Red",
        color_rgb: "CC0000",
        storage_option_id: 5,
        storage_option_name: "Drawer A",
        quantity: 8,
    },
    {
        part_id: 10,
        part_num: "3001",
        part_name: "Brick 2 x 4",
        part_image_url: "https://example.com/3001.jpg",
        color_id: 1,
        color_name: "Red",
        color_rgb: "CC0000",
        storage_option_id: 6,
        storage_option_name: "Drawer B",
        quantity: 4,
    },
    {
        part_id: 20,
        part_num: "3002",
        part_name: "Brick 2 x 3",
        part_image_url: null,
        color_id: 5,
        color_name: "Blue",
        color_rgb: "0000CC",
        storage_option_id: 5,
        storage_option_name: "Drawer A",
        quantity: 3,
    },
];

describe("PartsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render page header", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        const wrapper = shallowMount(PartsPage);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(PageHeader).props("title")).toBe("parts.title");
    });

    it("should fetch parts on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        shallowMount(PartsPage);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/family/parts");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(PartsPage);

        // Assert
        expect(wrapper.text()).toContain("common.loading");
    });

    it("should show empty state when no parts", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        const wrapper = shallowMount(PartsPage);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(EmptyState).props("message")).toBe("parts.noParts");
    });

    it("should group parts by part+color and show total quantity", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockPartsResponse});

        // Act
        const wrapper = shallowMount(PartsPage);
        await flushPromises();

        // Assert
        const items = wrapper.findAllComponents(PartListItem);
        expect(items).toHaveLength(2);

        const brick2x4 = items.find((item) => item.props("name") === "Brick 2 x 4");
        expect(brick2x4?.props("quantity")).toBe(12);
        expect(brick2x4?.props("colorName")).toBe("Red");

        const brick2x3 = items.find((item) => item.props("name") === "Brick 2 x 3");
        expect(brick2x3?.props("quantity")).toBe(3);
        expect(brick2x3?.props("colorName")).toBe("Blue");
    });

    it("should display storage location badges", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockPartsResponse});

        // Act
        const wrapper = shallowMount(PartsPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Drawer A (8x)");
        expect(wrapper.text()).toContain("Drawer B (4x)");
    });

    it("should handle fetch error gracefully", async () => {
        // Arrange
        mockGetRequest.mockRejectedValue(new Error("Network error"));

        // Act
        const wrapper = shallowMount(PartsPage);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(EmptyState).exists()).toBe(true);
    });
});

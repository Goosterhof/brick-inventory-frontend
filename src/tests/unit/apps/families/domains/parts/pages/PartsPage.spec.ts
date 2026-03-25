import PartsPage from "@app/domains/parts/pages/PartsPage.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import FilterChip from "@shared/components/FilterChip.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {
    createMockAxios,
    createMockStringTs,
    createMockFamilyServices,
    createMockFormField,
    createMockFormLabel,
    createMockFormError,
} = await vi.hoisted(() => import("../../../../../../helpers"));

const {mockGetRequest} = vi.hoisted(() => ({mockGetRequest: vi.fn()}));

vi.mock("axios", () => createMockAxios());
vi.mock("string-ts", () => createMockStringTs());

vi.mock("@shared/components/forms/FormError.vue", () => createMockFormError());
vi.mock("@shared/components/forms/FormField.vue", () => createMockFormField());
vi.mock("@shared/components/forms/FormLabel.vue", () => createMockFormLabel());

vi.mock("@shared/components/EmptyState.vue", () => ({
    default: {name: "EmptyState", template: "<span><slot /></span>", props: ["message"]},
}));

vi.mock("@shared/components/FilterChip.vue", () => ({
    default: {name: "FilterChip", template: "<button @click='$emit(\"click\")'><slot /></button>", props: ["active"]},
}));

vi.mock("@shared/components/forms/inputs/TextInput.vue", () => ({
    default: {
        name: "TextInput",
        template: "<input @input='$emit(\"update:modelValue\", $event.target.value)' />",
        props: ["modelValue"],
    },
}));

vi.mock("@shared/components/PageHeader.vue", () => ({
    default: {name: "PageHeader", template: "<header><h1>{{ title }}</h1><slot /></header>", props: ["title"]},
}));

vi.mock("@shared/components/PartListItem.vue", () => ({
    default: {
        name: "PartListItem",
        template: "<div><slot /></div>",
        props: ["name", "partNum", "quantity", "imageUrl", "colorName", "colorRgb"],
    },
}));

vi.mock("@shared/components/PrimaryButton.vue", () => ({
    default: {
        name: "PrimaryButton",
        template: "<button @click='$emit(\"click\")'><slot /></button>",
        props: ["variant"],
    },
}));

vi.mock("@shared/helpers/csv", () => ({downloadCsv: vi.fn(), toCsv: vi.fn()}));

vi.mock("@app/services", () =>
    createMockFamilyServices({
        familyHttpService: {getRequest: mockGetRequest},
        familyAuthService: {isLoggedIn: {value: true}},
    }),
);

const mockPartsResponse = [
    {
        partId: 10,
        partNum: "3001",
        partName: "Brick 2 x 4",
        partImageUrl: "https://example.com/3001.jpg",
        colorId: 1,
        colorName: "Red",
        colorRgb: "CC0000",
        storageOptionId: 5,
        storageOptionName: "Drawer A",
        quantity: 8,
        familySetId: 1,
    },
    {
        partId: 10,
        partNum: "3001",
        partName: "Brick 2 x 4",
        partImageUrl: "https://example.com/3001.jpg",
        colorId: 1,
        colorName: "Red",
        colorRgb: "CC0000",
        storageOptionId: 6,
        storageOptionName: "Drawer B",
        quantity: 4,
        familySetId: 1,
    },
    {
        partId: 20,
        partNum: "3002",
        partName: "Brick 2 x 3",
        partImageUrl: null,
        colorId: 5,
        colorName: "Blue",
        colorRgb: "0000CC",
        storageOptionId: 5,
        storageOptionName: "Drawer A",
        quantity: 3,
        familySetId: null,
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

    describe("search", () => {
        it("should filter parts by name", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            await wrapper.findComponent(TextInput).setValue("Brick 2 x 3");
            await flushPromises();

            // Assert
            const items = wrapper.findAllComponents(PartListItem);
            expect(items).toHaveLength(1);
            expect(items.find((i) => i.props("name") === "Brick 2 x 3")?.exists()).toBe(true);
        });

        it("should filter parts by part number", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            await wrapper.findComponent(TextInput).setValue("3001");
            await flushPromises();

            // Assert
            const items = wrapper.findAllComponents(PartListItem);
            expect(items).toHaveLength(1);
            expect(items.find((i) => i.props("name") === "Brick 2 x 4")?.exists()).toBe(true);
        });

        it("should be case-insensitive", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            await wrapper.findComponent(TextInput).setValue("brick 2 x 3");
            await flushPromises();

            // Assert
            expect(wrapper.findAllComponents(PartListItem)).toHaveLength(1);
        });

        it("should show no results when search matches nothing", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            await wrapper.findComponent(TextInput).setValue("nonexistent");
            await flushPromises();

            // Assert
            const emptyStates = wrapper.findAllComponents(EmptyState);
            const noResults = emptyStates.find((e) => e.props("message") === "parts.noResults");
            expect(noResults?.exists()).toBe(true);
        });
    });

    describe("color filter", () => {
        it("should display unique color chips", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});

            // Act
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Assert
            const chips = wrapper.findAllComponents(FilterChip);
            const chipTexts = chips.map((c) => c.text());
            expect(chipTexts).toContain("Blue");
            expect(chipTexts).toContain("Red");
        });

        it("should show all-colors chip", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});

            // Act
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Assert
            const chips = wrapper.findAllComponents(FilterChip);
            const allColorsChip = chips.find((c) => c.text() === "parts.allColors");
            expect(allColorsChip?.exists()).toBe(true);
            expect(allColorsChip?.props("active")).toBe(true);
        });

        it("should filter parts by color when a color chip is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            const blueChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "Blue");
            blueChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            const items = wrapper.findAllComponents(PartListItem);
            expect(items).toHaveLength(1);
            expect(items.find((i) => i.props("colorName") === "Blue")?.exists()).toBe(true);
        });

        it("should toggle color filter off when clicked again", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            const blueChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "Blue");
            blueChip?.vm.$emit("click");
            blueChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            expect(wrapper.findAllComponents(PartListItem)).toHaveLength(2);
        });

        it("should clear color filter when all-colors chip is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Apply a color filter first
            const blueChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "Blue");
            blueChip?.vm.$emit("click");
            await flushPromises();
            expect(wrapper.findAllComponents(PartListItem)).toHaveLength(1);

            // Act
            const allChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "parts.allColors");
            allChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            expect(wrapper.findAllComponents(PartListItem)).toHaveLength(2);
        });
    });

    describe("sort", () => {
        it("should display sort chips", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});

            // Act
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Assert
            const chips = wrapper.findAllComponents(FilterChip);
            const chipTexts = chips.map((c) => c.text());
            expect(chipTexts).toContain("parts.sortName");
            expect(chipTexts).toContain("parts.sortQuantity");
            expect(chipTexts).toContain("parts.sortColor");
        });

        it("should sort by name by default (alphabetical)", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});

            // Act
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Assert
            const names = wrapper.findAllComponents(PartListItem).map((i) => i.props("name"));
            expect(names).toEqual(["Brick 2 x 3", "Brick 2 x 4"]);
        });

        it("should sort by quantity descending when quantity chip is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            const quantityChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "parts.sortQuantity");
            quantityChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            const quantities = wrapper.findAllComponents(PartListItem).map((i) => i.props("quantity"));
            expect(quantities).toEqual([12, 3]);
        });

        it("should sort by color name when color sort chip is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            const colorSortChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "parts.sortColor");
            colorSortChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            const colors = wrapper.findAllComponents(PartListItem).map((i) => i.props("colorName"));
            expect(colors).toEqual(["Blue", "Red"]);
        });

        it("should mark the active sort chip", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});

            // Act
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Assert — name is active by default
            const nameChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "parts.sortName");
            expect(nameChip?.props("active")).toBe(true);
        });
    });

    describe("orphan parts", () => {
        it("should mark parts without a family set as orphans", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});

            // Act
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Assert — Brick 2 x 3 has familySetId: null so it's an orphan
            expect(wrapper.text()).toContain("parts.orphanParts");
        });

        it("should filter to only orphan parts when orphan chip is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            const orphanChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "parts.orphanParts");
            orphanChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            const items = wrapper.findAllComponents(PartListItem);
            expect(items).toHaveLength(1);
            expect(items.find((i) => i.props("name") === "Brick 2 x 3")?.exists()).toBe(true);
        });

        it("should toggle orphan filter off when clicked again", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act
            const orphanChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "parts.orphanParts");
            orphanChip?.vm.$emit("click");
            orphanChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            expect(wrapper.findAllComponents(PartListItem)).toHaveLength(2);
        });

        it("should show orphan badge on orphan part items", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});

            // Act
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Assert — the orphan badge text appears for Brick 2 x 3
            const orphanBadges = wrapper.findAll("span").filter((s) => s.text() === "parts.orphanParts");
            expect(orphanBadges.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("combined filters", () => {
        it("should apply search and color filter together", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act — search for "Brick" and filter by Red
            await wrapper.findComponent(TextInput).setValue("Brick");
            const redChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "Red");
            redChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            const items = wrapper.findAllComponents(PartListItem);
            expect(items).toHaveLength(1);
            expect(items.find((i) => i.props("colorName") === "Red")?.exists()).toBe(true);
        });

        it("should apply search and orphan filter together", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Act — search for "Brick" and filter orphans only
            await wrapper.findComponent(TextInput).setValue("Brick");
            const orphanChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "parts.orphanParts");
            orphanChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            const items = wrapper.findAllComponents(PartListItem);
            expect(items).toHaveLength(1);
            expect(items.find((i) => i.props("name") === "Brick 2 x 3")?.exists()).toBe(true);
        });
    });

    describe("export", () => {
        it("should show export button when parts exist", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockPartsResponse});

            // Act
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Assert
            const exportButton = wrapper.findAllComponents(PrimaryButton).find((btn) => btn.text() === "common.export");
            expect(exportButton?.exists()).toBe(true);
        });

        it("should not show export button when no parts exist", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: []});

            // Act
            const wrapper = shallowMount(PartsPage);
            await flushPromises();

            // Assert
            const exportButton = wrapper.findAllComponents(PrimaryButton).find((btn) => btn.text() === "common.export");
            expect(exportButton).toBeUndefined();
        });
    });
});

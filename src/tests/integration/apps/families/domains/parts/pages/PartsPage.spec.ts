import PartsPage from "@app/domains/parts/pages/PartsPage.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import FilterChip from "@shared/components/FilterChip.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest} = vi.hoisted(() => ({mockGetRequest: vi.fn()}));

vi.mock("axios", () => ({isAxiosError: () => false, AxiosError: Error}));
vi.mock("string-ts", () => ({deepCamelKeys: <T>(o: T): T => o, deepSnakeKeys: <T>(o: T): T => o}));
vi.mock("@app/services", () => ({
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
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
}));
vi.mock("@shared/helpers/csv", () => ({downloadCsv: vi.fn(), toCsv: vi.fn(() => "")}));

const makePart = (overrides: Record<string, unknown> = {}) => ({
    partId: 1,
    partNum: "3001",
    partName: "Brick 2x4",
    partImageUrl: "http://example.com/brick.png",
    colorId: 1,
    colorName: "Red",
    colorRgb: "FF0000",
    quantity: 5,
    storageOptionId: 1,
    storageOptionName: "Box A",
    familySetId: 1,
    ...overrides,
});

describe("PartsPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders empty state with real EmptyState component when no parts", async () => {
        mockGetRequest.mockResolvedValue({data: []});
        const wrapper = mount(PartsPage);
        await flushPromises();

        const emptyState = wrapper.findComponent(EmptyState);
        expect(emptyState.exists()).toBe(true);
        expect(emptyState.text()).toContain("parts.noParts");
    });

    it("renders real PartListItem components with correct props when parts exist", async () => {
        mockGetRequest.mockResolvedValue({data: [makePart()]});
        const wrapper = mount(PartsPage);
        await flushPromises();

        const partItems = wrapper.findAllComponents(PartListItem);
        expect(partItems).toHaveLength(1);

        const item = partItems.find((p) => p.props("name") === "Brick 2x4");
        expect(item).toBeDefined();
        expect(item?.props("partNum")).toBe("3001");
        expect(item?.props("quantity")).toBe(5);
        expect(item?.props("colorName")).toBe("Red");
    });

    it("renders PageHeader with export button when parts exist", async () => {
        mockGetRequest.mockResolvedValue({data: [makePart()]});
        const wrapper = mount(PartsPage);
        await flushPromises();

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.exists()).toBe(true);
        expect(pageHeader.find("h1").text()).toBe("parts.title");

        const exportBtn = pageHeader.findComponent(PrimaryButton);
        expect(exportBtn.exists()).toBe(true);
        expect(exportBtn.text()).toBe("common.export");
    });

    it("renders search input and filter chips for sorting and colors", async () => {
        mockGetRequest.mockResolvedValue({data: [makePart()]});
        const wrapper = mount(PartsPage);
        await flushPromises();

        const searchInput = wrapper.findComponent(TextInput);
        expect(searchInput.exists()).toBe(true);
        expect(searchInput.props("type")).toBe("search");

        const filterChips = wrapper.findAllComponents(FilterChip);
        expect(filterChips.length).toBeGreaterThanOrEqual(5);
    });

    it("filters parts when clicking a color FilterChip", async () => {
        mockGetRequest.mockResolvedValue({
            data: [
                makePart({partId: 1, colorId: 1, colorName: "Red"}),
                makePart({partId: 2, colorId: 2, colorName: "Blue", colorRgb: "0000FF"}),
            ],
        });
        const wrapper = mount(PartsPage);
        await flushPromises();

        expect(wrapper.findAllComponents(PartListItem)).toHaveLength(2);

        const filterChips = wrapper.findAllComponents(FilterChip);
        const redChip = filterChips.find((c) => c.text() === "Red");
        await redChip?.find("button").trigger("click");

        expect(wrapper.findAllComponents(PartListItem)).toHaveLength(1);
    });

    it("shows loading text before API resolves", () => {
        mockGetRequest.mockReturnValue(new Promise(() => {}));
        const wrapper = mount(PartsPage);

        expect(wrapper.text()).toContain("common.loading");
    });
});

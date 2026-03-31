import PartsPage from "@app/domains/parts/pages/PartsPage.vue";
import {mockServer} from "@integration/helpers/mock-server";
import EmptyState from "@shared/components/EmptyState.vue";
import FilterChip from "@shared/components/FilterChip.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("@script-development/fs-http", async () => {
    const {mockHttpService} = await import("@integration/helpers/mock-server");
    return {createHttpService: () => mockHttpService};
});

/** CSV helpers don't run in happy-dom — mock to prevent file system access. */
vi.mock("@shared/helpers/csv", () => ({downloadCsv: vi.fn(), toCsv: vi.fn(() => "")}));

/**
 * Snake_case fixtures — matching real API response format.
 * toCamelCaseTyped() converts these to camelCase before they reach the component.
 */
const makePart = (overrides: Record<string, unknown> = {}) => ({
    part_id: 1,
    part_num: "3001",
    part_name: "Brick 2x4",
    part_image_url: "http://example.com/brick.png",
    color_id: 1,
    color_name: "Red",
    color_rgb: "FF0000",
    quantity: 5,
    storage_option_id: 1,
    storage_option_name: "Box A",
    family_set_id: 1,
    ...overrides,
});

describe("PartsPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockServer.reset();
        localStorage.clear();
    });

    it("renders empty state with real EmptyState component when no parts", async () => {
        mockServer.onGet("/family/parts", []);
        const wrapper = mount(PartsPage);
        await flushPromises();

        const emptyState = wrapper.findComponent(EmptyState);
        expect(emptyState.exists()).toBe(true);
        expect(emptyState.text()).toContain("No parts stored yet");
    });

    it("renders real PartListItem components with correct props when parts exist", async () => {
        mockServer.onGet("/family/parts", [makePart()]);
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
        mockServer.onGet("/family/parts", [makePart()]);
        const wrapper = mount(PartsPage);
        await flushPromises();

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.exists()).toBe(true);
        expect(pageHeader.find("h1").text()).toBe("Parts Inventory");

        const exportBtn = pageHeader.findComponent(PrimaryButton);
        expect(exportBtn.exists()).toBe(true);
        expect(exportBtn.text()).toBe("Export CSV");
    });

    it("renders search input and filter chips for sorting and colors", async () => {
        mockServer.onGet("/family/parts", [makePart()]);
        const wrapper = mount(PartsPage);
        await flushPromises();

        const searchInput = wrapper.findComponent(TextInput);
        expect(searchInput.exists()).toBe(true);
        expect(searchInput.props("type")).toBe("search");

        const filterChips = wrapper.findAllComponents(FilterChip);
        expect(filterChips.length).toBeGreaterThanOrEqual(5);
    });

    it("filters parts when clicking a color FilterChip", async () => {
        mockServer.onGet("/family/parts", [
            makePart({part_id: 1, color_id: 1, color_name: "Red"}),
            makePart({part_id: 2, color_id: 2, color_name: "Blue", color_rgb: "0000FF"}),
        ]);
        const wrapper = mount(PartsPage);
        await flushPromises();

        expect(wrapper.findAllComponents(PartListItem)).toHaveLength(2);

        const filterChips = wrapper.findAllComponents(FilterChip);
        const redChip = filterChips.find((c) => c.text() === "Red");
        await redChip?.find("button").trigger("click");

        expect(wrapper.findAllComponents(PartListItem)).toHaveLength(1);
    });

    it("shows loading text before API resolves", () => {
        // No route registered — getRequest will reject, but loading shows while pending
        mockServer.onGet("/family/parts", [makePart()]);
        const wrapper = mount(PartsPage);

        expect(wrapper.text()).toContain("Loading...");
    });
});

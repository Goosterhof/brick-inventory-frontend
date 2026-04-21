import PartsMissingPage from "@app/domains/parts/pages/PartsMissingPage.vue";
import {mockServer} from "@integration/helpers/mock-server";
import BackButton from "@shared/components/BackButton.vue";
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

/** CSV + XML helpers don't run in happy-dom — mock to prevent file system access. */
vi.mock("@shared/helpers/csv", () => ({downloadCsv: vi.fn<() => void>(), toCsv: vi.fn<() => string>(() => "")}));
vi.mock("@shared/helpers/bricklinkWantedList", () => ({
    toBrickLinkWantedListXml: vi.fn<() => string>(() => "<xml />"),
    downloadBrickLinkWantedList: vi.fn<() => void>(),
}));

/** Snake_case fixture — matching the real API response format. */
const makeEntry = (overrides: Record<string, unknown> = {}) => ({
    part_id: 10,
    part_num: "3001",
    part_name: "Brick 2x4",
    part_image_url: "https://example.com/3001.jpg",
    color_id: 1,
    color_name: "Red",
    color_rgb: "CC0000",
    brick_link_color_id: 5,
    quantity_needed: 10,
    quantity_stored: 3,
    shortfall: 7,
    needed_by_family_set_ids: [100, 200],
    ...overrides,
});

const makePayload = (entries: Record<string, unknown>[] = [], unknownFamilySetIds: number[] = []) => ({
    entries,
    unknown_family_set_ids: unknownFamilySetIds,
});

const URL_MISSING = "/family-sets/missing-parts";

describe("PartsMissingPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockServer.reset();
        localStorage.clear();
    });

    it("renders the empty state with the real EmptyState when no parts are missing", async () => {
        mockServer.onGet(URL_MISSING, makePayload([]));

        const wrapper = mount(PartsMissingPage);
        await flushPromises();

        const empty = wrapper.findComponent(EmptyState);
        expect(empty.exists()).toBe(true);
        expect(empty.text()).toContain("All parts accounted for");
    });

    it("renders the PageHeader with a translated title", async () => {
        mockServer.onGet(URL_MISSING, makePayload([makeEntry()]));

        const wrapper = mount(PartsMissingPage);
        await flushPromises();

        expect(wrapper.findComponent(PageHeader).find("h1").text()).toBe("Master Shopping List");
    });

    it("renders a PartListItem per missing entry with the shortfall as the displayed quantity", async () => {
        mockServer.onGet(URL_MISSING, makePayload([makeEntry({shortfall: 4, part_name: "Plate 1x2"})]));

        const wrapper = mount(PartsMissingPage);
        await flushPromises();

        const items = wrapper.findAllComponents(PartListItem);
        expect(items).toHaveLength(1);
        const item = items[0];
        expect(item?.props("name")).toBe("Plate 1x2");
        expect(item?.props("quantity")).toBe(4);
    });

    it("shows the unknown-sets callout when the backend reports unsynced sets", async () => {
        mockServer.onGet(URL_MISSING, makePayload([makeEntry()], [42, 43]));

        const wrapper = mount(PartsMissingPage);
        await flushPromises();

        const callout = wrapper.find("[data-testid='missing-unknown-sets']");
        expect(callout.exists()).toBe(true);
        expect(callout.attributes("data-unknown-count")).toBe("2");
    });

    it("surfaces the non-intrusive error banner on fetch failure", async () => {
        // Register no route — the mock server rejects unregistered GETs.
        const wrapper = mount(PartsMissingPage);
        await flushPromises();

        expect(wrapper.find("[data-testid='missing-error']").exists()).toBe(true);
    });

    it("wires the BackButton and export buttons as real PrimaryButton components", async () => {
        mockServer.onGet(URL_MISSING, makePayload([makeEntry()]));

        const wrapper = mount(PartsMissingPage);
        await flushPromises();

        const back = wrapper.findComponent(BackButton);
        expect(back.exists()).toBe(true);

        const buttonLabels = wrapper.findAllComponents(PrimaryButton).map((b) => b.text());
        expect(buttonLabels).toContain("Export BrickLink wanted list");
        expect(buttonLabels).toContain("Export CSV");
    });

    it("renders the sort and search FilterChips as real components", async () => {
        mockServer.onGet(URL_MISSING, makePayload([makeEntry()]));

        const wrapper = mount(PartsMissingPage);
        await flushPromises();

        const chipTexts = wrapper.findAllComponents(FilterChip).map((c) => c.text());
        expect(chipTexts).toContain("Most missing");
        expect(chipTexts).toContain("Part name");
        expect(chipTexts).toContain("Color");
    });

    it("filters the PartListItem list when a search term is entered", async () => {
        mockServer.onGet(
            URL_MISSING,
            makePayload([
                makeEntry({part_name: "Brick 2x4", part_num: "3001"}),
                makeEntry({part_id: 11, part_name: "Plate 1x2", part_num: "3023"}),
            ]),
        );

        const wrapper = mount(PartsMissingPage);
        await flushPromises();

        expect(wrapper.findAllComponents(PartListItem)).toHaveLength(2);

        await wrapper.findComponent(TextInput).setValue("Plate");
        await flushPromises();

        const items = wrapper.findAllComponents(PartListItem);
        expect(items).toHaveLength(1);
        expect(items[0]?.props("name")).toBe("Plate 1x2");
    });

    it("reorders PartListItems when a sort FilterChip is clicked", async () => {
        mockServer.onGet(
            URL_MISSING,
            makePayload([
                makeEntry({part_id: 10, part_name: "Brick 2x4", shortfall: 9}),
                makeEntry({part_id: 11, part_name: "Axle 2", shortfall: 2}),
            ]),
        );

        const wrapper = mount(PartsMissingPage);
        await flushPromises();

        // Default sort: shortfall descending — Brick 2x4 (9) first
        const namesByShortfall = wrapper.findAllComponents(PartListItem).map((i) => i.props("name"));
        expect(namesByShortfall).toEqual(["Brick 2x4", "Axle 2"]);

        const nameChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === "Part name");
        await nameChip?.find("button").trigger("click");
        await flushPromises();

        // After switching to name sort: Axle 2 < Brick 2x4 alphabetically
        const namesByName = wrapper.findAllComponents(PartListItem).map((i) => i.props("name"));
        expect(namesByName).toEqual(["Axle 2", "Brick 2x4"]);
    });
});

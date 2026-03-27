import SetsOverviewPage from "@app/domains/sets/pages/SetsOverviewPage.vue";
import CollapsibleSection from "@shared/components/CollapsibleSection.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import FilterChip from "@shared/components/FilterChip.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import ListItemButton from "@shared/components/ListItemButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGoToRoute, mockRetrieveAll, holder} = vi.hoisted(() => ({
    mockGoToRoute: vi.fn(),
    mockRetrieveAll: vi.fn().mockResolvedValue(undefined),
    holder: {getAll: null as {value: Record<string, unknown>[]} | null},
}));

vi.mock("axios", () => ({isAxiosError: () => false, AxiosError: Error}));
vi.mock("string-ts", () => ({deepCamelKeys: <T>(o: T): T => o, deepSnakeKeys: <T>(o: T): T => o}));
vi.mock("@shared/helpers/csv", () => ({downloadCsv: vi.fn(), toCsv: vi.fn(() => "")}));
vi.mock("@app/services", () => ({
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    familyLoadingService: {isLoading: false},
    familyRouterService: {goToRoute: mockGoToRoute},
}));
vi.mock("@app/stores", async () => {
    const {ref} = await import("vue");
    const getAll = ref<Record<string, unknown>[]>([]);
    holder.getAll = getAll;
    return {familySetStoreModule: {retrieveAll: mockRetrieveAll, getAll}};
});

const makeSet = (id: number, theme: string, status = "sealed") => ({
    id,
    setNum: `${id}-1`,
    quantity: 1,
    status,
    purchaseDate: null,
    notes: null,
    set: {name: `Set ${id}`, setNum: `${id}-1`, year: 2024, theme, numParts: 100, imageUrl: null},
});

describe("SetsOverviewPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        if (holder.getAll) holder.getAll.value = [];
    });

    const mountPage = async (sets: Record<string, unknown>[] = []) => {
        if (holder.getAll) holder.getAll.value = sets;
        const wrapper = mount(SetsOverviewPage);
        await flushPromises();
        return wrapper;
    };

    it("renders real EmptyState when no sets", async () => {
        const wrapper = await mountPage();

        const emptyState = wrapper.findComponent(EmptyState);
        expect(emptyState.exists()).toBe(true);
        expect(emptyState.text()).toContain("sets.noSets");
    });

    it("renders PageHeader with real PrimaryButton actions", async () => {
        const wrapper = await mountPage([makeSet(1, "City")]);

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.find("h1").text()).toBe("sets.title");

        const buttons = pageHeader.findAllComponents(PrimaryButton);
        expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("renders sets grouped in real CollapsibleSection components", async () => {
        const wrapper = await mountPage([makeSet(1, "City"), makeSet(2, "Technic")]);

        const sections = wrapper.findAllComponents(CollapsibleSection);
        expect(sections).toHaveLength(2);

        const titles = sections.map((s) => s.props("title"));
        expect(titles).toContain("City");
        expect(titles).toContain("Technic");
    });

    it("renders real FilterChip components for status filtering", async () => {
        const wrapper = await mountPage([makeSet(1, "City")]);

        const chips = wrapper.findAllComponents(FilterChip);
        expect(chips.length).toBeGreaterThanOrEqual(5);
    });

    it("renders search TextInput for filtering sets", async () => {
        const wrapper = await mountPage([makeSet(1, "City")]);

        const textInput = wrapper.findComponent(TextInput);
        expect(textInput.exists()).toBe(true);
        expect(textInput.props("type")).toBe("search");
    });

    it("renders ListItemButton for each set in expanded sections", async () => {
        const wrapper = await mountPage([makeSet(1, "City"), makeSet(2, "City")]);

        const section = wrapper.findComponent(CollapsibleSection);
        await section.find("button").trigger("click");

        const listItems = wrapper.findAllComponents(ListItemButton);
        expect(listItems).toHaveLength(2);
    });

    it("navigates to detail when clicking a set", async () => {
        const wrapper = await mountPage([makeSet(1, "City")]);

        const section = wrapper.findComponent(CollapsibleSection);
        await section.find("button").trigger("click");

        const listItem = wrapper.findComponent(ListItemButton);
        await listItem.find("button").trigger("click");

        expect(mockGoToRoute).toHaveBeenCalledWith("sets-detail", 1);
    });
});

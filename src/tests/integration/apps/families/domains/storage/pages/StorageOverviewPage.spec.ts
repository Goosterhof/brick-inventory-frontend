import StorageOverviewPage from "@app/domains/storage/pages/StorageOverviewPage.vue";
import EmptyState from "@shared/components/EmptyState.vue";
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
vi.mock("@app/services", () => ({
    familyTranslationService: {
        t: (key: string, _params?: Record<string, string>) => ({value: key}),
        locale: {value: "en"},
    },
    familyLoadingService: {isLoading: false},
    familyRouterService: {goToRoute: mockGoToRoute},
}));
vi.mock("@app/stores", async () => {
    const {ref} = await import("vue");
    const getAll = ref<Record<string, unknown>[]>([]);
    holder.getAll = getAll;
    return {storageOptionStoreModule: {retrieveAll: mockRetrieveAll, getAll}};
});

const makeStorage = (id: number, name: string, parentId: number | null = null) => ({
    id,
    name,
    description: `Description for ${name}`,
    parentId,
    row: null,
    column: null,
    childIds: [] as number[],
});

describe("StorageOverviewPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        if (holder.getAll) holder.getAll.value = [];
    });

    const mountPage = async (storageOptions: Record<string, unknown>[] = []) => {
        if (holder.getAll) holder.getAll.value = storageOptions;
        const wrapper = mount(StorageOverviewPage);
        await flushPromises();
        return wrapper;
    };

    it("renders real EmptyState when no storage options", async () => {
        const wrapper = await mountPage();

        const emptyState = wrapper.findComponent(EmptyState);
        expect(emptyState.exists()).toBe(true);
        expect(emptyState.text()).toContain("storage.noStorage");
    });

    it("renders PageHeader with real PrimaryButton", async () => {
        const wrapper = await mountPage([makeStorage(1, "Shelf A")]);

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.find("h1").text()).toBe("storage.title");

        const addBtn = pageHeader.findComponent(PrimaryButton);
        expect(addBtn.text()).toContain("storage.addStorage");
    });

    it("renders real ListItemButton for each storage option", async () => {
        const wrapper = await mountPage([makeStorage(1, "Shelf A"), makeStorage(2, "Shelf B")]);

        const listItems = wrapper.findAllComponents(ListItemButton);
        expect(listItems).toHaveLength(2);

        for (const item of listItems) {
            expect(item.find("button").exists()).toBe(true);
        }
    });

    it("renders search TextInput", async () => {
        const wrapper = await mountPage([makeStorage(1, "Shelf A")]);

        const textInput = wrapper.findComponent(TextInput);
        expect(textInput.exists()).toBe(true);
        expect(textInput.props("type")).toBe("search");
    });

    it("navigates to detail on ListItemButton click", async () => {
        const wrapper = await mountPage([makeStorage(1, "Shelf A")]);

        const listItem = wrapper.findComponent(ListItemButton);
        await listItem.find("button").trigger("click");

        expect(mockGoToRoute).toHaveBeenCalledWith("storage-detail", 1);
    });

    it("filters storage options via search input", async () => {
        const wrapper = await mountPage([makeStorage(1, "Shelf A"), makeStorage(2, "Box B")]);

        const searchInput = wrapper.find("input");
        await searchInput.setValue("Shelf");

        const listItems = wrapper.findAllComponents(ListItemButton);
        expect(listItems).toHaveLength(1);
    });
});

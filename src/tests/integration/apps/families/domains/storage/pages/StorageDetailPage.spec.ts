import StorageDetailPage from "@app/domains/storage/pages/StorageDetailPage.vue";
import BackButton from "@shared/components/BackButton.vue";
import DetailRow from "@shared/components/DetailRow.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import LoadingState from "@shared/components/LoadingState.vue";
import PartListItem from "@shared/components/PartListItem.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockGoToRoute, mockGetOrFailById} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockGetOrFailById: vi.fn(),
}));

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
    familyRouterService: {goToRoute: mockGoToRoute, currentRouteId: {value: 1}},
}));
vi.mock("@app/stores", () => ({storageOptionStoreModule: {getOrFailById: mockGetOrFailById}}));

const makeAdapted = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    name: "Top Shelf",
    description: "The top shelf of the cabinet",
    parentId: null,
    row: 1,
    column: 2,
    childIds: [10, 11],
    ...overrides,
});

const makePart = (id: number) => ({
    id,
    quantity: 3,
    part: {name: `Part ${id}`, partNum: `P${id}`, imageUrl: null},
    color: {name: "Red", rgb: "FF0000"},
});

describe("StorageDetailPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders real LoadingState while loading", () => {
        mockGetOrFailById.mockReturnValue(new Promise(() => {}));
        mockGetRequest.mockReturnValue(new Promise(() => {}));
        const wrapper = mount(StorageDetailPage);

        const loadingState = wrapper.findComponent(LoadingState);
        expect(loadingState.exists()).toBe(true);
    });

    it("renders storage details with real DetailRow components", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        mockGetRequest.mockResolvedValue({data: []});
        const wrapper = mount(StorageDetailPage);
        await flushPromises();

        expect(wrapper.find("h1").text()).toBe("Top Shelf");

        const detailRows = wrapper.findAllComponents(DetailRow);
        const labels = detailRows.map((r) => r.props("label"));
        expect(labels).toContain("storage.description");
        expect(labels).toContain("storage.row");
        expect(labels).toContain("storage.column");
        expect(labels).toContain("storage.subLocations");
    });

    it("renders real PartListItem components for storage parts", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        mockGetRequest.mockResolvedValue({data: [makePart(1), makePart(2)]});
        const wrapper = mount(StorageDetailPage);
        await flushPromises();

        const partItems = wrapper.findAllComponents(PartListItem);
        expect(partItems).toHaveLength(2);

        const firstPart = partItems.find((p) => p.props("name") === "Part 1");
        expect(firstPart).toBeDefined();
        expect(firstPart?.props("quantity")).toBe(3);
        expect(firstPart?.props("colorName")).toBe("Red");
    });

    it("renders real EmptyState when no parts", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        mockGetRequest.mockResolvedValue({data: []});
        const wrapper = mount(StorageDetailPage);
        await flushPromises();

        const emptyState = wrapper.findComponent(EmptyState);
        expect(emptyState.exists()).toBe(true);
        expect(emptyState.text()).toContain("storage.noParts");
    });

    it("renders real BackButton and edit PrimaryButton", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        mockGetRequest.mockResolvedValue({data: []});
        const wrapper = mount(StorageDetailPage);
        await flushPromises();

        const backButton = wrapper.findComponent(BackButton);
        expect(backButton.find("button").exists()).toBe(true);

        const editBtn = wrapper.findComponent(PrimaryButton);
        expect(editBtn.text()).toContain("storage.edit");
    });

    it("navigates back via BackButton click", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        mockGetRequest.mockResolvedValue({data: []});
        const wrapper = mount(StorageDetailPage);
        await flushPromises();

        const backButton = wrapper.findComponent(BackButton);
        await backButton.find("button").trigger("click");

        expect(mockGoToRoute).toHaveBeenCalledWith("storage");
    });
});

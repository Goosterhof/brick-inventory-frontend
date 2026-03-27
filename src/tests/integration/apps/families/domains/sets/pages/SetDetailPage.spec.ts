import SetDetailPage from "@app/domains/sets/pages/SetDetailPage.vue";
import BackButton from "@shared/components/BackButton.vue";
import LoadingState from "@shared/components/LoadingState.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGoToRoute, mockGetOrFailById, mockGetRequest} = vi.hoisted(() => ({
    mockGoToRoute: vi.fn(),
    mockGetOrFailById: vi.fn(),
    mockGetRequest: vi.fn(),
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
vi.mock("@app/stores", () => ({familySetStoreModule: {getOrFailById: mockGetOrFailById}}));
vi.mock("@app/domains/sets/modals/AssignPartModal.vue", () => ({
    default: {template: "<div />", props: ["open", "part", "existingLocations"]},
}));

const makeAdapted = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    setNum: "75192-1",
    quantity: 1,
    status: "sealed",
    purchaseDate: "2024-01-15",
    notes: "Mint condition",
    set: {name: "Millennium Falcon", setNum: "75192-1", year: 2017, theme: "Star Wars", numParts: 7541, imageUrl: null},
    mutable: {quantity: 1, status: "sealed", purchaseDate: "2024-01-15", notes: "Mint condition"},
    patch: vi.fn(),
    delete: vi.fn(),
    ...overrides,
});

describe("SetDetailPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders real LoadingState while set is loading", () => {
        mockGetOrFailById.mockReturnValue(new Promise(() => {}));
        const wrapper = mount(SetDetailPage);

        const loadingState = wrapper.findComponent(LoadingState);
        expect(loadingState.exists()).toBe(true);
        expect(loadingState.find("[role='status']").exists()).toBe(true);
    });

    it("renders set details with real BackButton and PrimaryButton after loading", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(SetDetailPage);
        await flushPromises();

        const backButton = wrapper.findComponent(BackButton);
        expect(backButton.exists()).toBe(true);
        expect(backButton.find("button").exists()).toBe(true);

        expect(wrapper.find("h1").text()).toBe("Millennium Falcon");
    });

    it("renders edit and load parts PrimaryButtons", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(SetDetailPage);
        await flushPromises();

        const buttons = wrapper.findAllComponents(PrimaryButton);
        const editBtn = buttons.find((b) => b.text().includes("sets.edit"));
        const loadPartsBtn = buttons.find((b) => b.text().includes("sets.loadParts"));

        expect(editBtn).toBeDefined();
        expect(loadPartsBtn).toBeDefined();
    });

    it("navigates back via real BackButton click", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(SetDetailPage);
        await flushPromises();

        const backButton = wrapper.findComponent(BackButton);
        await backButton.find("button").trigger("click");

        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });

    it("hides load parts button for wishlist sets", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted({status: "wishlist"}));
        const wrapper = mount(SetDetailPage);
        await flushPromises();

        const buttons = wrapper.findAllComponents(PrimaryButton);
        const loadPartsBtn = buttons.find((b) => b.text().includes("sets.loadParts"));
        expect(loadPartsBtn).toBeUndefined();
    });

    it("shows add to collection button for wishlist sets", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted({status: "wishlist"}));
        const wrapper = mount(SetDetailPage);
        await flushPromises();

        const buttons = wrapper.findAllComponents(PrimaryButton);
        const addBtn = buttons.find((b) => b.text().includes("sets.addToCollection"));
        expect(addBtn).toBeDefined();
    });
});

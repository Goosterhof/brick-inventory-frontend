import EditStoragePage from "@app/domains/storage/pages/EditStoragePage.vue";
import ConfirmDialog from "@shared/components/ConfirmDialog.vue";
import DangerButton from "@shared/components/DangerButton.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import LoadingState from "@shared/components/LoadingState.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetOrFailById, mockGoToRoute, mockPatch, mockDelete} = vi.hoisted(() => ({
    mockGetOrFailById: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockPatch: vi.fn(),
    mockDelete: vi.fn(),
}));

vi.mock("axios", () => ({isAxiosError: () => false, AxiosError: Error}));
vi.mock("string-ts", () => ({deepCamelKeys: <T>(o: T): T => o, deepSnakeKeys: <T>(o: T): T => o}));
vi.mock("@app/services", () => ({
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    familyHttpService: {
        getRequest: vi.fn(),
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

const makeAdapted = () => ({
    id: 1,
    name: "Shelf A",
    mutable: {name: "Shelf A", description: "Top shelf", parentId: null, row: 1, column: 2},
    patch: mockPatch,
    delete: mockDelete,
});

describe("EditStoragePage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders real LoadingState while loading", () => {
        mockGetOrFailById.mockReturnValue(new Promise(() => {}));
        const wrapper = mount(EditStoragePage);

        const loadingState = wrapper.findComponent(LoadingState);
        expect(loadingState.exists()).toBe(true);
    });

    it("renders form with real input components after loading", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditStoragePage);
        await flushPromises();

        expect(wrapper.findComponent(TextInput).exists()).toBe(true);

        const numberInputs = wrapper.findAllComponents(NumberInput);
        expect(numberInputs).toHaveLength(2);
    });

    it("renders real PrimaryButton and DangerButton", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditStoragePage);
        await flushPromises();

        const primaryBtn = wrapper.findComponent(PrimaryButton);
        expect(primaryBtn.find("button").attributes("type")).toBe("submit");

        const dangerBtn = wrapper.findComponent(DangerButton);
        expect(dangerBtn.text()).toContain("storage.delete");
    });

    it("opens real ConfirmDialog when clicking delete", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditStoragePage);
        await flushPromises();

        const dangerBtn = wrapper.findComponent(DangerButton);
        await dangerBtn.find("button").trigger("click");

        const confirmDialog = wrapper.findComponent(ConfirmDialog);
        expect(confirmDialog.props("open")).toBe(true);
        expect(confirmDialog.props("title")).toBe("storage.delete");
    });

    it("submits edit through real component tree", async () => {
        mockPatch.mockResolvedValue(undefined);
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditStoragePage);
        await flushPromises();

        await wrapper.find("form").trigger("submit");
        await flushPromises();

        expect(mockPatch).toHaveBeenCalled();
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-detail", 1);
    });

    it("renders storage name in subtitle", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditStoragePage);
        await flushPromises();

        expect(wrapper.text()).toContain("Shelf A");
    });
});

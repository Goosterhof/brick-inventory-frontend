import EditSetPage from "@app/domains/sets/pages/EditSetPage.vue";
import ConfirmDialog from "@shared/components/ConfirmDialog.vue";
import DangerButton from "@shared/components/DangerButton.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
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
vi.mock("@app/stores", () => ({familySetStoreModule: {getOrFailById: mockGetOrFailById}}));

const makeAdapted = () => ({
    id: 1,
    setNum: "75192-1",
    status: "sealed",
    set: {name: "Millennium Falcon", setNum: "75192-1"},
    mutable: {quantity: 1, status: "sealed", purchaseDate: null, notes: ""},
    patch: mockPatch,
    delete: mockDelete,
});

describe("EditSetPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders real LoadingState while loading", () => {
        mockGetOrFailById.mockReturnValue(new Promise(() => {}));
        const wrapper = mount(EditSetPage);

        const loadingState = wrapper.findComponent(LoadingState);
        expect(loadingState.exists()).toBe(true);
        expect(loadingState.find("[role='status']").exists()).toBe(true);
    });

    it("renders form with real input components after loading", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditSetPage);
        await flushPromises();

        expect(wrapper.findComponent(NumberInput).exists()).toBe(true);
        expect(wrapper.findComponent(SelectInput).exists()).toBe(true);
    });

    it("renders real PrimaryButton and DangerButton for actions", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditSetPage);
        await flushPromises();

        const primaryBtn = wrapper.findComponent(PrimaryButton);
        expect(primaryBtn.find("button").attributes("type")).toBe("submit");

        const dangerBtn = wrapper.findComponent(DangerButton);
        expect(dangerBtn.exists()).toBe(true);
        expect(dangerBtn.text()).toContain("sets.delete");
    });

    it("opens real ConfirmDialog when clicking delete", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditSetPage);
        await flushPromises();

        const dangerBtn = wrapper.findComponent(DangerButton);
        await dangerBtn.find("button").trigger("click");

        const confirmDialog = wrapper.findComponent(ConfirmDialog);
        expect(confirmDialog.props("open")).toBe(true);
        expect(confirmDialog.props("title")).toBe("sets.delete");
    });

    it("submits edit through real component tree", async () => {
        mockPatch.mockResolvedValue(undefined);
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditSetPage);
        await flushPromises();

        await wrapper.find("form").trigger("submit");
        await flushPromises();

        expect(mockPatch).toHaveBeenCalled();
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-detail", 1);
    });

    it("renders set name in subtitle after loading", async () => {
        mockGetOrFailById.mockResolvedValue(makeAdapted());
        const wrapper = mount(EditSetPage);
        await flushPromises();

        expect(wrapper.text()).toContain("Millennium Falcon");
        expect(wrapper.text()).toContain("75192-1");
    });
});

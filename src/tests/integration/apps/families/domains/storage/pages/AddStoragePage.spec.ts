import AddStoragePage from "@app/domains/storage/pages/AddStoragePage.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import TextareaInput from "@shared/components/forms/inputs/TextareaInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockCreate, mockGoToRoute} = vi.hoisted(() => ({mockCreate: vi.fn(), mockGoToRoute: vi.fn()}));

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
    familyRouterService: {goToRoute: mockGoToRoute},
}));
vi.mock("@app/stores", () => ({
    storageOptionStoreModule: {
        generateNew: () => ({
            mutable: {value: {name: "", description: "", parentId: null, row: null, column: null}},
            create: mockCreate,
        }),
    },
}));

describe("AddStoragePage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mountPage = () => mount(AddStoragePage);

    it("renders all real form input components", () => {
        const wrapper = mountPage();

        const textInputs = wrapper.findAllComponents(TextInput);
        expect(textInputs).toHaveLength(1);
        expect(textInputs.find((i) => i.props("label") === "storage.name")).toBeDefined();

        expect(wrapper.findComponent(TextareaInput).exists()).toBe(true);

        const numberInputs = wrapper.findAllComponents(NumberInput);
        expect(numberInputs).toHaveLength(2);
    });

    it("renders real NumberInputs for row and column", () => {
        const wrapper = mountPage();

        const numberInputs = wrapper.findAllComponents(NumberInput);
        const labels = numberInputs.map((n) => n.props("label"));
        expect(labels).toContain("storage.row");
        expect(labels).toContain("storage.column");
    });

    it("renders real PrimaryButton for submission", () => {
        const wrapper = mountPage();

        const button = wrapper.findComponent(PrimaryButton);
        expect(button.find("button").attributes("type")).toBe("submit");
        expect(button.text()).toBe("storage.add");
    });

    it("submits form through real component tree", async () => {
        mockCreate.mockResolvedValue({id: 7});
        const wrapper = mountPage();

        await wrapper.find("form").trigger("submit");
        await flushPromises();

        expect(mockCreate).toHaveBeenCalled();
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-detail", 7);
    });

    it("renders page title", () => {
        const wrapper = mountPage();

        expect(wrapper.find("h1").text()).toBe("storage.addStorage");
    });
});

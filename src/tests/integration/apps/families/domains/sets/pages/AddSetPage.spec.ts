import AddSetPage from "@app/domains/sets/pages/AddSetPage.vue";
import DateInput from "@shared/components/forms/inputs/DateInput.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
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
    familySetStoreModule: {
        generateNew: () => ({
            mutable: {value: {setNum: "", quantity: 1, status: "sealed", purchaseDate: null, notes: ""}},
            create: mockCreate,
        }),
        getAll: {value: []},
    },
}));

describe("AddSetPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mountPage = () => mount(AddSetPage);

    it("renders all form input components as real children", () => {
        const wrapper = mountPage();

        expect(wrapper.findComponent(TextInput).exists()).toBe(true);
        expect(wrapper.findComponent(NumberInput).exists()).toBe(true);
        expect(wrapper.findComponent(SelectInput).exists()).toBe(true);
        expect(wrapper.findComponent(DateInput).exists()).toBe(true);
        expect(wrapper.findComponent(TextareaInput).exists()).toBe(true);
    });

    it("renders real TextInput with label for set number", () => {
        const wrapper = mountPage();

        const textInput = wrapper.findComponent(TextInput);
        expect(textInput.props("label")).toBe("sets.setNumber");
        expect(textInput.find("input").exists()).toBe(true);
    });

    it("renders real SelectInput with status options", () => {
        const wrapper = mountPage();

        const selectInput = wrapper.findComponent(SelectInput);
        expect(selectInput.props("label")).toBe("sets.status");
        const options = selectInput.findAll("option");
        expect(options).toHaveLength(5);
    });

    it("renders a real PrimaryButton for form submission", () => {
        const wrapper = mountPage();

        const button = wrapper.findComponent(PrimaryButton);
        expect(button.find("button").attributes("type")).toBe("submit");
        expect(button.text()).toBe("sets.add");
    });

    it("submits form through real component tree", async () => {
        mockCreate.mockResolvedValue({id: 42});
        const wrapper = mountPage();

        await wrapper.find("form").trigger("submit");
        await flushPromises();

        expect(mockCreate).toHaveBeenCalled();
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-detail", 42);
    });

    it("does not show duplicate warning when setNum is empty", () => {
        const wrapper = mountPage();

        expect(wrapper.find("[data-testid='duplicate-warning']").exists()).toBe(false);
    });
});

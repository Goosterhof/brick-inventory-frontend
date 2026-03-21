import AddSetPage from "@app/domains/sets/pages/AddSetPage.vue";
import DateInput from "@shared/components/forms/inputs/DateInput.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
import TextareaInput from "@shared/components/forms/inputs/TextareaInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {AxiosError} from "axios";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {ref} from "vue";

const {MockAxiosError} = vi.hoisted(() => {
    class MockAxiosError extends Error {
        response?: {status: number; data: unknown; statusText: string; headers: unknown; config: unknown};
    }
    return {MockAxiosError};
});

vi.mock("axios", () => ({
    isAxiosError: (e: unknown): boolean => e instanceof MockAxiosError,
    AxiosError: MockAxiosError,
    default: {create: vi.fn()},
}));

vi.mock("string-ts", () => ({deepCamelKeys: <T>(obj: T): T => obj, deepSnakeKeys: <T>(obj: T): T => obj}));

const {mockCreate, mockGoToRoute} = vi.hoisted(() => ({mockCreate: vi.fn(), mockGoToRoute: vi.fn()}));

vi.mock("@app/services", () => ({
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
    familyAuthService: {
        isLoggedIn: {value: true},
        user: {value: null},
        userId: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkIfLoggedIn: vi.fn(),
        sendEmailResetPassword: vi.fn(),
        resetPassword: vi.fn(),
    },
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: mockGoToRoute},
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    familySetStoreModule: {
        getAll: {value: []},
        retrieveAll: vi.fn(),
        getById: vi.fn(),
        getOrFailById: vi.fn(),
        generateNew: () => ({
            setNum: "",
            quantity: 1,
            status: "sealed",
            purchaseDate: null,
            notes: null,
            mutable: ref({setNum: "", quantity: 1, status: "sealed", purchaseDate: null, notes: null}),
            reset: vi.fn(),
            create: mockCreate,
        }),
    },
    familyLoadingService: {isLoading: {value: false}},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

describe("AddSetPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render page title", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddSetPage);

        // Assert
        expect(wrapper.find("h1").text()).toBe("sets.addSet");
    });

    it("should render form fields", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddSetPage);

        // Assert
        const textInputs = wrapper.findAllComponents(TextInput);
        expect(textInputs).toHaveLength(1);
        expect(textInputs[0]?.props("label")).toBe("sets.setNumber");

        const numberInputs = wrapper.findAllComponents(NumberInput);
        expect(numberInputs).toHaveLength(1);
        expect(numberInputs[0]?.props("label")).toBe("sets.quantity");

        expect(wrapper.findComponent(SelectInput).exists()).toBe(true);
        expect(wrapper.findComponent(DateInput).exists()).toBe(true);
        expect(wrapper.findComponent(TextareaInput).exists()).toBe(true);
    });

    it("should render submit button", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddSetPage);

        // Assert
        const button = wrapper.findComponent(PrimaryButton);
        expect(button.exists()).toBe(true);
        expect(button.props("type")).toBe("submit");
        expect(button.text()).toBe("sets.add");
    });

    it("should call create on form submit", async () => {
        // Arrange
        mockCreate.mockResolvedValue({id: 1, setNum: "75192-1", quantity: 1, status: "sealed"});
        const wrapper = shallowMount(AddSetPage);

        const textInput = wrapper.findComponent(TextInput);
        textInput.vm.$emit("update:modelValue", "75192-1");
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockCreate).toHaveBeenCalled();
    });

    it("should navigate to detail page on successful create", async () => {
        // Arrange
        mockCreate.mockResolvedValue({id: 42, setNum: "75192-1", quantity: 1, status: "sealed"});
        const wrapper = shallowMount(AddSetPage);

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-detail", 42);
    });

    it("should not navigate on 422 validation error", async () => {
        // Arrange
        const axiosError = new AxiosError("Validation failed");
        axiosError.response = {status: 422, data: {}, statusText: "", headers: {}, config: {} as never};
        mockCreate.mockRejectedValue(axiosError);
        const wrapper = shallowMount(AddSetPage);

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).not.toHaveBeenCalled();
    });

    it("should rethrow non-422 errors", async () => {
        // Arrange
        const axiosError = new AxiosError("Server error");
        axiosError.response = {status: 500, data: {}, statusText: "", headers: {}, config: {} as never};
        mockCreate.mockRejectedValue(axiosError);
        const wrapper = shallowMount(AddSetPage);

        // Act
        const errorHandler = vi.fn();
        wrapper.vm.$.appContext.config.errorHandler = errorHandler;
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(errorHandler).toHaveBeenCalled();
        expect(errorHandler.mock.calls[0]?.[0]).toBe(axiosError);
        expect(mockGoToRoute).not.toHaveBeenCalled();
    });

    it("should have setnummer required by default", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddSetPage);

        // Assert
        const textInput = wrapper.findComponent(TextInput);
        expect(textInput.props("optional")).toBe(false);
    });
});

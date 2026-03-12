import AddSetView from "@app/domains/sets/pages/AddSetView.vue";
import DateInput from "@shared/components/forms/inputs/DateInput.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
import TextareaInput from "@shared/components/forms/inputs/TextareaInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {AxiosError} from "axios";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockPostRequest, mockGoToRoute} = vi.hoisted(() => ({mockPostRequest: vi.fn(), mockGoToRoute: vi.fn()}));

vi.mock("@app/services", () => ({
    familyHttpService: {
        getRequest: vi.fn(),
        postRequest: mockPostRequest,
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
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

describe("AddSetView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render page title", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddSetView);

        // Assert
        expect(wrapper.find("h1").text()).toBe("sets.addSet");
    });

    it("should render form fields", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddSetView);

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
        const wrapper = shallowMount(AddSetView);

        // Assert
        const button = wrapper.findComponent(PrimaryButton);
        expect(button.exists()).toBe(true);
        expect(button.props("type")).toBe("submit");
        expect(button.text()).toBe("sets.add");
    });

    it("should submit correct payload on form submit", async () => {
        // Arrange
        mockPostRequest.mockResolvedValue({
            data: {id: 1, set_id: 10, quantity: 1, status: "sealed", purchase_date: null, notes: null, set: {}},
        });
        const wrapper = shallowMount(AddSetView);

        const textInput = wrapper.findComponent(TextInput);
        textInput.vm.$emit("update:modelValue", "75192-1");
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockPostRequest).toHaveBeenCalledWith("/family-sets", {
            set_num: "75192-1",
            quantity: 1,
            status: "sealed",
            purchase_date: null,
            notes: null,
        });
    });

    it("should navigate to detail page on successful create", async () => {
        // Arrange
        mockPostRequest.mockResolvedValue({
            data: {id: 42, set_id: 10, quantity: 1, status: "sealed", purchase_date: null, notes: null, set: {}},
        });
        const wrapper = shallowMount(AddSetView);

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
        mockPostRequest.mockRejectedValue(axiosError);
        const wrapper = shallowMount(AddSetView);

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
        mockPostRequest.mockRejectedValue(axiosError);
        const wrapper = shallowMount(AddSetView);

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
        const wrapper = shallowMount(AddSetView);

        // Assert
        const textInput = wrapper.findComponent(TextInput);
        expect(textInput.props("optional")).toBe(false);
    });
});

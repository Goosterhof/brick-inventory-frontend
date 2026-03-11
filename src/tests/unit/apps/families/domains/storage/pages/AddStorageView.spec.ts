import AddStorageView from "@app/domains/storage/pages/AddStorageView.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
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
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

describe("AddStorageView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render page title", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddStorageView);

        // Assert
        expect(wrapper.find("h1").text()).toBe("Opslag toevoegen");
    });

    it("should render form fields", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddStorageView);

        // Assert
        const textInputs = wrapper.findAllComponents(TextInput);
        expect(textInputs).toHaveLength(1);
        expect(textInputs[0]?.props("label")).toBe("Naam");

        const numberInputs = wrapper.findAllComponents(NumberInput);
        expect(numberInputs).toHaveLength(2);
        expect(numberInputs[0]?.props("label")).toBe("Rij");
        expect(numberInputs[1]?.props("label")).toBe("Kolom");

        expect(wrapper.findComponent(TextareaInput).exists()).toBe(true);
    });

    it("should render submit button", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddStorageView);

        // Assert
        const button = wrapper.findComponent(PrimaryButton);
        expect(button.exists()).toBe(true);
        expect(button.props("type")).toBe("submit");
        expect(button.text()).toBe("Toevoegen");
    });

    it("should submit correct payload on form submit", async () => {
        // Arrange
        mockPostRequest.mockResolvedValue({
            data: {id: 1, name: "Lade A", description: null, parent_id: null, row: null, column: null, child_ids: []},
        });
        const wrapper = shallowMount(AddStorageView);

        const textInput = wrapper.findComponent(TextInput);
        textInput.vm.$emit("update:modelValue", "Lade A");
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockPostRequest).toHaveBeenCalledWith("/storage-options", {
            name: "Lade A",
            description: null,
            parent_id: null,
            row: null,
            column: null,
        });
    });

    it("should navigate to detail page on successful create", async () => {
        // Arrange
        mockPostRequest.mockResolvedValue({
            data: {id: 7, name: "Lade A", description: null, parent_id: null, row: null, column: null, child_ids: []},
        });
        const wrapper = shallowMount(AddStorageView);

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-detail", 7);
    });

    it("should not navigate on 422 validation error", async () => {
        // Arrange
        const axiosError = new AxiosError("Validation failed");
        axiosError.response = {status: 422, data: {}, statusText: "", headers: {}, config: {} as never};
        mockPostRequest.mockRejectedValue(axiosError);
        const wrapper = shallowMount(AddStorageView);

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
        const wrapper = shallowMount(AddStorageView);

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

    it("should have name required by default", () => {
        // Arrange & Act
        const wrapper = shallowMount(AddStorageView);

        // Assert
        const textInput = wrapper.findComponent(TextInput);
        expect(textInput.props("optional")).toBe(false);
    });
});

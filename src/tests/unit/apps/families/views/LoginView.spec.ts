import LoginView from "@app/views/LoginView.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {AxiosError} from "axios";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockLogin, mockGoToDashboard} = vi.hoisted(() => ({mockLogin: vi.fn(), mockGoToDashboard: vi.fn()}));

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
        isLoggedIn: {value: false},
        user: {value: null},
        userId: vi.fn(),
        register: vi.fn(),
        login: mockLogin,
        logout: vi.fn(),
        checkIfLoggedIn: vi.fn(),
        sendEmailResetPassword: vi.fn(),
        resetPassword: vi.fn(),
    },
    familyRouterService: {goToDashboard: mockGoToDashboard, goToRoute: vi.fn()},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

describe("LoginView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render all form fields", () => {
        // Arrange & Act
        const wrapper = shallowMount(LoginView);

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs).toHaveLength(2);
        expect(inputs[0]?.props("label")).toBe("Email");
        expect(inputs[1]?.props("label")).toBe("Password");
    });

    it("should render email field with email type", () => {
        // Arrange & Act
        const wrapper = shallowMount(LoginView);

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs[0]?.props("type")).toBe("email");
    });

    it("should render password field with password type", () => {
        // Arrange & Act
        const wrapper = shallowMount(LoginView);

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs[1]?.props("type")).toBe("password");
    });

    it("should mark all fields as required", () => {
        // Arrange & Act
        const wrapper = shallowMount(LoginView);

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        for (const input of inputs) {
            expect(input.props("required")).toBe(true);
        }
    });

    it("should render submit button", () => {
        // Arrange & Act
        const wrapper = shallowMount(LoginView);

        // Assert
        const button = wrapper.findComponent(PrimaryButton);
        expect(button.exists()).toBe(true);
        expect(button.props("type")).toBe("submit");
        expect(button.text()).toBe("Log In");
    });

    it("should call authService.login on form submit", async () => {
        // Arrange
        const wrapper = shallowMount(LoginView);

        const inputs = wrapper.findAllComponents(TextInput);
        inputs[0]?.vm.$emit("update:modelValue", "john@example.com");
        inputs[1]?.vm.$emit("update:modelValue", "password123");
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockLogin).toHaveBeenCalledWith({email: "john@example.com", password: "password123"});
    });

    it("should navigate to dashboard on successful login", async () => {
        // Arrange
        mockLogin.mockResolvedValue(undefined);
        const wrapper = shallowMount(LoginView);

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToDashboard).toHaveBeenCalled();
    });

    it("should render page title", () => {
        // Arrange & Act
        const wrapper = shallowMount(LoginView);

        // Assert
        expect(wrapper.find("h1").text()).toBe("Log In");
    });

    it("should not navigate on 422 validation error", async () => {
        // Arrange
        const axiosError = new AxiosError("Validation failed");
        axiosError.response = {status: 422, data: {}, statusText: "", headers: {}, config: {} as never};
        mockLogin.mockRejectedValue(axiosError);
        const wrapper = shallowMount(LoginView);

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToDashboard).not.toHaveBeenCalled();
    });

    it("should rethrow non-422 errors", async () => {
        // Arrange
        const axiosError = new AxiosError("Server error");
        axiosError.response = {status: 500, data: {}, statusText: "", headers: {}, config: {} as never};
        mockLogin.mockRejectedValue(axiosError);
        const wrapper = shallowMount(LoginView);

        // Act
        const errorHandler = vi.fn();
        wrapper.vm.$.appContext.config.errorHandler = errorHandler;
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert - error should be rethrown and caught by Vue's error handler
        expect(errorHandler).toHaveBeenCalled();
        expect(errorHandler.mock.calls[0]?.[0]).toBe(axiosError);
        expect(mockGoToDashboard).not.toHaveBeenCalled();
    });
});

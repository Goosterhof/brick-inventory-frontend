import type {AuthService} from "@shared/services/auth/types";
import type {HttpService} from "@shared/services/http";

import RegisterView from "@app/views/RegisterView.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {describe, expect, it, vi} from "vitest";
import {createMemoryHistory, createRouter} from "vue-router";

const createMockHttpService = () =>
    ({
        getRequest: vi.fn(),
        postRequest: vi.fn(),
        putRequest: vi.fn(),
        patchRequest: vi.fn(),
        deleteRequest: vi.fn(),
        registerRequestMiddleware: vi.fn(() => vi.fn()),
        registerResponseMiddleware: vi.fn(() => vi.fn()),
        registerResponseErrorMiddleware: vi.fn(() => vi.fn()),
    }) as unknown as HttpService;

const createMockAuthService = () =>
    ({
        isLoggedIn: {value: false},
        user: {value: null},
        userId: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkIfLoggedIn: vi.fn(),
        sendEmailResetPassword: vi.fn(),
        resetPassword: vi.fn(),
    }) as unknown as AuthService<{id: number}>;

const createTestRouter = () =>
    createRouter({
        history: createMemoryHistory(),
        routes: [
            {path: "/", name: "home", component: {template: "<div>Home</div>"}},
            {path: "/register", name: "register", component: {template: "<div>Register</div>"}},
        ],
    });

describe("RegisterView", () => {
    it("should render all form fields", async () => {
        // Arrange
        const httpService = createMockHttpService();
        const authService = createMockAuthService();
        const router = createTestRouter();

        // Act
        const wrapper = shallowMount(RegisterView, {props: {httpService, authService}, global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs).toHaveLength(5);
        expect(inputs[0]?.props("label")).toBe("Family Name");
        expect(inputs[1]?.props("label")).toBe("Name");
        expect(inputs[2]?.props("label")).toBe("Email");
        expect(inputs[3]?.props("label")).toBe("Password");
        expect(inputs[4]?.props("label")).toBe("Password Confirmation");
    });

    it("should render email field with email type", async () => {
        // Arrange
        const httpService = createMockHttpService();
        const authService = createMockAuthService();
        const router = createTestRouter();

        // Act
        const wrapper = shallowMount(RegisterView, {props: {httpService, authService}, global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs[2]?.props("type")).toBe("email");
    });

    it("should render password fields with password type", async () => {
        // Arrange
        const httpService = createMockHttpService();
        const authService = createMockAuthService();
        const router = createTestRouter();

        // Act
        const wrapper = shallowMount(RegisterView, {props: {httpService, authService}, global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs[3]?.props("type")).toBe("password");
        expect(inputs[4]?.props("type")).toBe("password");
    });

    it("should mark all fields as required", async () => {
        // Arrange
        const httpService = createMockHttpService();
        const authService = createMockAuthService();
        const router = createTestRouter();

        // Act
        const wrapper = shallowMount(RegisterView, {props: {httpService, authService}, global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        for (const input of inputs) {
            expect(input.props("required")).toBe(true);
        }
    });

    it("should render submit button", async () => {
        // Arrange
        const httpService = createMockHttpService();
        const authService = createMockAuthService();
        const router = createTestRouter();

        // Act
        const wrapper = shallowMount(RegisterView, {props: {httpService, authService}, global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const button = wrapper.find("button[type='submit']");
        expect(button.exists()).toBe(true);
        expect(button.text()).toBe("Register");
    });

    it("should call authService.register on form submit", async () => {
        // Arrange
        const httpService = createMockHttpService();
        const authService = createMockAuthService();
        const router = createTestRouter();
        await router.push("/register");

        const wrapper = shallowMount(RegisterView, {props: {httpService, authService}, global: {plugins: [router]}});
        await router.isReady();

        const inputs = wrapper.findAllComponents(TextInput);
        inputs[0]?.vm.$emit("update:modelValue", "Smith");
        inputs[1]?.vm.$emit("update:modelValue", "John");
        inputs[2]?.vm.$emit("update:modelValue", "john@example.com");
        inputs[3]?.vm.$emit("update:modelValue", "password123");
        inputs[4]?.vm.$emit("update:modelValue", "password123");
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(authService.register).toHaveBeenCalledWith({
            familyName: "Smith",
            name: "John",
            email: "john@example.com",
            password: "password123",
            passwordConfirmation: "password123",
        });
    });

    it("should navigate to home on successful registration", async () => {
        // Arrange
        const httpService = createMockHttpService();
        const authService = createMockAuthService();
        const router = createTestRouter();
        await router.push("/register");

        const wrapper = shallowMount(RegisterView, {props: {httpService, authService}, global: {plugins: [router]}});
        await router.isReady();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(router.currentRoute.value.name).toBe("home");
    });

    it("should render page title", async () => {
        // Arrange
        const httpService = createMockHttpService();
        const authService = createMockAuthService();
        const router = createTestRouter();

        // Act
        const wrapper = shallowMount(RegisterView, {props: {httpService, authService}, global: {plugins: [router]}});
        await router.isReady();

        // Assert
        expect(wrapper.find("h1").text()).toBe("Create Account");
    });
});

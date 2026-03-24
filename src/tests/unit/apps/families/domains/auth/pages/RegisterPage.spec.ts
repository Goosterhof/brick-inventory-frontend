import RegisterPage from "@app/domains/auth/pages/RegisterPage.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {createMockAxios, createMockStringTs, createMockFamilyServices} = await vi.hoisted(
    () => import("../../../../../../helpers"),
);

const {mockRegister, mockGoToDashboard} = vi.hoisted(() => ({mockRegister: vi.fn(), mockGoToDashboard: vi.fn()}));

vi.mock("axios", () => createMockAxios());
vi.mock("string-ts", () => createMockStringTs());
vi.mock("@app/services", () =>
    createMockFamilyServices({
        familyAuthService: {register: mockRegister},
        familyRouterService: {goToDashboard: mockGoToDashboard},
    }),
);

describe("RegisterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render all form fields", () => {
        // Arrange & Act
        const wrapper = shallowMount(RegisterPage);

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs).toHaveLength(5);
        expect(inputs[0]?.props("label")).toBe("auth.familyName");
        expect(inputs[1]?.props("label")).toBe("auth.name");
        expect(inputs[2]?.props("label")).toBe("auth.email");
        expect(inputs[3]?.props("label")).toBe("auth.password");
        expect(inputs[4]?.props("label")).toBe("auth.passwordConfirmation");
    });

    it("should render email field with email type", () => {
        // Arrange & Act
        const wrapper = shallowMount(RegisterPage);

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs[2]?.props("type")).toBe("email");
    });

    it("should render password fields with password type", () => {
        // Arrange & Act
        const wrapper = shallowMount(RegisterPage);

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs[3]?.props("type")).toBe("password");
        expect(inputs[4]?.props("type")).toBe("password");
    });

    it("should have all fields required by default", () => {
        // Arrange & Act
        const wrapper = shallowMount(RegisterPage);

        // Assert
        const inputs = wrapper.findAllComponents(TextInput);
        for (const input of inputs) {
            expect(input.props("optional")).toBe(false);
        }
    });

    it("should render submit button", () => {
        // Arrange & Act
        const wrapper = shallowMount(RegisterPage);

        // Assert
        const button = wrapper.findComponent(PrimaryButton);
        expect(button.exists()).toBe(true);
        expect(button.props("type")).toBe("submit");
        expect(button.text()).toBe("auth.register");
    });

    it("should call authService.register on form submit", async () => {
        // Arrange
        const wrapper = shallowMount(RegisterPage);

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
        expect(mockRegister).toHaveBeenCalledWith({
            familyName: "Smith",
            name: "John",
            email: "john@example.com",
            password: "password123",
            passwordConfirmation: "password123",
        });
    });

    it("should navigate to dashboard on successful registration", async () => {
        // Arrange
        mockRegister.mockResolvedValue(undefined);
        const wrapper = shallowMount(RegisterPage);

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToDashboard).toHaveBeenCalled();
    });

    it("should render link to login page", () => {
        // Arrange & Act
        const wrapper = shallowMount(RegisterPage);

        // Assert
        const paragraph = wrapper.find("p");
        expect(paragraph.text()).toContain("auth.alreadyHaveAccount");
        expect(paragraph.text()).toContain("auth.logIn");
    });

    it("should render page title", () => {
        // Arrange & Act
        const wrapper = shallowMount(RegisterPage);

        // Assert
        expect(wrapper.find("h1").text()).toBe("auth.createAccount");
    });
});

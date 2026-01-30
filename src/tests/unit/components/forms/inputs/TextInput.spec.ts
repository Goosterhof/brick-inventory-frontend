import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

import FormError from "@/components/forms/FormError.vue";
import FormField from "@/components/forms/FormField.vue";
import FormLabel from "@/components/forms/FormLabel.vue";
import TextInput from "@/components/forms/inputs/TextInput.vue";

describe("TextInput", () => {
    it("should render label and input", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Username", modelValue: ""}});

        // Assert
        const label = wrapper.findComponent(FormLabel);
        expect(label.text()).toContain("Username");
        expect(wrapper.find("input").exists()).toBe(true);
        expect(wrapper.find("input").element.value).toBe("");
    });

    it("should associate label with input via id", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Email", modelValue: ""}});
        const input = wrapper.find("input");
        const label = wrapper.findComponent(FormLabel);
        const inputId = input.attributes("id");

        // Assert
        expect(inputId).toBeTruthy();
        expect(label.props("for")).toBe(inputId);
    });

    it("should emit update:modelValue on input", async () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Name", modelValue: ""}});

        // Act
        await wrapper.find("input").setValue("John");

        // Assert
        const emitted = wrapper.emitted("update:modelValue");
        expect(emitted).toBeTruthy();
        expect(emitted?.[0]).toEqual(["John"]);
    });

    it("should show required indicator when required", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Email", modelValue: "", required: true}});

        // Assert
        const label = wrapper.findComponent(FormLabel);
        expect(label.props("required")).toBe(true);
        expect(wrapper.find("input").attributes("required")).toBeDefined();
    });

    it("should not show required indicator when not required", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Email", modelValue: ""}});

        // Assert
        const label = wrapper.findComponent(FormLabel);
        expect(label.props("required")).toBe(false);
        expect(wrapper.find("input").attributes("required")).toBeUndefined();
    });

    it("should display error message and set aria-invalid", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {
            props: {label: "Email", modelValue: "", error: "Invalid email address"},
        });
        const input = wrapper.find("input");
        const errorComponent = wrapper.findComponent(FormError);

        // Assert
        expect(errorComponent.props("message")).toBe("Invalid email address");
        expect(input.attributes("aria-invalid")).toBe("true");
        expect(input.attributes("aria-describedby")).toBe(errorComponent.props("id"));
    });

    it("should be disabled when disabled prop is true", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Name", modelValue: "", disabled: true}});

        // Assert
        expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("should render with correct input type", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Password", modelValue: "", type: "password"}});

        // Assert
        expect(wrapper.find("input").attributes("type")).toBe("password");
    });

    it("should prioritize disabled state over error state", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {
            props: {label: "Email", modelValue: "", disabled: true, error: "Invalid email"},
        });
        const input = wrapper.find("input");

        // Assert
        expect(input.classes()).toContain("bg-gray-200");
        expect(input.classes()).not.toContain("bg-red-100");
    });

    it("should render placeholder text", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {
            props: {label: "Email", modelValue: "", placeholder: "Enter your email"},
        });

        // Assert
        expect(wrapper.find("input").attributes("placeholder")).toBe("Enter your email");
    });

    it("should wrap content in FormField", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Email", modelValue: ""}});

        // Assert
        expect(wrapper.findComponent(FormField).exists()).toBe(true);
    });

    it("should apply normal styling when not disabled and no error", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Email", modelValue: ""}});
        const input = wrapper.find("input");

        // Assert
        expect(input.classes()).toContain("bg-white");
    });

    it("should apply error styling when error is present", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Email", modelValue: "", error: "Invalid"}});
        const input = wrapper.find("input");

        // Assert
        expect(input.classes()).toContain("bg-red-100");
        expect(wrapper.findComponent(FormError).props("message")).toBe("Invalid");
    });

    it("should not render FormError when no error", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Email", modelValue: ""}});
        const input = wrapper.find("input");

        // Assert
        expect(wrapper.findComponent(FormError).exists()).toBe(false);
        expect(input.attributes("aria-invalid")).toBeUndefined();
        expect(input.attributes("aria-describedby")).toBeUndefined();
    });
});

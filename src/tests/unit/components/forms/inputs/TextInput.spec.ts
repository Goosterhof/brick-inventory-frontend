import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

import TextInput from "@/components/forms/inputs/TextInput.vue";

describe("TextInput", () => {
    it("should render label and input", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Username", modelValue: ""}});

        // Assert
        expect(wrapper.find("label").text()).toContain("Username");
        expect(wrapper.find("input").exists()).toBe(true);
        expect(wrapper.find("input").element.value).toBe("");
    });

    it("should associate label with input via id", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Email", modelValue: ""}});
        const input = wrapper.find("input");
        const label = wrapper.find("label");
        const inputId = input.attributes("id");

        // Assert
        expect(inputId).toBeTruthy();
        expect(label.attributes("for")).toBe(inputId);
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
        expect(wrapper.find("label").text()).toContain("*");
        expect(wrapper.find("input").attributes("required")).toBeDefined();
    });

    it("should not show required indicator when not required", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {props: {label: "Email", modelValue: ""}});

        // Assert
        expect(wrapper.find("label").text()).not.toContain("*");
        expect(wrapper.find("input").attributes("required")).toBeUndefined();
    });

    it("should display error message and set aria-invalid", () => {
        // Arrange
        const wrapper = shallowMount(TextInput, {
            props: {label: "Email", modelValue: "", error: "Invalid email address"},
        });
        const input = wrapper.find("input");
        const errorMessage = wrapper.find("[role='alert']");

        // Assert
        expect(errorMessage.text()).toBe("Invalid email address");
        expect(input.attributes("aria-invalid")).toBe("true");
        expect(input.attributes("aria-describedby")).toBe(errorMessage.attributes("id"));
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
});

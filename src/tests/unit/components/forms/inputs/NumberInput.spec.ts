import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

import NumberInput from "@/components/forms/inputs/NumberInput.vue";

describe("NumberInput", () => {
    it("should render label and input", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Quantity", modelValue: null}});

        // Assert
        expect(wrapper.find("label").text()).toContain("Quantity");
        expect(wrapper.find("input").exists()).toBe(true);
        expect(wrapper.find("input").attributes("type")).toBe("number");
    });

    it("should associate label with input via id", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Amount", modelValue: null}});
        const input = wrapper.find("input");
        const label = wrapper.find("label");
        const inputId = input.attributes("id");

        // Assert
        expect(inputId).toBeTruthy();
        expect(label.attributes("for")).toBe(inputId);
    });

    it("should emit update:modelValue on input", async () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Count", modelValue: null}});

        // Act
        await wrapper.find("input").setValue(42);

        // Assert
        const emitted = wrapper.emitted("update:modelValue");
        expect(emitted).toBeTruthy();
        expect(emitted?.[0]).toEqual([42]);
    });

    it("should show required indicator when required", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Amount", modelValue: null, required: true}});

        // Assert
        expect(wrapper.find("label").text()).toContain("*");
        expect(wrapper.find("input").attributes("required")).toBeDefined();
    });

    it("should not show required indicator when not required", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Amount", modelValue: null}});

        // Assert
        expect(wrapper.find("label").text()).not.toContain("*");
        expect(wrapper.find("input").attributes("required")).toBeUndefined();
    });

    it("should display error message and set aria-invalid", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {
            props: {label: "Amount", modelValue: null, error: "Must be a positive number"},
        });
        const input = wrapper.find("input");
        const errorMessage = wrapper.find("[role='alert']");

        // Assert
        expect(errorMessage.text()).toBe("Must be a positive number");
        expect(input.attributes("aria-invalid")).toBe("true");
        expect(input.attributes("aria-describedby")).toBe(errorMessage.attributes("id"));
    });

    it("should be disabled when disabled prop is true", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Count", modelValue: null, disabled: true}});

        // Assert
        expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("should prioritize disabled state over error state", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {
            props: {label: "Amount", modelValue: null, disabled: true, error: "Invalid number"},
        });
        const input = wrapper.find("input");

        // Assert
        expect(input.classes()).toContain("bg-gray-200");
        expect(input.classes()).not.toContain("bg-red-100");
    });

    it("should render placeholder text", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {
            props: {label: "Amount", modelValue: null, placeholder: "Enter amount"},
        });

        // Assert
        expect(wrapper.find("input").attributes("placeholder")).toBe("Enter amount");
    });

    it("should render with min attribute", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Age", modelValue: null, min: 0}});

        // Assert
        expect(wrapper.find("input").attributes("min")).toBe("0");
    });

    it("should render with max attribute", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Age", modelValue: null, max: 120}});

        // Assert
        expect(wrapper.find("input").attributes("max")).toBe("120");
    });

    it("should render with step attribute", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Price", modelValue: null, step: 0.01}});

        // Assert
        expect(wrapper.find("input").attributes("step")).toBe("0.01");
    });

    it("should display initial numeric value", () => {
        // Arrange
        const wrapper = shallowMount(NumberInput, {props: {label: "Quantity", modelValue: 5}});

        // Assert
        expect(wrapper.find("input").element.value).toBe("5");
    });
});

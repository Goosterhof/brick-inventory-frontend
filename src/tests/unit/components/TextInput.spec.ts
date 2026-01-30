import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

import TextInput from "../../../components/TextInput.vue";

describe("TextInput", () => {
    it("should render label and input", () => {
        const wrapper = shallowMount(TextInput, {
            props: {label: "Username"},
        });

        expect(wrapper.find("label").text()).toContain("Username");
        expect(wrapper.find("input").exists()).toBe(true);
    });

    it("should associate label with input via id", () => {
        const wrapper = shallowMount(TextInput, {
            props: {label: "Email"},
        });

        const input = wrapper.find("input");
        const label = wrapper.find("label");
        const inputId = input.attributes("id");

        expect(inputId).toBeTruthy();
        expect(label.attributes("for")).toBe(inputId);
    });

    it("should emit update:modelValue on input", async () => {
        const wrapper = shallowMount(TextInput, {
            props: {label: "Name", modelValue: ""},
        });

        await wrapper.find("input").setValue("John");

        const emitted = wrapper.emitted("update:modelValue");
        expect(emitted).toBeTruthy();
        expect(emitted?.[0]).toEqual(["John"]);
    });

    it("should show required indicator when required", () => {
        const wrapper = shallowMount(TextInput, {
            props: {label: "Email", required: true},
        });

        expect(wrapper.find("label").text()).toContain("*");
        expect(wrapper.find("input").attributes("required")).toBeDefined();
    });

    it("should display error message and set aria-invalid", () => {
        const wrapper = shallowMount(TextInput, {
            props: {label: "Email", error: "Invalid email address"},
        });

        const input = wrapper.find("input");
        const errorMessage = wrapper.find("[role='alert']");

        expect(errorMessage.text()).toBe("Invalid email address");
        expect(input.attributes("aria-invalid")).toBe("true");
        expect(input.attributes("aria-describedby")).toBe(errorMessage.attributes("id"));
    });

    it("should be disabled when disabled prop is true", () => {
        const wrapper = shallowMount(TextInput, {
            props: {label: "Name", disabled: true},
        });

        expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("should render with correct input type", () => {
        const wrapper = shallowMount(TextInput, {
            props: {label: "Password", type: "password"},
        });

        expect(wrapper.find("input").attributes("type")).toBe("password");
    });
});

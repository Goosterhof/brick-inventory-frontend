import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("PrimaryButton", () => {
    it("should render slot content", () => {
        // Arrange
        const wrapper = shallowMount(PrimaryButton, {slots: {default: "Save"}});

        // Assert
        expect(wrapper.text()).toBe("Save");
    });

    it("should default type to button", () => {
        // Arrange
        const wrapper = shallowMount(PrimaryButton, {slots: {default: "Click"}});

        // Assert
        expect(wrapper.attributes("type")).toBe("button");
    });

    it("should accept submit type", () => {
        // Arrange
        const wrapper = shallowMount(PrimaryButton, {props: {type: "submit"}, slots: {default: "Submit"}});

        // Assert
        expect(wrapper.attributes("type")).toBe("submit");
    });

    it("should not be disabled by default", () => {
        // Arrange
        const wrapper = shallowMount(PrimaryButton, {slots: {default: "Click"}});

        // Assert
        expect(wrapper.attributes("disabled")).toBeUndefined();
    });

    it("should be disabled when prop is set", () => {
        // Arrange
        const wrapper = shallowMount(PrimaryButton, {props: {disabled: true}, slots: {default: "Click"}});

        // Assert
        expect(wrapper.attributes("disabled")).toBeDefined();
    });

    it("should have neo-brutalist styling", () => {
        // Arrange
        const wrapper = shallowMount(PrimaryButton, {slots: {default: "Click"}});

        // Assert
        expect(wrapper.attributes("class")).toContain("brick-border");
        expect(wrapper.attributes("class")).toContain("brick-shadow");
        expect(wrapper.attributes("bg")).toBe("black hover:yellow-300 focus:yellow-300 disabled:gray-200");
        expect(wrapper.attributes("text")).toBe("white hover:black focus:black disabled:gray-600");
        expect(wrapper.attributes("font")).toBe("bold");
        expect(wrapper.attributes("uppercase")).toBeDefined();
    });
});

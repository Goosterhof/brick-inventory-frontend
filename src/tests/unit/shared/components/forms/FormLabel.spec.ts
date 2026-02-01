import FormLabel from "@shared/components/forms/FormLabel.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("FormLabel", () => {
    it("should render label with slot content", () => {
        // Arrange
        const wrapper = shallowMount(FormLabel, {slots: {default: "Username"}});

        // Assert
        expect(wrapper.find("label").text()).toContain("Username");
    });

    it("should set for attribute when provided", () => {
        // Arrange
        const wrapper = shallowMount(FormLabel, {props: {for: "input-123"}, slots: {default: "Email"}});

        // Assert
        expect(wrapper.find("label").attributes("for")).toBe("input-123");
    });

    it("should show required indicator when required", () => {
        // Arrange
        const wrapper = shallowMount(FormLabel, {props: {required: true}, slots: {default: "Email"}});

        // Assert
        expect(wrapper.find("label").text()).toContain("*");
        expect(wrapper.find("span").attributes("aria-hidden")).toBe("true");
    });

    it("should not show required indicator when not required", () => {
        // Arrange
        const wrapper = shallowMount(FormLabel, {slots: {default: "Email"}});

        // Assert
        expect(wrapper.find("label").text()).not.toContain("*");
        expect(wrapper.find("span").exists()).toBe(false);
    });
});

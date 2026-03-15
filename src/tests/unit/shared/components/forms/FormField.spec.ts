import FormField from "@shared/components/forms/FormField.vue";
import LegoStuds from "@shared/components/forms/LegoStuds.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("FormField", () => {
    it("should render slot content", () => {
        // Arrange
        const wrapper = shallowMount(FormField, {slots: {default: "<span>Field content</span>"}});

        // Assert
        expect(wrapper.find("span").text()).toBe("Field content");
    });

    it("should render as a flex column layout", () => {
        // Arrange
        const wrapper = shallowMount(FormField);

        // Assert
        const outerDiv = wrapper.find("div");
        expect(outerDiv.attributes("flex")).toBe("~ col");
    });

    it("should render a brick container with border", () => {
        // Arrange
        const wrapper = shallowMount(FormField);

        // Assert
        const brickContainer = wrapper.find(".brick-border");
        expect(brickContainer.exists()).toBe(true);
        expect(brickContainer.attributes("flex")).toBe("~ col");
        expect(brickContainer.attributes("gap")).toBe("2");
    });

    it("should render LegoStuds above the brick container", () => {
        // Arrange
        const wrapper = shallowMount(FormField);

        // Assert
        expect(wrapper.findComponent(LegoStuds).exists()).toBe(true);
    });
});

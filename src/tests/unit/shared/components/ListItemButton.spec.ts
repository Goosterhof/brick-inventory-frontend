import ListItemButton from "@shared/components/ListItemButton.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("ListItemButton", () => {
    it("should render slot content", () => {
        // Arrange
        const wrapper = shallowMount(ListItemButton, {slots: {default: "<p>Item content</p>"}});

        // Assert
        expect(wrapper.text()).toContain("Item content");
    });

    it("should emit click event when clicked", async () => {
        // Arrange
        const wrapper = shallowMount(ListItemButton, {slots: {default: "Item"}});

        // Act
        await wrapper.trigger("click");

        // Assert
        expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("should have neo-brutalist styling", () => {
        // Arrange
        const wrapper = shallowMount(ListItemButton, {slots: {default: "Item"}});

        // Assert
        expect(wrapper.attributes("class")).toContain("brick-border");
        expect(wrapper.attributes("class")).toContain("brick-shadow");
        expect(wrapper.attributes("bg")).toBe("white hover:yellow-300 focus:yellow-300");
        expect(wrapper.attributes("text")).toBe("left");
    });
});

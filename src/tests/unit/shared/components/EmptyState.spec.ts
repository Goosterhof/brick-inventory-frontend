import EmptyState from "@shared/components/EmptyState.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("EmptyState", () => {
    it("should render message", () => {
        // Arrange
        const wrapper = shallowMount(EmptyState, {props: {message: "No items found"}});

        // Assert
        expect(wrapper.text()).toBe("No items found");
    });

    it("should have muted text styling", () => {
        // Arrange
        const wrapper = shallowMount(EmptyState, {props: {message: "Empty"}});

        // Assert
        expect(wrapper.attributes("text")).toBe("gray-600");
    });
});

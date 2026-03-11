import PartListItem from "@shared/components/PartListItem.vue";
import {mount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("PartListItem", () => {
    const defaultProps = {name: "Brick 2x4", partNum: "3001", quantity: 5};

    it("should render part name and number", () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: defaultProps});

        // Assert
        expect(wrapper.text()).toContain("Brick 2x4");
        expect(wrapper.text()).toContain("3001");
    });

    it("should render quantity", () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: defaultProps});

        // Assert
        expect(wrapper.text()).toContain("5x");
    });

    it("should render color swatch when colorRgb is provided", () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: {...defaultProps, colorRgb: "FF0000"}});

        // Assert
        const swatch = wrapper.find("[w='6']");
        expect(swatch.exists()).toBe(true);
        expect(swatch.attributes("style")).toContain("background-color: rgb(255, 0, 0)");
    });

    it("should toggle color swatch when colorRgb changes", async () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: {...defaultProps, colorRgb: "FF0000"}});
        expect(wrapper.find("[w='6']").exists()).toBe(true);

        // Act
        await wrapper.setProps({colorRgb: undefined});

        // Assert
        expect(wrapper.find("[w='6']").exists()).toBe(false);
    });

    it("should render image when imageUrl is provided", () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: {...defaultProps, imageUrl: "https://example.com/img.png"}});

        // Assert
        const img = wrapper.find("img");
        expect(img.exists()).toBe(true);
        expect(img.attributes("src")).toBe("https://example.com/img.png");
        expect(img.attributes("alt")).toBe("Brick 2x4");
    });

    it("should toggle image when imageUrl changes", async () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: {...defaultProps, imageUrl: "https://example.com/img.png"}});
        expect(wrapper.find("img").exists()).toBe(true);

        // Act
        await wrapper.setProps({imageUrl: undefined});

        // Assert
        expect(wrapper.find("img").exists()).toBe(false);
    });

    it("should render color name when provided", () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: {...defaultProps, colorName: "Red"}});

        // Assert
        expect(wrapper.text()).toContain("Red");
    });

    it("should toggle color name when colorName changes", async () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: {...defaultProps, colorName: "Red"}});
        expect(wrapper.text()).toContain("Red");

        // Act
        await wrapper.setProps({colorName: undefined});

        // Assert
        expect(wrapper.text()).not.toContain("·");
    });

    it("should use gray background for spare parts", () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: {...defaultProps, spare: true}});

        // Assert
        expect(wrapper.attributes("bg")).toBe("gray-200");
    });

    it("should use white background for non-spare parts", () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: defaultProps});

        // Assert
        expect(wrapper.attributes("bg")).toBe("white");
    });

    it("should have neo-brutalist styling", () => {
        // Arrange
        const wrapper = mount(PartListItem, {props: defaultProps});

        // Assert
        expect(wrapper.attributes("class")).toContain("brick-border");
        expect(wrapper.attributes("class")).toContain("brick-shadow");
    });
});

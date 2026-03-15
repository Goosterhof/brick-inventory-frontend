import AboutPage from "@app/domains/about/pages/AboutPage.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it, vi} from "vitest";

vi.mock("@app/services", () => ({
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
}));

describe("AboutPage", () => {
    it("should render the title and description", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        expect(wrapper.text()).toContain("about.title");
        expect(wrapper.text()).toContain("about.description");
    });

    it("should render four LegoBrick components", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents({name: "LegoBrick"});
        expect(bricks).toHaveLength(4);
    });

    it("should render a 2x2 brick", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents({name: "LegoBrick"});
        const brick2x2 = bricks.find((b) => b.props("columns") === 2 && b.props("rows") === 2);
        expect(brick2x2?.exists()).toBe(true);
    });

    it("should render a 1x1 brick", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents({name: "LegoBrick"});
        const brick1x1 = bricks.find((b) => b.props("columns") === 1 && b.props("rows") === 1);
        expect(brick1x1?.exists()).toBe(true);
    });

    it("should render a 1x3 brick", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents({name: "LegoBrick"});
        const brick1x3 = bricks.find((b) => b.props("columns") === 1 && b.props("rows") === 3);
        expect(brick1x3?.exists()).toBe(true);
    });

    it("should render a 2x3 brick", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents({name: "LegoBrick"});
        const brick2x3 = bricks.find((b) => b.props("columns") === 2 && b.props("rows") === 3);
        expect(brick2x3?.exists()).toBe(true);
    });

    it("should disable shadow on all bricks", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents({name: "LegoBrick"});
        for (const brick of bricks) {
            expect(brick.props("shadow")).toBe(false);
        }
    });

    it("should use different colors for each brick", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents({name: "LegoBrick"});
        const colors = bricks.map((b) => String(b.props("color") ?? ""));
        const uniqueColors = new Set(colors.filter(Boolean));
        expect(uniqueColors.size).toBeGreaterThanOrEqual(3);
    });
});

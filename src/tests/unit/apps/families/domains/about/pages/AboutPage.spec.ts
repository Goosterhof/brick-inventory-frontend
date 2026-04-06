import AboutPage from "@app/domains/about/pages/AboutPage.vue";
import LegoBrick from "@shared/components/LegoBrick.vue";
import LegoBrickSvg from "@shared/components/LegoBrickSvg.vue";
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
        const bricks = wrapper.findAllComponents(LegoBrick);
        expect(bricks).toHaveLength(4);
    });

    it("should render bricks with correct colors", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents(LegoBrick);
        const colors = bricks.map((brick) => brick.props("color"));
        expect(colors).toEqual(["#DC2626", "#1D4ED8", "#EAB308", "#16A34A"]);
    });

    it("should render bricks with correct dimensions", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents(LegoBrick);
        const dimensions = bricks.map((brick) => ({columns: brick.props("columns"), rows: brick.props("rows")}));
        expect(dimensions).toEqual([
            {columns: 2, rows: 2},
            {columns: 1, rows: 1},
            {columns: 2, rows: 3},
            {columns: 1, rows: 3},
        ]);
    });

    it("should disable shadow on all bricks", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const bricks = wrapper.findAllComponents(LegoBrick);
        for (const brick of bricks) {
            expect(brick.props("shadow")).toBe(false);
        }
    });

    it("should have a drop-shadow on the container", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const container = wrapper.find("[inline-block]");
        expect(container.attributes("style")).toContain("drop-shadow");
    });

    it("should overlap borders between adjacent bricks with negative margins", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const negativeMarginElements = wrapper.findAll(".ml-\\[-3px\\]");
        expect(negativeMarginElements).toHaveLength(2);
        const negativeTopMargin = wrapper.findAll(".mt-\\[-3px\\]");
        expect(negativeTopMargin).toHaveLength(1);
    });

    it("should render four LegoBrickSvg components", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const svgBricks = wrapper.findAllComponents(LegoBrickSvg);
        expect(svgBricks).toHaveLength(4);
    });

    it("should render SVG bricks with correct colors", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const svgBricks = wrapper.findAllComponents(LegoBrickSvg);
        const colors = svgBricks.map((brick) => brick.props("color"));
        expect(colors).toEqual(["#DC2626", "#1D4ED8", "#EAB308", "#16A34A"]);
    });

    it("should render SVG bricks with correct dimensions", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const svgBricks = wrapper.findAllComponents(LegoBrickSvg);
        const dimensions = svgBricks.map((brick) => ({columns: brick.props("columns"), rows: brick.props("rows")}));
        expect(dimensions).toEqual([
            {columns: 2, rows: 2},
            {columns: 1, rows: 1},
            {columns: 2, rows: 3},
            {columns: 1, rows: 3},
        ]);
    });

    it("should disable shadow on all SVG bricks", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const svgBricks = wrapper.findAllComponents(LegoBrickSvg);
        for (const brick of svgBricks) {
            expect(brick.props("shadow")).toBe(false);
        }
    });

    it("should render both HTML and SVG brick arrangements side by side", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const flexContainer = wrapper.find("[flex]");
        expect(flexContainer.exists()).toBe(true);
        const inlineBlocks = wrapper.findAll("[inline-block]");
        expect(inlineBlocks).toHaveLength(2);
    });
});

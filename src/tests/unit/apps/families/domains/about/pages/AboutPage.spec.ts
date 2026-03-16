import LegoBrick from "@app/domains/about/components/LegoBrick.vue";
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
        expect(bricks[0].props()).toMatchObject({columns: 2, rows: 2});
        expect(bricks[1].props()).toMatchObject({columns: 1, rows: 1});
        expect(bricks[2].props()).toMatchObject({columns: 2, rows: 3});
        expect(bricks[3].props()).toMatchObject({columns: 1, rows: 3});
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
});

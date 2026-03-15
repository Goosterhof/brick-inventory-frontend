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

    it("should render a 3x5 stud grid with 14 studs", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const studs = wrapper.findAll("[rounded='full']");
        expect(studs).toHaveLength(14);
    });

    it("should render 15 grid cells including one empty", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const gridCells = wrapper.findAll("[flex]");
        const cellsWithStuds = wrapper.findAll("[rounded='full']");
        expect(gridCells.length).toBeGreaterThanOrEqual(15);
        expect(cellsWithStuds).toHaveLength(14);
    });

    it("should use four different brick colors", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const studs = wrapper.findAll("[rounded='full']");
        const colors = new Set<string>();
        for (const stud of studs) {
            const style = stud.attributes("style") ?? "";
            colors.add(style);
        }
        expect(colors.size).toBe(4);
    });

    it("should have brick brutalist border and shadow on container", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const container = wrapper.find("[inline-block]");
        expect(container.attributes("border")).toBe("3 black");
        expect(container.classes()).toContain("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should have internal borders between different brick regions", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const cellsWithRightBorder = wrapper.findAll(".border-r-3");
        const cellsWithBottomBorder = wrapper.findAll(".border-b-3");
        expect(cellsWithRightBorder.length).toBeGreaterThan(0);
        expect(cellsWithBottomBorder.length).toBeGreaterThan(0);
    });
});

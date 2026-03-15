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

    it("should render 14 studs for the four bricks", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const studs = wrapper.findAll("[rounded='full']");
        expect(studs).toHaveLength(14);
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

    it("should have a drop-shadow on the container", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const container = wrapper.find("[inline-block]");
        expect(container.attributes("style")).toContain("drop-shadow");
    });

    it("should render the empty cell without a stud", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const gridCells = wrapper.findAll("[flex]");
        const studs = wrapper.findAll("[rounded='full']");
        expect(gridCells.length).toBe(studs.length + 1);
    });

    it("should have inset box-shadow borders on brick cells", () => {
        // Arrange
        const wrapper = shallowMount(AboutPage);

        // Assert
        const cellsWithInsetShadow = wrapper
            .findAll("[flex]")
            .filter((cell) => (cell.attributes("style") ?? "").includes("inset"));
        expect(cellsWithInsetShadow.length).toBeGreaterThan(0);
    });
});

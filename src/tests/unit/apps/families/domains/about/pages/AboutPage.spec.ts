import AboutPage from "@app/domains/about/pages/AboutPage.vue";
import LegoArch from "@shared/components/LegoArch.vue";
import LegoBrick from "@shared/components/LegoBrick.vue";
import LegoBrickSvg from "@shared/components/LegoBrickSvg.vue";
import LegoPlate from "@shared/components/LegoPlate.vue";
import LegoRound from "@shared/components/LegoRound.vue";
import LegoSlope from "@shared/components/LegoSlope.vue";
import LegoTechnicBeam from "@shared/components/LegoTechnicBeam.vue";
import LegoTile from "@shared/components/LegoTile.vue";
import LegoWedge from "@shared/components/LegoWedge.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it, vi} from "vitest";

vi.mock("@app/services", () => ({
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
}));

describe("AboutPage", () => {
    it("should render the title and description", () => {
        const wrapper = shallowMount(AboutPage);

        expect(wrapper.text()).toContain("about.title");
        expect(wrapper.text()).toContain("about.description");
    });

    it("should render four LegoBrick components in the brick demo", () => {
        const wrapper = shallowMount(AboutPage);

        // 4 demo bricks + 3 diorama bricks (2 wall + 1 tree trunk) = 7
        const bricks = wrapper.findAllComponents(LegoBrick);
        expect(bricks).toHaveLength(7);
    });

    it("should render bricks with correct colors in the demo section", () => {
        const wrapper = shallowMount(AboutPage);

        const bricks = wrapper.findAllComponents(LegoBrick);
        const demoColors = bricks.slice(0, 4).map((brick) => brick.props("color"));
        expect(demoColors).toEqual(["#DC2626", "#1D4ED8", "#EAB308", "#16A34A"]);
    });

    it("should render bricks with correct dimensions in the demo section", () => {
        const wrapper = shallowMount(AboutPage);

        const bricks = wrapper.findAllComponents(LegoBrick);
        const demoDimensions = bricks
            .slice(0, 4)
            .map((brick) => ({columns: brick.props("columns"), rows: brick.props("rows")}));
        expect(demoDimensions).toEqual([
            {columns: 2, rows: 2},
            {columns: 1, rows: 1},
            {columns: 2, rows: 3},
            {columns: 1, rows: 3},
        ]);
    });

    it("should disable shadow on all bricks", () => {
        const wrapper = shallowMount(AboutPage);

        const bricks = wrapper.findAllComponents(LegoBrick);
        for (const brick of bricks) {
            expect(brick.props("shadow")).toBe(false);
        }
    });

    it("should have a drop-shadow on the demo container", () => {
        const wrapper = shallowMount(AboutPage);

        const container = wrapper.find("[inline-block]");
        expect(container.attributes("style")).toContain("drop-shadow");
    });

    it("should overlap borders between adjacent bricks with negative margins", () => {
        const wrapper = shallowMount(AboutPage);

        const negativeMarginElements = wrapper.findAll(".ml-\\[-3px\\]");
        expect(negativeMarginElements.length).toBeGreaterThanOrEqual(2);
        const negativeTopMargin = wrapper.findAll(".mt-\\[-3px\\]");
        expect(negativeTopMargin.length).toBeGreaterThanOrEqual(1);
    });

    it("should render four LegoBrickSvg components", () => {
        const wrapper = shallowMount(AboutPage);

        const svgBricks = wrapper.findAllComponents(LegoBrickSvg);
        expect(svgBricks).toHaveLength(4);
    });

    it("should render SVG bricks with correct colors", () => {
        const wrapper = shallowMount(AboutPage);

        const svgBricks = wrapper.findAllComponents(LegoBrickSvg);
        const colors = svgBricks.map((brick) => brick.props("color"));
        expect(colors).toEqual(["#DC2626", "#1D4ED8", "#EAB308", "#16A34A"]);
    });

    it("should render SVG bricks with correct dimensions", () => {
        const wrapper = shallowMount(AboutPage);

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
        const wrapper = shallowMount(AboutPage);

        const svgBricks = wrapper.findAllComponents(LegoBrickSvg);
        for (const brick of svgBricks) {
            expect(brick.props("shadow")).toBe(false);
        }
    });

    it("should render both HTML and SVG brick arrangements side by side", () => {
        const wrapper = shallowMount(AboutPage);

        const flexContainer = wrapper.find("[flex]");
        expect(flexContainer.exists()).toBe(true);
        const inlineBlocks = wrapper.findAll("[inline-block]");
        expect(inlineBlocks).toHaveLength(2);
    });

    it("should render the diorama section with heading", () => {
        const wrapper = shallowMount(AboutPage);

        expect(wrapper.text()).toContain("about.diorama");
        expect(wrapper.find("[data-diorama]").exists()).toBe(true);
    });

    it("should render a diorama with drop-shadow", () => {
        const wrapper = shallowMount(AboutPage);

        const diorama = wrapper.find("[data-diorama]");
        expect(diorama.attributes("style")).toContain("drop-shadow");
    });

    it("should render two LegoSlope components for the roof", () => {
        const wrapper = shallowMount(AboutPage);

        const slopes = wrapper.findAllComponents(LegoSlope);
        expect(slopes).toHaveLength(2);
        const colors = slopes.map((s) => s.props("color"));
        expect(colors).toEqual(["#EAB308", "#EAB308"]);
    });

    it("should mirror the second slope to form a roof peak", () => {
        const wrapper = shallowMount(AboutPage);

        const slopes = wrapper.findAllComponents(LegoSlope);
        const styles = slopes.map((s) => s.attributes("style") ?? "");
        expect(styles).toEqual([expect.not.stringContaining("scaleX"), expect.stringContaining("scaleX(-1)")]);
    });

    it("should render a LegoTile as a window", () => {
        const wrapper = shallowMount(AboutPage);

        const tiles = wrapper.findAllComponents(LegoTile);
        expect(tiles).toHaveLength(1);
        expect(tiles.map((t) => t.props("color"))).toEqual(["#1D4ED8"]);
    });

    it("should render a LegoArch as a door", () => {
        const wrapper = shallowMount(AboutPage);

        const arches = wrapper.findAllComponents(LegoArch);
        expect(arches).toHaveLength(1);
        expect(arches.map((a) => a.props("color"))).toEqual(["#DC2626"]);
    });

    it("should render a LegoRound as a tree top", () => {
        const wrapper = shallowMount(AboutPage);

        const rounds = wrapper.findAllComponents(LegoRound);
        expect(rounds).toHaveLength(1);
        expect(rounds.map((r) => r.props("color"))).toEqual(["#16A34A"]);
    });

    it("should render a LegoPlate as ground", () => {
        const wrapper = shallowMount(AboutPage);

        const plates = wrapper.findAllComponents(LegoPlate);
        expect(plates).toHaveLength(1);
        expect(plates.map((p) => p.props("color"))).toEqual(["#16A34A"]);
    });

    it("should render a LegoTechnicBeam in the ground row", () => {
        const wrapper = shallowMount(AboutPage);

        const beams = wrapper.findAllComponents(LegoTechnicBeam);
        expect(beams).toHaveLength(1);
        expect(beams.map((b) => b.props("color"))).toEqual(["#6B7280"]);
    });

    it("should render a LegoWedge in the ground row", () => {
        const wrapper = shallowMount(AboutPage);

        const wedges = wrapper.findAllComponents(LegoWedge);
        expect(wedges).toHaveLength(1);
        expect(wedges.map((w) => w.props("color"))).toEqual(["#6B7280"]);
    });

    it("should disable shadow on all diorama pieces", () => {
        const wrapper = shallowMount(AboutPage);

        const dioramaPieces = [
            ...wrapper.findAllComponents(LegoSlope),
            ...wrapper.findAllComponents(LegoTile),
            ...wrapper.findAllComponents(LegoArch),
            ...wrapper.findAllComponents(LegoRound),
            ...wrapper.findAllComponents(LegoPlate),
            ...wrapper.findAllComponents(LegoTechnicBeam),
            ...wrapper.findAllComponents(LegoWedge),
        ];
        for (const piece of dioramaPieces) {
            expect(piece.props("shadow")).toBe(false);
        }
    });

    it("should render diorama bricks with correct colors and dimensions", () => {
        const wrapper = shallowMount(AboutPage);

        const bricks = wrapper.findAllComponents(LegoBrick);
        // Diorama bricks are indices 4-6: two red 1×1 walls + one brown 1×2 trunk
        const dioramaBricks = bricks
            .slice(4)
            .map((b) => ({color: b.props("color"), columns: b.props("columns"), rows: b.props("rows")}));
        expect(dioramaBricks).toEqual([
            {color: "#DC2626", columns: 1, rows: 1},
            {color: "#DC2626", columns: 1, rows: 1},
            {color: "#92400E", columns: 1, rows: 2},
        ]);
    });
});

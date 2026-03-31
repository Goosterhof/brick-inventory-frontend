import AboutPage from "@app/domains/about/pages/AboutPage.vue";
import {mockServer} from "@integration/helpers/mock-server";
import LegoBrick from "@shared/components/LegoBrick.vue";
import {mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("@script-development/fs-http", async () => {
    const {mockHttpService} = await import("@integration/helpers/mock-server");
    return {createHttpService: () => mockHttpService};
});

describe("AboutPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockServer.reset();
        localStorage.clear();
    });

    const mountPage = () => mount(AboutPage);

    it("renders real LegoBrick components with visible stud grids", () => {
        const wrapper = mountPage();

        // Real LegoBrick components render stud elements — stubs would not
        const bricks = wrapper.findAllComponents(LegoBrick);
        expect(bricks).toHaveLength(4);

        // Each brick should render actual DOM content (divs for studs), not just a stub slot
        for (const brick of bricks) {
            expect(brick.html()).toContain("inline-grid");
        }
    });

    it("passes correct props through to real LegoBrick children", () => {
        const wrapper = mountPage();

        const bricks = wrapper.findAllComponents(LegoBrick);
        const props = bricks.map((b) => ({
            color: b.props("color"),
            columns: b.props("columns"),
            rows: b.props("rows"),
            shadow: b.props("shadow"),
        }));

        expect(props).toEqual([
            {color: "#DC2626", columns: 2, rows: 2, shadow: false},
            {color: "#1D4ED8", columns: 1, rows: 1, shadow: false},
            {color: "#EAB308", columns: 2, rows: 3, shadow: false},
            {color: "#16A34A", columns: 1, rows: 3, shadow: false},
        ]);
    });

    it("renders actual English text for title and description", () => {
        const wrapper = mountPage();

        expect(wrapper.text()).toContain("About");
        expect(wrapper.text()).toContain("This is the about page.");
    });
});

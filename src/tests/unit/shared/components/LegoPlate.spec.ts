import LegoPlate from "@shared/components/LegoPlate.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("LegoPlate", () => {
    it("should render 8 studs (2x4 plate)", () => {
        const wrapper = shallowMount(LegoPlate);

        const studs = wrapper.findAll("[data-stud]");
        expect(studs).toHaveLength(8);
    });

    it("should use a 4-column grid layout", () => {
        const wrapper = shallowMount(LegoPlate);

        const container = wrapper.find("[inline-grid]");
        expect(container.attributes("style")).toContain("grid-template-columns: repeat(4, 1fr)");
    });

    it("should show shadow by default", () => {
        const wrapper = shallowMount(LegoPlate);

        const container = wrapper.find("[inline-grid]");
        expect(container.classes()).toContain("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should hide shadow when shadow is false", () => {
        const wrapper = shallowMount(LegoPlate, {props: {shadow: false}});

        const container = wrapper.find("[inline-grid]");
        expect(container.classes()).not.toContain("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should apply custom color", () => {
        const wrapper = shallowMount(LegoPlate, {props: {color: "#C41A16"}});

        const studs = wrapper.findAll("[data-stud]");
        const stud = studs.find((s) => s.attributes("style")?.includes("#C41A16"));
        expect(stud?.exists()).toBe(true);
    });

    it("should apply default red color", () => {
        const wrapper = shallowMount(LegoPlate);

        const container = wrapper.find("[inline-grid]");
        expect(container.attributes("style")).toContain("#DC2626");
    });

    it("should have compact vertical padding for plate height", () => {
        const wrapper = shallowMount(LegoPlate);

        const container = wrapper.find("[inline-grid]");
        expect(container.attributes("p")).toBe("x-2 y-0.5");
    });

    it("should have brick-border styling", () => {
        const wrapper = shallowMount(LegoPlate);

        const container = wrapper.find("[inline-grid]");
        expect(container.attributes("border")).toBe("3 black");
    });
});

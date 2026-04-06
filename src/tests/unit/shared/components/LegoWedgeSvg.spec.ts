import LegoWedgeSvg from "@shared/components/LegoWedgeSvg.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("LegoWedgeSvg", () => {
    it("should render an SVG with role img and aria-label", () => {
        const wrapper = shallowMount(LegoWedgeSvg);

        const svg = wrapper.find("svg");
        expect(svg.attributes("role")).toBe("img");
        expect(svg.attributes("aria-label")).toBe("2 by 4 LEGO wedge plate");
    });

    it("should render the body polygon", () => {
        const wrapper = shallowMount(LegoWedgeSvg);

        const body = wrapper.find("[data-body]");
        expect(body.exists()).toBe(true);
        expect(body.attributes("stroke")).toBe("black");
        expect(body.attributes("stroke-width")).toBe("3");
    });

    it("should render 4 studs", () => {
        const wrapper = shallowMount(LegoWedgeSvg);

        const studGroups = wrapper.findAll("g");
        expect(studGroups).toHaveLength(4);
        const circles = wrapper.findAll("circle");
        expect(circles).toHaveLength(8);
    });

    it("should render shadow by default", () => {
        const wrapper = shallowMount(LegoWedgeSvg);

        const shadow = wrapper.find("[data-shadow]");
        expect(shadow.exists()).toBe(true);
    });

    it("should hide shadow when shadow is false", () => {
        const wrapper = shallowMount(LegoWedgeSvg, {props: {shadow: false}});

        const shadow = wrapper.find("[data-shadow]");
        expect(shadow.exists()).toBe(false);
    });

    it("should apply custom color", () => {
        const wrapper = shallowMount(LegoWedgeSvg, {props: {color: "#237841"}});

        const body = wrapper.find("[data-body]");
        expect(body.attributes("fill")).toBe("#237841");
    });

    it("should apply default red color", () => {
        const wrapper = shallowMount(LegoWedgeSvg);

        const body = wrapper.find("[data-body]");
        expect(body.attributes("fill")).toBe("#DC2626");
    });

    it("should include gradient defs", () => {
        const wrapper = shallowMount(LegoWedgeSvg);

        const gradient = wrapper.find("defs radialGradient");
        expect(gradient.exists()).toBe(true);
    });
});

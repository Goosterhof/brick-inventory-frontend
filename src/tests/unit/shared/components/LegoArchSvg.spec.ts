import LegoArchSvg from "@shared/components/LegoArchSvg.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("LegoArchSvg", () => {
    it("should render an SVG with role img and aria-label", () => {
        const wrapper = shallowMount(LegoArchSvg);

        const svg = wrapper.find("svg");
        expect(svg.attributes("role")).toBe("img");
        expect(svg.attributes("aria-label")).toBe("1 by 4 LEGO arch brick");
    });

    it("should render the body rect", () => {
        const wrapper = shallowMount(LegoArchSvg);

        const body = wrapper.find("[data-body]");
        expect(body.exists()).toBe(true);
        expect(body.attributes("stroke")).toBe("black");
        expect(body.attributes("stroke-width")).toBe("3");
    });

    it("should render a subtle arch hint path", () => {
        const wrapper = shallowMount(LegoArchSvg);

        const hint = wrapper.find("[data-arch-hint]");
        expect(hint.exists()).toBe(true);
        expect(hint.attributes("fill")).toBe("none");
        expect(hint.attributes("stroke-opacity")).toBe("0.35");
    });

    it("should render 4 studs with gradient", () => {
        const wrapper = shallowMount(LegoArchSvg);

        const studGroups = wrapper.findAll("g");
        expect(studGroups).toHaveLength(4);
        const circles = wrapper.findAll("circle");
        expect(circles).toHaveLength(8);
    });

    it("should render shadow by default", () => {
        const wrapper = shallowMount(LegoArchSvg);

        const shadow = wrapper.find("[data-shadow]");
        expect(shadow.exists()).toBe(true);
    });

    it("should hide shadow when shadow is false", () => {
        const wrapper = shallowMount(LegoArchSvg, {props: {shadow: false}});

        const shadow = wrapper.find("[data-shadow]");
        expect(shadow.exists()).toBe(false);
    });

    it("should apply custom color to body", () => {
        const wrapper = shallowMount(LegoArchSvg, {props: {color: "#F5C518"}});

        const body = wrapper.find("[data-body]");
        expect(body.attributes("fill")).toBe("#F5C518");
    });

    it("should apply default red color", () => {
        const wrapper = shallowMount(LegoArchSvg);

        const body = wrapper.find("[data-body]");
        expect(body.attributes("fill")).toBe("#DC2626");
    });

    it("should include gradient defs", () => {
        const wrapper = shallowMount(LegoArchSvg);

        const gradient = wrapper.find("defs radialGradient");
        expect(gradient.exists()).toBe(true);
    });
});

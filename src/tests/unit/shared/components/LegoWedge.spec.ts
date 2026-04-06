import LegoWedge from "@shared/components/LegoWedge.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("LegoWedge", () => {
    it("should render 4 studs", () => {
        const wrapper = shallowMount(LegoWedge);

        const studs = wrapper.findAll("[data-stud]");
        expect(studs).toHaveLength(4);
    });

    it("should apply trapezoidal clip-path", () => {
        const wrapper = shallowMount(LegoWedge);

        const container = wrapper.find("[inline-flex]");
        expect(container.attributes("style")).toContain("clip-path: polygon(0 0, 100% 0, 70% 100%, 0 100%)");
    });

    it("should show shadow by default", () => {
        const wrapper = shallowMount(LegoWedge);

        const container = wrapper.find("[inline-flex]");
        expect(container.classes()).toContain("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should hide shadow when shadow is false", () => {
        const wrapper = shallowMount(LegoWedge, {props: {shadow: false}});

        const container = wrapper.find("[inline-flex]");
        expect(container.classes()).not.toContain("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should apply custom color", () => {
        const wrapper = shallowMount(LegoWedge, {props: {color: "#0055BF"}});

        const container = wrapper.find("[inline-flex]");
        expect(container.attributes("style")).toContain("#0055BF");
    });

    it("should apply default red color", () => {
        const wrapper = shallowMount(LegoWedge);

        const container = wrapper.find("[inline-flex]");
        expect(container.attributes("style")).toContain("#DC2626");
    });

    it("should have brick-border styling", () => {
        const wrapper = shallowMount(LegoWedge);

        const container = wrapper.find("[inline-flex]");
        expect(container.attributes("border")).toBe("3 black");
    });
});

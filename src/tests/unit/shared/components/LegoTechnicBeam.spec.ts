import LegoTechnicBeam from "@shared/components/LegoTechnicBeam.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("LegoTechnicBeam", () => {
    it("should render 4 pin holes", () => {
        const wrapper = shallowMount(LegoTechnicBeam);

        const holes = wrapper.findAll("[data-pin-hole]");
        expect(holes).toHaveLength(4);
    });

    it("should render pin holes as white circles with black border", () => {
        const wrapper = shallowMount(LegoTechnicBeam);

        const holes = wrapper.findAll("[data-pin-hole]");
        const hole = holes.find((h) => h.attributes("bg") === "white");
        expect(hole?.exists()).toBe(true);
        expect(hole?.attributes("border")).toBe("3 black");
        expect(hole?.attributes("rounded")).toBe("full");
    });

    it("should show shadow by default", () => {
        const wrapper = shallowMount(LegoTechnicBeam);

        const container = wrapper.find("[inline-flex]");
        expect(container.classes()).toContain("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should hide shadow when shadow is false", () => {
        const wrapper = shallowMount(LegoTechnicBeam, {props: {shadow: false}});

        const container = wrapper.find("[inline-flex]");
        expect(container.classes()).not.toContain("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should apply custom color", () => {
        const wrapper = shallowMount(LegoTechnicBeam, {props: {color: "#0055BF"}});

        const container = wrapper.find("[inline-flex]");
        expect(container.attributes("style")).toContain("#0055BF");
    });

    it("should apply default red color", () => {
        const wrapper = shallowMount(LegoTechnicBeam);

        const container = wrapper.find("[inline-flex]");
        expect(container.attributes("style")).toContain("#DC2626");
    });

    it("should have brick-border styling", () => {
        const wrapper = shallowMount(LegoTechnicBeam);

        const container = wrapper.find("[inline-flex]");
        expect(container.attributes("border")).toBe("3 black");
    });
});

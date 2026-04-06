import LegoSlope from "@shared/components/LegoSlope.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("LegoSlope", () => {
    it("should render the angled top with clip-path polygon", () => {
        const wrapper = shallowMount(LegoSlope);

        const slopeTop = wrapper.findAll("div").find((d) => {
            const style = d.attributes("style") ?? "";
            return style.includes("clip-path");
        });
        expect(slopeTop?.exists()).toBe(true);
        expect(slopeTop?.attributes("style")).toContain("polygon(0 100%, 0 0, 100% 100%)");
    });

    it("should render 2 studs on the body", () => {
        const wrapper = shallowMount(LegoSlope);

        const studs = wrapper.findAll("[data-stud]");
        expect(studs).toHaveLength(2);
    });

    it("should apply default red color", () => {
        const wrapper = shallowMount(LegoSlope);

        const studs = wrapper.findAll("[data-stud]");
        const stud = studs.find((s) => s.attributes("style")?.includes("background-color"));
        expect(stud?.attributes("style")).toContain("background-color");
    });

    it("should apply custom color", () => {
        const wrapper = shallowMount(LegoSlope, {props: {color: "#0055BF"}});

        const studs = wrapper.findAll("[data-stud]");
        const stud = studs.find((s) => s.attributes("style")?.includes("#0055BF"));
        expect(stud?.exists()).toBe(true);
    });

    it("should show shadow by default", () => {
        const wrapper = shallowMount(LegoSlope);

        const body = wrapper.findAll("div").find((d) => d.classes().includes("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"));
        expect(body?.exists()).toBe(true);
    });

    it("should hide shadow when shadow is false", () => {
        const wrapper = shallowMount(LegoSlope, {props: {shadow: false}});

        const body = wrapper.findAll("div").find((d) => d.classes().includes("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"));
        expect(body).toBeUndefined();
    });

    it("should have brick-border styling on the body", () => {
        const wrapper = shallowMount(LegoSlope);

        const body = wrapper.findAll("div").find((d) => d.attributes("border") === "x-3 b-3 black");
        expect(body?.exists()).toBe(true);
    });
});

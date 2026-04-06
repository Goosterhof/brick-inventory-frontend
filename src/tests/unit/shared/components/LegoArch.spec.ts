import LegoArch from "@shared/components/LegoArch.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("LegoArch", () => {
    it("should render 4 studs on the top section", () => {
        const wrapper = shallowMount(LegoArch);

        const studs = wrapper.findAll("[data-stud]");
        expect(studs).toHaveLength(4);
    });

    it("should render the arch cutout", () => {
        const wrapper = shallowMount(LegoArch);

        const arch = wrapper.find("[data-arch]");
        expect(arch.exists()).toBe(true);
        expect(arch.attributes("style")).toContain("border-radius: 999px 999px 0px 0px");
    });

    it("should show shadow by default", () => {
        const wrapper = shallowMount(LegoArch);

        const body = wrapper.findAll("div").find((d) => d.classes().includes("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"));
        expect(body?.exists()).toBe(true);
    });

    it("should hide shadow when shadow is false", () => {
        const wrapper = shallowMount(LegoArch, {props: {shadow: false}});

        const body = wrapper.findAll("div").find((d) => d.classes().includes("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"));
        expect(body).toBeUndefined();
    });

    it("should apply custom color", () => {
        const wrapper = shallowMount(LegoArch, {props: {color: "#237841"}});

        const studs = wrapper.findAll("[data-stud]");
        const stud = studs.find((s) => s.attributes("style")?.includes("#237841"));
        expect(stud?.exists()).toBe(true);
    });

    it("should apply default red color", () => {
        const wrapper = shallowMount(LegoArch);

        const studs = wrapper.findAll("[data-stud]");
        const stud = studs.find((s) => s.attributes("style")?.includes("#DC2626"));
        expect(stud?.exists()).toBe(true);
    });

    it("should have brick-border on the top section", () => {
        const wrapper = shallowMount(LegoArch);

        const top = wrapper.findAll("div").find((d) => d.attributes("border") === "3 black");
        expect(top?.exists()).toBe(true);
    });
});

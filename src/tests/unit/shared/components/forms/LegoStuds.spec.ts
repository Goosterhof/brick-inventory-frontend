import LegoStuds from "@shared/components/forms/LegoStuds.vue";
import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("LegoStuds", () => {
    it("should render 3 studs by default", () => {
        // Arrange
        const wrapper = shallowMount(LegoStuds);

        // Assert
        expect(wrapper.findAll("span")).toHaveLength(3);
    });

    it("should render custom number of studs", () => {
        // Arrange
        const wrapper = shallowMount(LegoStuds, {props: {count: 5}});

        // Assert
        expect(wrapper.findAll("span")).toHaveLength(5);
    });

    it("should be hidden from assistive technology", () => {
        // Arrange
        const wrapper = shallowMount(LegoStuds);

        // Assert
        expect(wrapper.find("div").attributes("aria-hidden")).toBe("true");
    });

    it("should render each stud as a circle", () => {
        // Arrange
        const wrapper = shallowMount(LegoStuds);

        // Assert
        const studs = wrapper.findAll("span");
        for (const stud of studs) {
            expect(stud.element.style.borderRadius).toBe("50%");
        }
    });
});

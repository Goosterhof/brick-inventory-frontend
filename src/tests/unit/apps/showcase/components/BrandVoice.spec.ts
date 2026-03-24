import {mount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

import BrandVoice from "@/apps/showcase/components/BrandVoice.vue";

describe("BrandVoice", () => {
    it("should render the section heading with correct number and title", () => {
        // Act
        const wrapper = mount(BrandVoice);

        // Assert
        expect(wrapper.text()).toContain("06");
        expect(wrapper.text()).toContain("Brand Voice Specimens");
    });

    it("should render the section element with correct id", () => {
        // Act
        const wrapper = mount(BrandVoice);

        // Assert
        expect(wrapper.find("section#voice").exists()).toBe(true);
    });

    it("should render all voice specimen categories", () => {
        // Act
        const wrapper = mount(BrandVoice);

        // Assert
        const labels = wrapper.findAll(".brick-label");
        const labelTexts = labels.map((l) => l.text());
        expect(labelTexts).toContain("Empty States");
        expect(labelTexts).toContain("Error Messages");
        expect(labelTexts).toContain("Success Messages");
        expect(labelTexts).toContain("Destructive Confirmation");
    });
});

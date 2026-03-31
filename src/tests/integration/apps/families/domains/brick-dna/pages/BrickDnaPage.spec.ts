import BrickDnaPage from "@app/domains/brick-dna/pages/BrickDnaPage.vue";
import {mockServer} from "@integration/helpers/mock-server";
import CardContainer from "@shared/components/CardContainer.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import SectionDivider from "@shared/components/SectionDivider.vue";
import StatCard from "@shared/components/StatCard.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("@script-development/fs-http", async () => {
    const {mockHttpService} = await import("@integration/helpers/mock-server");
    return {createHttpService: () => mockHttpService};
});

/**
 * Snake_case fixtures — matching real API response format.
 * toCamelCaseTyped() converts these to camelCase before they reach the component.
 */
const mockDna = {
    diversity_score: {shannon_index: 0.85},
    top_colors: [
        {name: "Red", hex: "#FF0000", count: 120},
        {name: "Blue", hex: "#0000FF", count: 95},
    ],
    top_part_types: [{name: "Brick 2x4", category: "Bricks", count: 200}],
    rarest_parts: [{part: "Chrome Gold Helmet", color: "Chrome Gold", quantity: 1}],
};

describe("BrickDnaPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockServer.reset();
        localStorage.clear();
    });

    it("renders real PageHeader with title", async () => {
        mockServer.onGet("/family/brick-dna", mockDna);
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.exists()).toBe(true);
        expect(pageHeader.find("h1").text()).toBe("Brick DNA");
    });

    it("renders real EmptyState when API returns no data", async () => {
        // No route registered — the getRequest will reject, triggering the catch branch
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const emptyState = wrapper.findComponent(EmptyState);
        expect(emptyState.exists()).toBe(true);
        expect(emptyState.text()).toContain("No collection data available yet");
    });

    it("renders real StatCards for top colors", async () => {
        mockServer.onGet("/family/brick-dna", mockDna);
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const statCards = wrapper.findAllComponents(StatCard);
        const labels = statCards.map((c) => c.props("label"));
        expect(labels).toContain("Red");
        expect(labels).toContain("Blue");
    });

    it("renders real CardContainers for rarest parts", async () => {
        mockServer.onGet("/family/brick-dna", mockDna);
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const cards = wrapper.findAllComponents(CardContainer);
        expect(cards.length).toBeGreaterThanOrEqual(1);
        expect(wrapper.text()).toContain("Chrome Gold Helmet");
    });

    it("renders real SectionDividers between sections", async () => {
        mockServer.onGet("/family/brick-dna", mockDna);
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const dividers = wrapper.findAllComponents(SectionDivider);
        expect(dividers).toHaveLength(3);
    });

    it("displays diversity percentage from real component hierarchy", async () => {
        mockServer.onGet("/family/brick-dna", mockDna);
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        expect(wrapper.text()).toContain("85%");
        expect(wrapper.text()).toContain("Highly Diverse");
    });
});

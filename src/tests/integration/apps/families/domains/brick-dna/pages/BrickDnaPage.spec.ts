import BrickDnaPage from "@app/domains/brick-dna/pages/BrickDnaPage.vue";
import CardContainer from "@shared/components/CardContainer.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import SectionDivider from "@shared/components/SectionDivider.vue";
import StatCard from "@shared/components/StatCard.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest} = vi.hoisted(() => ({mockGetRequest: vi.fn()}));

vi.mock("axios", () => ({isAxiosError: () => false, AxiosError: Error}));
vi.mock("string-ts", () => ({deepCamelKeys: <T>(o: T): T => o, deepSnakeKeys: <T>(o: T): T => o}));
vi.mock("@app/services", () => ({
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    familyHttpService: {
        getRequest: mockGetRequest,
        postRequest: vi.fn(),
        putRequest: vi.fn(),
        patchRequest: vi.fn(),
        deleteRequest: vi.fn(),
        registerRequestMiddleware: vi.fn(() => vi.fn()),
        registerResponseMiddleware: vi.fn(() => vi.fn()),
        registerResponseErrorMiddleware: vi.fn(() => vi.fn()),
    },
    familyAuthService: {isLoggedIn: {value: true}, userId: vi.fn()},
}));

const mockDna = {
    diversityScore: {shannonIndex: 0.85},
    topColors: [
        {name: "Red", hex: "#FF0000", count: 120},
        {name: "Blue", hex: "#0000FF", count: 95},
    ],
    topPartTypes: [{name: "Brick 2x4", category: "Bricks", count: 200}],
    rarestParts: [{part: "Chrome Gold Helmet", color: "Chrome Gold", quantity: 1}],
};

describe("BrickDnaPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders real PageHeader with title", async () => {
        mockGetRequest.mockResolvedValue({data: mockDna});
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.exists()).toBe(true);
        expect(pageHeader.find("h1").text()).toBe("brickDna.title");
    });

    it("renders real EmptyState when API returns no data", async () => {
        mockGetRequest.mockRejectedValue(new Error("Network error"));
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const emptyState = wrapper.findComponent(EmptyState);
        expect(emptyState.exists()).toBe(true);
        expect(emptyState.text()).toContain("brickDna.empty");
    });

    it("renders real StatCards for top colors", async () => {
        mockGetRequest.mockResolvedValue({data: mockDna});
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const statCards = wrapper.findAllComponents(StatCard);
        const labels = statCards.map((c) => c.props("label"));
        expect(labels).toContain("Red");
        expect(labels).toContain("Blue");
    });

    it("renders real CardContainers for rarest parts", async () => {
        mockGetRequest.mockResolvedValue({data: mockDna});
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const cards = wrapper.findAllComponents(CardContainer);
        expect(cards.length).toBeGreaterThanOrEqual(1);
        expect(wrapper.text()).toContain("Chrome Gold Helmet");
    });

    it("renders real SectionDividers between sections", async () => {
        mockGetRequest.mockResolvedValue({data: mockDna});
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        const dividers = wrapper.findAllComponents(SectionDivider);
        expect(dividers).toHaveLength(3);
    });

    it("displays diversity percentage from real component hierarchy", async () => {
        mockGetRequest.mockResolvedValue({data: mockDna});
        const wrapper = mount(BrickDnaPage);
        await flushPromises();

        expect(wrapper.text()).toContain("85%");
        expect(wrapper.text()).toContain("brickDna.diversityHigh");
    });
});

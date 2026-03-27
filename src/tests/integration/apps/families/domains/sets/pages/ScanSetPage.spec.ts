import ScanSetPage from "@app/domains/sets/pages/ScanSetPage.vue";
import BackButton from "@shared/components/BackButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import BarcodeScanner from "@shared/components/scanner/BarcodeScanner.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockPostRequest, mockGoToRoute} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockPostRequest: vi.fn(),
    mockGoToRoute: vi.fn(),
}));

vi.mock("axios", () => ({isAxiosError: () => false, AxiosError: Error}));
vi.mock("string-ts", () => ({deepCamelKeys: <T>(o: T): T => o, deepSnakeKeys: <T>(o: T): T => o}));
vi.mock("barcode-detector", () => ({BarcodeDetector: vi.fn()}));
vi.mock("@app/services", () => ({
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    familyHttpService: {
        getRequest: mockGetRequest,
        postRequest: mockPostRequest,
        putRequest: vi.fn(),
        patchRequest: vi.fn(),
        deleteRequest: vi.fn(),
        registerRequestMiddleware: vi.fn(() => vi.fn()),
        registerResponseMiddleware: vi.fn(() => vi.fn()),
        registerResponseErrorMiddleware: vi.fn(() => vi.fn()),
    },
    familyRouterService: {goToRoute: mockGoToRoute},
}));
vi.mock("@app/stores", () => ({familySetStoreModule: {getAll: {value: []}}}));

describe("ScanSetPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mountPage = () => mount(ScanSetPage);

    it("renders PageHeader with real BackButton", () => {
        const wrapper = mountPage();

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.find("h1").text()).toBe("sets.scanSet");

        const backButton = wrapper.findComponent(BackButton);
        expect(backButton.exists()).toBe(true);
        expect(backButton.find("button").exists()).toBe(true);
    });

    it("renders real BarcodeScanner component", () => {
        const wrapper = mountPage();

        const scanner = wrapper.findComponent(BarcodeScanner);
        expect(scanner.exists()).toBe(true);
        expect(scanner.props("loadingText")).toBe("sets.startingCamera");
    });

    it("shows search result after barcode detection", async () => {
        mockGetRequest.mockResolvedValue({
            data: {name: "City Police", setNum: "60316-1", year: 2022, numParts: 300, imageUrl: null},
        });

        const wrapper = mountPage();

        const scanner = wrapper.findComponent(BarcodeScanner);
        scanner.vm.$emit("detect", "5702017153636");
        await flushPromises();

        expect(wrapper.text()).toContain("sets.scannedCode");
        expect(wrapper.text()).toContain("City Police");

        const addButton = wrapper
            .findAllComponents(PrimaryButton)
            .find((b) => b.text().includes("sets.addToCollection"));
        expect(addButton).toBeDefined();
    });

    it("shows no result message when barcode lookup fails", async () => {
        mockGetRequest.mockRejectedValue(new Error("Not found"));

        const wrapper = mountPage();

        const scanner = wrapper.findComponent(BarcodeScanner);
        scanner.vm.$emit("detect", "0000000000000");
        await flushPromises();

        expect(wrapper.text()).toContain("sets.scanNoResult");
    });

    it("navigates back via BackButton click", async () => {
        const wrapper = mountPage();

        const backButton = wrapper.findComponent(BackButton);
        await backButton.find("button").trigger("click");

        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });
});

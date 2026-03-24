import ScanSetPage from "@app/domains/sets/pages/ScanSetPage.vue";
import BackButton from "@shared/components/BackButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import BarcodeScanner from "@shared/components/scanner/BarcodeScanner.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {createMockAxios, createMockStringTs, createMockFamilyServices} = await vi.hoisted(
    () => import("../../../../../../helpers"),
);

const {mockGetRequest, mockPostRequest, mockGoToRoute} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockPostRequest: vi.fn(),
    mockGoToRoute: vi.fn(),
}));

vi.mock("barcode-detector", () => ({BarcodeDetector: vi.fn()}));

vi.mock("axios", () => createMockAxios());
vi.mock("string-ts", () => createMockStringTs());
vi.mock("@app/services", () =>
    createMockFamilyServices({
        familyHttpService: {getRequest: mockGetRequest, postRequest: mockPostRequest},
        familyAuthService: {isLoggedIn: {value: true}},
        familyRouterService: {goToRoute: mockGoToRoute},
    }),
);

const mockSetResponse = {
    id: 10,
    setNum: "75192-1",
    name: "Millennium Falcon",
    year: 2017,
    theme: "Star Wars",
    numParts: 7541,
    imageUrl: "https://example.com/75192.jpg",
};

describe("ScanSetPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render page header with title", () => {
        // Arrange & Act
        const wrapper = shallowMount(ScanSetPage);

        // Assert
        const header = wrapper.findComponent(PageHeader);
        expect(header.exists()).toBe(true);
        expect(header.props("title")).toBe("sets.scanSet");
    });

    it("should render BarcodeScanner component", () => {
        // Arrange & Act
        const wrapper = shallowMount(ScanSetPage);

        // Assert
        expect(wrapper.findComponent(BarcodeScanner).exists()).toBe(true);
    });

    it("should render back button", () => {
        // Arrange & Act
        const wrapper = shallowMount(ScanSetPage);

        // Assert
        expect(wrapper.findComponent(BackButton).exists()).toBe(true);
    });

    it("should navigate back to sets overview when back button is clicked", async () => {
        // Arrange
        const wrapper = shallowMount(ScanSetPage);

        // Act
        wrapper.findComponent(BackButton).vm.$emit("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });

    it("should not show results section before scan", () => {
        // Arrange & Act
        const wrapper = shallowMount(ScanSetPage);

        // Assert
        expect(wrapper.text()).not.toContain("sets.scannedCode");
    });

    describe("barcode detection", () => {
        it("should show scanned code after detection", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockSetResponse});
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("5702015357197");
        });

        it("should lookup set by EAN after detection", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockSetResponse});
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(mockGetRequest).toHaveBeenCalledWith("/sets/ean/5702015357197");
        });

        it("should show loading state while searching", async () => {
            // Arrange
            let resolveRequest: ((value: unknown) => void) | undefined;
            mockGetRequest.mockReturnValue(
                new Promise((resolve) => {
                    resolveRequest = resolve;
                }),
            );
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("common.loading");
            resolveRequest?.({data: mockSetResponse});
        });

        it("should display found set info", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockSetResponse});
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Millennium Falcon");
            expect(wrapper.text()).toContain("75192-1");
            expect(wrapper.text()).toContain("2017");
        });

        it("should display set image when available", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockSetResponse});
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            const img = wrapper.find("img");
            expect(img.exists()).toBe(true);
            expect(img.attributes("src")).toBe("https://example.com/75192.jpg");
        });

        it("should show add to collection button when set is found", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockSetResponse});
            const wrapper = shallowMount(ScanSetPage);
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            const addButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "sets.addToCollection");
            expect(addButton?.exists()).toBe(true);
        });

        it("should show no result message when set is not found", async () => {
            // Arrange
            mockGetRequest.mockRejectedValue(new Error("Not found"));
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("sets.scanNoResult");
        });

        it("should handle lookup error gracefully", async () => {
            // Arrange
            mockGetRequest.mockRejectedValue(new Error("Network error"));
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("sets.scanNoResult");
        });
    });

    describe("add to collection", () => {
        it("should add set to collection and navigate to detail", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockSetResponse});
            mockPostRequest.mockResolvedValue({data: {id: 42}});
            const wrapper = shallowMount(ScanSetPage);
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Act
            const addButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "sets.addToCollection");
            await addButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(mockPostRequest).toHaveBeenCalledWith("/family-sets", {
                set_num: "75192-1",
                quantity: 1,
                status: "sealed",
            });
            expect(mockGoToRoute).toHaveBeenCalledWith("sets-detail", 42);
        });

        it("should show error when add fails", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockSetResponse});
            mockPostRequest.mockRejectedValue(new Error("Server error"));
            const wrapper = shallowMount(ScanSetPage);
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Act
            const addButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "sets.addToCollection");
            await addButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("sets.scanAddError");
        });
    });

    describe("scan again", () => {
        it("should show scan again button after detection", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockSetResponse});
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            const scanAgainButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "sets.scanAgain");
            expect(scanAgainButton?.exists()).toBe(true);
        });

        it("should reset state when scan again is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: mockSetResponse});
            const wrapper = shallowMount(ScanSetPage);
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Act
            const scanAgainButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "sets.scanAgain");
            await scanAgainButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).not.toContain("5702015357197");
            expect(wrapper.findComponent(BarcodeScanner).props("resetKey")).toBe(1);
        });
    });
});

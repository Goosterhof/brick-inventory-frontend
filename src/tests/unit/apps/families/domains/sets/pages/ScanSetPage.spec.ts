import ScanSetPage from "@app/domains/sets/pages/ScanSetPage.vue";
import BackButton from "@shared/components/BackButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import BarcodeScanner from "@shared/components/scanner/BarcodeScanner.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockGoToRoute} = vi.hoisted(() => ({mockGetRequest: vi.fn(), mockGoToRoute: vi.fn()}));

vi.mock("@app/services", () => ({
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
    familyAuthService: {
        isLoggedIn: {value: true},
        user: {value: null},
        userId: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkIfLoggedIn: vi.fn(),
        sendEmailResetPassword: vi.fn(),
        resetPassword: vi.fn(),
    },
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: mockGoToRoute},
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

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
            mockGetRequest.mockResolvedValue({data: []});
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("5702015357197");
        });

        it("should search for matching sets after detection", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: []});
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(mockGetRequest).toHaveBeenCalledWith("/family-sets?set_num=5702015357197");
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
            resolveRequest?.({data: []});
        });

        it("should display matching sets when found", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({
                data: [{id: 1, set: {name: "Star Destroyer", set_num: "75252-1"}, quantity: 1, status: "sealed"}],
            });
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("sets.matchingSets");
            expect(wrapper.text()).toContain("Star Destroyer");
        });

        it("should navigate to set detail when matching set is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({
                data: [{id: 42, set: {name: "Star Destroyer", set_num: "75252-1"}, quantity: 1, status: "sealed"}],
            });
            const wrapper = shallowMount(ScanSetPage);
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Act
            const setButton = wrapper.findAll("button").find((btn) => btn.text().includes("Star Destroyer"));
            await setButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(mockGoToRoute).toHaveBeenCalledWith("sets-detail", 42);
        });

        it("should show no matching sets message when none found", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: []});
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("sets.noMatchingSets");
        });

        it("should show add set button when no matching sets found", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: []});
            const wrapper = shallowMount(ScanSetPage);
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            const addButton = wrapper.findAllComponents(PrimaryButton).find((btn) => btn.text() === "sets.addSet");
            expect(addButton?.exists()).toBe(true);
        });

        it("should navigate to add set when add button is clicked", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: []});
            const wrapper = shallowMount(ScanSetPage);
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Act
            const addButton = wrapper.findAllComponents(PrimaryButton).find((btn) => btn.text() === "sets.addSet");
            await addButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(mockGoToRoute).toHaveBeenCalledWith("sets-add");
        });

        it("should handle search error gracefully", async () => {
            // Arrange
            mockGetRequest.mockRejectedValue(new Error("Network error"));
            const wrapper = shallowMount(ScanSetPage);

            // Act
            wrapper.findComponent(BarcodeScanner).vm.$emit("detect", "5702015357197");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("sets.noMatchingSets");
        });
    });

    describe("scan again", () => {
        it("should show scan again button after detection", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: []});
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
            mockGetRequest.mockResolvedValue({data: []});
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

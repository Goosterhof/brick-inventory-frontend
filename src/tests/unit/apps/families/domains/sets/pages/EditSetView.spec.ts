import EditSetView from "@app/domains/sets/pages/EditSetView.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {AxiosError} from "axios";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockPatchRequest, mockDeleteRequest, mockGoToRoute, mockCurrentRouteId} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockPatchRequest: vi.fn(),
    mockDeleteRequest: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockCurrentRouteId: {value: 42},
}));

vi.mock("@app/services", () => ({
    familyHttpService: {
        getRequest: mockGetRequest,
        postRequest: vi.fn(),
        putRequest: vi.fn(),
        patchRequest: mockPatchRequest,
        deleteRequest: mockDeleteRequest,
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
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: mockGoToRoute, currentRouteId: mockCurrentRouteId},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

const mockFamilySetResponse = {
    id: 42,
    set_id: 10,
    quantity: 2,
    status: "built",
    purchase_date: "2024-01-15",
    notes: "Birthday gift",
    set: {
        id: 10,
        set_num: "75192-1",
        name: "Millennium Falcon",
        year: 2017,
        theme: "Star Wars",
        num_parts: 7541,
        image_url: "https://example.com/75192.jpg",
    },
};

describe("EditSetView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentRouteId.value = 42;
    });

    it("should fetch set on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        shallowMount(EditSetView);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/family-sets/42");
    });

    it("should render page title with set name", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(EditSetView);
        await flushPromises();

        // Assert
        expect(wrapper.find("h1").text()).toBe("Set bewerken");
        expect(wrapper.text()).toContain("Millennium Falcon");
        expect(wrapper.text()).toContain("75192-1");
    });

    it("should populate form with existing data", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(EditSetView);
        await flushPromises();

        // Assert
        const numberInput = wrapper.findComponent(NumberInput);
        expect(numberInput.props("modelValue")).toBe(2);

        const select = wrapper.find("select");
        expect((select.element as HTMLSelectElement).value).toBe("built");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(EditSetView);

        // Assert
        expect(wrapper.text()).toContain("Laden...");
    });

    it("should submit update with correct payload", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        mockPatchRequest.mockResolvedValue({data: mockFamilySetResponse});
        const wrapper = shallowMount(EditSetView);
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockPatchRequest).toHaveBeenCalledWith("/family-sets/42", {
            quantity: 2,
            status: "built",
            purchase_date: "2024-01-15",
            notes: "Birthday gift",
        });
    });

    it("should navigate to detail page on successful update", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        mockPatchRequest.mockResolvedValue({data: mockFamilySetResponse});
        const wrapper = shallowMount(EditSetView);
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-detail", 42);
    });

    it("should not navigate on 422 validation error", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        const axiosError = new AxiosError("Validation failed");
        axiosError.response = {status: 422, data: {}, statusText: "", headers: {}, config: {} as never};
        mockPatchRequest.mockRejectedValue(axiosError);
        const wrapper = shallowMount(EditSetView);
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).not.toHaveBeenCalled();
    });

    it("should rethrow non-422 errors", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        const axiosError = new AxiosError("Server error");
        axiosError.response = {status: 500, data: {}, statusText: "", headers: {}, config: {} as never};
        mockPatchRequest.mockRejectedValue(axiosError);
        const wrapper = shallowMount(EditSetView);
        await flushPromises();

        // Act
        const errorHandler = vi.fn();
        wrapper.vm.$.appContext.config.errorHandler = errorHandler;
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(errorHandler).toHaveBeenCalled();
        expect(errorHandler.mock.calls[0]?.[0]).toBe(axiosError);
        expect(mockGoToRoute).not.toHaveBeenCalled();
    });

    it("should delete set and navigate to overview on confirm", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        mockDeleteRequest.mockResolvedValue({});
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const wrapper = shallowMount(EditSetView);
        await flushPromises();

        // Act
        const deleteButton = wrapper.findAll("button").find((btn) => btn.text() === "Verwijderen");
        await deleteButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockDeleteRequest).toHaveBeenCalledWith("/family-sets/42");
        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });

    it("should not delete when user cancels confirmation", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        vi.spyOn(window, "confirm").mockReturnValue(false);
        const wrapper = shallowMount(EditSetView);
        await flushPromises();

        // Act
        const deleteButton = wrapper.findAll("button").find((btn) => btn.text() === "Verwijderen");
        await deleteButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockDeleteRequest).not.toHaveBeenCalled();
    });

    it("should render save and delete buttons", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(EditSetView);
        await flushPromises();

        // Assert
        const primaryButton = wrapper.findComponent(PrimaryButton);
        expect(primaryButton.text()).toBe("Opslaan");

        const deleteButton = wrapper.findAll("button").find((btn) => btn.text() === "Verwijderen");
        expect(deleteButton?.exists()).toBe(true);
    });
});

import EditSetPage from "@app/domains/sets/pages/EditSetPage.vue";
import ConfirmDialog from "@shared/components/ConfirmDialog.vue";
import DangerButton from "@shared/components/DangerButton.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
import LoadingState from "@shared/components/LoadingState.vue";
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
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
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

describe("EditSetPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentRouteId.value = 42;
    });

    it("should fetch set on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        shallowMount(EditSetPage);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/family-sets/42");
    });

    it("should render page title with set name", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(EditSetPage);
        await flushPromises();

        // Assert
        expect(wrapper.find("h1").text()).toBe("sets.editSet");
        expect(wrapper.text()).toContain("Millennium Falcon");
        expect(wrapper.text()).toContain("75192-1");
    });

    it("should populate form with existing data", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(EditSetPage);
        await flushPromises();

        // Assert
        const numberInput = wrapper.findComponent(NumberInput);
        expect(numberInput.props("modelValue")).toBe(2);

        const selectInput = wrapper.findComponent(SelectInput);
        expect(selectInput.props("modelValue")).toBe("built");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(EditSetPage);

        // Assert
        expect(wrapper.findComponent(LoadingState).exists()).toBe(true);
    });

    it("should submit update with correct payload", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        mockPatchRequest.mockResolvedValue({data: mockFamilySetResponse});
        const wrapper = shallowMount(EditSetPage);
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
        const wrapper = shallowMount(EditSetPage);
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
        const wrapper = shallowMount(EditSetPage);
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
        const wrapper = shallowMount(EditSetPage);
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

    it("should open confirm dialog when delete button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        const wrapper = shallowMount(EditSetPage);
        await flushPromises();

        // Act
        wrapper.findComponent(DangerButton).vm.$emit("click");
        await wrapper.vm.$nextTick();

        // Assert
        expect(wrapper.findComponent(ConfirmDialog).props("open")).toBe(true);
    });

    it("should delete set and navigate to overview on confirm", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        mockDeleteRequest.mockResolvedValue({});
        const wrapper = shallowMount(EditSetPage);
        await flushPromises();

        // Act
        wrapper.findComponent(DangerButton).vm.$emit("click");
        await wrapper.vm.$nextTick();
        wrapper.findComponent(ConfirmDialog).vm.$emit("confirm");
        await flushPromises();

        // Assert
        expect(mockDeleteRequest).toHaveBeenCalledWith("/family-sets/42");
        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });

    it("should close dialog when user cancels confirmation", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});
        const wrapper = shallowMount(EditSetPage);
        await flushPromises();

        // Act
        wrapper.findComponent(DangerButton).vm.$emit("click");
        await wrapper.vm.$nextTick();
        wrapper.findComponent(ConfirmDialog).vm.$emit("cancel");
        await wrapper.vm.$nextTick();

        // Assert
        expect(mockDeleteRequest).not.toHaveBeenCalled();
        expect(wrapper.findComponent(ConfirmDialog).props("open")).toBe(false);
    });

    it("should render save and delete buttons", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockFamilySetResponse});

        // Act
        const wrapper = shallowMount(EditSetPage);
        await flushPromises();

        // Assert
        const primaryButton = wrapper.findComponent(PrimaryButton);
        expect(primaryButton.text()).toBe("sets.save");

        const dangerButton = wrapper.findComponent(DangerButton);
        expect(dangerButton.exists()).toBe(true);
    });
});

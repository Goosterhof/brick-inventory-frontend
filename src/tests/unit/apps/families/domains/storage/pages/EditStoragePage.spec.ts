import EditStoragePage from "@app/domains/storage/pages/EditStoragePage.vue";
import ConfirmDialog from "@shared/components/ConfirmDialog.vue";
import DangerButton from "@shared/components/DangerButton.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import TextareaInput from "@shared/components/forms/inputs/TextareaInput.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
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
    mockCurrentRouteId: {value: 5},
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

const mockStorageOptionResponse = {
    id: 5,
    name: "Lade A",
    description: "Linkerla op plank 1",
    parent_id: null,
    row: 1,
    column: 2,
    child_ids: [6, 7],
};

describe("EditStoragePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentRouteId.value = 5;
    });

    it("should fetch storage option on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});

        // Act
        shallowMount(EditStoragePage);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/storage-options/5");
    });

    it("should render page title with storage name", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});

        // Act
        const wrapper = shallowMount(EditStoragePage);
        await flushPromises();

        // Assert
        expect(wrapper.find("h1").text()).toBe("storage.editStorage");
        expect(wrapper.text()).toContain("Lade A");
    });

    it("should populate form with existing data", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});

        // Act
        const wrapper = shallowMount(EditStoragePage);
        await flushPromises();

        // Assert
        const textInput = wrapper.findComponent(TextInput);
        expect(textInput.props("modelValue")).toBe("Lade A");

        const numberInputs = wrapper.findAllComponents(NumberInput);
        expect(numberInputs[0]?.props("modelValue")).toBe(1);
        expect(numberInputs[1]?.props("modelValue")).toBe(2);

        const textareaInput = wrapper.findComponent(TextareaInput);
        expect(textareaInput.props("modelValue")).toBe("Linkerla op plank 1");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(EditStoragePage);

        // Assert
        expect(wrapper.findComponent(LoadingState).exists()).toBe(true);
    });

    it("should submit update with correct payload", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});
        mockPatchRequest.mockResolvedValue({data: mockStorageOptionResponse});
        const wrapper = shallowMount(EditStoragePage);
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockPatchRequest).toHaveBeenCalledWith("/storage-options/5", {
            name: "Lade A",
            description: "Linkerla op plank 1",
            parent_id: null,
            row: 1,
            column: 2,
        });
    });

    it("should navigate to detail page on successful update", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});
        mockPatchRequest.mockResolvedValue({data: mockStorageOptionResponse});
        const wrapper = shallowMount(EditStoragePage);
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-detail", 5);
    });

    it("should not navigate on 422 validation error", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});
        const axiosError = new AxiosError("Validation failed");
        axiosError.response = {status: 422, data: {}, statusText: "", headers: {}, config: {} as never};
        mockPatchRequest.mockRejectedValue(axiosError);
        const wrapper = shallowMount(EditStoragePage);
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).not.toHaveBeenCalled();
    });

    it("should rethrow non-422 errors", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});
        const axiosError = new AxiosError("Server error");
        axiosError.response = {status: 500, data: {}, statusText: "", headers: {}, config: {} as never};
        mockPatchRequest.mockRejectedValue(axiosError);
        const wrapper = shallowMount(EditStoragePage);
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
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});
        const wrapper = shallowMount(EditStoragePage);
        await flushPromises();

        // Act
        wrapper.findComponent(DangerButton).vm.$emit("click");
        await wrapper.vm.$nextTick();

        // Assert
        expect(wrapper.findComponent(ConfirmDialog).props("open")).toBe(true);
    });

    it("should delete storage option and navigate to overview on confirm", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});
        mockDeleteRequest.mockResolvedValue({});
        const wrapper = shallowMount(EditStoragePage);
        await flushPromises();

        // Act
        wrapper.findComponent(DangerButton).vm.$emit("click");
        await wrapper.vm.$nextTick();
        wrapper.findComponent(ConfirmDialog).vm.$emit("confirm");
        await flushPromises();

        // Assert
        expect(mockDeleteRequest).toHaveBeenCalledWith("/storage-options/5");
        expect(mockGoToRoute).toHaveBeenCalledWith("storage");
    });

    it("should close dialog when user cancels confirmation", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});
        const wrapper = shallowMount(EditStoragePage);
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
        mockGetRequest.mockResolvedValue({data: mockStorageOptionResponse});

        // Act
        const wrapper = shallowMount(EditStoragePage);
        await flushPromises();

        // Assert
        const primaryButton = wrapper.findComponent(PrimaryButton);
        expect(primaryButton.text()).toBe("storage.save");

        const dangerButton = wrapper.findComponent(DangerButton);
        expect(dangerButton.exists()).toBe(true);
    });
});

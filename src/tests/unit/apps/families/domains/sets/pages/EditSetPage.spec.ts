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
import {ref} from "vue";

const {MockAxiosError} = vi.hoisted(() => {
    class MockAxiosError extends Error {
        response?: {status: number; data: unknown; statusText: string; headers: unknown; config: unknown};
    }
    return {MockAxiosError};
});

vi.mock("axios", () => ({
    isAxiosError: (e: unknown): boolean => e instanceof MockAxiosError,
    AxiosError: MockAxiosError,
    default: {create: vi.fn()},
}));

vi.mock("string-ts", () => ({deepCamelKeys: <T>(obj: T): T => obj, deepSnakeKeys: <T>(obj: T): T => obj}));

vi.mock("@phosphor-icons/vue", () => ({PhX: {template: "<i />"}}));

vi.mock("@shared/components/forms/FormError.vue", () => ({
    default: {name: "FormError", template: "<span />", props: ["error"]},
}));

vi.mock("@shared/components/forms/FormField.vue", () => ({
    default: {name: "FormField", template: "<div><slot /></div>"},
}));

vi.mock("@shared/components/forms/FormLabel.vue", () => ({
    default: {name: "FormLabel", template: "<label><slot /></label>", props: ["for"]},
}));

const {mockGetOrFailById, mockGoToRoute, mockCurrentRouteId, mockPatch, mockDelete} = vi.hoisted(() => ({
    mockGetOrFailById: vi.fn(),
    mockGoToRoute: vi.fn(),
    mockCurrentRouteId: {value: 42},
    mockPatch: vi.fn(),
    mockDelete: vi.fn(),
}));

vi.mock("@app/services", () => ({
    familyHttpService: {
        getRequest: vi.fn(),
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
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: mockGoToRoute, currentRouteId: mockCurrentRouteId},
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    familySetStoreModule: {
        getAll: {value: []},
        retrieveAll: vi.fn(),
        getById: vi.fn(),
        getOrFailById: mockGetOrFailById,
        generateNew: vi.fn(),
    },
    familyLoadingService: {isLoading: {value: false}},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

const createMockAdapted = () => ({
    id: 42,
    setId: 10,
    setNum: "75192-1",
    quantity: 2,
    status: "built" as const,
    purchaseDate: "2024-01-15",
    notes: "Birthday gift",
    set: {
        id: 10,
        setNum: "75192-1",
        name: "Millennium Falcon",
        year: 2017,
        theme: "Star Wars",
        numParts: 7541,
        imageUrl: "https://example.com/75192.jpg",
    },
    mutable: ref({
        setId: 10,
        setNum: "75192-1",
        quantity: 2,
        status: "built" as const,
        purchaseDate: "2024-01-15",
        notes: "Birthday gift",
    }),
    reset: vi.fn(),
    update: vi.fn(),
    patch: mockPatch,
    delete: mockDelete,
});

describe("EditSetPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentRouteId.value = 42;
    });

    it("should fetch set on mount", async () => {
        // Arrange
        mockGetOrFailById.mockResolvedValue(createMockAdapted());

        // Act
        shallowMount(EditSetPage);
        await flushPromises();

        // Assert
        expect(mockGetOrFailById).toHaveBeenCalledWith(42);
    });

    it("should render page title with set name", async () => {
        // Arrange
        mockGetOrFailById.mockResolvedValue(createMockAdapted());

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
        mockGetOrFailById.mockResolvedValue(createMockAdapted());

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
        mockGetOrFailById.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(EditSetPage);

        // Assert
        expect(wrapper.findComponent(LoadingState).exists()).toBe(true);
    });

    it("should submit update with correct payload", async () => {
        // Arrange
        mockGetOrFailById.mockResolvedValue(createMockAdapted());
        mockPatch.mockResolvedValue({});
        const wrapper = shallowMount(EditSetPage);
        await flushPromises();

        // Act
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        // Assert
        expect(mockPatch).toHaveBeenCalledWith({
            quantity: 2,
            status: "built",
            purchaseDate: "2024-01-15",
            notes: "Birthday gift",
        });
    });

    it("should navigate to detail page on successful update", async () => {
        // Arrange
        mockGetOrFailById.mockResolvedValue(createMockAdapted());
        mockPatch.mockResolvedValue({});
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
        mockGetOrFailById.mockResolvedValue(createMockAdapted());
        const axiosError = new AxiosError("Validation failed");
        axiosError.response = {status: 422, data: {}, statusText: "", headers: {}, config: {} as never};
        mockPatch.mockRejectedValue(axiosError);
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
        mockGetOrFailById.mockResolvedValue(createMockAdapted());
        const axiosError = new AxiosError("Server error");
        axiosError.response = {status: 500, data: {}, statusText: "", headers: {}, config: {} as never};
        mockPatch.mockRejectedValue(axiosError);
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
        mockGetOrFailById.mockResolvedValue(createMockAdapted());
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
        mockGetOrFailById.mockResolvedValue(createMockAdapted());
        mockDelete.mockResolvedValue(undefined);
        const wrapper = shallowMount(EditSetPage);
        await flushPromises();

        // Act
        wrapper.findComponent(DangerButton).vm.$emit("click");
        await wrapper.vm.$nextTick();
        wrapper.findComponent(ConfirmDialog).vm.$emit("confirm");
        await flushPromises();

        // Assert
        expect(mockDelete).toHaveBeenCalled();
        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });

    it("should close dialog when user cancels confirmation", async () => {
        // Arrange
        mockGetOrFailById.mockResolvedValue(createMockAdapted());
        const wrapper = shallowMount(EditSetPage);
        await flushPromises();

        // Act
        wrapper.findComponent(DangerButton).vm.$emit("click");
        await wrapper.vm.$nextTick();
        wrapper.findComponent(ConfirmDialog).vm.$emit("cancel");
        await wrapper.vm.$nextTick();

        // Assert
        expect(mockDelete).not.toHaveBeenCalled();
        expect(wrapper.findComponent(ConfirmDialog).props("open")).toBe(false);
    });

    it("should render save and delete buttons", async () => {
        // Arrange
        mockGetOrFailById.mockResolvedValue(createMockAdapted());

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

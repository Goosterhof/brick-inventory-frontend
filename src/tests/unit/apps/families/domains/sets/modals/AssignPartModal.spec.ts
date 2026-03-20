import AssignPartModal from "@app/domains/sets/modals/AssignPartModal.vue";
import NumberInput from "@shared/components/forms/inputs/NumberInput.vue";
import SelectInput from "@shared/components/forms/inputs/SelectInput.vue";
import ModalDialog from "@shared/components/ModalDialog.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

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

vi.mock("string-ts", () => ({deepCamelKeys: <T>(obj: T): T => obj, deepSnakeKeys: <T>(obj: T): T => obj}));

const {mockGetRequest, mockPostRequest} = vi.hoisted(() => ({mockGetRequest: vi.fn(), mockPostRequest: vi.fn()}));

vi.mock("@app/services", () => ({
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
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: vi.fn()},
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

const mockPart = {
    id: 1,
    quantity: 10,
    isSpare: false,
    elementId: "300101",
    part: {id: 10, partNum: "3001", name: "Brick 2 x 4", category: null, imageUrl: "https://example.com/3001.jpg"},
    color: {id: 1, name: "Red", rgb: "CC0000", isTransparent: false},
};

const mockStorageOptions = [
    {id: 1, name: "Drawer A", description: null, parent_id: null, row: null, column: null, child_ids: []},
    {id: 2, name: "Drawer B", description: null, parent_id: null, row: null, column: null, child_ids: []},
];

const mountModal = () => shallowMount(AssignPartModal, {props: {open: true, part: mockPart}});

describe("AssignPartModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetRequest.mockResolvedValue({data: mockStorageOptions});
    });

    it("should render modal dialog", async () => {
        // Arrange & Act
        const wrapper = mountModal();
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(ModalDialog).exists()).toBe(true);
        expect(wrapper.findComponent(ModalDialog).props("open")).toBe(true);
    });

    it("should display part info", async () => {
        // Arrange & Act
        const wrapper = mountModal();
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Brick 2 x 4");
        expect(wrapper.text()).toContain("3001");
        expect(wrapper.text()).toContain("Red");
    });

    it("should fetch storage options on mount", async () => {
        // Arrange & Act
        mountModal();
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/storage-options");
    });

    it("should render storage select with options", async () => {
        // Arrange & Act
        const wrapper = mountModal();
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(SelectInput).exists()).toBe(true);
        const options = wrapper.findAll("option");
        expect(options).toHaveLength(3);
        expect(options[1]?.text()).toBe("Drawer A");
        expect(options[2]?.text()).toBe("Drawer B");
    });

    it("should render quantity input", async () => {
        // Arrange & Act
        const wrapper = mountModal();
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(NumberInput).exists()).toBe(true);
    });

    it("should render assign button", async () => {
        // Arrange & Act
        const wrapper = mountModal();
        await flushPromises();

        // Assert
        const button = wrapper.findComponent(PrimaryButton);
        expect(button.text()).toBe("sets.assignPart");
    });

    it("should show loading while fetching storage options", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = mountModal();

        // Assert
        expect(wrapper.text()).toContain("common.loading");
    });

    describe("assign part", () => {
        it("should call assign endpoint with correct data", async () => {
            // Arrange
            mockPostRequest.mockResolvedValue({data: {}});
            const wrapper = mountModal();
            await flushPromises();

            await wrapper.findComponent(SelectInput).setValue("1");
            await wrapper.findComponent(NumberInput).setValue(5);

            // Act
            await wrapper.find("form").trigger("submit");
            await flushPromises();

            // Assert
            expect(mockPostRequest).toHaveBeenCalledWith("/storage-options/1/parts", {
                part_id: 10,
                color_id: 1,
                quantity: 5,
            });
        });

        it("should emit assigned and close on success", async () => {
            // Arrange
            mockPostRequest.mockResolvedValue({data: {}});
            const wrapper = mountModal();
            await flushPromises();

            await wrapper.findComponent(SelectInput).setValue("1");

            // Act
            await wrapper.find("form").trigger("submit");
            await flushPromises();

            // Assert
            expect(wrapper.emitted("assigned")).toBeTruthy();
            expect(wrapper.emitted("close")).toBeTruthy();
        });

        it("should show error on failure", async () => {
            // Arrange
            mockPostRequest.mockRejectedValue(new Error("Server error"));
            const wrapper = mountModal();
            await flushPromises();

            await wrapper.findComponent(SelectInput).setValue("1");

            // Act
            await wrapper.find("form").trigger("submit");
            await flushPromises();

            // Assert
            expect(wrapper.findComponent(SelectInput).props("error")).toBe("sets.assignError");
        });

        it("should emit close when modal is closed", async () => {
            // Arrange
            const wrapper = mountModal();
            await flushPromises();

            // Act
            wrapper.findComponent(ModalDialog).vm.$emit("close");

            // Assert
            expect(wrapper.emitted("close")).toBeTruthy();
        });
    });

    describe("smart sorter hint", () => {
        it("should show existing locations when part is already stored", async () => {
            // Arrange
            const existingLocations = [
                {partId: 10, colorId: 1, storageOptionId: 5, storageOptionName: "Drawer A", quantity: 8},
            ];
            const wrapper = shallowMount(AssignPartModal, {props: {open: true, part: mockPart, existingLocations}});
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("sets.alreadyStored");
            expect(wrapper.text()).toContain("Drawer A (8x)");
        });

        it("should not show hint when no existing locations", async () => {
            // Arrange
            const wrapper = mountModal();
            await flushPromises();

            // Assert
            expect(wrapper.text()).not.toContain("sets.alreadyStored");
        });
    });
});

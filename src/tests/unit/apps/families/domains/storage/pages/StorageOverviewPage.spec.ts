import StorageOverviewPage from "@app/domains/storage/pages/StorageOverviewPage.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import ListItemButton from "@shared/components/ListItemButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("axios", () => ({
    isAxiosError: (_e: unknown): boolean => false,
    AxiosError: Error,
    default: {create: vi.fn()},
}));

vi.mock("string-ts", () => ({deepCamelKeys: <T>(obj: T): T => obj, deepSnakeKeys: <T>(obj: T): T => obj}));

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

const mockStorageOption = {
    id: 1,
    name: "Lade A",
    description: "Linkerla op plank 1",
    parentId: null,
    row: 1,
    column: 2,
    childIds: [2],
};

const mockChildOption = {
    id: 2,
    name: "Lade A - Vak 1",
    description: null,
    parentId: 1,
    row: null,
    column: null,
    childIds: [],
};

describe("StorageOverviewPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render page title", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        const wrapper = shallowMount(StorageOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(PageHeader).props("title")).toBe("storage.title");
    });

    it("should fetch storage options on mount", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        shallowMount(StorageOverviewPage);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/storage-options");
    });

    it("should render storage option cards when options exist", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: [mockStorageOption]});

        // Act
        const wrapper = shallowMount(StorageOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Lade A");
        expect(wrapper.text()).toContain("Linkerla op plank 1");
        expect(wrapper.text()).toContain("storage.subLocationsCount");
        expect(wrapper.text()).toContain("storage.rowColumnLabel");
    });

    it("should show empty state when no storage options exist", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});

        // Act
        const wrapper = shallowMount(StorageOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(EmptyState).props("message")).toBe("storage.noStorage");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockGetRequest.mockReturnValue(new Promise(() => {}));

        // Act
        const wrapper = shallowMount(StorageOverviewPage);

        // Assert
        expect(wrapper.text()).toContain("common.loading");
    });

    it("should navigate to add page when add button is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: []});
        const wrapper = shallowMount(StorageOverviewPage);
        await flushPromises();

        // Act
        await wrapper.findComponent(PrimaryButton).trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-add");
    });

    it("should navigate to detail page when a storage card is clicked", async () => {
        // Arrange
        mockGetRequest.mockResolvedValue({data: [mockStorageOption]});
        const wrapper = shallowMount(StorageOverviewPage);
        await flushPromises();

        // Act
        wrapper.findComponent(ListItemButton).vm.$emit("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("storage-detail", 1);
    });

    it("should not show sub-locations badge when no children", async () => {
        // Arrange
        const optionWithoutChildren = {...mockStorageOption, childIds: []};
        mockGetRequest.mockResolvedValue({data: [optionWithoutChildren]});

        // Act
        const wrapper = shallowMount(StorageOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("storage.subLocationsCount");
    });

    it("should not show row and column when null", async () => {
        // Arrange
        const optionWithoutGrid = {...mockStorageOption, row: null, column: null};
        mockGetRequest.mockResolvedValue({data: [optionWithoutGrid]});

        // Act
        const wrapper = shallowMount(StorageOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("storage.rowColumnLabel");
    });

    it("should not show description when null", async () => {
        // Arrange
        const optionWithoutDescription = {...mockStorageOption, description: null};
        mockGetRequest.mockResolvedValue({data: [optionWithoutDescription]});

        // Act
        const wrapper = shallowMount(StorageOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).not.toContain("Linkerla op plank 1");
    });

    describe("tree view", () => {
        it("should show children indented under parent", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: [mockStorageOption, mockChildOption]});

            // Act
            const wrapper = shallowMount(StorageOverviewPage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Lade A");
            expect(wrapper.text()).toContain("Lade A - Vak 1");
            const listItems = wrapper.findAllComponents(ListItemButton);
            expect(listItems).toHaveLength(2);
        });

        it("should not show children at top level", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: [mockStorageOption, mockChildOption]});

            // Act
            const wrapper = shallowMount(StorageOverviewPage);
            await flushPromises();

            // Assert — only 1 top-level group, child is nested
            const topLevelDivs = wrapper.findAll("[m='l-8']");
            expect(topLevelDivs).toHaveLength(1);
        });
    });

    describe("search", () => {
        const mockStorageOptionB = {
            id: 2,
            name: "Lade B",
            description: "Rechterla op plank 1",
            parentId: null,
            row: 1,
            column: 3,
            childIds: [],
        };

        it("should filter storage by name", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: [mockStorageOption, mockStorageOptionB]});
            const wrapper = shallowMount(StorageOverviewPage);
            await flushPromises();

            // Act
            await wrapper.findComponent(TextInput).setValue("Lade B");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Lade B");
            expect(wrapper.text()).not.toContain("Lade A");
        });

        it("should filter storage by description", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: [mockStorageOption, mockStorageOptionB]});
            const wrapper = shallowMount(StorageOverviewPage);
            await flushPromises();

            // Act
            await wrapper.findComponent(TextInput).setValue("Rechterla");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Lade B");
            expect(wrapper.text()).not.toContain("Lade A");
        });

        it("should show no results when search matches nothing", async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: [mockStorageOption]});
            const wrapper = shallowMount(StorageOverviewPage);
            await flushPromises();

            // Act
            await wrapper.findComponent(TextInput).setValue("nonexistent");
            await flushPromises();

            // Assert
            const emptyStates = wrapper.findAllComponents(EmptyState);
            const noResults = emptyStates.find((e) => e.props("message") === "common.noResults");
            expect(noResults?.exists()).toBe(true);
        });
    });
});

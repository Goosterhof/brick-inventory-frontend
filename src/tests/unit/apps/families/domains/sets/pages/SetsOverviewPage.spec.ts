import SetsOverviewPage from "@app/domains/sets/pages/SetsOverviewPage.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import FilterChip from "@shared/components/FilterChip.vue";
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

vi.mock("@shared/components/forms/FormError.vue", () => ({
    default: {name: "FormError", template: "<span />", props: ["error"]},
}));

vi.mock("@shared/components/forms/FormField.vue", () => ({
    default: {name: "FormField", template: "<div><slot /></div>"},
}));

vi.mock("@shared/components/forms/FormLabel.vue", () => ({
    default: {name: "FormLabel", template: "<label><slot /></label>", props: ["for"]},
}));

vi.mock("@shared/components/BadgeLabel.vue", () => ({
    default: {name: "BadgeLabel", template: "<span><slot /></span>", props: ["variant"]},
}));

vi.mock("@shared/components/EmptyState.vue", () => ({
    default: {name: "EmptyState", template: "<span><slot /></span>", props: ["message"]},
}));

vi.mock("@shared/components/FilterChip.vue", () => ({
    default: {name: "FilterChip", template: "<button @click='$emit(\"click\")'><slot /></button>", props: ["selected"]},
}));

vi.mock("@shared/components/forms/inputs/TextInput.vue", () => ({
    default: {
        name: "TextInput",
        template: "<input @input='$emit(\"update:modelValue\", $event.target.value)' />",
        props: ["modelValue"],
    },
}));

vi.mock("@shared/components/ListItemButton.vue", () => ({
    default: {name: "ListItemButton", template: "<div @click='$emit(\"click\")'><slot /></div>", props: ["variant"]},
}));

vi.mock("@shared/components/PageHeader.vue", () => ({
    default: {name: "PageHeader", template: "<header><h1>{{ title }}</h1><slot /></header>", props: ["title"]},
}));

vi.mock("@shared/components/PrimaryButton.vue", () => ({
    default: {
        name: "PrimaryButton",
        template: "<button @click='$emit(\"click\")'><slot /></button>",
        props: ["variant"],
    },
}));

vi.mock("@shared/helpers/csv", () => ({downloadCsv: vi.fn(), toCsv: vi.fn()}));

const {mockRetrieveAll, mockGoToRoute, mockAllItems, mockIsLoading} = await vi.hoisted(async () => {
    const {ref} = await import("vue");
    return {
        mockRetrieveAll: vi.fn(),
        mockGoToRoute: vi.fn(),
        mockAllItems: ref<unknown[]>([]),
        mockIsLoading: ref(false),
    };
});

vi.mock("@app/services", async () => {
    const {computed} = await import("vue");

    return {
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
        familyRouterService: {goToDashboard: vi.fn(), goToRoute: mockGoToRoute},
        familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
        familyLoadingService: {isLoading: computed(() => mockIsLoading.value)},
        FamilyRouterView: {template: "<div><slot /></div>"},
        FamilyRouterLink: {template: "<a><slot /></a>"},
    };
});

vi.mock("@app/stores", async () => {
    const {computed} = await import("vue");

    return {
        familySetStoreModule: {
            getAll: computed(() => mockAllItems.value),
            retrieveAll: mockRetrieveAll,
            getById: vi.fn(),
            getOrFailById: vi.fn(),
            generateNew: vi.fn(),
        },
    };
});

const mockAdaptedSet = {
    id: 1,
    setId: 10,
    setNum: "75192-1",
    quantity: 2,
    status: "built" as const,
    purchaseDate: "2024-01-15",
    notes: "Test notes",
    set: {
        id: 10,
        setNum: "75192-1",
        name: "Millennium Falcon",
        year: 2017,
        theme: "Star Wars",
        numParts: 7541,
        imageUrl: "https://example.com/75192.jpg",
    },
};

describe("SetsOverviewPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAllItems.value = [];
        mockIsLoading.value = false;
        mockRetrieveAll.mockResolvedValue(undefined);
    });

    it("should render page title", async () => {
        // Arrange & Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(PageHeader).props("title")).toBe("sets.title");
    });

    it("should call retrieveAll on mount", async () => {
        // Arrange & Act
        shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(mockRetrieveAll).toHaveBeenCalled();
    });

    it("should render set cards when sets exist", async () => {
        // Arrange
        mockAllItems.value = [mockAdaptedSet];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Millennium Falcon");
        expect(wrapper.text()).toContain("75192-1");
        expect(wrapper.text()).toContain("sets.built");
        expect(wrapper.text()).toContain("2x");
    });

    it("should show empty state when no sets exist", async () => {
        // Arrange
        mockAllItems.value = [];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(EmptyState).props("message")).toBe("sets.noSets");
    });

    it("should show loading state initially", () => {
        // Arrange
        mockIsLoading.value = true;

        // Act
        const wrapper = shallowMount(SetsOverviewPage);

        // Assert
        expect(wrapper.text()).toContain("common.loading");
    });

    it("should navigate to scan page when scan button is clicked", async () => {
        // Arrange
        mockAllItems.value = [];
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Act
        const scanButton = wrapper.findAllComponents(PrimaryButton).find((btn) => btn.text() === "sets.scanSet");
        await scanButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-scan");
    });

    it("should navigate to add page when add button is clicked", async () => {
        // Arrange
        mockAllItems.value = [];
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Act
        const addButton = wrapper.findAllComponents(PrimaryButton).find((btn) => btn.text() === "sets.addSet");
        await addButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-add");
    });

    it("should navigate to detail page when a set card is clicked", async () => {
        // Arrange
        mockAllItems.value = [mockAdaptedSet];
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Act
        wrapper.findComponent(ListItemButton).vm.$emit("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets-detail", 1);
    });

    it("should render set image when available", async () => {
        // Arrange
        mockAllItems.value = [mockAdaptedSet];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        const img = wrapper.find("img");
        expect(img.exists()).toBe(true);
        expect(img.attributes("src")).toBe("https://example.com/75192.jpg");
        expect(img.attributes("alt")).toBe("Millennium Falcon");
    });

    it("should render placeholder when image is not available", async () => {
        // Arrange
        const setWithoutImage = {...mockAdaptedSet, set: {...mockAdaptedSet.set, imageUrl: null}};
        mockAllItems.value = [setWithoutImage];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.find("img").exists()).toBe(false);
        expect(wrapper.text()).toContain("common.noImage");
    });

    describe("search and filter", () => {
        const mockSealedSet = {
            id: 2,
            setId: 20,
            setNum: "10294-1",
            quantity: 1,
            status: "sealed" as const,
            purchaseDate: null,
            notes: null,
            set: {
                id: 20,
                setNum: "10294-1",
                name: "Titanic",
                year: 2021,
                theme: "Creator Expert",
                numParts: 9090,
                imageUrl: null,
            },
        };

        it("should filter sets by search query", async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet, mockSealedSet];
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Act
            await wrapper.findComponent(TextInput).setValue("Titanic");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Titanic");
            expect(wrapper.text()).not.toContain("Millennium Falcon");
        });

        it("should filter sets by set number", async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet, mockSealedSet];
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Act
            await wrapper.findComponent(TextInput).setValue("75192");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Millennium Falcon");
            expect(wrapper.text()).not.toContain("Titanic");
        });

        it("should filter sets by status", async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet, mockSealedSet];
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Act — click "sealed" status filter
            const sealedChip = wrapper.findAllComponents(FilterChip).find((chip) => chip.text() === "sets.sealed");
            sealedChip?.vm.$emit("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Titanic");
            expect(wrapper.text()).not.toContain("Millennium Falcon");
        });

        it("should toggle status filter off when clicked again", async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet, mockSealedSet];
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Act — click sealed, then click sealed again
            const sealedChip = wrapper.findAllComponents(FilterChip).find((chip) => chip.text() === "sets.sealed");
            sealedChip?.vm.$emit("click");
            sealedChip?.vm.$emit("click");
            await flushPromises();

            // Assert — both sets visible
            expect(wrapper.text()).toContain("Millennium Falcon");
            expect(wrapper.text()).toContain("Titanic");
        });

        it("should show no results when search matches nothing", async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet];
            const wrapper = shallowMount(SetsOverviewPage);
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

    it("should show export button when sets exist", async () => {
        // Arrange
        mockAllItems.value = [mockAdaptedSet];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        const exportButton = wrapper.findAllComponents(PrimaryButton).find((btn) => btn.text() === "common.export");
        expect(exportButton?.exists()).toBe(true);
    });

    it("should not show export button when no sets exist", async () => {
        // Arrange
        mockAllItems.value = [];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        const exportButton = wrapper.findAllComponents(PrimaryButton).find((btn) => btn.text() === "common.export");
        expect(exportButton).toBeUndefined();
    });
});

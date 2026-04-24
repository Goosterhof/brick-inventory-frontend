import type {ComponentPublicInstance} from 'vue';

import SetsOverviewPage from '@app/domains/sets/pages/SetsOverviewPage.vue';
import {flushPromises, shallowMount} from '@vue/test-utils';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const {
    createMockAxios,
    createMockFsHelpers,
    createMockStringTs,
    createMockFamilyServices,
    createMockFamilyStores,
    createMockFormField,
    createMockFormLabel,
    createMockFormError,
} = await vi.hoisted(() => import('../../../../../../helpers'));

vi.mock('axios', () => createMockAxios());
vi.mock('string-ts', () => createMockStringTs());
vi.mock('@script-development/fs-helpers', () => createMockFsHelpers());

vi.mock('@shared/components/forms/FormError.vue', () => createMockFormError());
vi.mock('@shared/components/forms/FormField.vue', () => createMockFormField());
vi.mock('@shared/components/forms/FormLabel.vue', () => createMockFormLabel());

vi.mock('@phosphor-icons/vue', () => ({PhCaretRight: {template: '<i />', props: ['size', 'weight']}}));

vi.mock('@shared/components/BadgeLabel.vue', () => ({
    default: {name: 'BadgeLabel', template: '<span><slot /></span>', props: ['variant']},
}));

vi.mock('@shared/components/CollapsibleSection.vue', () => ({
    default: {
        name: 'CollapsibleSection',
        template: '<div @click=\'$emit("toggle")\'><slot /></div>',
        props: ['title', 'count', 'expanded'],
    },
}));

vi.mock('@shared/components/EmptyState.vue', () => ({
    default: {name: 'EmptyState', template: '<span><slot /></span>', props: ['message']},
}));

vi.mock('@shared/components/FilterChip.vue', () => ({
    default: {name: 'FilterChip', template: '<button @click=\'$emit("click")\'><slot /></button>', props: ['active']},
}));

vi.mock('@shared/components/forms/inputs/TextInput.vue', () => ({
    default: {
        name: 'TextInput',
        template: '<input @input=\'$emit("update:modelValue", $event.target.value)\' />',
        props: ['modelValue'],
    },
}));

vi.mock('@shared/components/ListItemButton.vue', () => ({
    default: {name: 'ListItemButton', template: '<div @click=\'$emit("click")\'><slot /></div>', props: ['variant']},
}));

vi.mock('@shared/components/PageHeader.vue', () => ({
    default: {name: 'PageHeader', template: '<header><h1>{{ title }}</h1><slot /></header>', props: ['title']},
}));

vi.mock('@shared/components/PrimaryButton.vue', () => ({
    default: {
        name: 'PrimaryButton',
        template: '<button @click=\'$emit("click")\'><slot /></button>',
        props: ['variant'],
    },
}));

vi.mock('@shared/helpers/csv', () => ({downloadCsv: vi.fn<() => void>(), toCsv: vi.fn<() => string>()}));

vi.mock('@app/domains/sets/components/CompletionGauge.vue', () => ({
    default: {
        name: 'CompletionGauge',
        template: "<span data-test='completion-gauge'>{{ percentage }}</span>",
        props: ['percentage', 'unknownLabel'],
    },
}));

const {mockRetrieveAll, mockGoToRoute, mockAllItems, mockIsLoading, mockGetRequest} = await vi.hoisted(async () => {
    const {ref} = await import('vue');
    return {
        mockRetrieveAll: vi.fn<() => Promise<void>>(),
        mockGoToRoute: vi.fn<() => Promise<void>>(),
        mockAllItems: ref<unknown[]>([]),
        mockIsLoading: ref(false),
        mockGetRequest: vi.fn<() => Promise<unknown>>(),
    };
});

vi.mock('@app/services', async () => {
    const {computed} = await import('vue');

    return createMockFamilyServices({
        familyAuthService: {isLoggedIn: {value: true}},
        familyHttpService: {getRequest: mockGetRequest},
        familyRouterService: {goToRoute: mockGoToRoute},
        familyLoadingService: {isLoading: computed(() => mockIsLoading.value)},
    });
});

vi.mock('@app/stores', async () => {
    const {computed} = await import('vue');

    return createMockFamilyStores({
        familySetStoreModule: {
            getAll: computed(() => mockAllItems.value),
            retrieveAll: mockRetrieveAll,
            getById: vi.fn<() => unknown>(),
            getOrFailById: vi.fn<() => Promise<unknown>>(),
            generateNew: vi.fn<() => unknown>(),
        },
    });
});

const mockAdaptedSet = {
    id: 1,
    setId: 10,
    setNum: '75192-1',
    quantity: 2,
    status: 'built' as const,
    purchaseDate: '2024-01-15',
    notes: 'Test notes',
    set: {
        id: 10,
        setNum: '75192-1',
        name: 'Millennium Falcon',
        year: 2017,
        theme: 'Star Wars',
        numParts: 7541,
        imageUrl: 'https://example.com/75192.jpg',
    },
};

describe('SetsOverviewPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAllItems.value = [];
        mockIsLoading.value = false;
        mockRetrieveAll.mockResolvedValue(undefined);
        mockGetRequest.mockResolvedValue({data: []});
    });

    it('should render page title', async () => {
        // Arrange & Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent({name: 'PageHeader'}).props('title')).toBe('sets.title');
    });

    it('should call retrieveAll on mount', async () => {
        // Arrange & Act
        shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(mockRetrieveAll).toHaveBeenCalled();
    });

    it('should render set cards when sets exist', async () => {
        // Arrange
        mockAllItems.value = [mockAdaptedSet];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain('Millennium Falcon');
        expect(wrapper.text()).toContain('75192-1');
        expect(wrapper.text()).toContain('sets.built');
        expect(wrapper.text()).toContain('2x');
    });

    it('should show empty state when no sets exist', async () => {
        // Arrange
        mockAllItems.value = [];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent({name: 'EmptyState'}).props('message')).toBe('sets.noSets');
    });

    it('should show loading state initially', () => {
        // Arrange
        mockIsLoading.value = true;

        // Act
        const wrapper = shallowMount(SetsOverviewPage);

        // Assert
        expect(wrapper.text()).toContain('common.loading');
    });

    it('should navigate to scan page when scan button is clicked', async () => {
        // Arrange
        mockAllItems.value = [];
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Act
        const scanButton = wrapper
            .findAllComponents({name: 'PrimaryButton'})
            .find((btn) => btn.text() === 'sets.scanSet');
        await scanButton?.trigger('click');
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith('sets-scan');
    });

    it('should navigate to add page when add button is clicked', async () => {
        // Arrange
        mockAllItems.value = [];
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Act
        const addButton = wrapper
            .findAllComponents({name: 'PrimaryButton'})
            .find((btn) => btn.text() === 'sets.addSet');
        await addButton?.trigger('click');
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith('sets-add');
    });

    it('should navigate to detail page when a set card is clicked', async () => {
        // Arrange
        mockAllItems.value = [mockAdaptedSet];
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Act
        (wrapper.findComponent({name: 'ListItemButton'}).vm as ComponentPublicInstance).$emit('click');
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith('sets-detail', 1);
    });

    it('should render set image when available', async () => {
        // Arrange
        mockAllItems.value = [mockAdaptedSet];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBe('https://example.com/75192.jpg');
        expect(img.attributes('alt')).toBe('Millennium Falcon');
    });

    it('should render placeholder when image is not available', async () => {
        // Arrange
        const setWithoutImage = {...mockAdaptedSet, set: {...mockAdaptedSet.set, imageUrl: null}};
        mockAllItems.value = [setWithoutImage];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.find('img').exists()).toBe(false);
        expect(wrapper.text()).toContain('common.noImage');
    });

    describe('search and filter', () => {
        const mockSealedSet = {
            id: 2,
            setId: 20,
            setNum: '10294-1',
            quantity: 1,
            status: 'sealed' as const,
            purchaseDate: null,
            notes: null,
            set: {
                id: 20,
                setNum: '10294-1',
                name: 'Titanic',
                year: 2021,
                theme: 'Creator Expert',
                numParts: 9090,
                imageUrl: null,
            },
        };

        it('should filter sets by search query', async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet, mockSealedSet];
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Act
            await wrapper.findComponent({name: 'TextInput'}).setValue('Titanic');
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain('Titanic');
            expect(wrapper.text()).not.toContain('Millennium Falcon');
        });

        it('should filter sets by set number', async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet, mockSealedSet];
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Act
            await wrapper.findComponent({name: 'TextInput'}).setValue('75192');
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain('Millennium Falcon');
            expect(wrapper.text()).not.toContain('Titanic');
        });

        it('should filter sets by status', async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet, mockSealedSet];
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Act — click "sealed" status filter
            const sealedChip = wrapper
                .findAllComponents({name: 'FilterChip'})
                .find((chip) => chip.text() === 'sets.sealed');
            await sealedChip?.trigger('click');
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain('Titanic');
            expect(wrapper.text()).not.toContain('Millennium Falcon');
        });

        it('should toggle status filter off when clicked again', async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet, mockSealedSet];
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Act — click sealed, then click sealed again
            const sealedChip = wrapper
                .findAllComponents({name: 'FilterChip'})
                .find((chip) => chip.text() === 'sets.sealed');
            await sealedChip?.trigger('click');
            await sealedChip?.trigger('click');
            await flushPromises();

            // Assert — both sets visible
            expect(wrapper.text()).toContain('Millennium Falcon');
            expect(wrapper.text()).toContain('Titanic');
        });

        it('should show no results when search matches nothing', async () => {
            // Arrange
            mockAllItems.value = [mockAdaptedSet];
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Act
            await wrapper.findComponent({name: 'TextInput'}).setValue('nonexistent');
            await flushPromises();

            // Assert
            const emptyStates = wrapper.findAllComponents({name: 'EmptyState'});
            const noResults = emptyStates.find((e) => e.props('message') === 'common.noResults');
            expect(noResults?.exists()).toBe(true);
        });
    });

    it('should show export button when sets exist', async () => {
        // Arrange
        mockAllItems.value = [mockAdaptedSet];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        const exportButton = wrapper
            .findAllComponents({name: 'PrimaryButton'})
            .find((btn) => btn.text() === 'common.export');
        expect(exportButton?.exists()).toBe(true);
    });

    it('should not show export button when no sets exist', async () => {
        // Arrange
        mockAllItems.value = [];

        // Act
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        const exportButton = wrapper
            .findAllComponents({name: 'PrimaryButton'})
            .find((btn) => btn.text() === 'common.export');
        expect(exportButton).toBeUndefined();
    });

    it('should display set without set summary using setNum', async () => {
        // Arrange
        const setWithoutSummary = {
            id: 8,
            setId: 80,
            setNum: '99999-1',
            quantity: 1,
            status: 'wishlist' as const,
            purchaseDate: null,
            notes: null,
        };
        mockAllItems.value = [setWithoutSummary];
        const wrapper = shallowMount(SetsOverviewPage);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain('99999-1');
    });

    describe('completion gauge', () => {
        const mockWishlistSet = {
            id: 5,
            setId: 50,
            setNum: '11111-1',
            quantity: 1,
            status: 'wishlist' as const,
            purchaseDate: null,
            notes: null,
            set: {
                id: 50,
                setNum: '11111-1',
                name: 'Wishlist Dreams',
                year: 2023,
                theme: 'Star Wars',
                numParts: 1000,
                imageUrl: null,
            },
        };

        it('should fetch completion data on mount', async () => {
            // Arrange & Act
            shallowMount(SetsOverviewPage);
            await flushPromises();

            // Assert
            expect(mockGetRequest).toHaveBeenCalledWith('/family-sets/completion');
        });

        it('should show loading placeholder for non-wishlist sets while completion is loading', () => {
            // Arrange — getRequest never resolves, completion stays loading
            mockGetRequest.mockReturnValue(new Promise(() => {}));
            mockAllItems.value = [mockAdaptedSet];

            // Act
            const wrapper = shallowMount(SetsOverviewPage);

            // Assert
            expect(wrapper.find("[aria-label='set-completion-loading']").exists()).toBe(true);
            expect(wrapper.findComponent({name: 'CompletionGauge'}).exists()).toBe(false);
        });

        it('should render a completion gauge with the matching percentage once data loads', async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({
                data: [{familySetId: 1, setNum: '75192-1', totalParts: 100, storedParts: 78, percentage: 78}],
            });
            mockAllItems.value = [mockAdaptedSet];

            // Act
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Assert
            const gauge = wrapper.findComponent({name: 'CompletionGauge'});
            expect(gauge.exists()).toBe(true);
            expect(gauge.props('percentage')).toBe(78);
            expect(gauge.props('unknownLabel')).toBe('sets.completionUnknown');
        });

        it('should pass null percentage to the gauge when a set has no completion entry', async () => {
            // Arrange — backend returns nothing for this set (parts never fetched)
            mockGetRequest.mockResolvedValue({data: []});
            mockAllItems.value = [mockAdaptedSet];

            // Act
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Assert
            const gauge = wrapper.findComponent({name: 'CompletionGauge'});
            expect(gauge.props('percentage')).toBeNull();
        });

        it('should not render a completion gauge for wishlist sets', async () => {
            // Arrange
            mockGetRequest.mockResolvedValue({data: []});
            mockAllItems.value = [mockWishlistSet];

            // Act
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Assert
            expect(wrapper.findComponent({name: 'CompletionGauge'}).exists()).toBe(false);
            expect(wrapper.find("[aria-label='set-completion-loading']").exists()).toBe(false);
        });

        it('should stop showing the loading placeholder even when completion fetch fails', async () => {
            // Arrange — completion request rejects; page must still render gauges with null data
            mockGetRequest.mockRejectedValue(new Error('network down'));
            mockAllItems.value = [mockAdaptedSet];

            // Act
            const wrapper = shallowMount(SetsOverviewPage);
            await flushPromises();

            // Assert — the page swallows the error; loading flips off and a null-percentage gauge renders
            expect(wrapper.find("[aria-label='set-completion-loading']").exists()).toBe(false);
            const gauge = wrapper.findComponent({name: 'CompletionGauge'});
            expect(gauge.exists()).toBe(true);
            expect(gauge.props('percentage')).toBeNull();
        });
    });
});

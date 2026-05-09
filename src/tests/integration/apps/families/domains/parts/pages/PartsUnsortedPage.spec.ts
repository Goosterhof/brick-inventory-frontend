import PartsUnsortedPage from '@app/domains/parts/pages/PartsUnsortedPage.vue';
import {mockServer} from '@integration/helpers/mock-server';
import BackButton from '@shared/components/BackButton.vue';
import EmptyState from '@shared/components/EmptyState.vue';
import FilterChip from '@shared/components/FilterChip.vue';
import TextInput from '@shared/components/forms/inputs/TextInput.vue';
import PageHeader from '@shared/components/PageHeader.vue';
import PartListItem from '@shared/components/PartListItem.vue';
import PrimaryButton from '@shared/components/PrimaryButton.vue';
import {flushPromises, mount} from '@vue/test-utils';
import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@script-development/fs-http', async () => {
    const {mockHttpService} = await import('@integration/helpers/mock-server');
    return {createHttpService: () => mockHttpService};
});

/** CSV helpers don't run in happy-dom — mock to prevent file system access. */
vi.mock('@shared/helpers/csv', () => ({downloadCsv: vi.fn<() => void>(), toCsv: vi.fn<() => string>(() => '')}));

/**
 * Snake_case fixture mirroring the real `/family-sets/missing-parts` payload —
 * same endpoint as the missing-parts page. The shortfall field is reframed
 * here as "parts to place" for an owned-but-unsorted set.
 */
const makeEntry = (overrides: Record<string, unknown> = {}) => ({
    part_num: '3001',
    color_id: 4,
    part_name: 'Brick 2x4',
    color_name: 'Red',
    color_hex: 'C91A09',
    part_image_url: 'https://example.com/3001.jpg',
    quantity_needed: 10,
    quantity_stored: 3,
    shortfall: 7,
    needed_by_set_nums: ['75313-1', '10497-1'],
    ...overrides,
});

const makePayload = (entries: Record<string, unknown>[] = [], unknownFamilySetIds: string[] = []) => ({
    shortfalls: entries,
    unknown_family_set_ids: unknownFamilySetIds,
});

const URL_UNSORTED = '/family-sets/missing-parts';

describe('PartsUnsortedPage — integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockServer.reset();
        localStorage.clear();
    });

    it('renders the empty state with the real EmptyState when nothing is left to place', async () => {
        mockServer.onGet(URL_UNSORTED, makePayload([]));

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        const empty = wrapper.findComponent(EmptyState);
        expect(empty.exists()).toBe(true);
        expect(empty.text()).toContain("Everything's been placed in storage");
    });

    it('renders the PageHeader with the placement-framing translated title', async () => {
        mockServer.onGet(URL_UNSORTED, makePayload([makeEntry()]));

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        expect(wrapper.findComponent(PageHeader).find('h1').text()).toBe('Parts to Place');
    });

    it('renders a PartListItem per entry with the shortfall as the to-place quantity', async () => {
        mockServer.onGet(URL_UNSORTED, makePayload([makeEntry({shortfall: 4, part_name: 'Plate 1x2'})]));

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        const items = wrapper.findAllComponents(PartListItem);
        expect(items).toHaveLength(1);
        const item = items.find((p) => p.props('name') === 'Plate 1x2');
        expect(item).toBeDefined();
        expect(item?.props('quantity')).toBe(4);
    });

    it('shows the unknown-sets callout when the backend reports unsynced sets', async () => {
        mockServer.onGet(URL_UNSORTED, makePayload([makeEntry()], ['42', '43']));

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        const callout = wrapper.find("[data-testid='unsorted-unknown-sets']");
        expect(callout.exists()).toBe(true);
        expect(callout.attributes('data-unknown-count')).toBe('2');
    });

    it('surfaces the non-intrusive error banner on fetch failure', async () => {
        // Register no route — the mock server rejects unregistered GETs.
        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        expect(wrapper.find("[data-testid='unsorted-error']").exists()).toBe(true);
    });

    it('wires the BackButton and CSV export button as real PrimaryButton components (no BrickLink export)', async () => {
        mockServer.onGet(URL_UNSORTED, makePayload([makeEntry()]));

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        const back = wrapper.findComponent(BackButton);
        expect(back.exists()).toBe(true);

        const buttonLabels = wrapper.findAllComponents(PrimaryButton).map((b) => b.text());
        expect(buttonLabels).toContain('Export CSV');
        // Buying-only export must not bleed into the placement page.
        expect(buttonLabels).not.toContain('Export BrickLink wanted list');
    });

    it('renders the placement-oriented sort and search FilterChips as real components', async () => {
        mockServer.onGet(URL_UNSORTED, makePayload([makeEntry()]));

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        const chipTexts = wrapper.findAllComponents(FilterChip).map((c) => c.text());
        expect(chipTexts).toContain('Most to place');
        expect(chipTexts).toContain('Part name');
        expect(chipTexts).toContain('Color');
    });

    it('filters the PartListItem list when a search term is entered', async () => {
        mockServer.onGet(
            URL_UNSORTED,
            makePayload([
                makeEntry({part_name: 'Brick 2x4', part_num: '3001'}),
                makeEntry({part_name: 'Plate 1x2', part_num: '3023'}),
            ]),
        );

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        expect(wrapper.findAllComponents(PartListItem)).toHaveLength(2);

        await wrapper.findComponent(TextInput).setValue('Plate');
        await flushPromises();

        const items = wrapper.findAllComponents(PartListItem);
        expect(items).toHaveLength(1);
        const onlyPlate = items.find((i) => i.props('name') === 'Plate 1x2');
        expect(onlyPlate).toBeDefined();
    });

    it('reorders PartListItems when a sort FilterChip is clicked', async () => {
        mockServer.onGet(
            URL_UNSORTED,
            makePayload([
                makeEntry({part_name: 'Brick 2x4', part_num: '3001', shortfall: 9}),
                makeEntry({part_name: 'Axle 2', part_num: '3705', shortfall: 2}),
            ]),
        );

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        // Default sort: shortfall descending — Brick 2x4 (9) first.
        const namesByShortfall = wrapper.findAllComponents(PartListItem).map((i) => i.props('name'));
        expect(namesByShortfall).toStrictEqual(['Brick 2x4', 'Axle 2']);

        const nameChip = wrapper.findAllComponents(FilterChip).find((c) => c.text() === 'Part name');
        await nameChip?.find('button').trigger('click');
        await flushPromises();

        // After switching to name sort: Axle 2 < Brick 2x4 alphabetically.
        const namesByName = wrapper.findAllComponents(PartListItem).map((i) => i.props('name'));
        expect(namesByName).toStrictEqual(['Axle 2', 'Brick 2x4']);
    });

    it('navigates back to /parts via the BackButton', async () => {
        mockServer.onGet(URL_UNSORTED, makePayload([makeEntry()]));

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        await wrapper.findComponent(BackButton).find('button').trigger('click');
        await flushPromises();

        const {familyRouterService} = await import('@app/services');
        expect(familyRouterService.getUrlForRouteName('parts')).toBe('/parts');
    });

    it('renders the unknown-sets callout when shortfalls is empty but unknown sets are present', async () => {
        mockServer.onGet(URL_UNSORTED, makePayload([], ['11', '12']));

        const wrapper = mount(PartsUnsortedPage);
        await flushPromises();

        expect(wrapper.find("[data-testid='unsorted-unknown-sets']").exists()).toBe(true);
        expect(wrapper.findComponent(EmptyState).exists()).toBe(false);
    });
});

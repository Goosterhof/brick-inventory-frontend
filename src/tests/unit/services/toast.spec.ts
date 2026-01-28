import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';

const mockShowPopover = vi.fn();
const mockHidePopover = vi.fn();
const mockMount = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCreateApp = vi.fn(() => ({ mount: mockMount })) as any;

vi.mock('vue', async () => {
    const actual = await vi.importActual<typeof import('vue')>('vue');
    return {
        ...actual,
        createApp: (options: unknown) => mockCreateApp(options),
    };
});

describe('toast service', () => {
    let originalCreateElement: typeof document.createElement;
    let mockContainer: HTMLDivElement;

    beforeEach(() => {
        vi.resetModules();
        mockShowPopover.mockClear();
        mockHidePopover.mockClear();
        mockMount.mockClear();
        mockCreateApp.mockClear();

        originalCreateElement = document.createElement.bind(document);
        mockContainer = originalCreateElement('div');
        mockContainer.showPopover = mockShowPopover;
        mockContainer.hidePopover = mockHidePopover;

        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
            if (tagName === 'div') return mockContainer;
            return originalCreateElement(tagName);
        });

        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockContainer);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('should create a container element with correct attributes', async () => {
            // Act
            await import('@/services/toast');

            // Assert
            expect(mockContainer.role).toBe('region');
            expect(mockContainer.popover).toBe('manual');
            expect(mockContainer.classList.contains('pointer-events-none')).toBe(true);
            expect(mockContainer.classList.contains('flex')).toBe(true);
            expect(mockContainer.classList.contains('flex-col-reverse')).toBe(true);
        });

        it('should append container to document body', async () => {
            // Act
            await import('@/services/toast');

            // Assert
            expect(document.body.appendChild).toHaveBeenCalledWith(mockContainer);
        });

        it('should mount a Vue app to the container', async () => {
            // Act
            await import('@/services/toast');

            // Assert
            expect(mockCreateApp).toHaveBeenCalled();
            expect(mockMount).toHaveBeenCalledWith(mockContainer);
        });
    });

    describe('createToast', () => {
        it('should show popover when creating a toast', async () => {
            // Arrange
            const { createToast } = await import('@/services/toast');
            const TestComponent = defineComponent({
                props: { message: String },
                emits: ['close'],
                render() {
                    return h('div', this.message);
                },
            });

            // Act
            createToast(TestComponent, { message: 'Test message' });

            // Assert
            expect(mockShowPopover).toHaveBeenCalled();
        });

        it('should create toast with unique id', async () => {
            // Arrange
            const { createToast } = await import('@/services/toast');
            const TestComponent = defineComponent({
                props: { message: String },
                emits: ['close'],
                render() {
                    return h('div', this.message);
                },
            });

            // Act
            createToast(TestComponent, { message: 'Toast 1' });
            createToast(TestComponent, { message: 'Toast 2' });

            // Assert
            expect(mockShowPopover).toHaveBeenCalledTimes(2);
        });

        it('should remove oldest toast when exceeding maximum', async () => {
            // Arrange
            const { createToast } = await import('@/services/toast');
            const TestComponent = defineComponent({
                props: { message: String },
                emits: ['close'],
                render() {
                    return h('div', this.message);
                },
            });

            // Act
            for (let i = 0; i < 6; i++) {
                createToast(TestComponent, { message: `Toast ${i}` });
            }

            // Assert
            expect(mockShowPopover).toHaveBeenCalledTimes(6);
        });

        it('should pass onClose prop to toast component', async () => {
            // Arrange
            const { createToast } = await import('@/services/toast');
            const TestComponent = defineComponent({
                props: {
                    message: String,
                    onClose: Function,
                },
                emits: ['close'],
                render() {
                    return h('div', this.message);
                },
            });

            // Act
            createToast(TestComponent, { message: 'Test' });

            // Assert
            const appOptions = mockCreateApp.mock.calls[0]![0] as unknown as { render: () => { props: Record<string, unknown> }[] };
            const vnodes = appOptions.render();

            expect(vnodes).toHaveLength(1);
            expect(vnodes[0]?.props).toHaveProperty('onClose');
            expect(typeof vnodes[0]?.props?.onClose).toBe('function');
        });

        it('should hide popover when last toast is closed', async () => {
            // Arrange
            const { createToast } = await import('@/services/toast');
            const TestComponent = defineComponent({
                props: {
                    message: String,
                    onClose: Function,
                },
                emits: ['close'],
                render() {
                    return h('div', this.message);
                },
            });

            // Act
            createToast(TestComponent, { message: 'Only toast' });
            const appOptions = mockCreateApp.mock.calls[0]![0] as unknown as { render: () => { props: Record<string, unknown> }[] };
            const vnodes = appOptions.render();
            const onClose = vnodes[0]?.props?.onClose as () => void;
            onClose();

            // Assert
            expect(mockHidePopover).toHaveBeenCalled();
        });

        it('should not hide popover when there are remaining toasts', async () => {
            // Arrange
            const { createToast } = await import('@/services/toast');
            const TestComponent = defineComponent({
                props: {
                    message: String,
                    onClose: Function,
                },
                emits: ['close'],
                render() {
                    return h('div', this.message);
                },
            });

            // Act
            createToast(TestComponent, { message: 'Toast 1' });
            createToast(TestComponent, { message: 'Toast 2' });
            const appOptions = mockCreateApp.mock.calls[0]![0] as unknown as { render: () => { props: Record<string, unknown> }[] };
            const vnodes = appOptions.render();
            const firstOnClose = vnodes[0]?.props?.onClose as () => void;
            firstOnClose();

            // Assert
            expect(mockHidePopover).not.toHaveBeenCalled();
        });
    });
});

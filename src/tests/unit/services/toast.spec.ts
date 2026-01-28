import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { createToastService } from '@/services/toast';

const TestComponent = defineComponent({
    props: { message: String },
    emits: ['close'],
    render() {
        return h('div', this.message);
    },
});

describe('toast service', () => {
    const mockShowPopover = vi.fn();
    const mockHidePopover = vi.fn();

    beforeEach(() => {
        mockShowPopover.mockClear();
        mockHidePopover.mockClear();

        HTMLElement.prototype.showPopover = mockShowPopover;
        HTMLElement.prototype.hidePopover = mockHidePopover;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('createToastService', () => {
        it('should return all expected methods and properties', () => {
            // Act
            const toastService = createToastService({ component: TestComponent });

            // Assert
            expect(toastService).toHaveProperty('show');
            expect(toastService).toHaveProperty('hide');
            expect(toastService).toHaveProperty('container');
            expect(toastService).toHaveProperty('destroy');
            expect(typeof toastService.show).toBe('function');
            expect(typeof toastService.hide).toBe('function');
            expect(typeof toastService.destroy).toBe('function');
            expect(toastService.container).toBeInstanceOf(HTMLDivElement);

            toastService.destroy();
        });

        it('should create container with default classes', () => {
            // Act
            const toastService = createToastService({ component: TestComponent });

            // Assert
            expect(toastService.container.classList.contains('pointer-events-none')).toBe(true);
            expect(toastService.container.classList.contains('flex')).toBe(true);
            expect(toastService.container.classList.contains('flex-col-reverse')).toBe(true);

            toastService.destroy();
        });

        it('should create container with custom classes when provided', () => {
            // Arrange
            const customClasses = ['custom-class', 'another-class'];

            // Act
            const toastService = createToastService({
                component: TestComponent,
                containerClasses: customClasses,
            });

            // Assert
            expect(toastService.container.classList.contains('custom-class')).toBe(true);
            expect(toastService.container.classList.contains('another-class')).toBe(true);
            expect(toastService.container.classList.contains('pointer-events-none')).toBe(false);

            toastService.destroy();
        });

        it('should set container role and popover attributes', () => {
            // Act
            const toastService = createToastService({ component: TestComponent });

            // Assert
            expect(toastService.container.role).toBe('region');
            expect(toastService.container.popover).toBe('manual');

            toastService.destroy();
        });
    });

    describe('show', () => {
        it('should show popover when creating a toast', () => {
            // Arrange
            const toastService = createToastService({ component: TestComponent });

            // Act
            toastService.show({ message: 'Test message' });

            // Assert
            expect(mockShowPopover).toHaveBeenCalled();

            toastService.destroy();
        });

        it('should remove oldest toast when exceeding maximum', () => {
            // Arrange
            const toastService = createToastService({ component: TestComponent, maxToasts: 2 });

            // Act
            toastService.show({ message: 'Toast 1' });
            toastService.show({ message: 'Toast 2' });
            toastService.show({ message: 'Toast 3' });
            toastService.show({ message: 'Toast 4' });

            // Assert
            expect(mockShowPopover).toHaveBeenCalledTimes(4);

            toastService.destroy();
        });

        it('should use default maxToasts of 4', () => {
            // Arrange
            const toastService = createToastService({ component: TestComponent });

            // Act
            for (let i = 0; i < 6; i++) {
                toastService.show({ message: `Toast ${i}` });
            }

            // Assert
            expect(mockShowPopover).toHaveBeenCalledTimes(6);

            toastService.destroy();
        });
    });

    describe('hide', () => {
        it('should hide popover when last toast is hidden', () => {
            // Arrange
            const toastService = createToastService({ component: TestComponent });
            toastService.show({ message: 'Only toast' });

            // Act
            toastService.hide('toast-0');

            // Assert
            expect(mockHidePopover).toHaveBeenCalled();

            toastService.destroy();
        });

        it('should not hide popover when there are remaining toasts', () => {
            // Arrange
            const toastService = createToastService({ component: TestComponent });
            toastService.show({ message: 'Toast 1' });
            toastService.show({ message: 'Toast 2' });

            // Act
            toastService.hide('toast-0');

            // Assert
            expect(mockHidePopover).not.toHaveBeenCalled();

            toastService.destroy();
        });

        it('should do nothing when hiding non-existent toast', () => {
            // Arrange
            const toastService = createToastService({ component: TestComponent });

            // Act & Assert
            expect(() => toastService.hide('non-existent')).not.toThrow();

            toastService.destroy();
        });
    });

    describe('destroy', () => {
        it('should remove container from DOM', () => {
            // Arrange
            const toastService = createToastService({ component: TestComponent });
            const removeSpy = vi.spyOn(toastService.container, 'remove');

            // Act
            toastService.destroy();

            // Assert
            expect(removeSpy).toHaveBeenCalled();
        });

        it('should be safe to call multiple times', () => {
            // Arrange
            const toastService = createToastService({ component: TestComponent });

            // Act & Assert
            expect(() => {
                toastService.destroy();
                toastService.destroy();
            }).not.toThrow();
        });
    });

    describe('isolation', () => {
        it('should create independent toast services', () => {
            // Arrange
            const service1 = createToastService({ component: TestComponent });
            const service2 = createToastService({ component: TestComponent });

            // Act
            service1.show({ message: 'Service 1 toast' });

            // Assert
            expect(service1.container).not.toBe(service2.container);

            service1.destroy();
            service2.destroy();
        });
    });
});

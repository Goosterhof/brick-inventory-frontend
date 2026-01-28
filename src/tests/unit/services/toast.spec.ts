import { describe, it, expect } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createToastService } from '@/services/toast';

const TestToast = defineComponent({
    props: { message: String },
    emits: ['close'],
    render() {
        return h('div', { class: 'toast' }, this.message);
    },
});

describe('toast service', () => {
    describe('createToastService', () => {
        it('should return all expected methods and properties', () => {
            // Act
            const toastService = createToastService(TestToast);

            // Assert
            expect(toastService).toHaveProperty('show');
            expect(toastService).toHaveProperty('hide');
            expect(toastService).toHaveProperty('ToastContainerComponent');
            expect(typeof toastService.show).toBe('function');
            expect(typeof toastService.hide).toBe('function');
        });

        it('should return a valid Vue component', () => {
            // Act
            const toastService = createToastService(TestToast);

            // Assert
            expect(toastService.ToastContainerComponent).toHaveProperty('render');
            expect(toastService.ToastContainerComponent.name).toBe('ToastContainer');
        });
    });

    describe('show', () => {
        it('should add toast to the container', async () => {
            // Arrange
            const toastService = createToastService(TestToast);
            const wrapper = mount(toastService.ToastContainerComponent);

            // Act
            toastService.show({ message: 'Test message' });
            await nextTick();

            // Assert
            expect(wrapper.text()).toContain('Test message');
        });

        it('should add multiple toasts', async () => {
            // Arrange
            const toastService = createToastService(TestToast);
            const wrapper = mount(toastService.ToastContainerComponent);

            // Act
            toastService.show({ message: 'Toast 1' });
            toastService.show({ message: 'Toast 2' });
            toastService.show({ message: 'Toast 3' });
            await nextTick();

            // Assert
            expect(wrapper.findAll('.toast')).toHaveLength(3);
            expect(wrapper.text()).toContain('Toast 1');
            expect(wrapper.text()).toContain('Toast 2');
            expect(wrapper.text()).toContain('Toast 3');
        });

        it('should remove oldest toast when exceeding maximum', async () => {
            // Arrange
            const toastService = createToastService(TestToast, 2);
            const wrapper = mount(toastService.ToastContainerComponent);

            // Act
            toastService.show({ message: 'Toast 1' });
            toastService.show({ message: 'Toast 2' });
            toastService.show({ message: 'Toast 3' });
            toastService.show({ message: 'Toast 4' });
            await nextTick();

            // Assert
            expect(wrapper.findAll('.toast')).toHaveLength(2);
            expect(wrapper.text()).not.toContain('Toast 1');
            expect(wrapper.text()).not.toContain('Toast 2');
            expect(wrapper.text()).toContain('Toast 3');
            expect(wrapper.text()).toContain('Toast 4');
        });

        it('should use default maxToasts of 4', async () => {
            // Arrange
            const toastService = createToastService(TestToast);
            const wrapper = mount(toastService.ToastContainerComponent);

            // Act
            for (let i = 1; i <= 6; i++) {
                toastService.show({ message: `Toast ${i}` });
            }
            await nextTick();

            // Assert
            expect(wrapper.findAll('.toast')).toHaveLength(4);
            expect(wrapper.text()).not.toContain('Toast 1');
            expect(wrapper.text()).toContain('Toast 6');
        });
    });

    describe('hide', () => {
        it('should remove toast by id', async () => {
            // Arrange
            const toastService = createToastService(TestToast);
            const wrapper = mount(toastService.ToastContainerComponent);
            toastService.show({ message: 'Toast to hide' });
            await nextTick();

            // Act
            toastService.hide('toast-0');
            await nextTick();

            // Assert
            expect(wrapper.findAll('.toast')).toHaveLength(0);
        });

        it('should only remove specified toast', async () => {
            // Arrange
            const toastService = createToastService(TestToast);
            const wrapper = mount(toastService.ToastContainerComponent);
            toastService.show({ message: 'Toast 1' });
            toastService.show({ message: 'Toast 2' });
            toastService.show({ message: 'Toast 3' });
            await nextTick();

            // Act
            toastService.hide('toast-1');
            await nextTick();

            // Assert
            expect(wrapper.findAll('.toast')).toHaveLength(2);
            expect(wrapper.text()).toContain('Toast 1');
            expect(wrapper.text()).not.toContain('Toast 2');
            expect(wrapper.text()).toContain('Toast 3');
        });

        it('should do nothing when hiding non-existent toast', async () => {
            // Arrange
            const toastService = createToastService(TestToast);
            const wrapper = mount(toastService.ToastContainerComponent);
            toastService.show({ message: 'Toast 1' });
            await nextTick();

            // Act & Assert
            expect(() => toastService.hide('non-existent')).not.toThrow();
            expect(wrapper.findAll('.toast')).toHaveLength(1);
        });
    });

    describe('onClose prop', () => {
        it('should pass onClose handler to toast component', async () => {
            // Arrange
            const ClosableToast = defineComponent({
                props: { message: String, onClose: Function },
                emits: ['close'],
                render() {
                    return h('div', { class: 'toast' }, [
                        this.message,
                        h('button', { onClick: this.onClose }, 'Close'),
                    ]);
                },
            });
            const toastService = createToastService(ClosableToast);
            const wrapper = mount(toastService.ToastContainerComponent);
            toastService.show({ message: 'Closable toast' });
            await nextTick();

            // Act
            await wrapper.find('button').trigger('click');
            await nextTick();

            // Assert
            expect(wrapper.findAll('.toast')).toHaveLength(0);
        });
    });

    describe('isolation', () => {
        it('should create independent toast services', async () => {
            // Arrange
            const service1 = createToastService(TestToast);
            const service2 = createToastService(TestToast);
            const wrapper1 = mount(service1.ToastContainerComponent);
            const wrapper2 = mount(service2.ToastContainerComponent);

            // Act
            service1.show({ message: 'Service 1 toast' });
            await nextTick();

            // Assert
            expect(wrapper1.text()).toContain('Service 1 toast');
            expect(wrapper2.text()).not.toContain('Service 1 toast');
        });
    });
});

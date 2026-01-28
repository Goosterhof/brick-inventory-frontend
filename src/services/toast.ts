import type { VNode, Component } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { ref, h, defineComponent } from 'vue';

export interface ToastServiceOptions<C extends Component> {
    component: C;
    maxToasts?: number;
}

export interface ToastService<C extends Component> {
    show: (props: Omit<ComponentProps<C>, 'onClose'>) => void;
    hide: (id: string) => void;
    ToastContainerComponent: Component;
}

export const createToastService = <C extends Component>(
    options: ToastServiceOptions<C>,
): ToastService<C> => {
    const { component: toastComponent, maxToasts = 4 } = options;

    const toasts = ref<{ node: VNode; id: string }[]>([]);
    let toastId = 0;

    const hide = (id: string) => {
        const index = toasts.value.findIndex(toast => toast.id === id);
        if (index === -1) return;

        toasts.value.splice(index, 1);
    };

    const show = (props: Omit<ComponentProps<C>, 'onClose'>) => {
        if (toasts.value.length >= maxToasts && toasts.value[0]) {
            hide(toasts.value[0].id);
        }

        const id = `toast-${toastId++}`;
        const toastHider = () => hide(id);

        toasts.value.push({ node: h(toastComponent, { ...props, onClose: toastHider }), id });
    };

    const ToastContainerComponent = defineComponent({
        name: 'ToastContainer',
        render() {
            return toasts.value.map(toast => toast.node);
        },
    });

    return { show, hide, ToastContainerComponent };
};

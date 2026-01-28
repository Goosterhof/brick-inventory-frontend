import type { VNode, Component, App } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { ref, createApp, h } from 'vue';

export interface ToastServiceOptions<C extends Component> {
    component: C;
    maxToasts?: number;
    containerClasses?: string[];
}

export interface ToastService<C extends Component> {
    show: (props: Omit<ComponentProps<C>, 'onClose'>) => void;
    hide: (id: string) => void;
    container: HTMLDivElement;
    destroy: () => void;
}

const defaultContainerClasses = [
    'pointer-events-none',
    'flex',
    'flex-col-reverse',
    'h-725px',
    'right-100%',
    'left-6',
    'lt-sm:left-0',
    'lt-sm:right-0',
    'lt-sm:w-90%',
    'top-[calc(100%-725px)]',
    'bg-transparent',
    'b-none',
];

export const createToastService = <C extends Component>(
    options: ToastServiceOptions<C>,
): ToastService<C> => {
    const { component, maxToasts = 4, containerClasses = defaultContainerClasses } = options;

    const toasts = ref<{ node: VNode; id: string }[]>([]);
    let toastId = 0;
    let app: App | null = null;

    const container = document.createElement('div');
    container.classList.add(...containerClasses);
    container.role = 'region';
    container.popover = 'manual';

    app = createApp({
        render: () => toasts.value.map(toast => toast.node),
    });
    app.mount(container);

    const hide = (id: string) => {
        const index = toasts.value.findIndex(toast => toast.id === id);
        if (index === -1) return;

        toasts.value.splice(index, 1);

        if (!toasts.value.length) container.hidePopover();
    };

    const show = (props: Omit<ComponentProps<C>, 'onClose'>) => {
        if (toasts.value.length > maxToasts && toasts.value[0]) {
            hide(toasts.value[0].id);
        }

        container.showPopover();

        const id = `toast-${toastId++}`;
        const toastHider = () => hide(id);

        toasts.value.push({ node: h(component, { ...props, onClose: toastHider }), id });
    };

    const destroy = () => {
        if (app) {
            app.unmount();
            app = null;
        }
        container.remove();
        toasts.value = [];
    };

    return { show, hide, container, destroy };
};

import type { VNode, Component } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { ref, createApp, h } from 'vue';

const toasts = ref<{ node: VNode; id: string }[]>([]);

const toastContainer = document.createElement('div');

const maximumToasts = 4;

toastContainer.classList.add(
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
);

toastContainer.role = 'region';
toastContainer.popover = 'manual';

document.body.appendChild(toastContainer);

createApp({
    render: () => toasts.value.map(toast => toast.node),
}).mount(toastContainer);

const hideToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id);

    toasts.value.splice(index, 1);

    if (!toasts.value.length) toastContainer.hidePopover();
};

let toastId = 0;

export const createToast = <C extends Component>(toastComponent: C, props: ComponentProps<C>) => {
    if (toasts.value.length > maximumToasts && toasts.value[0]) hideToast(toasts.value[0].id);

    toastContainer.showPopover();

    const id = `toast-${toastId++}`;

    const toastHider = () => hideToast(id);

    toasts.value.push({ node: h(toastComponent, { ...props, onClose: toastHider }), id });
};

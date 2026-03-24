import type {Component, VNode} from "vue";
import type {ComponentProps} from "vue-component-type-helpers";

import {Suspense, defineComponent, h, markRaw, onErrorCaptured, ref} from "vue";

type UnregisterMiddleware = () => void;
type DialogErrorHandler = (error: Error, context: {closeAll: () => void}) => boolean;

/** @public */
export interface DialogService {
    open: <C extends Component>(component: C, props: ComponentProps<C>) => void;
    closeAll: () => void;
    registerErrorMiddleware: (handler: DialogErrorHandler) => UnregisterMiddleware;
    DialogContainerComponent: Component;
}

interface DialogEntry {
    node: VNode;
    key: string;
}

const prepareVModelProps = (props: Record<string, unknown>, onClose: () => void): Record<string, unknown> => {
    const prepared: Record<string, unknown> = {...props, onClose};

    for (const key of Object.keys(prepared)) {
        if (!key.startsWith("onUpdate:")) continue;

        const modelPropName = key.slice("onUpdate:".length);
        const originalHandler = prepared[key] as (...args: unknown[]) => void;

        prepared[key] = (value: unknown) => {
            prepared[modelPropName] = value;
            originalHandler(value);
        };
    }

    return prepared;
};

export const createDialogService = (): DialogService => {
    const dialogs = ref<DialogEntry[]>([]);
    const errorMiddleware: DialogErrorHandler[] = [];
    let dialogId = 0;

    const updateBodyScroll = () => {
        document.body.style.overflowY = dialogs.value.length > 0 ? "hidden" : "auto";
    };

    const closeFrom = (index: number) => {
        if (index < 0 || index >= dialogs.value.length) return;

        dialogs.value.splice(index);
        updateBodyScroll();
    };

    const closeAll = () => {
        dialogs.value.splice(0);
        updateBodyScroll();
    };

    const open = <C extends Component>(component: C, props: ComponentProps<C>): void => {
        const key = `dialog-${dialogId++}`;
        const rawComponent = markRaw(component);

        const index = dialogs.value.length;
        const onClose = () => closeFrom(index);
        const prepared = prepareVModelProps(props as Record<string, unknown>, onClose);

        const node = h(
            "dialog",
            {
                key,
                p: "0",
                m: "auto",
                bg: "transparent",
                class: "backdrop:bg-black",
                onCancel: (event: Event) => event.preventDefault(),
                onClick: (event: MouseEvent) => {
                    if ((event.target as HTMLElement).tagName === "DIALOG") {
                        onClose();
                    }
                },
                onVnodeMounted: (vnode: VNode) => {
                    const el = vnode.el as HTMLDialogElement | null;
                    el?.showModal();
                },
            },
            h(Suspense, null, {
                default: () => h(rawComponent, prepared),
                fallback: () => h("div", {p: "6", text: "center"}, "Loading..."),
            }),
        );

        dialogs.value.push({node, key});
        updateBodyScroll();
    };

    const registerErrorMiddleware = (handler: DialogErrorHandler): UnregisterMiddleware => {
        errorMiddleware.push(handler);

        return () => {
            const index = errorMiddleware.indexOf(handler);
            if (index > -1) errorMiddleware.splice(index, 1);
        };
    };

    const handleError = (error: unknown): boolean => {
        if (!(error instanceof Error)) return true;

        for (const handler of errorMiddleware) {
            const shouldPropagate = handler(error, {closeAll});
            if (!shouldPropagate) return false;
        }

        return true;
    };

    const DialogContainerComponent = defineComponent({
        name: "DialogContainer",
        setup() {
            onErrorCaptured((error) => handleError(error));

            return () => dialogs.value.map((dialog) => dialog.node);
        },
    });

    return {open, closeAll, registerErrorMiddleware, DialogContainerComponent};
};

import type {DeepReadonly, Ref} from "vue";

import {readonly, ref, watch} from "vue";

export interface LoadingService {
    isLoading: DeepReadonly<Ref<boolean>>;
    startLoading: () => void;
    stopLoading: () => void;
    ensureLoadingFinished: () => Promise<void>;
}

export const createLoadingService = (): LoadingService => {
    const isLoading = ref(false);

    return {
        isLoading: readonly(isLoading),
        startLoading: () => {
            isLoading.value = true;
        },
        stopLoading: () => {
            isLoading.value = false;
        },
        ensureLoadingFinished: () => {
            if (!isLoading.value) return Promise.resolve();
            return new Promise((resolve) => {
                const unwatch = watch(isLoading, (loading) => {
                    if (!loading) {
                        unwatch();
                        resolve();
                    }
                });
            });
        },
    };
};

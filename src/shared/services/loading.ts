import type {Ref} from "vue";

import {ref, watch} from "vue";

export interface LoadingService {
    isLoading: Ref<boolean>;
    startLoading: () => void;
    stopLoading: () => void;
    ensureLoadingFinished: () => Promise<void>;
}

export const createLoadingService = (): LoadingService => {
    const isLoading = ref(false);

    return {
        isLoading,
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

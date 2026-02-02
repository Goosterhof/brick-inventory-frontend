import type {ComputedRef, DeepReadonly, Ref} from "vue";

import {computed, readonly, ref, watch} from "vue";

export interface LoadingService {
    isLoading: ComputedRef<boolean>;
    activeRequests: DeepReadonly<Ref<number>>;
    startLoading: () => void;
    stopLoading: () => void;
    ensureLoadingFinished: () => Promise<void>;
}

export const createLoadingService = (): LoadingService => {
    const activeRequests = ref(0);
    const isLoading = computed(() => activeRequests.value > 0);

    return {
        isLoading,
        activeRequests: readonly(activeRequests),
        startLoading: () => {
            activeRequests.value++;
        },
        stopLoading: () => {
            activeRequests.value = Math.max(0, activeRequests.value - 1);
        },
        ensureLoadingFinished: () => {
            if (!isLoading.value) return Promise.resolve();
            return new Promise((resolve) => {
                const unwatch = watch(isLoading, () => {
                    unwatch();
                    resolve();
                });
            });
        },
    };
};

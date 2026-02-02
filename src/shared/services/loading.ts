import type {ComputedRef, DeepReadonly, Ref} from "vue";

import {computed, readonly, ref, watch} from "vue";

export interface LoadingService {
    isLoading: ComputedRef<boolean>;
    activeCount: DeepReadonly<Ref<number>>;
    startLoading: () => void;
    stopLoading: () => void;
    ensureLoadingFinished: () => Promise<void>;
}

export const createLoadingService = (): LoadingService => {
    const activeCount = ref(0);
    const isLoading = computed(() => activeCount.value > 0);

    return {
        isLoading,
        activeCount: readonly(activeCount),
        startLoading: () => {
            activeCount.value++;
        },
        stopLoading: () => {
            activeCount.value = Math.max(0, activeCount.value - 1);
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

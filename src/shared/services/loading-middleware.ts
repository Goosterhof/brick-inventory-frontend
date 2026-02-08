import type {InternalAxiosRequestConfig} from "axios";

import type {HttpService} from "./http";
import type {LoadingService} from "./loading";

/** @public */
export interface LoadingMiddlewareOptions {
    /**
     * Timeout in milliseconds after which a request is considered stuck
     * and loading state is auto-decremented. Set to 0 to disable.
     * @default 30000 (30 seconds)
     */
    timeoutMs?: number;
}

/** @public */
export interface LoadingMiddlewareResult {
    unregister: () => void;
}

/**
 * Registers middleware on an HTTP service to automatically track loading state.
 * Each request increments the loading counter, and each response/error decrements it.
 * Includes timeout protection to prevent stuck loading states.
 */
export const registerLoadingMiddleware = (
    httpService: HttpService,
    loadingService: LoadingService,
    options: LoadingMiddlewareOptions = {},
): LoadingMiddlewareResult => {
    const {timeoutMs = 30000} = options;

    const requestTimeouts = new Map<InternalAxiosRequestConfig, ReturnType<typeof setTimeout>>();
    const completedRequests = new WeakSet<InternalAxiosRequestConfig>();

    const stopLoadingForRequest = (config: InternalAxiosRequestConfig) => {
        if (completedRequests.has(config)) return;
        completedRequests.add(config);

        const timeout = requestTimeouts.get(config);
        if (timeout) {
            clearTimeout(timeout);
            requestTimeouts.delete(config);
        }

        loadingService.stopLoading();
    };

    const unregisterRequest = httpService.registerRequestMiddleware((config) => {
        loadingService.startLoading();

        if (timeoutMs > 0) {
            const timeout = setTimeout(() => {
                stopLoadingForRequest(config);
            }, timeoutMs);
            requestTimeouts.set(config, timeout);
        }
    });

    const unregisterResponse = httpService.registerResponseMiddleware((response) => {
        stopLoadingForRequest(response.config);
    });

    const unregisterError = httpService.registerResponseErrorMiddleware((error) => {
        if (error.config) {
            stopLoadingForRequest(error.config);
        }
    });

    const unregister = () => {
        unregisterRequest();
        unregisterResponse();
        unregisterError();

        for (const timeout of requestTimeouts.values()) {
            clearTimeout(timeout);
        }
        requestTimeouts.clear();
    };

    return {unregister};
};

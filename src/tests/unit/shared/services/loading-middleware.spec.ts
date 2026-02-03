import type {AxiosResponseError, HttpService} from "@shared/services/http";
import type {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from "axios";

import {createLoadingService} from "@shared/services/loading";
import {registerLoadingMiddleware} from "@shared/services/loading-middleware";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

type RequestMiddleware = (config: InternalAxiosRequestConfig) => void;
type ResponseMiddleware = (response: AxiosResponse) => void;
type ErrorMiddleware = (error: AxiosError<AxiosResponseError>) => void;

const createMockHttpService = () => {
    const requestMiddlewares: RequestMiddleware[] = [];
    const responseMiddlewares: ResponseMiddleware[] = [];
    const errorMiddlewares: ErrorMiddleware[] = [];

    const triggerRequest = (config: Partial<InternalAxiosRequestConfig> = {}) => {
        const fullConfig = {url: "/test", ...config} as InternalAxiosRequestConfig;
        for (const middleware of requestMiddlewares) {
            middleware(fullConfig);
        }
        return fullConfig;
    };

    const triggerResponse = (config: InternalAxiosRequestConfig) => {
        const response = {config, data: {}, status: 200} as AxiosResponse;
        for (const middleware of responseMiddlewares) {
            middleware(response);
        }
    };

    const triggerError = (config: InternalAxiosRequestConfig) => {
        const error = {config, message: "Error", isAxiosError: true} as AxiosError<AxiosResponseError>;
        for (const middleware of errorMiddlewares) {
            middleware(error);
        }
    };

    const httpService: HttpService = {
        getRequest: vi.fn(),
        postRequest: vi.fn(),
        putRequest: vi.fn(),
        patchRequest: vi.fn(),
        deleteRequest: vi.fn(),
        registerRequestMiddleware: vi.fn((fn: RequestMiddleware) => {
            requestMiddlewares.push(fn);
            return () => {
                const index = requestMiddlewares.indexOf(fn);
                if (index > -1) requestMiddlewares.splice(index, 1);
            };
        }),
        registerResponseMiddleware: vi.fn((fn: ResponseMiddleware) => {
            responseMiddlewares.push(fn);
            return () => {
                const index = responseMiddlewares.indexOf(fn);
                if (index > -1) responseMiddlewares.splice(index, 1);
            };
        }),
        registerResponseErrorMiddleware: vi.fn((fn: ErrorMiddleware) => {
            errorMiddlewares.push(fn);
            return () => {
                const index = errorMiddlewares.indexOf(fn);
                if (index > -1) errorMiddlewares.splice(index, 1);
            };
        }),
    };

    return {httpService, triggerRequest, triggerResponse, triggerError};
};

describe("registerLoadingMiddleware", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should register all three middleware types", () => {
        // Arrange
        const {httpService} = createMockHttpService();
        const loadingService = createLoadingService();

        // Act
        registerLoadingMiddleware(httpService, loadingService);

        // Assert
        expect(httpService.registerRequestMiddleware).toHaveBeenCalledOnce();
        expect(httpService.registerResponseMiddleware).toHaveBeenCalledOnce();
        expect(httpService.registerResponseErrorMiddleware).toHaveBeenCalledOnce();
    });

    it("should increment loading on request start", () => {
        // Arrange
        const {httpService, triggerRequest} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService);

        // Assert initial state
        expect(loadingService.activeCount.value).toBe(0);

        // Act
        triggerRequest();

        // Assert - loading started
        expect(loadingService.activeCount.value).toBe(1);
        expect(loadingService.isLoading.value).toBe(true);
    });

    it("should decrement loading on successful response", () => {
        // Arrange
        const {httpService, triggerRequest, triggerResponse} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService);

        // Act
        const config = triggerRequest();
        triggerResponse(config);

        // Assert
        expect(loadingService.activeCount.value).toBe(0);
        expect(loadingService.isLoading.value).toBe(false);
    });

    it("should decrement loading on error response", () => {
        // Arrange
        const {httpService, triggerRequest, triggerError} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService);

        // Act
        const config = triggerRequest();
        triggerError(config);

        // Assert
        expect(loadingService.activeCount.value).toBe(0);
        expect(loadingService.isLoading.value).toBe(false);
    });

    it("should track multiple concurrent requests", () => {
        // Arrange
        const {httpService, triggerRequest, triggerResponse} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService);

        // Act - start two requests
        const config1 = triggerRequest({url: "/users"});
        const config2 = triggerRequest({url: "/posts"});

        // Assert - both tracked
        expect(loadingService.activeCount.value).toBe(2);

        // Complete first request
        triggerResponse(config1);
        expect(loadingService.activeCount.value).toBe(1);
        expect(loadingService.isLoading.value).toBe(true);

        // Complete second request
        triggerResponse(config2);
        expect(loadingService.activeCount.value).toBe(0);
        expect(loadingService.isLoading.value).toBe(false);
    });

    it("should auto-decrement loading after timeout", () => {
        // Arrange
        const {httpService, triggerRequest} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService, {timeoutMs: 5000});

        // Act - start request
        triggerRequest();

        // Assert - loading started
        expect(loadingService.activeCount.value).toBe(1);

        // Fast forward past timeout
        vi.advanceTimersByTime(5000);

        // Assert - loading auto-decremented
        expect(loadingService.activeCount.value).toBe(0);
        expect(loadingService.isLoading.value).toBe(false);
    });

    it("should not auto-decrement if response arrives before timeout", () => {
        // Arrange
        const {httpService, triggerRequest, triggerResponse} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService, {timeoutMs: 5000});

        // Act
        const config = triggerRequest();
        triggerResponse(config);

        // Fast forward past timeout
        vi.advanceTimersByTime(5000);

        // Assert - should still be 0 (not negative)
        expect(loadingService.activeCount.value).toBe(0);
    });

    it("should not double-decrement if timeout fires after response", () => {
        // Arrange
        const {httpService, triggerRequest, triggerResponse} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService, {timeoutMs: 5000});

        // Start two requests
        const config1 = triggerRequest({url: "/users"});
        triggerRequest({url: "/posts"});
        expect(loadingService.activeCount.value).toBe(2);

        // Complete first request before timeout
        triggerResponse(config1);
        expect(loadingService.activeCount.value).toBe(1);

        // Timeout fires for first request - should not decrement again
        vi.advanceTimersByTime(5000);

        // Assert - only second request timed out
        expect(loadingService.activeCount.value).toBe(0);
    });

    it("should disable timeout when timeoutMs is 0", () => {
        // Arrange
        const {httpService, triggerRequest} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService, {timeoutMs: 0});

        // Act
        triggerRequest();

        // Assert - loading started
        expect(loadingService.activeCount.value).toBe(1);

        // Fast forward a long time
        vi.advanceTimersByTime(60000);

        // Assert - still loading (no auto-timeout)
        expect(loadingService.activeCount.value).toBe(1);
    });

    it("should use default 30 second timeout", () => {
        // Arrange
        const {httpService, triggerRequest} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService);

        // Act
        triggerRequest();

        // Assert - still loading before timeout
        vi.advanceTimersByTime(29999);
        expect(loadingService.activeCount.value).toBe(1);

        // Assert - auto-decremented after 30 seconds
        vi.advanceTimersByTime(1);
        expect(loadingService.activeCount.value).toBe(0);
    });

    it("should stop tracking after unregister is called", () => {
        // Arrange
        const {httpService, triggerRequest} = createMockHttpService();
        const loadingService = createLoadingService();
        const {unregister} = registerLoadingMiddleware(httpService, loadingService);

        // Act
        unregister();
        triggerRequest();

        // Assert - should not have tracked the request (middleware unregistered)
        expect(loadingService.activeCount.value).toBe(0);
    });

    it("should clear pending timeouts on unregister", () => {
        // Arrange
        const {httpService, triggerRequest} = createMockHttpService();
        const loadingService = createLoadingService();
        const {unregister} = registerLoadingMiddleware(httpService, loadingService, {timeoutMs: 5000});

        // Start a request
        triggerRequest();
        expect(loadingService.activeCount.value).toBe(1);

        // Unregister before timeout
        unregister();

        // Fast forward past timeout
        vi.advanceTimersByTime(5000);

        // Assert - timeout was cleared, count stays at 1 (not decremented by timeout)
        expect(loadingService.activeCount.value).toBe(1);
    });

    it("should handle error without config gracefully", () => {
        // Arrange
        const {httpService, triggerRequest} = createMockHttpService();
        const loadingService = createLoadingService();
        registerLoadingMiddleware(httpService, loadingService);

        // Start a request
        triggerRequest();
        expect(loadingService.activeCount.value).toBe(1);

        // Trigger error without config (edge case)
        const errorMiddleware = (httpService.registerResponseErrorMiddleware as ReturnType<typeof vi.fn>).mock
            .calls[0]?.[0] as ErrorMiddleware;
        errorMiddleware({message: "Network error", isAxiosError: true} as AxiosError<AxiosResponseError>);

        // Assert - should not crash, count unchanged
        expect(loadingService.activeCount.value).toBe(1);
    });
});

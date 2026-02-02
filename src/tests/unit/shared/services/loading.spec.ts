import {createLoadingService} from "@shared/services/loading";
import {flushPromises} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

describe("createLoadingService", () => {
    it("should initialize with isLoading as false", () => {
        // Act
        const service = createLoadingService();

        // Assert
        expect(service.isLoading.value).toBe(false);
    });

    it("should set isLoading to true when startLoading is called", () => {
        // Arrange
        const service = createLoadingService();

        // Act
        service.startLoading();

        // Assert
        expect(service.isLoading.value).toBe(true);
    });

    it("should set isLoading to false when stopLoading is called", () => {
        // Arrange
        const service = createLoadingService();
        service.startLoading();

        // Act
        service.stopLoading();

        // Assert
        expect(service.isLoading.value).toBe(false);
    });

    it("should resolve immediately from ensureLoadingFinished when not loading", async () => {
        // Arrange
        const service = createLoadingService();
        let resolved = false;

        // Act
        await service.ensureLoadingFinished();
        resolved = true;

        // Assert
        expect(resolved).toBe(true);
    });

    it("should wait and resolve from ensureLoadingFinished when loading finishes", async () => {
        // Arrange
        const service = createLoadingService();
        service.startLoading();
        let resolved = false;

        // Act
        const promise = service.ensureLoadingFinished().then(() => {
            resolved = true;
        });

        // Assert - should not be resolved yet
        await flushPromises();
        expect(resolved).toBe(false);

        // Stop loading
        service.stopLoading();
        await flushPromises();
        await promise;

        // Assert - now resolved
        expect(resolved).toBe(true);
    });

    it("should handle multiple calls to ensureLoadingFinished", async () => {
        // Arrange
        const service = createLoadingService();
        service.startLoading();
        let resolved1 = false;
        let resolved2 = false;

        // Act
        const promise1 = service.ensureLoadingFinished().then(() => {
            resolved1 = true;
        });
        const promise2 = service.ensureLoadingFinished().then(() => {
            resolved2 = true;
        });

        await flushPromises();
        expect(resolved1).toBe(false);
        expect(resolved2).toBe(false);

        service.stopLoading();
        await Promise.all([promise1, promise2]);

        // Assert
        expect(resolved1).toBe(true);
        expect(resolved2).toBe(true);
    });

    it("should track activeCount count", () => {
        // Arrange
        const service = createLoadingService();

        // Assert initial state
        expect(service.activeCount.value).toBe(0);

        // Act & Assert - increment
        service.startLoading();
        expect(service.activeCount.value).toBe(1);

        service.startLoading();
        expect(service.activeCount.value).toBe(2);

        // Act & Assert - decrement
        service.stopLoading();
        expect(service.activeCount.value).toBe(1);

        service.stopLoading();
        expect(service.activeCount.value).toBe(0);
    });

    it("should stay loading while any request is active", () => {
        // Arrange
        const service = createLoadingService();

        // Act - start two requests
        service.startLoading();
        service.startLoading();

        // Assert - both active
        expect(service.isLoading.value).toBe(true);
        expect(service.activeCount.value).toBe(2);

        // Act - finish first request
        service.stopLoading();

        // Assert - still loading because one request remains
        expect(service.isLoading.value).toBe(true);
        expect(service.activeCount.value).toBe(1);

        // Act - finish second request
        service.stopLoading();

        // Assert - now finished
        expect(service.isLoading.value).toBe(false);
        expect(service.activeCount.value).toBe(0);
    });

    it("should not allow activeCount to go below zero", () => {
        // Arrange
        const service = createLoadingService();

        // Act - call stopLoading without starting
        service.stopLoading();
        service.stopLoading();

        // Assert
        expect(service.activeCount.value).toBe(0);
        expect(service.isLoading.value).toBe(false);
    });

    it("should wait for all requests to finish in ensureLoadingFinished", async () => {
        // Arrange
        const service = createLoadingService();
        service.startLoading();
        service.startLoading();
        let resolved = false;

        // Act
        const promise = service.ensureLoadingFinished().then(() => {
            resolved = true;
        });

        // Assert - should not resolve after first stopLoading
        await flushPromises();
        service.stopLoading();
        await flushPromises();
        expect(resolved).toBe(false);

        // Assert - should resolve after all requests complete
        service.stopLoading();
        await flushPromises();
        await promise;
        expect(resolved).toBe(true);
    });
});

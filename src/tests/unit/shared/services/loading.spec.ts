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
});

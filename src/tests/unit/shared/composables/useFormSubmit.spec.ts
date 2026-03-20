import type {UseValidationErrors, ValidationErrors} from "@shared/composables/useValidationErrors";

import {useFormSubmit} from "@shared/composables/useFormSubmit";
import {AxiosError} from "axios";
import {describe, expect, it, vi} from "vitest";
import {ref} from "vue";

type TestField = "name" | "email";

const createMockValidationErrors = (): UseValidationErrors<TestField> => ({
    errors: ref<ValidationErrors<TestField>>({}),
    clearErrors: vi.fn(),
});

const createAxiosError = (status: number): AxiosError => {
    const error = new AxiosError("Request failed", AxiosError.ERR_BAD_REQUEST, undefined, undefined, {
        status,
        data: {message: "Error"},
        statusText: "",
        headers: {},
        config: {} as never,
    });

    return error;
};

describe("useFormSubmit", () => {
    it("should return a handleSubmit function", () => {
        // Arrange
        const validationErrors = createMockValidationErrors();

        // Act
        const {handleSubmit} = useFormSubmit(validationErrors);

        // Assert
        expect(handleSubmit).toBeInstanceOf(Function);
    });

    it("should clear errors before executing the action", async () => {
        // Arrange
        const validationErrors = createMockValidationErrors();
        const {handleSubmit} = useFormSubmit(validationErrors);
        const action = vi.fn().mockResolvedValue(undefined);

        // Act
        await handleSubmit(action);

        // Assert
        expect(validationErrors.clearErrors).toHaveBeenCalledOnce();
        expect(validationErrors.clearErrors).toHaveBeenCalledBefore(action);
    });

    it("should execute the provided action", async () => {
        // Arrange
        const validationErrors = createMockValidationErrors();
        const {handleSubmit} = useFormSubmit(validationErrors);
        const action = vi.fn().mockResolvedValue(undefined);

        // Act
        await handleSubmit(action);

        // Assert
        expect(action).toHaveBeenCalledOnce();
    });

    it("should swallow 422 axios errors silently", async () => {
        // Arrange
        const validationErrors = createMockValidationErrors();
        const {handleSubmit} = useFormSubmit(validationErrors);
        const error = createAxiosError(422);
        const action = vi.fn().mockRejectedValue(error);

        // Act & Assert
        await expect(handleSubmit(action)).resolves.toBeUndefined();
    });

    it("should re-throw non-422 axios errors", async () => {
        // Arrange
        const validationErrors = createMockValidationErrors();
        const {handleSubmit} = useFormSubmit(validationErrors);
        const error = createAxiosError(500);
        const action = vi.fn().mockRejectedValue(error);

        // Act & Assert
        await expect(handleSubmit(action)).rejects.toThrow(error);
    });

    it("should re-throw non-axios errors", async () => {
        // Arrange
        const validationErrors = createMockValidationErrors();
        const {handleSubmit} = useFormSubmit(validationErrors);
        const error = new Error("Network failure");
        const action = vi.fn().mockRejectedValue(error);

        // Act & Assert
        await expect(handleSubmit(action)).rejects.toThrow("Network failure");
    });

    it("should clear errors even when the action throws a 422 error", async () => {
        // Arrange
        const validationErrors = createMockValidationErrors();
        const {handleSubmit} = useFormSubmit(validationErrors);
        const error = createAxiosError(422);
        const action = vi.fn().mockRejectedValue(error);

        // Act
        await handleSubmit(action);

        // Assert
        expect(validationErrors.clearErrors).toHaveBeenCalledOnce();
    });

    it("should clear errors even when the action throws a non-422 error", async () => {
        // Arrange
        const validationErrors = createMockValidationErrors();
        const {handleSubmit} = useFormSubmit(validationErrors);
        const error = createAxiosError(500);
        const action = vi.fn().mockRejectedValue(error);

        // Act
        try {
            await handleSubmit(action);
        } catch {
            // Expected
        }

        // Assert
        expect(validationErrors.clearErrors).toHaveBeenCalledOnce();
    });

    it("should re-throw axios errors without a response", async () => {
        // Arrange
        const validationErrors = createMockValidationErrors();
        const {handleSubmit} = useFormSubmit(validationErrors);
        const error = new AxiosError("Network Error", AxiosError.ERR_NETWORK);
        const action = vi.fn().mockRejectedValue(error);

        // Act & Assert
        await expect(handleSubmit(action)).rejects.toThrow(error);
    });
});

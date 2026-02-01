import {EntryNotFoundError, type TranslationServiceForError} from "@shared/errors/entry-not-found";
import {describe, expect, it} from "vitest";

describe("EntryNotFoundError", () => {
    const createMockTranslationService = (singularName: string): TranslationServiceForError => ({
        getCapitalizedSingularTranslation: () => singularName,
    });

    it("should create error with formatted message using translation service", () => {
        // Arrange
        const translationService = createMockTranslationService("Family Set");
        const id = 5;

        // Act
        const error = new EntryNotFoundError("family-sets", id, translationService);

        // Assert
        expect(error.message).toBe("Family Set with id 5 not found");
    });

    it("should have name 'EntryNotFoundError'", () => {
        // Arrange
        const translationService = createMockTranslationService("Storage Option");

        // Act
        const error = new EntryNotFoundError("storage-options", 10, translationService);

        // Assert
        expect(error.name).toBe("EntryNotFoundError");
    });

    it("should be an instance of Error", () => {
        // Arrange
        const translationService = createMockTranslationService("Item");

        // Act
        const error = new EntryNotFoundError("items", 1, translationService);

        // Assert
        expect(error).toBeInstanceOf(Error);
    });
});

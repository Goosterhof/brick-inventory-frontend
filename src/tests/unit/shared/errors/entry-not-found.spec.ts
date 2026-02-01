import {EntryNotFoundError} from "@shared/errors/entry-not-found";
import {describe, expect, it} from "vitest";

describe("EntryNotFoundError", () => {
    it("should create error with formatted message using domain name", () => {
        // Arrange
        const domainName = "family-sets";
        const id = 5;

        // Act
        const error = new EntryNotFoundError(domainName, id);

        // Assert
        expect(error.message).toBe("family-sets with id 5 not found");
    });

    it("should have name 'EntryNotFoundError'", () => {
        // Act
        const error = new EntryNotFoundError("storage-options", 10);

        // Assert
        expect(error.name).toBe("EntryNotFoundError");
    });

    it("should be an instance of Error", () => {
        // Act
        const error = new EntryNotFoundError("items", 1);

        // Assert
        expect(error).toBeInstanceOf(Error);
    });
});

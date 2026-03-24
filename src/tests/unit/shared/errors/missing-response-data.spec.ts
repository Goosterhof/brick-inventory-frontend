import {MissingResponseDataError} from "@shared/errors/missing-response-data";
import {describe, expect, it} from "vitest";

describe("MissingResponseDataError", () => {
    it("should create error with the provided message", () => {
        // Arrange
        const message = "Response data is missing from the API response";

        // Act
        const error = new MissingResponseDataError(message);

        // Assert
        expect(error.message).toBe("Response data is missing from the API response");
    });

    it("should have name 'MissingResponseDataError'", () => {
        // Act
        const error = new MissingResponseDataError("missing data");

        // Assert
        expect(error.name).toBe("MissingResponseDataError");
    });

    it("should be an instance of Error", () => {
        // Act
        const error = new MissingResponseDataError("missing data");

        // Assert
        expect(error).toBeInstanceOf(Error);
    });
});

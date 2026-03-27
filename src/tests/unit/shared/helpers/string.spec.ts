import type {Item} from "@shared/types/item";

import {deepSnakeKeys, normalizeForPath, toCamelCaseTyped} from "@shared/helpers/string";
import {describe, expect, it} from "vitest";

interface TestItem extends Item {
    id: number;
    userName: string;
    createdAt: string;
}

describe("toCamelCaseTyped", () => {
    it("should convert snake_case keys to camelCase", () => {
        // Arrange
        const snakeCase = {id: 1, user_name: "test", created_at: "2024-01-01"};

        // Act
        const result = toCamelCaseTyped<TestItem>(snakeCase);

        // Assert
        expect(result).toEqual({id: 1, userName: "test", createdAt: "2024-01-01"});
    });

    it("should handle already camelCase data", () => {
        // Arrange
        const camelCase: TestItem = {id: 1, userName: "test", createdAt: "2024-01-01"};

        // Act
        const result = toCamelCaseTyped<TestItem>(camelCase);

        // Assert
        expect(result).toEqual({id: 1, userName: "test", createdAt: "2024-01-01"});
    });

    it("should handle nested snake_case objects", () => {
        // Arrange
        interface NestedItem extends Item {
            id: number;
            userProfile: {firstName: string; lastName: string};
        }
        const snakeCase = {id: 1, user_profile: {first_name: "John", last_name: "Doe"}};

        // Act
        const result = toCamelCaseTyped<NestedItem>(snakeCase);

        // Assert
        expect(result).toEqual({id: 1, userProfile: {firstName: "John", lastName: "Doe"}});
    });

    it("should handle arrays with snake_case objects", () => {
        // Arrange
        interface ItemWithArray extends Item {
            id: number;
            userTags: Array<{tagName: string}>;
        }
        const snakeCase = {id: 1, user_tags: [{tag_name: "admin"}, {tag_name: "user"}]};

        // Act
        const result = toCamelCaseTyped<ItemWithArray>(snakeCase);

        // Assert
        expect(result).toEqual({id: 1, userTags: [{tagName: "admin"}, {tagName: "user"}]});
    });

    it("should preserve primitive values", () => {
        // Arrange
        interface ItemWithPrimitives extends Item {
            id: number;
            isActive: boolean;
            score: number;
            description: string | null;
        }
        const snakeCase = {id: 1, is_active: true, score: 42, description: null};

        // Act
        const result = toCamelCaseTyped<ItemWithPrimitives>(snakeCase);

        // Assert
        expect(result).toEqual({id: 1, isActive: true, score: 42, description: null});
    });
});

describe("deepSnakeKeys", () => {
    it("should convert camelCase keys to snake_case", () => {
        // Arrange
        const camelCase = {userName: "test", createdAt: "2024-01-01"};

        // Act
        const result = deepSnakeKeys(camelCase);

        // Assert
        expect(result).toEqual({user_name: "test", created_at: "2024-01-01"});
    });

    it("should handle nested camelCase objects", () => {
        // Arrange
        const camelCase = {userProfile: {firstName: "John", lastName: "Doe"}};

        // Act
        const result = deepSnakeKeys(camelCase);

        // Assert
        expect(result).toEqual({user_profile: {first_name: "John", last_name: "Doe"}});
    });

    it("should handle already snake_case data", () => {
        // Arrange
        const snakeCase = {user_name: "test", created_at: "2024-01-01"};

        // Act
        const result = deepSnakeKeys(snakeCase);

        // Assert
        expect(result).toEqual({user_name: "test", created_at: "2024-01-01"});
    });
});

describe("normalizeForPath", () => {
    it("should remove accents from characters", () => {
        // Arrange
        const input = "café";

        // Act
        const result = normalizeForPath(input);

        // Assert
        expect(result).toBe("cafe");
    });

    it("should remove umlauts", () => {
        // Arrange
        const input = "München";

        // Act
        const result = normalizeForPath(input);

        // Assert
        expect(result).toBe("Munchen");
    });

    it("should remove tildes", () => {
        // Arrange
        const input = "España";

        // Act
        const result = normalizeForPath(input);

        // Assert
        expect(result).toBe("Espana");
    });

    it("should remove cedillas", () => {
        // Arrange
        const input = "français";

        // Act
        const result = normalizeForPath(input);

        // Assert
        expect(result).toBe("francais");
    });

    it("should remove apostrophes", () => {
        // Arrange
        const input = "it's a test";

        // Act
        const result = normalizeForPath(input);

        // Assert
        expect(result).toBe("its a test");
    });

    it("should handle strings without diacritics", () => {
        // Arrange
        const input = "hello world";

        // Act
        const result = normalizeForPath(input);

        // Assert
        expect(result).toBe("hello world");
    });

    it("should handle empty string", () => {
        // Arrange
        const input = "";

        // Act
        const result = normalizeForPath(input);

        // Assert
        expect(result).toBe("");
    });

    it("should handle multiple diacritics", () => {
        // Arrange
        const input = "crème brûlée";

        // Act
        const result = normalizeForPath(input);

        // Assert
        expect(result).toBe("creme brulee");
    });

    it("should preserve numbers and special characters", () => {
        // Arrange
        const input = "café-123!";

        // Act
        const result = normalizeForPath(input);

        // Assert
        expect(result).toBe("cafe-123!");
    });
});

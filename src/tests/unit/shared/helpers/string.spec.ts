import {describe, expect, it} from "vitest";

import type {Item} from "@/types/item";

import {toCamelCaseTyped} from "@/helpers/string";

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

import type {New} from "@shared/types/generics";
import type {Item} from "@shared/types/item";

import {assertDefined, isExisting} from "@shared/helpers/type-check";
import {describe, expect, it} from "vitest";

interface TestItem extends Item {
    id: number;
    name: string;
}

describe("assertDefined", () => {
    it("should return the value when it is defined", () => {
        // Arrange
        const value = "hello";

        // Act
        const result = assertDefined(value, "testValue");

        // Assert
        expect(result).toBe("hello");
    });

    it("should throw when value is null", () => {
        // Arrange
        const value: string | null = null;

        // Act & Assert
        expect(() => assertDefined(value, "videoRef")).toThrow("Expected videoRef to be defined but received null.");
    });

    it("should throw when value is undefined", () => {
        // Arrange
        const value: string | undefined = undefined;

        // Act & Assert
        expect(() => assertDefined(value, "canvasRef")).toThrow(
            "Expected canvasRef to be defined but received undefined.",
        );
    });

    it("should narrow the type from nullable to non-nullable", () => {
        // Arrange
        const value: number | null = 42;

        // Act
        const result: number = assertDefined(value, "count");

        // Assert
        expect(result).toBe(42);
    });

    it("should return falsy values that are not null or undefined", () => {
        // Arrange & Act & Assert
        expect(assertDefined(0, "zero")).toBe(0);
        expect(assertDefined("", "empty")).toBe("");
        expect(assertDefined(false, "flag")).toBe(false);
    });
});

describe("isExisting", () => {
    it("should return true for objects with an id", () => {
        // Arrange
        const existing: TestItem = {id: 1, name: "test"};

        // Act
        const result = isExisting<TestItem>(existing);

        // Assert
        expect(result).toBe(true);
    });

    it("should return false for objects without an id", () => {
        // Arrange
        const newItem: New<TestItem> = {name: "test"};

        // Act
        const result = isExisting<TestItem>(newItem);

        // Assert
        expect(result).toBe(false);
    });

    it("should return true for objects with id of 0", () => {
        // Arrange
        const existing: TestItem = {id: 0, name: "test"};

        // Act
        const result = isExisting<TestItem>(existing);

        // Assert
        expect(result).toBe(true);
    });

    it("should narrow type to existing item when returning true", () => {
        // Arrange
        const item: TestItem = {id: 1, name: "test"};

        // Act
        const result = isExisting<TestItem>(item);

        // Assert
        expect(result).toBe(true);
        expect(item.id).toBe(1);
    });

    it("should narrow type to new item when returning false", () => {
        // Arrange
        const item: New<TestItem> = {name: "test"};

        // Act
        const result = isExisting<TestItem>(item);

        // Assert
        expect(result).toBe(false);
        expect("id" in item).toBe(false);
    });
});

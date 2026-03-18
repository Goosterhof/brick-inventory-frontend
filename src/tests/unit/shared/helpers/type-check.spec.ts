import type {New} from "@shared/types/generics";
import type {Item} from "@shared/types/item";

import {MissingRefValueError} from "@shared/errors/missing-ref-value";
import {ensureRefValueExists, isExisting} from "@shared/helpers/type-check";
import {describe, expect, it} from "vitest";
import {ref} from "vue";

interface TestItem extends Item {
    id: number;
    name: string;
}

describe("ensureRefValueExists", () => {
    it("should return the value when the ref has a defined value", () => {
        // Arrange
        const testRef = ref<string | undefined>("hello");

        // Act
        const result = ensureRefValueExists(testRef);

        // Assert
        expect(result).toBe("hello");
    });

    it("should throw MissingRefValueError when the ref value is null", () => {
        // Arrange
        const testRef = ref<string | null>(null);

        // Act & Assert
        expect(() => ensureRefValueExists(testRef)).toThrow(MissingRefValueError);
    });

    it("should throw MissingRefValueError when the ref value is undefined", () => {
        // Arrange
        const testRef = ref<string | undefined>(undefined);

        // Act & Assert
        expect(() => ensureRefValueExists(testRef)).toThrow(MissingRefValueError);
    });

    it("should narrow the type from nullable to non-nullable", () => {
        // Arrange
        const testRef = ref<number | null>(42);

        // Act
        const result: number = ensureRefValueExists(testRef);

        // Assert
        expect(result).toBe(42);
    });

    it("should return falsy values that are not null or undefined", () => {
        // Arrange & Act & Assert
        expect(ensureRefValueExists(ref<number | undefined>(0))).toBe(0);
        expect(ensureRefValueExists(ref<string | undefined>(""))).toBe("");
        expect(ensureRefValueExists(ref<boolean | undefined>(false))).toBe(false);
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

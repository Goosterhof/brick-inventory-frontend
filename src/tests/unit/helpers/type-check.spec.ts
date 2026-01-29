import { describe, expect,it } from 'vitest';

import { isExisting } from '@/helpers/type-check';
import type { New } from '@/types/generics';
import type { Item } from '@/types/item';

interface TestItem extends Item {
    id: number;
    name: string;
}

describe('isExisting', () => {
    it('should return true for objects with an id', () => {
        // Arrange
        const existing: TestItem = { id: 1, name: 'test' };

        // Act
        const result = isExisting<TestItem>(existing);

        // Assert
        expect(result).toBe(true);
    });

    it('should return false for objects without an id', () => {
        // Arrange
        const newItem: New<TestItem> = { name: 'test' };

        // Act
        const result = isExisting<TestItem>(newItem);

        // Assert
        expect(result).toBe(false);
    });

    it('should return true for objects with id of 0', () => {
        // Arrange
        const existing: TestItem = { id: 0, name: 'test' };

        // Act
        const result = isExisting<TestItem>(existing);

        // Assert
        expect(result).toBe(true);
    });

    it('should narrow type to existing item when returning true', () => {
        // Arrange
        const item: TestItem = { id: 1, name: 'test' };

        // Act
        const result = isExisting<TestItem>(item);

        // Assert
        expect(result).toBe(true);
        expect(item.id).toBe(1);
    });

    it('should narrow type to new item when returning false', () => {
        // Arrange
        const item: New<TestItem> = { name: 'test' };

        // Act
        const result = isExisting<TestItem>(item);

        // Assert
        expect(result).toBe(false);
        expect('id' in item).toBe(false);
    });
});

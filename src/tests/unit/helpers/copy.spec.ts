import { describe, expect,it } from 'vitest';

import { deepCopy } from '@/helpers/copy';

describe('deepCopy', () => {
    describe('primitives', () => {
        it('should return the same string', () => {
            // Act
            const result = deepCopy('hello');

            // Assert
            expect(result).toBe('hello');
        });

        it('should return the same number', () => {
            // Act
            const result = deepCopy(42);

            // Assert
            expect(result).toBe(42);
        });

        it('should return the same boolean', () => {
            // Act
            const resultTrue = deepCopy(true);
            const resultFalse = deepCopy(false);

            // Assert
            expect(resultTrue).toBe(true);
            expect(resultFalse).toBe(false);
        });

        it('should return null', () => {
            // Act
            const result = deepCopy(null);

            // Assert
            expect(result).toBe(null);
        });

        it('should return undefined', () => {
            // Act
            const result = deepCopy(undefined);

            // Assert
            expect(result).toBe(undefined);
        });
    });

    describe('objects', () => {
        it('should create a shallow copy of a simple object', () => {
            // Arrange
            const original = { a: 1, b: 2 };

            // Act
            const copy = deepCopy(original);

            // Assert
            expect(copy).toEqual(original);
            expect(copy).not.toBe(original);
        });

        it('should create a deep copy of nested objects', () => {
            // Arrange
            const original = { a: { b: { c: 1 } } };

            // Act
            const copy = deepCopy(original);

            // Assert
            expect(copy).toEqual(original);
            expect(copy.a).not.toBe(original.a);
            expect(copy.a.b).not.toBe(original.a.b);
        });

        it('should not copy inherited properties', () => {
            // Arrange
            const parent = { inherited: true };
            const original = Object.create(parent) as { own: boolean; inherited?: boolean };
            original.own = true;

            // Act
            const copy = deepCopy(original);

            // Assert
            expect(copy.own).toBe(true);
            expect(copy.inherited).toBeUndefined();
        });

        it('should handle empty objects', () => {
            // Arrange
            const original = {};

            // Act
            const copy = deepCopy(original);

            // Assert
            expect(copy).toEqual({});
            expect(copy).not.toBe(original);
        });
    });

    describe('arrays', () => {
        it('should create a copy of a simple array', () => {
            // Arrange
            const original = [1, 2, 3];

            // Act
            const copy = deepCopy(original);

            // Assert
            expect(copy).toEqual(original);
            expect(copy).not.toBe(original);
        });

        it('should create a deep copy of nested arrays', () => {
            // Arrange
            const original: number[][] = [[1, 2], [3, 4]];

            // Act
            const copy = deepCopy(original);

            // Assert
            expect(copy).toEqual(original);
            expect(copy[0]).not.toBe(original[0]);
            expect(copy[1]).not.toBe(original[1]);
        });

        it('should create a deep copy of arrays containing objects', () => {
            // Arrange
            const original: Array<{ a?: number; b?: number }> = [{ a: 1 }, { b: 2 }];

            // Act
            const copy = deepCopy(original);

            // Assert
            expect(copy).toEqual(original);
            expect(copy[0]).not.toBe(original[0]);
            expect(copy[1]).not.toBe(original[1]);
        });

        it('should handle empty arrays', () => {
            // Arrange
            const original: unknown[] = [];

            // Act
            const copy = deepCopy(original);

            // Assert
            expect(copy).toEqual([]);
            expect(copy).not.toBe(original);
        });
    });

    describe('Date objects', () => {
        it('should create a copy of a Date', () => {
            // Arrange
            const original = new Date('2024-01-01');

            // Act
            const copy = deepCopy(original);

            // Assert
            expect(copy).toEqual(original);
            expect(copy).not.toBe(original);
            expect(copy instanceof Date).toBe(true);
        });

        it('should create independent Date copies', () => {
            // Arrange
            const original = new Date('2024-01-01');

            // Act
            const copy = deepCopy(original);
            copy.setFullYear(2025);

            // Assert
            expect(original.getFullYear()).toBe(2024);
            expect(copy.getFullYear()).toBe(2025);
        });

        it('should handle Date objects nested in objects', () => {
            // Arrange
            const original = { date: new Date('2024-01-01') };

            // Act
            const copy = deepCopy(original);
            copy.date.setFullYear(2025);

            // Assert
            expect(original.date.getFullYear()).toBe(2024);
            expect(copy.date.getFullYear()).toBe(2025);
        });
    });

    describe('mixed structures', () => {
        it('should handle objects with arrays', () => {
            // Arrange
            const original = { items: [1, 2, 3], name: 'test' };

            // Act
            const copy = deepCopy(original);
            copy.items.push(4);

            // Assert
            expect(original.items).toEqual([1, 2, 3]);
            expect(copy.items).toEqual([1, 2, 3, 4]);
        });

        it('should handle arrays with objects', () => {
            // Arrange
            const original: [{ id: number }, { id: number }] = [{ id: 1 }, { id: 2 }];

            // Act
            const copy = deepCopy(original);
            copy[0].id = 100;

            // Assert
            expect(original[0].id).toBe(1);
            expect(copy[0].id).toBe(100);
        });

        it('should handle deeply nested mixed structures', () => {
            // Arrange
            type User = { name: string; tags: string[] };
            const original: {
                users: [User, User];
                metadata: { createdAt: Date; nested: { deep: { value: number } } };
            } = {
                users: [
                    { name: 'Alice', tags: ['admin', 'user'] },
                    { name: 'Bob', tags: ['user'] },
                ],
                metadata: {
                    createdAt: new Date('2024-01-01'),
                    nested: { deep: { value: 42 } },
                },
            };

            // Act
            const copy = deepCopy(original);
            copy.users[0].tags.push('super');
            copy.metadata.nested.deep.value = 100;
            copy.metadata.createdAt.setFullYear(2025);

            // Assert
            expect(original.users[0].tags).toEqual(['admin', 'user']);
            expect(original.metadata.nested.deep.value).toBe(42);
            expect(original.metadata.createdAt.getFullYear()).toBe(2024);
        });
    });
});

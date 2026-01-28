import { describe, it, expect, vi, beforeEach } from 'vitest';
import { putInStorage, getFromStorage, clearStorage, removeStorageItem } from '@/services/storage';

describe('storage service', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('putInStorage', () => {
        it('should store string values directly', () => {
            // Arrange
            const key = 'testKey';
            const value = 'testValue';

            // Act
            putInStorage(key, value);

            // Assert
            expect(localStorage.getItem(key)).toBe('testValue');
        });

        it('should stringify non-string values', () => {
            // Arrange
            const key = 'testKey';
            const value = { name: 'test', count: 42 };

            // Act
            putInStorage(key, value);

            // Assert
            expect(localStorage.getItem(key)).toBe('{"name":"test","count":42}');
        });

        it('should stringify arrays', () => {
            // Arrange
            const key = 'testKey';
            const value = [1, 2, 3];

            // Act
            putInStorage(key, value);

            // Assert
            expect(localStorage.getItem(key)).toBe('[1,2,3]');
        });

        it('should stringify boolean values', () => {
            // Arrange
            const key = 'testKey';

            // Act
            putInStorage(key, true);

            // Assert
            expect(localStorage.getItem(key)).toBe('true');
        });

        it('should log error when quota is exceeded', () => {
            // Arrange
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw quotaError;
            });

            // Act
            putInStorage('key', 'value');

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('localStorage quota exceeded');
        });

        it('should log other errors', () => {
            // Arrange
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const genericError = new Error('Some error');
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw genericError;
            });

            // Act
            putInStorage('key', 'value');

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(genericError);
        });
    });

    describe('getFromStorage', () => {
        it('should return undefined when key does not exist', () => {
            // Act
            const result = getFromStorage('nonExistentKey');

            // Assert
            expect(result).toBeUndefined();
        });

        it('should return default value when key does not exist', () => {
            // Arrange
            const defaultValue = 'default';

            // Act
            const result = getFromStorage('nonExistentKey', defaultValue);

            // Assert
            expect(result).toBe('default');
        });

        it('should return parsed JSON for object values', () => {
            // Arrange
            const value = { name: 'test', count: 42 };
            localStorage.setItem('testKey', JSON.stringify(value));

            // Act
            const result = getFromStorage<typeof value>('testKey');

            // Assert
            expect(result).toEqual({ name: 'test', count: 42 });
        });

        it('should return parsed JSON for array values', () => {
            // Arrange
            localStorage.setItem('testKey', '[1,2,3]');

            // Act
            const result = getFromStorage<number[]>('testKey');

            // Assert
            expect(result).toEqual([1, 2, 3]);
        });

        it('should return raw string when default is a string', () => {
            // Arrange
            localStorage.setItem('testKey', '5e3');

            // Act
            const result = getFromStorage('testKey', 'default');

            // Assert
            expect(result).toBe('5e3');
        });

        it('should return string value when JSON parse fails', () => {
            // Arrange
            localStorage.setItem('testKey', 'not-json');

            // Act
            const result = getFromStorage<string>('testKey');

            // Assert
            expect(result).toBe('not-json');
        });

        it('should return boolean values correctly', () => {
            // Arrange
            localStorage.setItem('testKey', 'true');

            // Act
            const result = getFromStorage<boolean>('testKey');

            // Assert
            expect(result).toBe(true);
        });
    });

    describe('clearStorage', () => {
        it('should clear all items from localStorage', () => {
            // Arrange
            localStorage.setItem('key1', 'value1');
            localStorage.setItem('key2', 'value2');

            // Act
            clearStorage();

            // Assert
            expect(localStorage.length).toBe(0);
        });
    });

    describe('removeStorageItem', () => {
        it('should remove specific item from localStorage', () => {
            // Arrange
            localStorage.setItem('key1', 'value1');
            localStorage.setItem('key2', 'value2');

            // Act
            removeStorageItem('key1');

            // Assert
            expect(localStorage.getItem('key1')).toBeNull();
            expect(localStorage.getItem('key2')).toBe('value2');
        });

        it('should not throw when removing non-existent key', () => {
            // Act & Assert
            expect(() => removeStorageItem('nonExistentKey')).not.toThrow();
        });

        it('should log errors on removal failure', () => {
            // Arrange
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const genericError = new Error('Removal failed');
            vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw genericError;
            });

            // Act
            removeStorageItem('key');

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(genericError);
        });
    });
});

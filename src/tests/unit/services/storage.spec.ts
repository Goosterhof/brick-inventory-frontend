/* eslint-disable no-restricted-globals */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStorageService } from '@/services/storage';

describe('storage service', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('createStorageService', () => {
        it('should return all expected methods', () => {
            // Act
            const storage = createStorageService();

            // Assert
            expect(storage).toHaveProperty('put');
            expect(storage).toHaveProperty('get');
            expect(storage).toHaveProperty('remove');
            expect(storage).toHaveProperty('clear');
        });
    });

    describe('put', () => {
        it('should store string values directly', () => {
            // Arrange
            const storage = createStorageService();

            // Act
            storage.put('testKey', 'testValue');

            // Assert
            expect(localStorage.getItem('testKey')).toBe('testValue');
        });

        it('should stringify non-string values', () => {
            // Arrange
            const storage = createStorageService();
            const value = { name: 'test', count: 42 };

            // Act
            storage.put('testKey', value);

            // Assert
            expect(localStorage.getItem('testKey')).toBe('{"name":"test","count":42}');
        });

        it('should stringify arrays', () => {
            // Arrange
            const storage = createStorageService();

            // Act
            storage.put('testKey', [1, 2, 3]);

            // Assert
            expect(localStorage.getItem('testKey')).toBe('[1,2,3]');
        });

        it('should stringify boolean values', () => {
            // Arrange
            const storage = createStorageService();

            // Act
            storage.put('testKey', true);

            // Assert
            expect(localStorage.getItem('testKey')).toBe('true');
        });

        it('should store with prefix when provided', () => {
            // Arrange
            const storage = createStorageService('auth');

            // Act
            storage.put('token', 'abc123');

            // Assert
            expect(localStorage.getItem('auth:token')).toBe('abc123');
        });

        it('should log error when quota is exceeded', () => {
            // Arrange
            const storage = createStorageService();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw quotaError;
            });

            // Act
            storage.put('key', 'value');

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('localStorage quota exceeded');
        });

        it('should log other errors', () => {
            // Arrange
            const storage = createStorageService();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const genericError = new Error('Some error');
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw genericError;
            });

            // Act
            storage.put('key', 'value');

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(genericError);
        });
    });

    describe('get', () => {
        it('should return undefined when key does not exist', () => {
            // Arrange
            const storage = createStorageService();

            // Act
            const result = storage.get('nonExistentKey');

            // Assert
            expect(result).toBeUndefined();
        });

        it('should return default value when key does not exist', () => {
            // Arrange
            const storage = createStorageService();

            // Act
            const result = storage.get('nonExistentKey', 'default');

            // Assert
            expect(result).toBe('default');
        });

        it('should return parsed JSON for object values', () => {
            // Arrange
            const storage = createStorageService();
            const value = { name: 'test', count: 42 };
            localStorage.setItem('testKey', JSON.stringify(value));

            // Act
            const result = storage.get<typeof value>('testKey');

            // Assert
            expect(result).toEqual({ name: 'test', count: 42 });
        });

        it('should return parsed JSON for array values', () => {
            // Arrange
            const storage = createStorageService();
            localStorage.setItem('testKey', '[1,2,3]');

            // Act
            const result = storage.get<number[]>('testKey');

            // Assert
            expect(result).toEqual([1, 2, 3]);
        });

        it('should return raw string when default is a string', () => {
            // Arrange
            const storage = createStorageService();
            localStorage.setItem('testKey', '5e3');

            // Act
            const result = storage.get('testKey', 'default');

            // Assert
            expect(result).toBe('5e3');
        });

        it('should return string value when JSON parse fails', () => {
            // Arrange
            const storage = createStorageService();
            localStorage.setItem('testKey', 'not-json');

            // Act
            const result = storage.get<string>('testKey');

            // Assert
            expect(result).toBe('not-json');
        });

        it('should return boolean values correctly', () => {
            // Arrange
            const storage = createStorageService();
            localStorage.setItem('testKey', 'true');

            // Act
            const result = storage.get<boolean>('testKey');

            // Assert
            expect(result).toBe(true);
        });

        it('should get with prefix when provided', () => {
            // Arrange
            const storage = createStorageService('auth');
            localStorage.setItem('auth:token', 'abc123');

            // Act
            const result = storage.get<string>('token');

            // Assert
            expect(result).toBe('abc123');
        });
    });

    describe('clear', () => {
        it('should clear all items from localStorage when no prefix', () => {
            // Arrange
            const storage = createStorageService();
            localStorage.setItem('key1', 'value1');
            localStorage.setItem('key2', 'value2');

            // Act
            storage.clear();

            // Assert
            expect(localStorage.length).toBe(0);
        });

        it('should only clear prefixed items when prefix is set', () => {
            // Arrange
            const storage = createStorageService('app');
            localStorage.setItem('app:key1', 'value1');
            localStorage.setItem('app:key2', 'value2');
            localStorage.setItem('other:key', 'value3');
            localStorage.setItem('unprefixed', 'value4');

            // Act
            storage.clear();

            // Assert
            expect(localStorage.getItem('app:key1')).toBeNull();
            expect(localStorage.getItem('app:key2')).toBeNull();
            expect(localStorage.getItem('other:key')).toBe('value3');
            expect(localStorage.getItem('unprefixed')).toBe('value4');
        });
    });

    describe('remove', () => {
        it('should remove specific item from localStorage', () => {
            // Arrange
            const storage = createStorageService();
            localStorage.setItem('key1', 'value1');
            localStorage.setItem('key2', 'value2');

            // Act
            storage.remove('key1');

            // Assert
            expect(localStorage.getItem('key1')).toBeNull();
            expect(localStorage.getItem('key2')).toBe('value2');
        });

        it('should remove prefixed item when prefix is set', () => {
            // Arrange
            const storage = createStorageService('auth');
            localStorage.setItem('auth:token', 'abc123');
            localStorage.setItem('other:token', 'xyz789');

            // Act
            storage.remove('token');

            // Assert
            expect(localStorage.getItem('auth:token')).toBeNull();
            expect(localStorage.getItem('other:token')).toBe('xyz789');
        });

        it('should not throw when removing non-existent key', () => {
            // Arrange
            const storage = createStorageService();

            // Act & Assert
            expect(() => storage.remove('nonExistentKey')).not.toThrow();
        });

        it('should log errors on removal failure', () => {
            // Arrange
            const storage = createStorageService();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const genericError = new Error('Removal failed');
            vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw genericError;
            });

            // Act
            storage.remove('key');

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(genericError);
        });
    });

    describe('prefix isolation', () => {
        it('should isolate storage between different prefixes', () => {
            // Arrange
            const authStorage = createStorageService('auth');
            const settingsStorage = createStorageService('settings');

            // Act
            authStorage.put('token', 'auth-token');
            settingsStorage.put('token', 'settings-token');

            // Assert
            expect(authStorage.get('token')).toBe('auth-token');
            expect(settingsStorage.get('token')).toBe('settings-token');
            expect(localStorage.getItem('auth:token')).toBe('auth-token');
            expect(localStorage.getItem('settings:token')).toBe('settings-token');
        });
    });
});

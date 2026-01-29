/* eslint-disable no-restricted-globals */

/**
 * Retrieve a value from storage.
 *
 * @remarks
 * Parsing behavior depends on the default value type:
 * - No default or non-string default: Attempts JSON.parse, falls back to raw string on failure
 * - String default: Returns the raw stored string without JSON parsing
 *
 * This prevents unintended conversions (e.g., stored "5e3" becoming number 5000).
 *
 * @example
 * ```ts
 * storage.put('key', '5e3');
 * storage.get('key');           // Returns number 5000 (JSON parsed)
 * storage.get('key', '');       // Returns string "5e3" (raw)
 * ```
 */
interface Get {
    <T>(key: string): T | undefined;
    <T>(key: string, defaultValue: T): T;
}

export interface StorageService {
    put: (key: string, value: unknown) => void;
    get: Get;
    remove: (key: string) => void;
    clear: () => void;
}

export const createStorageService = (prefix: string): StorageService => {
    const prefixKey = (key: string): string => `${prefix}:${key}`;

    const put = (key: string, value: unknown): void => {
        const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);

        try {
            localStorage.setItem(prefixKey(key), valueToStore);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded');
                return;
            }
            console.error(error);
        }
    };

    const get: Get = <T>(key: string, defaultValue?: T): T | undefined => {
        let storedValue: string | null;
        try {
            storedValue = localStorage.getItem(prefixKey(key));
        } catch (error) {
            console.error(error);
            return defaultValue;
        }

        if (storedValue === null) return defaultValue;

        // If default is a string, return raw value to avoid unintended conversions (e.g., "5e3" -> 5000)
        if (typeof defaultValue === 'string') return storedValue as T;

        try {
            return JSON.parse(storedValue) as T;
        } catch {
            // Value is not valid JSON, return as-is
            return storedValue as unknown as T;
        }
    };

    const remove = (key: string): void => {
        try {
            localStorage.removeItem(prefixKey(key));
        } catch (error) {
            console.error(error);
        }
    };

    const clear = (): void => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(`${prefix}:`)) {
                keysToRemove.push(key);
            }
        }
        for (const key of keysToRemove) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(error);
            }
        }
    };

    return { put, get, remove, clear };
};

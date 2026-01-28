/**
 * Store a value in localStorage under the given key.
 * Non-string values are JSON-stringified before storage.
 */
export const putInStorage = (key: string, value: unknown): void => {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);

    try {
        localStorage.setItem(key, valueToStore);
    } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded');
            return;
        }
        console.error(error);
    }
};

interface GetFromStorage {
    <T>(key: string): T | undefined;
    <T>(key: string, defaultValue: T): T;
}

/**
 * Retrieve a value from localStorage.
 * Returns the defaultValue if the key doesn't exist.
 * Automatically parses JSON unless the defaultValue is a string.
 */
export const getFromStorage: GetFromStorage = <T>(key: string, defaultValue?: T): T | undefined => {
    const storedValue = localStorage.getItem(key);

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

/**
 * Clear all items from localStorage.
 */
export const clearStorage = (): void => {
    localStorage.clear();
};

/**
 * Remove a specific item from localStorage.
 */
export const removeStorageItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(error);
    }
};

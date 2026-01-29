export type Writable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Makes a deep copy of plain objects and arrays.
 * If it's not an object or array, it will return toCopy.
 *
 * Handles: primitives, plain objects, arrays, Date, null
 * Does NOT handle: Map, Set, RegExp, functions, circular references
 *
 * We use deepCopy over structuredClone because deepCopy can be significantly faster (up to ~10x times)
 * depending on the type and size of an object.
 */
export const deepCopy = <T = unknown>(toCopy: T): Writable<T> => {
    if (typeof toCopy !== 'object' || toCopy === null) return toCopy;

    if (toCopy instanceof Date) return <T>new Date(toCopy.getTime());

    if (Array.isArray(toCopy)) return <T>toCopy.map(value => deepCopy(value));

    const copiedObject: Record<string, unknown> = {};

    for (const key of Object.keys(toCopy)) {
        copiedObject[key] = deepCopy((toCopy as Record<string, unknown>)[key]);
    }

    return copiedObject as T;
};

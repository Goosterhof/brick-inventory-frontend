export type Writable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Makes a deep copy
 * If it's not an object or array, it will return toCopy
 *
 * We use deepCopy over structuredClone because deepCopy can be significantly faster (up to ~10x times)
 * depending on the type and size of an object
 */
export const deepCopy = <T = unknown>(toCopy: T): Writable<T> => {
    if (typeof toCopy !== 'object' || toCopy === null) return toCopy;

    if (Array.isArray(toCopy)) return <T>toCopy.map(value => deepCopy(value));

    const copiedObject: Partial<T> = {};

    // @ts-expect-error this can be assigned
    for (const key in toCopy) copiedObject[key] = deepCopy(toCopy[key]);

    return <T>copiedObject;
};

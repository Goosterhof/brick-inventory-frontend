type WritablePrimitive = undefined | null | boolean | string | number | Date;

export type Writable<T> = T extends WritablePrimitive
  ? T
  : T extends readonly [...infer U]
    ? { -readonly [K in keyof U]: Writable<U[K]> }
    : T extends ReadonlyArray<infer U>
      ? Array<Writable<U>>
      : T extends object
        ? { -readonly [K in keyof T]: Writable<T[K]> }
        : T;

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
export const deepCopy = <T>(toCopy: T): Writable<T> => {
  if (typeof toCopy !== "object" || toCopy === null) return toCopy as Writable<T>;

  if (toCopy instanceof Date) return new Date(toCopy.getTime()) as Writable<T>;

  if (Array.isArray(toCopy)) return toCopy.map((value) => deepCopy(value)) as Writable<T>;

  const copiedObject: Record<string, unknown> = {};

  for (const key of Object.keys(toCopy)) {
    copiedObject[key] = deepCopy((toCopy as Record<string, unknown>)[key]);
  }

  return copiedObject as Writable<T>;
};

import type {DeepSnakeKeys} from "string-ts";

import {deepCamelKeys, deepSnakeKeys} from "string-ts";

export {deepSnakeKeys};

// Helper to convert API (snake_case) response to the camelCase generic T.
// We assert because the runtime transformation aligns keys with T's shape.
export const toCamelCaseTyped = <T extends object>(data: T | DeepSnakeKeys<T>): T => <T>(<unknown>deepCamelKeys(data));

/**
 * Normalizes a string for use in URL paths by removing diacritics (accents, umlauts, etc.)
 * and apostrophes. Useful for creating URL-safe slugs from localized text.
 *
 * @example normalizeForPath("café") // "cafe"
 * @example normalizeForPath("it's") // "its"
 */
export const normalizeForPath = (string: string): string =>
    string
        .normalize("NFD")
        // https://caniuse.com/mdn-javascript_builtins_regexp_property_escapes
        // Note there is no IE support. but rollup/babel has a polyfill for this regexp.
        .replace(/\p{Diacritic}/gu, "")
        .replace(/'/g, "")
        .normalize("NFC");

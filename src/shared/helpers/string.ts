export {deepCamelKeys, deepSnakeKeys, toCamelCaseTyped} from "@script-development/fs-helpers";

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

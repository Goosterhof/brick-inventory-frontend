import type {ComputedRef, Ref} from "vue";

import {computed, ref} from "vue";

type TranslationSchema = Record<string, Record<string, string>>;

type NestedKeys<T extends TranslationSchema, K extends keyof T = keyof T> = K extends string
    ? T[K] extends Record<string, string>
        ? `${K}.${keyof T[K] & string}`
        : never
    : never;

export interface TranslationService<TSchema extends TranslationSchema, TLocale extends string> {
    t: (key: NestedKeys<TSchema>, params?: Record<string, string>) => ComputedRef<string>;
    locale: Ref<TLocale>;
}

export const createTranslationService = <const TSchema extends TranslationSchema, const TLocale extends string>(
    translations: Record<TLocale, TSchema>,
    defaultLocale: NoInfer<TLocale>,
): TranslationService<TSchema, TLocale> => {
    const locale = ref(defaultLocale) as Ref<TLocale>;
    const cache = new Map<string, ComputedRef<string>>();

    const getCacheKey = (key: string, params?: Record<string, string>): string => {
        if (!params) {
            return key;
        }
        return `${key}:${JSON.stringify(params)}`;
    };

    const createTranslationComputed = (key: string, params?: Record<string, string>): ComputedRef<string> => {
        return computed(() => {
            const parts = key.split(".");

            if (parts.length !== 2) {
                return key;
            }

            const [section, name] = parts as [string, string];
            const localeData = translations[locale.value] as Record<string, Record<string, string>> | undefined;
            const sectionData = localeData?.[section];
            let text = sectionData?.[name];

            if (text === undefined) {
                return key;
            }

            if (params) {
                for (const [param, value] of Object.entries(params)) {
                    text = text.replace(`{${param}}`, value);
                }
            }

            return text;
        });
    };

    const t = (key: NestedKeys<TSchema>, params?: Record<string, string>): ComputedRef<string> => {
        const keyString = key as string;
        const cacheKey = getCacheKey(keyString, params);

        const cached = cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const translationComputed = createTranslationComputed(keyString, params);
        cache.set(cacheKey, translationComputed);
        return translationComputed;
    };

    return {t, locale};
};

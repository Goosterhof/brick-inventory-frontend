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

    const t = (key: NestedKeys<TSchema>, params?: Record<string, string>): ComputedRef<string> => {
        return computed(() => {
            const keyString = key as string;
            const parts = keyString.split(".");

            if (parts.length !== 2) {
                return keyString;
            }

            const [section, name] = parts as [string, string];
            const localeData = translations[locale.value] as Record<string, Record<string, string>> | undefined;
            const sectionData = localeData?.[section];
            let text = sectionData?.[name];

            if (text === undefined) {
                return keyString;
            }

            if (params) {
                for (const [param, value] of Object.entries(params)) {
                    text = text.replace(`{${param}}`, value);
                }
            }

            return text;
        });
    };

    return {t, locale};
};

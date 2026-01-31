import type {ComputedRef, Ref} from "vue";

import {computed, ref} from "vue";

type NestedKeys<T, K extends keyof T = keyof T> = K extends string
    ? T[K] extends Record<string, string>
        ? `${K}.${keyof T[K] & string}`
        : never
    : never;

export interface TranslationService<
    TTranslations extends Record<string, Record<string, Record<string, string>>>,
    TLocale extends keyof TTranslations = keyof TTranslations,
> {
    t: (key: NestedKeys<TTranslations[TLocale]>, params?: Record<string, string>) => ComputedRef<string>;
    locale: Ref<keyof TTranslations>;
}

export const createTranslationService = <
    const TTranslations extends Record<string, Record<string, Record<string, string>>>,
    TLocale extends keyof TTranslations = keyof TTranslations,
>(
    translations: TTranslations,
    defaultLocale: TLocale,
): TranslationService<TTranslations, TLocale> => {
    const locale = ref(defaultLocale) as Ref<keyof TTranslations>;

    const t = (key: NestedKeys<TTranslations[TLocale]>, params?: Record<string, string>): ComputedRef<string> => {
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

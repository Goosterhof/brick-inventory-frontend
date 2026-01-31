import {describe, expect, it} from "vitest";

import {createTranslationService} from "@/services/translation";

const translations = {
    en: {
        common: {save: "Save", cancel: "Cancel"},
        errors: {required: "{field} is required", minLength: "{field} must be at least {min} characters"},
    },
    nl: {
        common: {save: "Opslaan", cancel: "Annuleren"},
        errors: {required: "{field} is verplicht", minLength: "{field} moet minimaal {min} tekens bevatten"},
    },
} as const;

describe("translation service", () => {
    describe("createTranslationService", () => {
        it("should return t function and locale ref", () => {
            // Act
            const service = createTranslationService(translations, "en");

            // Assert
            expect(service).toHaveProperty("t");
            expect(service).toHaveProperty("locale");
        });

        it("should set default locale", () => {
            // Act
            const service = createTranslationService(translations, "nl");

            // Assert
            expect(service.locale.value).toBe("nl");
        });
    });

    describe("t", () => {
        it("should return computed with translation for given key", () => {
            // Arrange
            const {t} = createTranslationService(translations, "en");

            // Act
            const result = t("common.save");

            // Assert
            expect(result.value).toBe("Save");
        });

        it("should return translation for nested keys", () => {
            // Arrange
            const {t} = createTranslationService(translations, "en");

            // Act
            const result = t("errors.required", {field: "Name"});

            // Assert
            expect(result.value).toBe("Name is required");
        });

        it("should interpolate multiple params", () => {
            // Arrange
            const {t} = createTranslationService(translations, "en");

            // Act
            const result = t("errors.minLength", {field: "Password", min: "8"});

            // Assert
            expect(result.value).toBe("Password must be at least 8 characters");
        });

        it("should update reactively when locale changes", () => {
            // Arrange
            const {t, locale} = createTranslationService(translations, "en");
            const save = t("common.save");

            // Assert initial value
            expect(save.value).toBe("Save");

            // Act
            locale.value = "nl";

            // Assert updated value
            expect(save.value).toBe("Opslaan");
        });

        it("should update interpolated translations when locale changes", () => {
            // Arrange
            const {t, locale} = createTranslationService(translations, "en");
            const required = t("errors.required", {field: "Email"});

            // Assert initial value
            expect(required.value).toBe("Email is required");

            // Act
            locale.value = "nl";

            // Assert updated value
            expect(required.value).toBe("Email is verplicht");
        });
    });

    describe("locale", () => {
        it("should be a reactive ref", () => {
            // Arrange
            const {locale} = createTranslationService(translations, "en");

            // Act
            locale.value = "nl";

            // Assert
            expect(locale.value).toBe("nl");
        });
    });
});

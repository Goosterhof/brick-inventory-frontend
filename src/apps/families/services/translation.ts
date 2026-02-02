import {createTranslationService} from "@shared/services/translation";

const translations = {
    en: {
        common: {
            loading: "Loading...",
            save: "Save",
            cancel: "Cancel",
            delete: "Delete",
            edit: "Edit",
            create: "Create",
            back: "Back",
            submit: "Submit",
            search: "Search",
            noResults: "No results found",
        },
        auth: {
            login: "Login",
            logout: "Logout",
            register: "Register",
            email: "Email",
            password: "Password",
            passwordConfirmation: "Password Confirmation",
            forgotPassword: "Forgot Password?",
            resetPassword: "Reset Password",
            name: "Name",
            familyName: "Family Name",
        },
        errors: {
            required: "This field is required",
            invalidEmail: "Invalid email address",
            minLength: "Must be at least {min} characters",
            maxLength: "Must be at most {max} characters",
            passwordMismatch: "Passwords do not match",
            generic: "An error occurred",
            notFound: "Not found",
            unauthorized: "Unauthorized",
        },
        navigation: {
            home: "Home",
            about: "About",
            dashboard: "Dashboard",
            settings: "Settings",
        },
    },
    nl: {
        common: {
            loading: "Laden...",
            save: "Opslaan",
            cancel: "Annuleren",
            delete: "Verwijderen",
            edit: "Bewerken",
            create: "Aanmaken",
            back: "Terug",
            submit: "Verzenden",
            search: "Zoeken",
            noResults: "Geen resultaten gevonden",
        },
        auth: {
            login: "Inloggen",
            logout: "Uitloggen",
            register: "Registreren",
            email: "E-mail",
            password: "Wachtwoord",
            passwordConfirmation: "Wachtwoord bevestigen",
            forgotPassword: "Wachtwoord vergeten?",
            resetPassword: "Wachtwoord resetten",
            name: "Naam",
            familyName: "Familienaam",
        },
        errors: {
            required: "Dit veld is verplicht",
            invalidEmail: "Ongeldig e-mailadres",
            minLength: "Moet minimaal {min} tekens zijn",
            maxLength: "Mag maximaal {max} tekens zijn",
            passwordMismatch: "Wachtwoorden komen niet overeen",
            generic: "Er is een fout opgetreden",
            notFound: "Niet gevonden",
            unauthorized: "Niet geautoriseerd",
        },
        navigation: {
            home: "Home",
            about: "Over",
            dashboard: "Dashboard",
            settings: "Instellingen",
        },
    },
} as const;

export type Locale = keyof typeof translations;
export type TranslationSchema = (typeof translations)["en"];

export const familyTranslationService = createTranslationService(translations, "en");

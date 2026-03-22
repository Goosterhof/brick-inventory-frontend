import type {AuthService} from "@shared/services/auth/types";
import type {HttpService} from "@shared/services/http";

import {vi} from "vitest";

import type {MockedService} from "./mockTypes";

export interface FamilyServicesMock {
    familyHttpService: MockedService<HttpService>;
    familyAuthService: MockedService<AuthService<{id: number}>>;
    familyRouterService: Record<string, unknown>;
    familyTranslationService: {t: (key: string) => {value: string}; locale: {value: string}};
    familyLoadingService: Record<string, unknown>;
    familySoundService: Record<string, unknown>;
    familyStorageService: Record<string, unknown>;
    FamilyRouterView: Record<string, unknown>;
    FamilyRouterLink: Record<string, unknown>;
}

type FamilyServicesOverrides = {
    [K in keyof FamilyServicesMock]?: Partial<FamilyServicesMock[K]>;
};

export const createMockFamilyServices = (overrides?: FamilyServicesOverrides): FamilyServicesMock => {
    const defaults: FamilyServicesMock = {
        familyHttpService: {
            getRequest: vi.fn(),
            postRequest: vi.fn(),
            putRequest: vi.fn(),
            patchRequest: vi.fn(),
            deleteRequest: vi.fn(),
            registerRequestMiddleware: vi.fn(() => vi.fn()),
            registerResponseMiddleware: vi.fn(() => vi.fn()),
            registerResponseErrorMiddleware: vi.fn(() => vi.fn()),
        },
        familyAuthService: {
            isLoggedIn: {value: false},
            user: {value: null},
            userId: vi.fn(),
            register: vi.fn(),
            login: vi.fn(),
            logout: vi.fn(),
            checkIfLoggedIn: vi.fn(),
            sendEmailResetPassword: vi.fn(),
            resetPassword: vi.fn(),
        },
        familyRouterService: {
            goToDashboard: vi.fn(),
            goToRoute: vi.fn(),
            goToCreatePage: vi.fn(),
            goToOverviewPage: vi.fn(),
            goToEditPage: vi.fn(),
            goToShowPage: vi.fn(),
            goBack: vi.fn(),
        },
        familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
        familyLoadingService: {},
        familySoundService: {},
        familyStorageService: {},
        FamilyRouterView: {template: "<div><slot /></div>"},
        FamilyRouterLink: {template: "<a><slot /></a>"},
    };

    if (!overrides) return defaults;

    return {
        familyHttpService: {...defaults.familyHttpService, ...overrides.familyHttpService},
        familyAuthService: {...defaults.familyAuthService, ...overrides.familyAuthService},
        familyRouterService: {...defaults.familyRouterService, ...overrides.familyRouterService},
        familyTranslationService: {...defaults.familyTranslationService, ...overrides.familyTranslationService},
        familyLoadingService: {...defaults.familyLoadingService, ...overrides.familyLoadingService},
        familySoundService: {...defaults.familySoundService, ...overrides.familySoundService},
        familyStorageService: {...defaults.familyStorageService, ...overrides.familyStorageService},
        FamilyRouterView: {...defaults.FamilyRouterView, ...overrides.FamilyRouterView},
        FamilyRouterLink: {...defaults.FamilyRouterLink, ...overrides.FamilyRouterLink},
    };
};

export interface FamilyStoresMock {
    familySetStoreModule: Record<string, unknown>;
    storageOptionStoreModule: Record<string, unknown>;
}

type FamilyStoresOverrides = {
    [K in keyof FamilyStoresMock]?: Partial<FamilyStoresMock[K]>;
};

export const createMockFamilyStores = (overrides?: FamilyStoresOverrides): FamilyStoresMock => {
    const defaults: FamilyStoresMock = {familySetStoreModule: {}, storageOptionStoreModule: {}};

    if (!overrides) return defaults;

    return {
        familySetStoreModule: {...defaults.familySetStoreModule, ...overrides.familySetStoreModule},
        storageOptionStoreModule: {...defaults.storageOptionStoreModule, ...overrides.storageOptionStoreModule},
    };
};

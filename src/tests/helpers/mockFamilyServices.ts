import {vi} from "vitest";

import type {MockedService} from "./mockTypes";

interface MockHttpService {
    getRequest: (...args: unknown[]) => unknown;
    postRequest: (...args: unknown[]) => unknown;
    putRequest: (...args: unknown[]) => unknown;
    patchRequest: (...args: unknown[]) => unknown;
    deleteRequest: (...args: unknown[]) => unknown;
    registerRequestMiddleware: (...args: unknown[]) => unknown;
    registerResponseMiddleware: (...args: unknown[]) => unknown;
    registerResponseErrorMiddleware: (...args: unknown[]) => unknown;
}

interface MockAuthService {
    isLoggedIn: {value: boolean};
    user: {value: unknown};
    userId: () => unknown;
    register: (...args: unknown[]) => unknown;
    login: (...args: unknown[]) => unknown;
    logout: () => unknown;
    checkIfLoggedIn: () => unknown;
    sendEmailResetPassword: (...args: unknown[]) => unknown;
    resetPassword: (...args: unknown[]) => unknown;
}

export interface FamilyServicesMock {
    familyHttpService: MockedService<MockHttpService>;
    familyAuthService: MockedService<MockAuthService>;
    familyRouterService: Record<string, unknown>;
    familyTranslationService: {t: (key: string) => {value: string}; locale: {value: string}};
    familyLoadingService: Record<string, unknown>;
    familySoundService: Record<string, unknown>;
    familyStorageService: Record<string, unknown>;
    familySetStoreModule: Record<string, unknown>;
    FamilyRouterView: {template: string};
    FamilyRouterLink: {template: string};
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
        familyTranslationService: {
            t: (key: string) => ({value: key}),
            locale: {value: "en"},
        },
        familyLoadingService: {},
        familySoundService: {},
        familyStorageService: {},
        familySetStoreModule: {},
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
        familySetStoreModule: {...defaults.familySetStoreModule, ...overrides.familySetStoreModule},
        FamilyRouterView: {...defaults.FamilyRouterView, ...overrides.FamilyRouterView},
        FamilyRouterLink: {...defaults.FamilyRouterLink, ...overrides.FamilyRouterLink},
    };
};

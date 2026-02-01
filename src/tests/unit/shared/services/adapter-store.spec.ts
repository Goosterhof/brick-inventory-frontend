import type {HttpService} from "@shared/services/http";
import type {LoadingService} from "@shared/services/loading";
import type {Adapted, AdapterStoreModule, NewAdapted} from "@shared/services/resource-adapter";
import type {StorageService} from "@shared/services/storage";
import type {New} from "@shared/types/generics";
import type {Item} from "@shared/types/item";
import type {AxiosResponse} from "axios";
import type {Ref} from "vue";

import {EntryNotFoundError, type TranslationServiceForError} from "@shared/errors/entry-not-found";
import {createAdapterStoreModule, type Adapter, type AdapterStoreConfig} from "@shared/services/adapter-store";
import {describe, expect, it, vi} from "vitest";
import {ref} from "vue";

type TestStorageService = Pick<StorageService, "get" | "put">;
type TestLoadingService = Pick<LoadingService, "ensureLoadingFinished">;

interface TestItem extends Item {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

type TestAdapted = Adapted<TestItem> & {testMethod: () => string};
type TestNewAdapted = NewAdapted<TestItem> & {testMethod: () => string};

describe("createAdapterStoreModule", () => {
    describe("getAll", () => {
        it("should return computed with empty array when no items", () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };

            // Act
            const store = createAdapterStoreModule(config);

            // Assert
            expect(store.getAll.value).toEqual([]);
        });

        it("should return computed with all adapted items", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const items: TestItem[] = [
                {id: 1, name: "Item 1", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
                {id: 2, name: "Item 2", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
            ];
            vi.mocked(httpService.getRequest).mockResolvedValue({data: items} as AxiosResponse<TestItem[]>);
            const store = createAdapterStoreModule(config);

            // Act
            await store.retrieveAll();

            // Assert
            expect(store.getAll.value).toHaveLength(2);
            expect(store.getAll.value[0]?.testMethod()).toBe("adapted-1");
            expect(store.getAll.value[1]?.testMethod()).toBe("adapted-2");
        });

        it("should update when items are added to state", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const store = createAdapterStoreModule(config);
            expect(store.getAll.value).toHaveLength(0);
            const items: TestItem[] = [
                {id: 1, name: "Item 1", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
            ];
            vi.mocked(httpService.getRequest).mockResolvedValue({data: items} as AxiosResponse<TestItem[]>);

            // Act
            await store.retrieveAll();

            // Assert
            expect(store.getAll.value).toHaveLength(1);
        });
    });

    describe("getById", () => {
        it("should return computed with undefined for non-existent id", () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };

            // Act
            const store = createAdapterStoreModule(config);

            // Assert
            expect(store.getById(999).value).toBeUndefined();
        });

        it("should return computed with adapted item for existing id", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const items: TestItem[] = [
                {id: 1, name: "Item 1", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
            ];
            vi.mocked(httpService.getRequest).mockResolvedValue({data: items} as AxiosResponse<TestItem[]>);
            const store = createAdapterStoreModule(config);
            await store.retrieveAll();

            // Act
            const result = store.getById(1);

            // Assert
            expect(result.value).toBeDefined();
            expect(result.value?.testMethod()).toBe("adapted-1");
        });

        it("should update when item is modified", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const store = createAdapterStoreModule(config);
            vi.mocked(httpService.getRequest).mockResolvedValue({
                data: [{id: 1, name: "Original", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"}],
            } as AxiosResponse<TestItem[]>);
            await store.retrieveAll();
            const computed = store.getById(1);
            expect(computed.value?.name).toBe("Original");
            vi.mocked(httpService.getRequest).mockResolvedValue({
                data: [{id: 1, name: "Updated", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"}],
            } as AxiosResponse<TestItem[]>);

            // Act
            await store.retrieveAll();

            // Assert
            expect(computed.value?.name).toBe("Updated");
        });
    });

    describe("getOrFailById", () => {
        it("should wait for loading to finish before checking", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const store = createAdapterStoreModule(config);

            // Act
            try {
                await store.getOrFailById(1);
            } catch {
                // Expected to throw
            }

            // Assert
            expect(loadingService.ensureLoadingFinished).toHaveBeenCalled();
        });

        it("should return adapted item when found", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const items: TestItem[] = [
                {id: 1, name: "Item 1", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
            ];
            vi.mocked(httpService.getRequest).mockResolvedValue({data: items} as AxiosResponse<TestItem[]>);
            const store = createAdapterStoreModule(config);
            await store.retrieveAll();

            // Act
            const result = await store.getOrFailById(1);

            // Assert
            expect(result.testMethod()).toBe("adapted-1");
        });

        it("should throw EntryNotFoundError when item not found", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const store = createAdapterStoreModule(config);

            // Act & Assert
            await expect(store.getOrFailById(999)).rejects.toThrow(EntryNotFoundError);
            await expect(store.getOrFailById(999)).rejects.toThrow("Test Item with id 999 not found");
        });
    });

    describe("generateNew", () => {
        it("should return new adapted resource from adapter", () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const store = createAdapterStoreModule(config);

            // Act
            const result = store.generateNew();

            // Assert
            expect(result.testMethod()).toBe("new-adapted");
        });
    });

    describe("retrieveAll", () => {
        it("should call httpService.getRequest with domainName", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            vi.mocked(httpService.getRequest).mockResolvedValue({data: [] as TestItem[]} as AxiosResponse<TestItem[]>);
            const store = createAdapterStoreModule(config);

            // Act
            await store.retrieveAll();

            // Assert
            expect(httpService.getRequest).toHaveBeenCalledWith("test-items");
        });

        it("should convert snake_case response to camelCase", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const snakeCaseItems = [
                {id: 1, name: "Item 1", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z"},
            ];
            vi.mocked(httpService.getRequest).mockResolvedValue({data: snakeCaseItems} as AxiosResponse);
            const store = createAdapterStoreModule(config);

            // Act
            await store.retrieveAll();

            // Assert
            const item = store.getById(1).value;
            expect(item).toBeDefined();
            expect(item?.createdAt).toBe("2024-01-01T00:00:00Z");
        });

        it("should store items in state", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const items: TestItem[] = [
                {id: 1, name: "Item 1", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
                {id: 2, name: "Item 2", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
            ];
            vi.mocked(httpService.getRequest).mockResolvedValue({data: items} as AxiosResponse<TestItem[]>);
            const store = createAdapterStoreModule(config);

            // Act
            await store.retrieveAll();

            // Assert
            expect(store.getAll.value).toHaveLength(2);
        });

        it("should persist to storage service", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const items: TestItem[] = [
                {id: 1, name: "Item 1", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
            ];
            vi.mocked(httpService.getRequest).mockResolvedValue({data: items} as AxiosResponse<TestItem[]>);
            const store = createAdapterStoreModule(config);

            // Act
            await store.retrieveAll();

            // Assert
            expect(storageService.put).toHaveBeenCalledWith("test-items", expect.any(Object));
        });
    });

    describe("localStorage persistence", () => {
        it("should initialize state from storage", () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storedItems = {
                1: {id: 1, name: "Stored Item", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
            };
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue(storedItems)};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };

            // Act
            const store = createAdapterStoreModule(config);

            // Assert
            expect(storageService.get).toHaveBeenCalledWith("test-items", {});
            expect(store.getById(1).value).toBeDefined();
        });

        it("should persist state changes to storage on retrieveAll", async () => {
            // Arrange
            const httpService: Pick<HttpService, "getRequest"> = {getRequest: vi.fn()};
            const storageService: TestStorageService = {put: vi.fn(), get: vi.fn().mockReturnValue({})};
            const loadingService: TestLoadingService = {ensureLoadingFinished: vi.fn().mockResolvedValue(undefined)};
            const translationService: TranslationServiceForError = {
                getCapitalizedSingularTranslation: () => "Test Item",
            };
            function adapter(storeModule: AdapterStoreModule<TestItem>): TestNewAdapted;
            function adapter(storeModule: AdapterStoreModule<TestItem>, resource: TestItem): TestAdapted;
            function adapter(
                storeModule: AdapterStoreModule<TestItem>,
                resource?: TestItem,
            ): TestAdapted | TestNewAdapted {
                if (resource) {
                    return {
                        ...resource,
                        mutable: ref({...resource}) as Ref<New<TestItem>>,
                        reset: vi.fn(),
                        update: vi.fn(),
                        patch: vi.fn(),
                        delete: vi.fn(),
                        testMethod: () => `adapted-${resource.id}`,
                    } as unknown as TestAdapted;
                }
                return {
                    name: "",
                    mutable: ref({name: ""}) as Ref<New<TestItem>>,
                    reset: vi.fn(),
                    create: vi.fn(),
                    testMethod: () => "new-adapted",
                } as unknown as TestNewAdapted;
            }
            const config: AdapterStoreConfig<TestItem, TestAdapted, TestNewAdapted> = {
                domainName: "test-items",
                adapter: adapter as Adapter<TestItem, TestAdapted, TestNewAdapted>,
                httpService,
                storageService,
                loadingService,
                translationService,
            };
            const items: TestItem[] = [
                {id: 1, name: "Item 1", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"},
            ];
            vi.mocked(httpService.getRequest).mockResolvedValue({data: items} as AxiosResponse<TestItem[]>);
            const store = createAdapterStoreModule(config);

            // Act
            await store.retrieveAll();

            // Assert
            expect(storageService.put).toHaveBeenCalledWith(
                "test-items",
                expect.objectContaining({1: expect.any(Object) as unknown}),
            );
        });
    });
});

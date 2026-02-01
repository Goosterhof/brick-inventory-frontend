import type {Item} from "@shared/types/item";
import type {ComputedRef, Ref} from "vue";

import {EntryNotFoundError} from "@shared/errors/entry-not-found";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {computed, ref} from "vue";

import type {HttpService} from "./http";
import type {LoadingService} from "./loading";
import type {Adapted, AdapterStoreModule, NewAdapted} from "./resource-adapter";
import type {StorageService} from "./storage";

export type {AdapterStoreModule};

export type Adapter<T extends Item, E extends Adapted<T>, N extends NewAdapted<T>> = {
    (storeModule: AdapterStoreModule<T>): N;
    (storeModule: AdapterStoreModule<T>, resource: T): E;
};

export interface AdapterStoreConfig<T extends Item, E extends Adapted<T>, N extends NewAdapted<T>> {
    domainName: string;
    adapter: Adapter<T, E, N>;
    httpService: Pick<HttpService, "getRequest">;
    storageService: Pick<StorageService, "get" | "put">;
    loadingService: Pick<LoadingService, "ensureLoadingFinished">;
}

export interface StoreModuleForAdapter<T extends Item, E extends Adapted<T>, N extends NewAdapted<T>> {
    getAll: ComputedRef<E[]>;
    getById: (id: number) => ComputedRef<E | undefined>;
    getOrFailById: (id: number) => Promise<E>;
    generateNew: () => N;
    retrieveAll: () => Promise<void>;
}

export const createAdapterStoreModule = <
    T extends Item,
    E extends Adapted<T> = Adapted<T>,
    N extends NewAdapted<T> = NewAdapted<T>,
>(
    config: AdapterStoreConfig<T, E, N>,
): StoreModuleForAdapter<T, E, N> => {
    const {domainName, adapter, httpService, storageService, loadingService} = config;

    const state: Ref<{[id: number]: Readonly<T>}> = ref(
        storageService.get<{[id: number]: Readonly<T>}>(domainName, {}),
    );

    const setById = (item: T) => {
        state.value[item.id] = Object.freeze(item);
        storageService.put(domainName, state.value);
    };

    const deleteById = (id: number) => {
        delete state.value[id];
        storageService.put(domainName, state.value);
    };

    const storeModule: AdapterStoreModule<T> = {setById, deleteById};

    const getById = (id: number) =>
        computed(() => (state.value[id] ? adapter(storeModule, state.value[id]) : undefined));

    return {
        getAll: computed(() => Object.values(state.value).map((item) => adapter(storeModule, item))),
        getById,
        getOrFailById: async (id: number) => {
            await loadingService.ensureLoadingFinished();
            const item = getById(id).value;
            if (!item) throw new EntryNotFoundError(domainName, id);
            return item;
        },
        generateNew: () => adapter(storeModule),
        retrieveAll: async () => {
            const {data} = await httpService.getRequest<T[]>(domainName);
            state.value = data.reduce<{[id: number]: Readonly<T>}>((acc, item) => {
                acc[item.id] = Object.freeze(toCamelCaseTyped(item));
                return acc;
            }, {});
            storageService.put(domainName, state.value);
        },
    };
};

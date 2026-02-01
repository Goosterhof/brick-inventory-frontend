import type {Writable} from "@shared/helpers/copy";
import type {HttpService} from "@shared/services/http";
import type {New, Updatable} from "@shared/types/generics";
import type {Item} from "@shared/types/item";
import type {DeepSnakeKeys} from "string-ts";
import type {Ref} from "vue";

import {MissingResponseDataError} from "@shared/errors/missing-response-data";
import {deepCopy} from "@shared/helpers/copy";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {isExisting} from "@shared/helpers/type-check";
import {deepSnakeKeys} from "string-ts";
import {ref} from "vue";

type ResourceHttpService = Pick<HttpService, "postRequest" | "putRequest" | "patchRequest" | "deleteRequest">;

interface AdapterRepository<T extends Item> {
    create: (newItem: New<T>) => Promise<T>;
    update: (id: number, updatedItem: Updatable<T>) => Promise<T>;
    patch: (id: number, partialItem: Partial<New<T>>) => Promise<T>;
    delete: (id: number) => Promise<void>;
}

export interface AdapterStoreModule<T extends Item> {
    setById: (item: T) => void;
    deleteById: (id: number) => void;
}

/**
 * Base of a resource adapter:
 * - a readonly version of the resource
 * - a `mutable` Ref for state changes
 * - a `reset` function to restore the original state
 */
type BaseResourceAdapter<T extends Updatable<Item>> = Readonly<T> & {
    /** Reactive, mutable copy of the resource */
    mutable: Ref<Writable<T>>;
    /** Reset the `mutable` state to the original resource */
    reset: () => void;
};

/**
 * Adapter for an existing resource (with an id).
 * Provides update, patch, and delete methods from the repository.
 */
export type Adapted<T extends Item> = BaseResourceAdapter<T> & {
    /** Update the resource in the repository (full replacement) */
    update(): ReturnType<AdapterRepository<T>["update"]>;
    /** Patch the resource in the repository (partial update) */
    patch(partialItem: Partial<New<T>>): ReturnType<AdapterRepository<T>["patch"]>;
    /** Delete the resource from the repository */
    delete(): ReturnType<AdapterRepository<T>["delete"]>;
};

/**
 * Adapter for a new resource (without an id).
 * Provides a create method from the repository.
 */
export type NewAdapted<T extends Item> = BaseResourceAdapter<New<T>> & {
    /** Create the resource in the repository */
    create(): ReturnType<AdapterRepository<T>["create"]>;
};

const adapterRepositoryFactory = <T extends Item>(
    domainName: string,
    {setById, deleteById}: AdapterStoreModule<T>,
    httpService: ResourceHttpService,
): AdapterRepository<T> => {
    const dataHandler = (data: DeepSnakeKeys<T> | undefined, actionType: "create" | "update" | "patch"): T => {
        if (!data) {
            throw new MissingResponseDataError(
                `${actionType} route for ${domainName} returned no model in response to put in store.`,
            );
        }

        const camelCasedData = toCamelCaseTyped<T>(data);

        setById(camelCasedData);

        return camelCasedData;
    };

    return {
        create: async (newItem: New<T>) => {
            const {data} = await httpService.postRequest<DeepSnakeKeys<T>>(domainName, deepSnakeKeys(newItem));

            return dataHandler(data, "create");
        },
        update: async (id: number, updatedItem: Updatable<T>) => {
            const {data} = await httpService.putRequest<DeepSnakeKeys<T>>(
                `${domainName}/${id}`,
                deepSnakeKeys(updatedItem),
            );

            return dataHandler(data, "update");
        },
        patch: async (id: number, partialItem: Partial<New<T>>) => {
            const {data} = await httpService.patchRequest<DeepSnakeKeys<T>>(
                `${domainName}/${id}`,
                deepSnakeKeys(partialItem),
            );

            return dataHandler(data, "patch");
        },
        delete: async (id: number) => {
            await httpService.deleteRequest<void>(`${domainName}/${id}`);
            deleteById(id);
        },
    };
};

/**
 * Factory that adapts a resource by:
 * - adding mutable state
 * - adding reset functionality
 * - attaching repository methods (create, update, delete)
 *
 * @param resource - The resource (new or existing) to adapt
 * @param domainName - The API domain name for the resource
 * @param storeModule - Store module with setById and deleteById methods
 * @param httpService - The HTTP service instance
 * @returns An adapter with mutable state and CRUD methods
 */
export function resourceAdapter<T extends Item>(
    resource: T,
    domainName: string,
    storeModule: AdapterStoreModule<T>,
    httpService: ResourceHttpService,
): Adapted<T>;
export function resourceAdapter<T extends Item>(
    resource: New<T>,
    domainName: string,
    storeModule: AdapterStoreModule<T>,
    httpService: ResourceHttpService,
): NewAdapted<T>;
export function resourceAdapter<T extends Item>(
    resource: T | New<T>,
    domainName: string,
    storeModule: AdapterStoreModule<T>,
    httpService: ResourceHttpService,
): Adapted<T> | NewAdapted<T> {
    const repository = adapterRepositoryFactory<T>(domainName, storeModule, httpService);

    if (isExisting(resource)) {
        // Assertion: UnwrapRef widens to unknown for generic T; object is a plain POJO so this is safe.
        const mutable = <Ref<Writable<T>>>ref(deepCopy(resource));

        return {
            // existing resource is a proxy, so we unwrap it to avoid issues with Object.freeze
            ...Object.freeze({...resource}),
            mutable,
            reset: () => (mutable.value = deepCopy(resource)),
            update: () => repository.update(resource.id, mutable.value as Updatable<T>),
            patch: (partialItem: Partial<New<T>>) => repository.patch(resource.id, partialItem),
            delete: () => repository.delete(resource.id),
        };
    }
    // Assertion: UnwrapRef widens to unknown for generic T; object is a plain POJO so this is safe.
    const mutable = <Ref<Writable<New<T>>>>ref(deepCopy(resource));

    return {
        ...Object.freeze(resource),
        mutable,
        reset: () => (mutable.value = deepCopy(resource)),
        create: () => repository.create(mutable.value as New<T>),
    };
}

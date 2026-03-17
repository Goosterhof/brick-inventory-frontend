import type {Updatable} from "@shared/types/generics";
import type {Item} from "@shared/types/item";

export const isExisting = <T extends Item>(obj: Updatable<T>): obj is T => "id" in obj;

export const assertDefined = <T>(value: T | null | undefined, name: string): T => {
    if (value === null || value === undefined) {
        throw new Error(`Expected ${name} to be defined but received ${String(value)}.`);
    }
    return value;
};

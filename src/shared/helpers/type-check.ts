import type {Ref} from "vue";

import type {Updatable} from "@shared/types/generics";
import type {Item} from "@shared/types/item";

import {MissingRefValueError} from "@shared/errors/missing-ref-value";

export const isExisting = <T extends Item>(obj: Updatable<T>): obj is T => "id" in obj;

export const ensureRefValueExists = <T>(refVariable: Ref<T | undefined | null>): T => {
    if (refVariable.value !== undefined && refVariable.value !== null) return refVariable.value;

    throw new MissingRefValueError();
};

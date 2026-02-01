import type {Updatable} from "@shared/types/generics";
import type {Item} from "@shared/types/item";

export const isExisting = <T extends Item>(obj: Updatable<T>): obj is T => "id" in obj;

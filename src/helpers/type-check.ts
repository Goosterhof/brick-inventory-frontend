import type { Updatable } from "@/types/generics";
import type { Item } from "@/types/item";

export const isExisting = <T extends Item>(obj: Updatable<T>): obj is T => "id" in obj;

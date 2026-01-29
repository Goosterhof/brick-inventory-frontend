import type { Item } from '@/types/item';
import type { Updatable } from '@/types/generics';

export const isExisting = <T extends Item>(obj: Updatable<T>): obj is T => 'id' in obj;

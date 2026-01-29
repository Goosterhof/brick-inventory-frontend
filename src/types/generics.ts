import type { Item } from '@/types/item';

/**
 * Omits the id from item
 * Being used when items are being created, because they don't have an id yet
 */
export type New<T extends Item> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Omits the id from item
 * Being used when items are being created, because they don't have an id yet
 */
export type Updatable<T extends Item> = New<T> | T;

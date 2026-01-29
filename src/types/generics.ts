import type { Item } from '@/types/item';

/**
 * Omits the id from item
 * Being used when items are being created, because they don't have an id yet
 */
export type New<T extends Item> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Union type representing either a new resource (without id) or an existing resource (with id).
 * Used for forms that can handle both creation and updates.
 */
export type Updatable<T extends Item> = New<T> | T;

import type { Item } from '@/types/item';
import type { DeepSnakeKeys } from 'string-ts';

import { deepCamelKeys } from 'string-ts';

// Helper to convert API (snake_case) response to the camelCase generic T.
// We assert because the runtime transformation aligns keys with T's shape.
export const toCamelCaseTyped = <T extends Item>(data: T | DeepSnakeKeys<T>): T => <T>(<unknown>deepCamelKeys(data));

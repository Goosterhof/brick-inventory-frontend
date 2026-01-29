import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    resourceAdapter,
    type AdapterStoreModule,
    type Adapted,
    type NewAdapted,
} from '@/services/resource-adapter';
import type { HttpService } from '@/services/http';
import type { Item } from '@/types/item';
import type { New } from '@/types/generics';
import { MissingResponseDataError } from '@/errors/missing-response-data';
import { isRef } from 'vue';

interface TestItem extends Item {
    id: number;
    userName: string;
    createdAt: string;
}

describe('resource adapter', () => {
    let mockHttpService: HttpService;
    let mockStoreModule: AdapterStoreModule<TestItem>;
    const domainName = 'users';

    beforeEach(() => {
        mockHttpService = {
            getRequest: vi.fn(),
            postRequest: vi.fn(),
            putRequest: vi.fn(),
            patchRequest: vi.fn(),
            deleteRequest: vi.fn(),
            registerRequestMiddleware: vi.fn(),
            registerResponseMiddleware: vi.fn(),
            registerResponseErrorMiddleware: vi.fn(),
        };

        mockStoreModule = {
            setById: vi.fn(),
            deleteById: vi.fn(),
        };
    });

    describe('adapting existing resource', () => {
        const existingResource: TestItem = {
            id: 1,
            userName: 'testUser',
            createdAt: '2024-01-01',
        };

        const createAdapted = (): Adapted<TestItem> =>
            resourceAdapter(existingResource, domainName, mockStoreModule, mockHttpService);

        it('should return the original resource properties', () => {
            // Act
            const adapted = createAdapted();

            // Assert
            expect(adapted.id).toBe(1);
            expect(adapted.userName).toBe('testUser');
            expect(adapted.createdAt).toBe('2024-01-01');
        });

        it('should provide a mutable ref with a deep copy of the resource', () => {
            // Act
            const adapted = createAdapted();

            // Assert
            expect(isRef(adapted.mutable)).toBe(true);
            expect(adapted.mutable.value).toEqual({
                id: 1,
                userName: 'testUser',
                createdAt: '2024-01-01',
            });
            expect(adapted.mutable.value).not.toBe(existingResource);
        });

        it('should allow modifying the mutable ref without affecting original', () => {
            // Arrange
            const adapted = createAdapted();

            // Act
            adapted.mutable.value.userName = 'modifiedUser';

            // Assert
            expect(adapted.mutable.value.userName).toBe('modifiedUser');
            expect(adapted.userName).toBe('testUser');
            expect(existingResource.userName).toBe('testUser');
        });

        it('should reset mutable state to original with reset()', () => {
            // Arrange
            const adapted = createAdapted();
            adapted.mutable.value.userName = 'modifiedUser';

            // Act
            adapted.reset();

            // Assert
            expect(adapted.mutable.value.userName).toBe('testUser');
        });

        it('should call httpService.putRequest with snake_case data on update()', async () => {
            // Arrange
            const responseData = { id: 1, user_name: 'updatedUser', created_at: '2024-01-01' };
            vi.mocked(mockHttpService.putRequest).mockResolvedValue({ data: responseData } as never);
            const adapted = createAdapted();
            adapted.mutable.value.userName = 'updatedUser';

            // Act
            await adapted.update();

            // Assert
            expect(mockHttpService.putRequest).toHaveBeenCalledWith(`${domainName}/1`, {
                id: 1,
                user_name: 'updatedUser',
                created_at: '2024-01-01',
            });
        });

        it('should call setById with camelCase data after update()', async () => {
            // Arrange
            const responseData = { id: 1, user_name: 'updatedUser', created_at: '2024-01-01' };
            vi.mocked(mockHttpService.putRequest).mockResolvedValue({ data: responseData } as never);
            const adapted = createAdapted();

            // Act
            await adapted.update();

            // Assert
            expect(mockStoreModule.setById).toHaveBeenCalledWith({
                id: 1,
                userName: 'updatedUser',
                createdAt: '2024-01-01',
            });
        });

        it('should return the updated item from update()', async () => {
            // Arrange
            const responseData = { id: 1, user_name: 'updatedUser', created_at: '2024-01-01' };
            vi.mocked(mockHttpService.putRequest).mockResolvedValue({ data: responseData } as never);
            const adapted = createAdapted();

            // Act
            const result = await adapted.update();

            // Assert
            expect(result).toEqual({
                id: 1,
                userName: 'updatedUser',
                createdAt: '2024-01-01',
            });
        });

        it('should throw MissingResponseDataError when update response has no data', async () => {
            // Arrange
            vi.mocked(mockHttpService.putRequest).mockResolvedValue({ data: undefined } as never);
            const adapted = createAdapted();

            // Act & Assert
            await expect(adapted.update()).rejects.toThrow(MissingResponseDataError);
            await expect(adapted.update()).rejects.toThrow(
                `update route for ${domainName} returned no model in response to put in store.`,
            );
        });

        it('should call httpService.deleteRequest on delete()', async () => {
            // Arrange
            vi.mocked(mockHttpService.deleteRequest).mockResolvedValue({} as never);
            const adapted = createAdapted();

            // Act
            await adapted.delete();

            // Assert
            expect(mockHttpService.deleteRequest).toHaveBeenCalledWith(`${domainName}/1`);
        });

        it('should call deleteById after delete()', async () => {
            // Arrange
            vi.mocked(mockHttpService.deleteRequest).mockResolvedValue({} as never);
            const adapted = createAdapted();

            // Act
            await adapted.delete();

            // Assert
            expect(mockStoreModule.deleteById).toHaveBeenCalledWith(1);
        });

        it('should propagate HTTP errors from update()', async () => {
            // Arrange
            const httpError = new Error('Network error');
            vi.mocked(mockHttpService.putRequest).mockRejectedValue(httpError);
            const adapted = createAdapted();

            // Act & Assert
            await expect(adapted.update()).rejects.toThrow('Network error');
            expect(mockStoreModule.setById).not.toHaveBeenCalled();
        });

        it('should propagate HTTP errors from delete()', async () => {
            // Arrange
            const httpError = new Error('Network error');
            vi.mocked(mockHttpService.deleteRequest).mockRejectedValue(httpError);
            const adapted = createAdapted();

            // Act & Assert
            await expect(adapted.delete()).rejects.toThrow('Network error');
            expect(mockStoreModule.deleteById).not.toHaveBeenCalled();
        });

        it('should have update and delete methods', () => {
            // Act
            const adapted = createAdapted();

            // Assert
            expect(adapted).toHaveProperty('update');
            expect(adapted).toHaveProperty('delete');
            expect(typeof adapted.update).toBe('function');
            expect(typeof adapted.delete).toBe('function');
        });

        it('should not have create method', () => {
            // Act
            const adapted = createAdapted();

            // Assert
            expect(adapted).not.toHaveProperty('create');
        });
    });

    describe('adapting new resource', () => {
        const newResource: New<TestItem> = {
            userName: 'newUser',
        };

        const createNewAdapted = (): NewAdapted<TestItem> =>
            resourceAdapter(newResource, domainName, mockStoreModule, mockHttpService);

        it('should return the original resource properties', () => {
            // Act
            const adapted = createNewAdapted();

            // Assert
            expect(adapted.userName).toBe('newUser');
        });

        it('should provide a mutable ref with a deep copy of the resource', () => {
            // Act
            const adapted = createNewAdapted();

            // Assert
            expect(isRef(adapted.mutable)).toBe(true);
            expect(adapted.mutable.value).toEqual({ userName: 'newUser' });
            expect(adapted.mutable.value).not.toBe(newResource);
        });

        it('should allow modifying the mutable ref without affecting original', () => {
            // Arrange
            const adapted = createNewAdapted();

            // Act
            adapted.mutable.value.userName = 'modifiedUser';

            // Assert
            expect(adapted.mutable.value.userName).toBe('modifiedUser');
            expect(adapted.userName).toBe('newUser');
        });

        it('should reset mutable state to original with reset()', () => {
            // Arrange
            const adapted = createNewAdapted();
            adapted.mutable.value.userName = 'modifiedUser';

            // Act
            adapted.reset();

            // Assert
            expect(adapted.mutable.value.userName).toBe('newUser');
        });

        it('should call httpService.postRequest with snake_case data on create()', async () => {
            // Arrange
            const responseData = { id: 1, user_name: 'newUser', created_at: '2024-01-01' };
            vi.mocked(mockHttpService.postRequest).mockResolvedValue({ data: responseData } as never);
            const adapted = createNewAdapted();

            // Act
            await adapted.create();

            // Assert
            expect(mockHttpService.postRequest).toHaveBeenCalledWith(domainName, { user_name: 'newUser' });
        });

        it('should call setById with camelCase data after create()', async () => {
            // Arrange
            const responseData = { id: 1, user_name: 'newUser', created_at: '2024-01-01' };
            vi.mocked(mockHttpService.postRequest).mockResolvedValue({ data: responseData } as never);
            const adapted = createNewAdapted();

            // Act
            await adapted.create();

            // Assert
            expect(mockStoreModule.setById).toHaveBeenCalledWith({
                id: 1,
                userName: 'newUser',
                createdAt: '2024-01-01',
            });
        });

        it('should return the created item from create()', async () => {
            // Arrange
            const responseData = { id: 1, user_name: 'newUser', created_at: '2024-01-01' };
            vi.mocked(mockHttpService.postRequest).mockResolvedValue({ data: responseData } as never);
            const adapted = createNewAdapted();

            // Act
            const result = await adapted.create();

            // Assert
            expect(result).toEqual({
                id: 1,
                userName: 'newUser',
                createdAt: '2024-01-01',
            });
        });

        it('should throw MissingResponseDataError when create response has no data', async () => {
            // Arrange
            vi.mocked(mockHttpService.postRequest).mockResolvedValue({ data: undefined } as never);
            const adapted = createNewAdapted();

            // Act & Assert
            await expect(adapted.create()).rejects.toThrow(MissingResponseDataError);
            await expect(adapted.create()).rejects.toThrow(
                `create route for ${domainName} returned no model in response to put in store.`,
            );
        });

        it('should propagate HTTP errors from create()', async () => {
            // Arrange
            const httpError = new Error('Network error');
            vi.mocked(mockHttpService.postRequest).mockRejectedValue(httpError);
            const adapted = createNewAdapted();

            // Act & Assert
            await expect(adapted.create()).rejects.toThrow('Network error');
            expect(mockStoreModule.setById).not.toHaveBeenCalled();
        });

        it('should have create method', () => {
            // Act
            const adapted = createNewAdapted();

            // Assert
            expect(adapted).toHaveProperty('create');
            expect(typeof adapted.create).toBe('function');
        });

        it('should not have update and delete methods', () => {
            // Act
            const adapted = createNewAdapted();

            // Assert
            expect(adapted).not.toHaveProperty('update');
            expect(adapted).not.toHaveProperty('delete');
        });
    });

    describe('deep copy behavior', () => {
        it('should deeply copy nested objects in mutable', () => {
            // Arrange
            interface NestedItem extends Item {
                id: number;
                nested: { value: string };
            }
            const nestedResource: NestedItem = {
                id: 1,
                nested: { value: 'original' },
            };

            // Act
            const adapted = resourceAdapter(
                nestedResource,
                domainName,
                mockStoreModule as unknown as AdapterStoreModule<NestedItem>,
                mockHttpService,
            );
            adapted.mutable.value.nested.value = 'modified';

            // Assert
            expect(adapted.mutable.value.nested.value).toBe('modified');
            expect(nestedResource.nested.value).toBe('original');
        });

        it('should deeply copy arrays in mutable', () => {
            // Arrange
            interface ArrayItem extends Item {
                id: number;
                items: string[];
            }
            const arrayResource: ArrayItem = {
                id: 1,
                items: ['a', 'b'],
            };

            // Act
            const adapted = resourceAdapter(
                arrayResource,
                domainName,
                mockStoreModule as unknown as AdapterStoreModule<ArrayItem>,
                mockHttpService,
            );
            adapted.mutable.value.items.push('c');

            // Assert
            expect(adapted.mutable.value.items).toEqual(['a', 'b', 'c']);
            expect(arrayResource.items).toEqual(['a', 'b']);
        });

        it('should deeply copy Date objects in mutable', () => {
            // Arrange
            interface DateItem extends Item {
                id: number;
                createdAt: Date;
            }
            const originalDate = new Date('2024-01-01');
            const dateResource: DateItem = {
                id: 1,
                createdAt: originalDate,
            };

            // Act
            const adapted = resourceAdapter(
                dateResource,
                domainName,
                mockStoreModule as unknown as AdapterStoreModule<DateItem>,
                mockHttpService,
            );
            adapted.mutable.value.createdAt.setFullYear(2025);

            // Assert
            expect(adapted.mutable.value.createdAt.getFullYear()).toBe(2025);
            expect(originalDate.getFullYear()).toBe(2024);
        });
    });
});

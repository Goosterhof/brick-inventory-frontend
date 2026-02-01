import type {New} from "@shared/types/generics";
import type {Item} from "@shared/types/item";

import {MissingResponseDataError} from "@shared/errors/missing-response-data";
import {
    type Adapted,
    type AdapterStoreModule,
    type NewAdapted,
    resourceAdapter,
} from "@shared/services/resource-adapter";
import {describe, expect, it, vi} from "vitest";
import {isRef} from "vue";

interface TestItem extends Item {
    id: number;
    userName: string;
    createdAt: string;
}

describe("resource adapter", () => {
    describe("adapting existing resource", () => {
        const existingResource: TestItem = {id: 1, userName: "testUser", createdAt: "2024-01-01"};

        it("should return the original resource properties", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Assert
            expect(adapted.id).toBe(1);
            expect(adapted.userName).toBe("testUser");
            expect(adapted.createdAt).toBe("2024-01-01");
        });

        it("should provide a mutable ref with a deep copy of the resource", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Assert
            expect(isRef(adapted.mutable)).toBe(true);
            expect(adapted.mutable.value).toEqual({id: 1, userName: "testUser", createdAt: "2024-01-01"});
            expect(adapted.mutable.value).not.toBe(existingResource);
        });

        it("should allow modifying the mutable ref without affecting original", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act
            adapted.mutable.value.userName = "modifiedUser";

            // Assert
            expect(adapted.mutable.value.userName).toBe("modifiedUser");
            expect(adapted.userName).toBe("testUser");
            expect(existingResource.userName).toBe("testUser");
        });

        it("should reset mutable state to original with reset()", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);
            adapted.mutable.value.userName = "modifiedUser";

            // Act
            adapted.reset();

            // Assert
            expect(adapted.mutable.value.userName).toBe("testUser");
        });

        it("should call httpService.putRequest with snake_case data on update()", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const putRequest = vi
                .fn()
                .mockResolvedValue({data: {id: 1, user_name: "updatedUser", created_at: "2024-01-01"}});
            const httpService = {postRequest: vi.fn(), putRequest, patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);
            adapted.mutable.value.userName = "updatedUser";

            // Act
            await adapted.update();

            // Assert
            expect(putRequest).toHaveBeenCalledWith("users/1", {
                id: 1,
                user_name: "updatedUser",
                created_at: "2024-01-01",
            });
        });

        it("should call setById with camelCase data after update()", async () => {
            // Arrange
            const setById = vi.fn();
            const storeModule: AdapterStoreModule<TestItem> = {setById, deleteById: vi.fn()};
            const putRequest = vi
                .fn()
                .mockResolvedValue({data: {id: 1, user_name: "updatedUser", created_at: "2024-01-01"}});
            const httpService = {postRequest: vi.fn(), putRequest, patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act
            await adapted.update();

            // Assert
            expect(setById).toHaveBeenCalledWith({id: 1, userName: "updatedUser", createdAt: "2024-01-01"});
        });

        it("should return the updated item from update()", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const putRequest = vi
                .fn()
                .mockResolvedValue({data: {id: 1, user_name: "updatedUser", created_at: "2024-01-01"}});
            const httpService = {postRequest: vi.fn(), putRequest, patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act
            const result = await adapted.update();

            // Assert
            expect(result).toEqual({id: 1, userName: "updatedUser", createdAt: "2024-01-01"});
        });

        it("should throw MissingResponseDataError when update response has no data", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const putRequest = vi.fn().mockResolvedValue({data: undefined});
            const httpService = {postRequest: vi.fn(), putRequest, patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act & Assert
            await expect(adapted.update()).rejects.toThrow(MissingResponseDataError);
            await expect(adapted.update()).rejects.toThrow(
                "update route for users returned no model in response to put in store.",
            );
        });

        it("should call httpService.patchRequest with snake_case data on patch()", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const patchRequest = vi
                .fn()
                .mockResolvedValue({data: {id: 1, user_name: "patchedUser", created_at: "2024-01-01"}});
            const httpService = {postRequest: vi.fn(), putRequest: vi.fn(), patchRequest, deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act
            await adapted.patch({userName: "patchedUser"});

            // Assert
            expect(patchRequest).toHaveBeenCalledWith("users/1", {user_name: "patchedUser"});
        });

        it("should call setById with camelCase data after patch()", async () => {
            // Arrange
            const setById = vi.fn();
            const storeModule: AdapterStoreModule<TestItem> = {setById, deleteById: vi.fn()};
            const patchRequest = vi
                .fn()
                .mockResolvedValue({data: {id: 1, user_name: "patchedUser", created_at: "2024-01-01"}});
            const httpService = {postRequest: vi.fn(), putRequest: vi.fn(), patchRequest, deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act
            await adapted.patch({userName: "patchedUser"});

            // Assert
            expect(setById).toHaveBeenCalledWith({id: 1, userName: "patchedUser", createdAt: "2024-01-01"});
        });

        it("should return the patched item from patch()", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const patchRequest = vi
                .fn()
                .mockResolvedValue({data: {id: 1, user_name: "patchedUser", created_at: "2024-01-01"}});
            const httpService = {postRequest: vi.fn(), putRequest: vi.fn(), patchRequest, deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act
            const result = await adapted.patch({userName: "patchedUser"});

            // Assert
            expect(result).toEqual({id: 1, userName: "patchedUser", createdAt: "2024-01-01"});
        });

        it("should throw MissingResponseDataError when patch response has no data", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const patchRequest = vi.fn().mockResolvedValue({data: undefined});
            const httpService = {postRequest: vi.fn(), putRequest: vi.fn(), patchRequest, deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act & Assert
            await expect(adapted.patch({userName: "patchedUser"})).rejects.toThrow(MissingResponseDataError);
            await expect(adapted.patch({userName: "patchedUser"})).rejects.toThrow(
                "patch route for users returned no model in response to put in store.",
            );
        });

        it("should propagate HTTP errors from patch()", async () => {
            // Arrange
            const setById = vi.fn();
            const storeModule: AdapterStoreModule<TestItem> = {setById, deleteById: vi.fn()};
            const patchRequest = vi.fn().mockRejectedValue(new Error("Network error"));
            const httpService = {postRequest: vi.fn(), putRequest: vi.fn(), patchRequest, deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act & Assert
            await expect(adapted.patch({userName: "patchedUser"})).rejects.toThrow("Network error");
            expect(setById).not.toHaveBeenCalled();
        });

        it("should call httpService.deleteRequest on delete()", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const deleteRequest = vi.fn().mockResolvedValue({});
            const httpService = {postRequest: vi.fn(), putRequest: vi.fn(), patchRequest: vi.fn(), deleteRequest};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act
            await adapted.delete();

            // Assert
            expect(deleteRequest).toHaveBeenCalledWith("users/1");
        });

        it("should call deleteById after delete()", async () => {
            // Arrange
            const deleteById = vi.fn();
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById};
            const deleteRequest = vi.fn().mockResolvedValue({});
            const httpService = {postRequest: vi.fn(), putRequest: vi.fn(), patchRequest: vi.fn(), deleteRequest};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act
            await adapted.delete();

            // Assert
            expect(deleteById).toHaveBeenCalledWith(1);
        });

        it("should propagate HTTP errors from update()", async () => {
            // Arrange
            const setById = vi.fn();
            const storeModule: AdapterStoreModule<TestItem> = {setById, deleteById: vi.fn()};
            const putRequest = vi.fn().mockRejectedValue(new Error("Network error"));
            const httpService = {postRequest: vi.fn(), putRequest, patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act & Assert
            await expect(adapted.update()).rejects.toThrow("Network error");
            expect(setById).not.toHaveBeenCalled();
        });

        it("should propagate HTTP errors from delete()", async () => {
            // Arrange
            const deleteById = vi.fn();
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById};
            const deleteRequest = vi.fn().mockRejectedValue(new Error("Network error"));
            const httpService = {postRequest: vi.fn(), putRequest: vi.fn(), patchRequest: vi.fn(), deleteRequest};
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Act & Assert
            await expect(adapted.delete()).rejects.toThrow("Network error");
            expect(deleteById).not.toHaveBeenCalled();
        });

        it("should have update, patch, and delete methods", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Assert
            expect(adapted).toHaveProperty("update");
            expect(adapted).toHaveProperty("patch");
            expect(adapted).toHaveProperty("delete");
            expect(typeof adapted.update).toBe("function");
            expect(typeof adapted.patch).toBe("function");
            expect(typeof adapted.delete).toBe("function");
        });

        it("should not have create method", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted: Adapted<TestItem> = resourceAdapter(existingResource, "users", storeModule, httpService);

            // Assert
            expect(adapted).not.toHaveProperty("create");
        });
    });

    describe("adapting new resource", () => {
        const newResource: New<TestItem> = {userName: "newUser"};

        it("should return the original resource properties", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Assert
            expect(adapted.userName).toBe("newUser");
        });

        it("should provide a mutable ref with a deep copy of the resource", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Assert
            expect(isRef(adapted.mutable)).toBe(true);
            expect(adapted.mutable.value).toEqual({userName: "newUser"});
            expect(adapted.mutable.value).not.toBe(newResource);
        });

        it("should allow modifying the mutable ref without affecting original", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Act
            adapted.mutable.value.userName = "modifiedUser";

            // Assert
            expect(adapted.mutable.value.userName).toBe("modifiedUser");
            expect(adapted.userName).toBe("newUser");
        });

        it("should reset mutable state to original with reset()", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);
            adapted.mutable.value.userName = "modifiedUser";

            // Act
            adapted.reset();

            // Assert
            expect(adapted.mutable.value.userName).toBe("newUser");
        });

        it("should call httpService.postRequest with snake_case data on create()", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const postRequest = vi
                .fn()
                .mockResolvedValue({data: {id: 1, user_name: "newUser", created_at: "2024-01-01"}});
            const httpService = {postRequest, putRequest: vi.fn(), patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Act
            await adapted.create();

            // Assert
            expect(postRequest).toHaveBeenCalledWith("users", {user_name: "newUser"});
        });

        it("should call setById with camelCase data after create()", async () => {
            // Arrange
            const setById = vi.fn();
            const storeModule: AdapterStoreModule<TestItem> = {setById, deleteById: vi.fn()};
            const postRequest = vi
                .fn()
                .mockResolvedValue({data: {id: 1, user_name: "newUser", created_at: "2024-01-01"}});
            const httpService = {postRequest, putRequest: vi.fn(), patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Act
            await adapted.create();

            // Assert
            expect(setById).toHaveBeenCalledWith({id: 1, userName: "newUser", createdAt: "2024-01-01"});
        });

        it("should return the created item from create()", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const postRequest = vi
                .fn()
                .mockResolvedValue({data: {id: 1, user_name: "newUser", created_at: "2024-01-01"}});
            const httpService = {postRequest, putRequest: vi.fn(), patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Act
            const result = await adapted.create();

            // Assert
            expect(result).toEqual({id: 1, userName: "newUser", createdAt: "2024-01-01"});
        });

        it("should throw MissingResponseDataError when create response has no data", async () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const postRequest = vi.fn().mockResolvedValue({data: undefined});
            const httpService = {postRequest, putRequest: vi.fn(), patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Act & Assert
            await expect(adapted.create()).rejects.toThrow(MissingResponseDataError);
            await expect(adapted.create()).rejects.toThrow(
                "create route for users returned no model in response to put in store.",
            );
        });

        it("should propagate HTTP errors from create()", async () => {
            // Arrange
            const setById = vi.fn();
            const storeModule: AdapterStoreModule<TestItem> = {setById, deleteById: vi.fn()};
            const postRequest = vi.fn().mockRejectedValue(new Error("Network error"));
            const httpService = {postRequest, putRequest: vi.fn(), patchRequest: vi.fn(), deleteRequest: vi.fn()};
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Act & Assert
            await expect(adapted.create()).rejects.toThrow("Network error");
            expect(setById).not.toHaveBeenCalled();
        });

        it("should have create method", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Assert
            expect(adapted).toHaveProperty("create");
            expect(typeof adapted.create).toBe("function");
        });

        it("should not have update, patch, and delete methods", () => {
            // Arrange
            const storeModule: AdapterStoreModule<TestItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted: NewAdapted<TestItem> = resourceAdapter(newResource, "users", storeModule, httpService);

            // Assert
            expect(adapted).not.toHaveProperty("update");
            expect(adapted).not.toHaveProperty("patch");
            expect(adapted).not.toHaveProperty("delete");
        });
    });

    describe("deep copy behavior", () => {
        it("should deeply copy nested objects in mutable", () => {
            // Arrange
            interface NestedItem extends Item {
                id: number;
                nested: {value: string};
            }
            const nestedResource: NestedItem = {id: 1, nested: {value: "original"}};
            const storeModule: AdapterStoreModule<NestedItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted = resourceAdapter(nestedResource, "nested", storeModule, httpService);
            adapted.mutable.value.nested.value = "modified";

            // Assert
            expect(adapted.mutable.value.nested.value).toBe("modified");
            expect(nestedResource.nested.value).toBe("original");
        });

        it("should deeply copy arrays in mutable", () => {
            // Arrange
            interface ArrayItem extends Item {
                id: number;
                items: string[];
            }
            const arrayResource: ArrayItem = {id: 1, items: ["a", "b"]};
            const storeModule: AdapterStoreModule<ArrayItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted = resourceAdapter(arrayResource, "arrays", storeModule, httpService);
            adapted.mutable.value.items.push("c");

            // Assert
            expect(adapted.mutable.value.items).toEqual(["a", "b", "c"]);
            expect(arrayResource.items).toEqual(["a", "b"]);
        });

        it("should deeply copy Date objects in mutable", () => {
            // Arrange
            interface DateItem extends Item {
                id: number;
                createdAt: Date;
            }
            const originalDate = new Date("2024-01-01");
            const dateResource: DateItem = {id: 1, createdAt: originalDate};
            const storeModule: AdapterStoreModule<DateItem> = {setById: vi.fn(), deleteById: vi.fn()};
            const httpService = {
                postRequest: vi.fn(),
                putRequest: vi.fn(),
                patchRequest: vi.fn(),
                deleteRequest: vi.fn(),
            };

            // Act
            const adapted = resourceAdapter(dateResource, "dates", storeModule, httpService);
            adapted.mutable.value.createdAt.setFullYear(2025);

            // Assert
            expect(adapted.mutable.value.createdAt.getFullYear()).toBe(2025);
            expect(originalDate.getFullYear()).toBe(2024);
        });
    });
});

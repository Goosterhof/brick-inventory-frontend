import { beforeEach, describe, expect, it, vi } from "vitest";

import { createStorageService } from "@/services/storage";

describe("storage service", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe("createStorageService", () => {
        it("should return all expected methods", () => {
            // Act
            const storage = createStorageService("test");

            // Assert
            expect(storage).toHaveProperty("put");
            expect(storage).toHaveProperty("get");
            expect(storage).toHaveProperty("remove");
            expect(storage).toHaveProperty("clear");
        });
    });

    describe("put", () => {
        it("should store string values with prefix", () => {
            // Arrange
            const storage = createStorageService("test");

            // Act
            storage.put("testKey", "testValue");

            // Assert
            expect(localStorage.getItem("test:testKey")).toBe("testValue");
        });

        it("should stringify non-string values", () => {
            // Arrange
            const storage = createStorageService("test");
            const value = { name: "test", count: 42 };

            // Act
            storage.put("testKey", value);

            // Assert
            expect(localStorage.getItem("test:testKey")).toBe('{"name":"test","count":42}');
        });

        it("should stringify arrays", () => {
            // Arrange
            const storage = createStorageService("test");

            // Act
            storage.put("testKey", [1, 2, 3]);

            // Assert
            expect(localStorage.getItem("test:testKey")).toBe("[1,2,3]");
        });

        it("should stringify boolean values", () => {
            // Arrange
            const storage = createStorageService("test");

            // Act
            storage.put("testKey", true);

            // Assert
            expect(localStorage.getItem("test:testKey")).toBe("true");
        });

        it('should stringify null to "null"', () => {
            // Arrange
            const storage = createStorageService("test");

            // Act
            storage.put("testKey", null);

            // Assert
            expect(localStorage.getItem("test:testKey")).toBe("null");
        });

        it('should stringify undefined to "undefined"', () => {
            // Arrange
            const storage = createStorageService("test");

            // Act
            storage.put("testKey", undefined);

            // Assert
            expect(localStorage.getItem("test:testKey")).toBe("undefined");
        });

        it("should log error when quota is exceeded", () => {
            // Arrange
            const storage = createStorageService("test");
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const quotaError = new DOMException("Quota exceeded", "QuotaExceededError");
            vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
                throw quotaError;
            });

            // Act
            storage.put("key", "value");

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith("localStorage quota exceeded");
        });

        it("should log other errors", () => {
            // Arrange
            const storage = createStorageService("test");
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const genericError = new Error("Some error");
            vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
                throw genericError;
            });

            // Act
            storage.put("key", "value");

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(genericError);
        });
    });

    describe("get", () => {
        it("should return undefined when key does not exist", () => {
            // Arrange
            const storage = createStorageService("test");

            // Act
            const result = storage.get("nonExistentKey");

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return default value when key does not exist", () => {
            // Arrange
            const storage = createStorageService("test");

            // Act
            const result = storage.get("nonExistentKey", "default");

            // Assert
            expect(result).toBe("default");
        });

        it("should return parsed JSON for object values", () => {
            // Arrange
            const storage = createStorageService("test");
            const value = { name: "test", count: 42 };
            localStorage.setItem("test:testKey", JSON.stringify(value));

            // Act
            const result = storage.get<typeof value>("testKey");

            // Assert
            expect(result).toEqual({ name: "test", count: 42 });
        });

        it("should return parsed JSON for array values", () => {
            // Arrange
            const storage = createStorageService("test");
            localStorage.setItem("test:testKey", "[1,2,3]");

            // Act
            const result = storage.get<number[]>("testKey");

            // Assert
            expect(result).toEqual([1, 2, 3]);
        });

        it("should return raw string when default is a string", () => {
            // Arrange
            const storage = createStorageService("test");
            localStorage.setItem("test:testKey", "5e3");

            // Act
            const result = storage.get("testKey", "default");

            // Assert
            expect(result).toBe("5e3");
        });

        it("should return string value when JSON parse fails", () => {
            // Arrange
            const storage = createStorageService("test");
            localStorage.setItem("test:testKey", "not-json");

            // Act
            const result = storage.get<string>("testKey");

            // Assert
            expect(result).toBe("not-json");
        });

        it("should return boolean values correctly", () => {
            // Arrange
            const storage = createStorageService("test");
            localStorage.setItem("test:testKey", "true");

            // Act
            const result = storage.get<boolean>("testKey");

            // Assert
            expect(result).toBe(true);
        });

        it("should return null when stored value was null", () => {
            // Arrange
            const storage = createStorageService("test");
            storage.put("testKey", null);

            // Act
            const result = storage.get<null>("testKey");

            // Assert
            expect(result).toBeNull();
        });

        it('should return string "undefined" when stored value was undefined', () => {
            // Arrange
            const storage = createStorageService("test");
            storage.put("testKey", undefined);

            // Act
            const result = storage.get<string>("testKey");

            // Assert
            expect(result).toBe("undefined");
        });

        it("should return default value and log error on storage access failure", () => {
            // Arrange
            const storage = createStorageService("test");
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const securityError = new DOMException("Access denied", "SecurityError");
            vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
                throw securityError;
            });

            // Act
            const result = storage.get("key", "fallback");

            // Assert
            expect(result).toBe("fallback");
            expect(consoleSpy).toHaveBeenCalledWith(securityError);
        });
    });

    describe("clear", () => {
        it("should only clear items with matching prefix", () => {
            // Arrange
            const storage = createStorageService("app");
            localStorage.setItem("app:key1", "value1");
            localStorage.setItem("app:key2", "value2");
            localStorage.setItem("other:key", "value3");
            localStorage.setItem("unprefixed", "value4");

            // Act
            storage.clear();

            // Assert
            expect(localStorage.getItem("app:key1")).toBeNull();
            expect(localStorage.getItem("app:key2")).toBeNull();
            expect(localStorage.getItem("other:key")).toBe("value3");
            expect(localStorage.getItem("unprefixed")).toBe("value4");
        });

        it("should log errors and continue clearing remaining keys on failure", () => {
            // Arrange
            const storage = createStorageService("app");
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const genericError = new Error("Removal failed");
            localStorage.setItem("app:key1", "value1");
            localStorage.setItem("app:key2", "value2");
            vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
                throw genericError;
            });

            // Act
            storage.clear();

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(genericError);
            expect(consoleSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe("remove", () => {
        it("should remove specific prefixed item from localStorage", () => {
            // Arrange
            const storage = createStorageService("test");
            localStorage.setItem("test:key1", "value1");
            localStorage.setItem("test:key2", "value2");

            // Act
            storage.remove("key1");

            // Assert
            expect(localStorage.getItem("test:key1")).toBeNull();
            expect(localStorage.getItem("test:key2")).toBe("value2");
        });

        it("should not affect items with different prefix", () => {
            // Arrange
            const storage = createStorageService("auth");
            localStorage.setItem("auth:token", "abc123");
            localStorage.setItem("other:token", "xyz789");

            // Act
            storage.remove("token");

            // Assert
            expect(localStorage.getItem("auth:token")).toBeNull();
            expect(localStorage.getItem("other:token")).toBe("xyz789");
        });

        it("should not throw when removing non-existent key", () => {
            // Arrange
            const storage = createStorageService("test");

            // Act & Assert
            expect(() => storage.remove("nonExistentKey")).not.toThrow();
        });

        it("should log errors on removal failure", () => {
            // Arrange
            const storage = createStorageService("test");
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const genericError = new Error("Removal failed");
            vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
                throw genericError;
            });

            // Act
            storage.remove("key");

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(genericError);
        });
    });

    describe("prefix isolation", () => {
        it("should isolate storage between different prefixes", () => {
            // Arrange
            const authStorage = createStorageService("auth");
            const settingsStorage = createStorageService("settings");

            // Act
            authStorage.put("token", "auth-token");
            settingsStorage.put("token", "settings-token");

            // Assert
            expect(authStorage.get("token")).toBe("auth-token");
            expect(settingsStorage.get("token")).toBe("settings-token");
            expect(localStorage.getItem("auth:token")).toBe("auth-token");
            expect(localStorage.getItem("settings:token")).toBe("settings-token");
        });
    });
});

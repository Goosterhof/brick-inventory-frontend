import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {describe, expect, it, vi} from "vitest";

import {
    createHttpService,
    type RequestMiddlewareFunc,
    type ResponseErrorMiddlewareFunc,
    type ResponseMiddlewareFunc,
} from "@/services/http";

describe("http service", () => {
    const baseURL = "https://api.example.com";

    describe("createHttpService", () => {
        it("should create an axios instance with correct config", () => {
            // Arrange
            const createSpy = vi.spyOn(axios, "create");

            // Act
            createHttpService(baseURL);

            // Assert
            expect(createSpy).toHaveBeenCalledWith({
                baseURL,
                withCredentials: true,
                headers: {Accept: "application/json"},
            });
        });

        it("should return all expected methods", () => {
            // Act
            const service = createHttpService(baseURL);

            // Assert
            expect(service).toHaveProperty("getRequest");
            expect(service).toHaveProperty("postRequest");
            expect(service).toHaveProperty("putRequest");
            expect(service).toHaveProperty("patchRequest");
            expect(service).toHaveProperty("deleteRequest");
            expect(service).toHaveProperty("registerRequestMiddleware");
            expect(service).toHaveProperty("registerResponseMiddleware");
            expect(service).toHaveProperty("registerResponseErrorMiddleware");
        });
    });

    describe("request methods", () => {
        it("should call axios.get with endpoint for getRequest", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const responseData = {id: 1};
            mock.onGet(`${baseURL}/users`).reply(200, responseData);

            // Act
            const result = await service.getRequest("/users");

            // Assert
            expect(result.data).toEqual(responseData);
            expect(result.status).toBe(200);

            mock.restore();
        });

        it("should call axios.post with endpoint and data for postRequest", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const requestData = {name: "Test"};
            const responseData = {id: 1, name: "Test"};
            mock.onPost(`${baseURL}/users`, requestData).reply(201, responseData);

            // Act
            const result = await service.postRequest("/users", requestData);

            // Assert
            expect(result.data).toEqual(responseData);
            expect(result.status).toBe(201);

            mock.restore();
        });

        it("should call axios.put with endpoint and data for putRequest", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const requestData = {name: "Updated"};
            const responseData = {id: 1, name: "Updated"};
            mock.onPut(`${baseURL}/users/1`, requestData).reply(200, responseData);

            // Act
            const result = await service.putRequest("/users/1", requestData);

            // Assert
            expect(result.data).toEqual(responseData);
            expect(result.status).toBe(200);

            mock.restore();
        });

        it("should call axios.patch with endpoint and data for patchRequest", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const requestData = {name: "Patched"};
            const responseData = {id: 1, name: "Patched"};
            mock.onPatch(`${baseURL}/users/1`, requestData).reply(200, responseData);

            // Act
            const result = await service.patchRequest("/users/1", requestData);

            // Assert
            expect(result.data).toEqual(responseData);
            expect(result.status).toBe(200);

            mock.restore();
        });

        it("should call axios.delete with endpoint for deleteRequest", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const responseData = {success: true};
            mock.onDelete(`${baseURL}/users/1`).reply(200, responseData);

            // Act
            const result = await service.deleteRequest("/users/1");

            // Assert
            expect(result.data).toEqual(responseData);
            expect(result.status).toBe(200);

            mock.restore();
        });
    });

    describe("request middleware", () => {
        it("should execute registered request middleware", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: RequestMiddlewareFunc = vi.fn();
            mock.onGet(`${baseURL}/users`).reply(200, {});

            // Act
            service.registerRequestMiddleware(middleware);
            await service.getRequest("/users");

            // Assert
            expect(middleware).toHaveBeenCalled();

            mock.restore();
        });

        it("should execute multiple request middlewares in order", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const callOrder: number[] = [];
            const middleware1: RequestMiddlewareFunc = vi.fn(() => callOrder.push(1));
            const middleware2: RequestMiddlewareFunc = vi.fn(() => callOrder.push(2));
            mock.onGet(`${baseURL}/users`).reply(200, {});

            // Act
            service.registerRequestMiddleware(middleware1);
            service.registerRequestMiddleware(middleware2);
            await service.getRequest("/users");

            // Assert
            expect(callOrder).toEqual([1, 2]);

            mock.restore();
        });

        it("should not execute middleware after unregister is called", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: RequestMiddlewareFunc = vi.fn();
            mock.onGet(`${baseURL}/users`).reply(200, {});

            // Act
            const unregister = service.registerRequestMiddleware(middleware);
            unregister();
            await service.getRequest("/users");

            // Assert
            expect(middleware).not.toHaveBeenCalled();

            mock.restore();
        });

        it("should handle calling unregister multiple times safely", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: RequestMiddlewareFunc = vi.fn();
            mock.onGet(`${baseURL}/users`).reply(200, {});

            // Act
            const unregister = service.registerRequestMiddleware(middleware);
            unregister();
            unregister(); // Call twice - should not throw
            await service.getRequest("/users");

            // Assert
            expect(middleware).not.toHaveBeenCalled();

            mock.restore();
        });
    });

    describe("response middleware", () => {
        it("should execute registered response middleware", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: ResponseMiddlewareFunc = vi.fn();
            mock.onGet(`${baseURL}/users`).reply(200, {id: 1});

            // Act
            service.registerResponseMiddleware(middleware);
            await service.getRequest("/users");

            // Assert
            expect(middleware).toHaveBeenCalled();

            mock.restore();
        });

        it("should return the response after middleware execution", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const responseData = {id: 1};
            mock.onGet(`${baseURL}/users`).reply(200, responseData);

            // Act
            const result = await service.getRequest("/users");

            // Assert
            expect(result.data).toEqual(responseData);

            mock.restore();
        });

        it("should not execute middleware after unregister is called", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: ResponseMiddlewareFunc = vi.fn();
            mock.onGet(`${baseURL}/users`).reply(200, {id: 1});

            // Act
            const unregister = service.registerResponseMiddleware(middleware);
            unregister();
            await service.getRequest("/users");

            // Assert
            expect(middleware).not.toHaveBeenCalled();

            mock.restore();
        });

        it("should handle calling unregister multiple times safely", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: ResponseMiddlewareFunc = vi.fn();
            mock.onGet(`${baseURL}/users`).reply(200, {id: 1});

            // Act
            const unregister = service.registerResponseMiddleware(middleware);
            unregister();
            unregister(); // Call twice - should not throw
            await service.getRequest("/users");

            // Assert
            expect(middleware).not.toHaveBeenCalled();

            mock.restore();
        });
    });

    describe("response error middleware", () => {
        it("should execute registered error middleware for axios errors", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: ResponseErrorMiddlewareFunc = vi.fn();
            mock.onGet(`${baseURL}/users`).reply(500);
            service.registerResponseErrorMiddleware(middleware);

            // Act & Assert
            await expect(service.getRequest("/users")).rejects.toThrow();
            expect(middleware).toHaveBeenCalled();

            mock.restore();
        });

        it("should not execute error middleware for non-axios errors", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: ResponseErrorMiddlewareFunc = vi.fn();
            const genericError = new Error("Generic error");
            mock.onGet(`${baseURL}/users`).reply(() => {
                throw genericError;
            });
            service.registerResponseErrorMiddleware(middleware);

            // Act & Assert
            await expect(service.getRequest("/users")).rejects.toThrow("Generic error");
            expect(middleware).not.toHaveBeenCalled();

            mock.restore();
        });

        it("should reject with the error after middleware execution", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            mock.onGet(`${baseURL}/users`).reply(500);

            // Act & Assert
            await expect(service.getRequest("/users")).rejects.toThrow();

            mock.restore();
        });

        it("should not execute middleware after unregister is called", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: ResponseErrorMiddlewareFunc = vi.fn();
            mock.onGet(`${baseURL}/users`).reply(500);

            // Act
            const unregister = service.registerResponseErrorMiddleware(middleware);
            unregister();

            // Assert
            await expect(service.getRequest("/users")).rejects.toThrow();
            expect(middleware).not.toHaveBeenCalled();

            mock.restore();
        });

        it("should handle calling unregister multiple times safely", async () => {
            // Arrange
            const mock = new MockAdapter(axios);
            const service = createHttpService(baseURL);
            const middleware: ResponseErrorMiddlewareFunc = vi.fn();
            mock.onGet(`${baseURL}/users`).reply(500);

            // Act
            const unregister = service.registerResponseErrorMiddleware(middleware);
            unregister();
            unregister(); // Call twice - should not throw

            // Assert
            await expect(service.getRequest("/users")).rejects.toThrow();
            expect(middleware).not.toHaveBeenCalled();

            mock.restore();
        });
    });
});

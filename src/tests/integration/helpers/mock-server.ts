/**
 * Lightweight in-memory HTTP service for integration tests.
 *
 * Replaces the @script-development/fs-http transport layer with an in-memory
 * route table. Stores, adapters, translation, and camelCase transforms all
 * run real — only the network transport is replaced.
 *
 * Usage in test files:
 *
 *   import {mockHttpService, mockServer} from "../helpers/mock-server";
 *
 *   vi.mock("@script-development/fs-http", async () => {
 *       const {mockHttpService} = await import("../helpers/mock-server");
 *       return {createHttpService: () => mockHttpService};
 *   });
 *
 *   beforeEach(() => mockServer.reset());
 *   mockServer.onGet("storage-options", [...]); // register before mount
 */

type RouteHandler = unknown;

const routes = {
    GET: new Map<string, RouteHandler>(),
    POST: new Map<string, RouteHandler>(),
    PUT: new Map<string, RouteHandler>(),
    PATCH: new Map<string, RouteHandler>(),
    DELETE: new Map<string, RouteHandler>(),
};

const makeResponse = <T>(data: T): {data: T; status: number; statusText: string; headers: object; config: object} => ({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
});

const resolveRoute = <T>(
    method: keyof typeof routes,
    endpoint: string,
): Promise<{data: T; status: number; statusText: string; headers: object; config: object}> => {
    const handler = routes[method].get(endpoint);
    if (handler === undefined) {
        return Promise.reject(new Error(`[mock-server] No ${method} handler registered for "${endpoint}"`));
    }
    return Promise.resolve(makeResponse(handler as T));
};

const noop = () => () => {};

/**
 * The mock HTTP service implementing the HttpService interface from
 * @script-development/fs-http. Backed by in-memory route table.
 * Middleware registration methods are no-ops since we bypass axios entirely.
 */
export const mockHttpService = {
    getRequest: <T = unknown>(endpoint: string) => resolveRoute<T>("GET", endpoint),
    postRequest: <T = unknown>(endpoint: string, _data: unknown) => resolveRoute<T>("POST", endpoint),
    putRequest: <T = unknown>(endpoint: string, _data: unknown) => resolveRoute<T>("PUT", endpoint),
    patchRequest: <T = unknown>(endpoint: string, _data: unknown) => resolveRoute<T>("PATCH", endpoint),
    deleteRequest: <T = unknown>(endpoint: string) => resolveRoute<T>("DELETE", endpoint),
    downloadRequest: () => Promise.reject(new Error("[mock-server] downloadRequest not implemented")),
    previewRequest: () => Promise.reject(new Error("[mock-server] previewRequest not implemented")),
    streamRequest: () => Promise.reject(new Error("[mock-server] streamRequest not implemented")),
    registerRequestMiddleware: noop,
    registerResponseMiddleware: noop,
    registerResponseErrorMiddleware: noop,
};

/**
 * Route registration and lifecycle API for tests.
 */
export const mockServer = {
    /** Register a GET route. Call before mounting the component. */
    onGet: (endpoint: string, responseData: unknown): void => {
        routes.GET.set(endpoint, responseData);
    },

    /** Register a POST route. */
    onPost: (endpoint: string, responseData: unknown): void => {
        routes.POST.set(endpoint, responseData);
    },

    /** Register a PUT route. */
    onPut: (endpoint: string, responseData: unknown): void => {
        routes.PUT.set(endpoint, responseData);
    },

    /** Register a PATCH route. */
    onPatch: (endpoint: string, responseData: unknown): void => {
        routes.PATCH.set(endpoint, responseData);
    },

    /** Register a DELETE route. */
    onDelete: (endpoint: string, responseData: unknown = undefined): void => {
        routes.DELETE.set(endpoint, responseData);
    },

    /** Clear all registered routes. Call in beforeEach. */
    reset: (): void => {
        for (const map of Object.values(routes)) {
            map.clear();
        }
    },
};

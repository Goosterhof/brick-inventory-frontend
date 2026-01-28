import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHttpService, type RequestMiddlewareFunc, type ResponseMiddlewareFunc, type ResponseErrorMiddlewareFunc } from '@/services/http';
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const { mockCreate } = vi.hoisted(() => ({
    mockCreate: vi.fn(),
}));

vi.mock('axios', async (importOriginal) => {
    const actual = await importOriginal<typeof import('axios')>();
    return {
        ...actual,
        default: {
            ...actual.default,
            create: mockCreate,
        },
    };
});

describe('http service', () => {
    const baseURL = 'https://api.example.com';
    let mockAxiosInstance: {
        get: ReturnType<typeof vi.fn>;
        post: ReturnType<typeof vi.fn>;
        put: ReturnType<typeof vi.fn>;
        patch: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        interceptors: {
            request: { use: ReturnType<typeof vi.fn> };
            response: { use: ReturnType<typeof vi.fn> };
        };
    };
    let requestInterceptor: (request: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
    let responseInterceptor: (response: AxiosResponse) => AxiosResponse;
    let responseErrorInterceptor: (error: unknown) => Promise<never>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockAxiosInstance = {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        };

        mockCreate.mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

        mockAxiosInstance.interceptors.request.use.mockImplementation((interceptor) => {
            requestInterceptor = interceptor;
        });

        mockAxiosInstance.interceptors.response.use.mockImplementation((successInterceptor, errorInterceptor) => {
            responseInterceptor = successInterceptor;
            responseErrorInterceptor = errorInterceptor;
        });
    });

    describe('createHttpService', () => {
        it('creates an axios instance with correct config', () => {
            createHttpService(baseURL);

            expect(mockCreate).toHaveBeenCalledWith({
                baseURL,
                withCredentials: true,
                headers: {
                    Accept: 'application/json',
                },
            });
        });

        it('returns all expected methods', () => {
            const service = createHttpService(baseURL);

            expect(service).toHaveProperty('getRequest');
            expect(service).toHaveProperty('postRequest');
            expect(service).toHaveProperty('putRequest');
            expect(service).toHaveProperty('patchRequest');
            expect(service).toHaveProperty('deleteRequest');
            expect(service).toHaveProperty('registerRequestMiddleware');
            expect(service).toHaveProperty('registerResponseMiddleware');
            expect(service).toHaveProperty('registerResponseErrorMiddleware');
        });
    });

    describe('request methods', () => {
        it('getRequest calls axios.get with endpoint and options', async () => {
            const service = createHttpService(baseURL);
            const mockResponse = { data: { id: 1 } };
            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const options = { params: { search: 'test' } };
            const result = await service.getRequest('/users', options);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', options);
            expect(result).toEqual(mockResponse);
        });

        it('postRequest calls axios.post with endpoint, data, and options', async () => {
            const service = createHttpService(baseURL);
            const mockResponse = { data: { id: 1 } };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const data = { name: 'Test' };
            const options = { headers: { 'X-Custom': 'value' } };
            const result = await service.postRequest('/users', data, options);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', data, options);
            expect(result).toEqual(mockResponse);
        });

        it('putRequest calls axios.put with endpoint, data, and options', async () => {
            const service = createHttpService(baseURL);
            const mockResponse = { data: { id: 1 } };
            mockAxiosInstance.put.mockResolvedValue(mockResponse);

            const data = { name: 'Updated' };
            const options = { headers: { 'X-Custom': 'value' } };
            const result = await service.putRequest('/users/1', data, options);

            expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', data, options);
            expect(result).toEqual(mockResponse);
        });

        it('patchRequest calls axios.patch with endpoint, data, and options', async () => {
            const service = createHttpService(baseURL);
            const mockResponse = { data: { id: 1 } };
            mockAxiosInstance.patch.mockResolvedValue(mockResponse);

            const data = { name: 'Patched' };
            const options = { headers: { 'X-Custom': 'value' } };
            const result = await service.patchRequest('/users/1', data, options);

            expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/1', data, options);
            expect(result).toEqual(mockResponse);
        });

        it('deleteRequest calls axios.delete with endpoint and options', async () => {
            const service = createHttpService(baseURL);
            const mockResponse = { data: { success: true } };
            mockAxiosInstance.delete.mockResolvedValue(mockResponse);

            const options = { headers: { 'X-Custom': 'value' } };
            const result = await service.deleteRequest('/users/1', options);

            expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1', options);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('request middleware', () => {
        it('executes registered request middleware', () => {
            const service = createHttpService(baseURL);
            const middleware: RequestMiddlewareFunc = vi.fn();

            service.registerRequestMiddleware(middleware);

            const mockRequest = { headers: {} } as InternalAxiosRequestConfig;
            requestInterceptor(mockRequest);

            expect(middleware).toHaveBeenCalledWith(mockRequest);
        });

        it('executes multiple request middlewares in order', () => {
            const service = createHttpService(baseURL);
            const callOrder: number[] = [];
            const middleware1: RequestMiddlewareFunc = vi.fn(() => callOrder.push(1));
            const middleware2: RequestMiddlewareFunc = vi.fn(() => callOrder.push(2));

            service.registerRequestMiddleware(middleware1);
            service.registerRequestMiddleware(middleware2);

            const mockRequest = { headers: {} } as InternalAxiosRequestConfig;
            requestInterceptor(mockRequest);

            expect(callOrder).toEqual([1, 2]);
        });
    });

    describe('response middleware', () => {
        it('executes registered response middleware', () => {
            const service = createHttpService(baseURL);
            const middleware: ResponseMiddlewareFunc = vi.fn();

            service.registerResponseMiddleware(middleware);

            const mockResponse = { data: {}, status: 200 } as AxiosResponse;
            responseInterceptor(mockResponse);

            expect(middleware).toHaveBeenCalledWith(mockResponse);
        });

        it('returns the response after middleware execution', () => {
            createHttpService(baseURL);

            const mockResponse = { data: { id: 1 }, status: 200 } as AxiosResponse;
            const result = responseInterceptor(mockResponse);

            expect(result).toEqual(mockResponse);
        });
    });

    describe('response error middleware', () => {
        it('executes registered error middleware for axios errors', async () => {
            const service = createHttpService(baseURL);
            const middleware: ResponseErrorMiddlewareFunc = vi.fn();

            service.registerResponseErrorMiddleware(middleware);

            const axiosError = new AxiosError('Request failed');

            await expect(responseErrorInterceptor(axiosError)).rejects.toEqual(axiosError);
            expect(middleware).toHaveBeenCalledWith(axiosError);
        });

        it('does not execute error middleware for non-axios errors', async () => {
            const service = createHttpService(baseURL);
            const middleware: ResponseErrorMiddlewareFunc = vi.fn();

            service.registerResponseErrorMiddleware(middleware);

            const genericError = new Error('Generic error');

            await expect(responseErrorInterceptor(genericError)).rejects.toEqual(genericError);
            expect(middleware).not.toHaveBeenCalled();
        });

        it('rejects with the error after middleware execution', async () => {
            createHttpService(baseURL);

            const axiosError = new AxiosError('Request failed');

            await expect(responseErrorInterceptor(axiosError)).rejects.toEqual(axiosError);
        });
    });
});

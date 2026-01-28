import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHttpService, type RequestMiddlewareFunc, type ResponseMiddlewareFunc, type ResponseErrorMiddlewareFunc } from '@/services/http';
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

vi.mock('axios', { spy: true });

const createMockAxiosInstance = () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
    },
});

type MockAxiosInstance = ReturnType<typeof createMockAxiosInstance>;

interface SetupResult {
    mockAxiosInstance: MockAxiosInstance;
    getRequestInterceptor: () => (request: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
    getResponseInterceptor: () => (response: AxiosResponse) => AxiosResponse;
    getResponseErrorInterceptor: () => (error: unknown) => Promise<never>;
}

const setupHttpServiceTest = (): SetupResult => {
    const mockAxiosInstance = createMockAxiosInstance();
    const interceptors = {
        request: undefined as unknown as (request: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
        response: undefined as unknown as (response: AxiosResponse) => AxiosResponse,
        responseError: undefined as unknown as (error: unknown) => Promise<never>,
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    mockAxiosInstance.interceptors.request.use.mockImplementation((interceptor) => {
        interceptors.request = interceptor;
    });

    mockAxiosInstance.interceptors.response.use.mockImplementation((successInterceptor, errorInterceptor) => {
        interceptors.response = successInterceptor;
        interceptors.responseError = errorInterceptor;
    });

    return {
        mockAxiosInstance,
        getRequestInterceptor: () => interceptors.request,
        getResponseInterceptor: () => interceptors.response,
        getResponseErrorInterceptor: () => interceptors.responseError,
    };
};

describe('http service', () => {
    const baseURL = 'https://api.example.com';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createHttpService', () => {
        it('should create an axios instance with correct config', () => {
            // Arrange
            setupHttpServiceTest();

            // Act
            createHttpService(baseURL);

            // Assert
            expect(axios.create).toHaveBeenCalledWith({
                baseURL,
                withCredentials: true,
                headers: {
                    Accept: 'application/json',
                },
            });
        });

        it('should return all expected methods', () => {
            // Arrange
            setupHttpServiceTest();

            // Act
            const service = createHttpService(baseURL);

            // Assert
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
        it('should call axios.get with endpoint and options for getRequest', async () => {
            // Arrange
            const { mockAxiosInstance } = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const mockResponse = { data: { id: 1 } };
            const options = { params: { search: 'test' } };
            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            // Act
            const result = await service.getRequest('/users', options);

            // Assert
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', options);
            expect(result).toEqual(mockResponse);
        });

        it('should call axios.post with endpoint, data, and options for postRequest', async () => {
            // Arrange
            const { mockAxiosInstance } = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const mockResponse = { data: { id: 1 } };
            const data = { name: 'Test' };
            const options = { headers: { 'X-Custom': 'value' } };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            // Act
            const result = await service.postRequest('/users', data, options);

            // Assert
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', data, options);
            expect(result).toEqual(mockResponse);
        });

        it('should call axios.put with endpoint, data, and options for putRequest', async () => {
            // Arrange
            const { mockAxiosInstance } = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const mockResponse = { data: { id: 1 } };
            const data = { name: 'Updated' };
            const options = { headers: { 'X-Custom': 'value' } };
            mockAxiosInstance.put.mockResolvedValue(mockResponse);

            // Act
            const result = await service.putRequest('/users/1', data, options);

            // Assert
            expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', data, options);
            expect(result).toEqual(mockResponse);
        });

        it('should call axios.patch with endpoint, data, and options for patchRequest', async () => {
            // Arrange
            const { mockAxiosInstance } = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const mockResponse = { data: { id: 1 } };
            const data = { name: 'Patched' };
            const options = { headers: { 'X-Custom': 'value' } };
            mockAxiosInstance.patch.mockResolvedValue(mockResponse);

            // Act
            const result = await service.patchRequest('/users/1', data, options);

            // Assert
            expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/1', data, options);
            expect(result).toEqual(mockResponse);
        });

        it('should call axios.delete with endpoint and options for deleteRequest', async () => {
            // Arrange
            const { mockAxiosInstance } = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const mockResponse = { data: { success: true } };
            const options = { headers: { 'X-Custom': 'value' } };
            mockAxiosInstance.delete.mockResolvedValue(mockResponse);

            // Act
            const result = await service.deleteRequest('/users/1', options);

            // Assert
            expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1', options);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('request middleware', () => {
        it('should execute registered request middleware', () => {
            // Arrange
            const setup = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const middleware: RequestMiddlewareFunc = vi.fn();
            const mockRequest = { headers: {} } as InternalAxiosRequestConfig;

            // Act
            service.registerRequestMiddleware(middleware);
            setup.getRequestInterceptor()(mockRequest);

            // Assert
            expect(middleware).toHaveBeenCalledWith(mockRequest);
        });

        it('should execute multiple request middlewares in order', () => {
            // Arrange
            const setup = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const callOrder: number[] = [];
            const middleware1: RequestMiddlewareFunc = vi.fn(() => callOrder.push(1));
            const middleware2: RequestMiddlewareFunc = vi.fn(() => callOrder.push(2));
            const mockRequest = { headers: {} } as InternalAxiosRequestConfig;

            // Act
            service.registerRequestMiddleware(middleware1);
            service.registerRequestMiddleware(middleware2);
            setup.getRequestInterceptor()(mockRequest);

            // Assert
            expect(callOrder).toEqual([1, 2]);
        });
    });

    describe('response middleware', () => {
        it('should execute registered response middleware', () => {
            // Arrange
            const setup = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const middleware: ResponseMiddlewareFunc = vi.fn();
            const mockResponse = { data: {}, status: 200 } as AxiosResponse;

            // Act
            service.registerResponseMiddleware(middleware);
            setup.getResponseInterceptor()(mockResponse);

            // Assert
            expect(middleware).toHaveBeenCalledWith(mockResponse);
        });

        it('should return the response after middleware execution', () => {
            // Arrange
            const setup = setupHttpServiceTest();
            createHttpService(baseURL);
            const mockResponse = { data: { id: 1 }, status: 200 } as AxiosResponse;

            // Act
            const result = setup.getResponseInterceptor()(mockResponse);

            // Assert
            expect(result).toEqual(mockResponse);
        });
    });

    describe('response error middleware', () => {
        it('should execute registered error middleware for axios errors', async () => {
            // Arrange
            const setup = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const middleware: ResponseErrorMiddlewareFunc = vi.fn();
            const axiosError = new AxiosError('Request failed');
            service.registerResponseErrorMiddleware(middleware);

            // Act & Assert
            await expect(setup.getResponseErrorInterceptor()(axiosError)).rejects.toEqual(axiosError);
            expect(middleware).toHaveBeenCalledWith(axiosError);
        });

        it('should not execute error middleware for non-axios errors', async () => {
            // Arrange
            const setup = setupHttpServiceTest();
            const service = createHttpService(baseURL);
            const middleware: ResponseErrorMiddlewareFunc = vi.fn();
            const genericError = new Error('Generic error');
            service.registerResponseErrorMiddleware(middleware);

            // Act & Assert
            await expect(setup.getResponseErrorInterceptor()(genericError)).rejects.toEqual(genericError);
            expect(middleware).not.toHaveBeenCalled();
        });

        it('should reject with the error after middleware execution', async () => {
            // Arrange
            const setup = setupHttpServiceTest();
            createHttpService(baseURL);
            const axiosError = new AxiosError('Request failed');

            // Act & Assert
            await expect(setup.getResponseErrorInterceptor()(axiosError)).rejects.toEqual(axiosError);
        });
    });
});

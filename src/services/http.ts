import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig, isAxiosError } from 'axios';

export type AxiosResponseError = Record<string, unknown>;

export type RequestMiddlewareFunc = (request: InternalAxiosRequestConfig) => void;
export type ResponseMiddlewareFunc = (response: AxiosResponse) => void;
export type ResponseErrorMiddlewareFunc = (error: AxiosError<AxiosResponseError>) => void;

export interface HttpService {
    getRequest: <T = unknown>(endpoint: string, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    postRequest: <T = unknown>(endpoint: string, data: unknown, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    putRequest: <T = unknown>(endpoint: string, data: unknown, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    patchRequest: <T = unknown>(endpoint: string, data: unknown, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    deleteRequest: <T = unknown>(endpoint: string, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    registerRequestMiddleware: (middlewareFunc: RequestMiddlewareFunc) => void;
    registerResponseMiddleware: (middlewareFunc: ResponseMiddlewareFunc) => void;
    registerResponseErrorMiddleware: (middlewareFunc: ResponseErrorMiddlewareFunc) => void;
}

export const createHttpService = (baseURL: string): HttpService => {
    const http = axios.create({
        baseURL,
        withCredentials: true,
        headers: {
            Accept: 'application/json',
        },
    });

    const requestMiddleware: RequestMiddlewareFunc[] = [];
    const responseMiddleware: ResponseMiddlewareFunc[] = [];
    const responseErrorMiddleware: ResponseErrorMiddlewareFunc[] = [];

    http.interceptors.request.use(request => {
        for (const middleware of requestMiddleware) middleware(request);

        return request;
    });

    http.interceptors.response.use(
        response => {
            for (const middleware of responseMiddleware) middleware(response);

            return response;
        },
        error => {
            if (!isAxiosError<AxiosResponseError>(error)) return Promise.reject(error);

            for (const middleware of responseErrorMiddleware) middleware(error);

            return Promise.reject(error);
        },
    );

    const getRequest = <T = unknown>(endpoint: string, options?: AxiosRequestConfig) =>
        http.get<T>(endpoint, options);

    const postRequest = <T = unknown>(endpoint: string, data: unknown, options?: AxiosRequestConfig) =>
        http.post<T>(endpoint, data, options);

    const putRequest = <T = unknown>(endpoint: string, data: unknown, options?: AxiosRequestConfig) =>
        http.put<T>(endpoint, data, options);

    const patchRequest = <T = unknown>(endpoint: string, data: unknown, options?: AxiosRequestConfig) =>
        http.patch<T>(endpoint, data, options);

    const deleteRequest = <T = unknown>(endpoint: string, options?: AxiosRequestConfig) =>
        http.delete<T>(endpoint, options);

    const registerRequestMiddleware = (middlewareFunc: RequestMiddlewareFunc) => {
        requestMiddleware.push(middlewareFunc);
    };

    const registerResponseMiddleware = (middlewareFunc: ResponseMiddlewareFunc) => {
        responseMiddleware.push(middlewareFunc);
    };

    const registerResponseErrorMiddleware = (middlewareFunc: ResponseErrorMiddlewareFunc) => {
        responseErrorMiddleware.push(middlewareFunc);
    };

    return {
        getRequest,
        postRequest,
        putRequest,
        patchRequest,
        deleteRequest,
        registerRequestMiddleware,
        registerResponseMiddleware,
        registerResponseErrorMiddleware,
    };
};

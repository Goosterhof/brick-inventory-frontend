import axios, { isAxiosError, type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

export type AxiosResponseError = Record<string, unknown>;

export type RequestMiddlewareFunc = (request: InternalAxiosRequestConfig) => void;
export type ResponseMiddlewareFunc = (response: AxiosResponse) => void;
export type ResponseErrorMiddlewareFunc = (error: AxiosError<AxiosResponseError>) => void;

export const createHttpService = (baseURL: string) => {
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

    const deleteRequest = <T = unknown>(endpoint: string) => http.delete<T>(endpoint);

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
        deleteRequest,
        registerRequestMiddleware,
        registerResponseMiddleware,
        registerResponseErrorMiddleware,
    };
}

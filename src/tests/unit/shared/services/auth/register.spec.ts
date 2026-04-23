import {createHttpService} from '@script-development/fs-http';
import {createAuthService} from '@shared/services/auth';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {describe, expect, it} from 'vitest';

interface TestProfile {
    id: number;
    email: string;
    createdAt: string;
}

describe('auth service register', () => {
    const baseURL = 'https://api.example.com';

    it('should set user after successful registration', async () => {
        // Arrange
        const mock = new MockAdapter(axios);
        const httpService = createHttpService(baseURL);
        const authService = createAuthService<TestProfile>(httpService);
        const registrationData = {
            familyName: 'Smith',
            name: 'John',
            email: 'john@example.com',
            password: 'password123',
            passwordConfirmation: 'password123',
        };
        const responseData = {id: 1, email: 'john@example.com', created_at: '2024-01-01T00:00:00Z'};
        mock.onPost(`${baseURL}/register`, {
            family_name: 'Smith',
            name: 'John',
            email: 'john@example.com',
            password: 'password123',
            password_confirmation: 'password123',
        }).reply(200, responseData);

        // Act
        await authService.register(registrationData);

        // Assert
        expect(authService.user.value).toEqual({id: 1, email: 'john@example.com', createdAt: '2024-01-01T00:00:00Z'});

        mock.restore();
    });

    it('should set isLoggedIn to true after successful registration', async () => {
        // Arrange
        const mock = new MockAdapter(axios);
        const httpService = createHttpService(baseURL);
        const authService = createAuthService<TestProfile>(httpService);
        const registrationData = {
            familyName: 'Smith',
            name: 'John',
            email: 'john@example.com',
            password: 'password123',
            passwordConfirmation: 'password123',
        };
        const responseData = {id: 1, email: 'john@example.com', created_at: '2024-01-01T00:00:00Z'};
        mock.onPost(`${baseURL}/register`).reply(200, responseData);

        // Act
        await authService.register(registrationData);

        // Assert
        expect(authService.isLoggedIn.value).toBe(true);

        mock.restore();
    });

    it('should throw error on failed registration', async () => {
        // Arrange
        const mock = new MockAdapter(axios);
        const httpService = createHttpService(baseURL);
        const authService = createAuthService<TestProfile>(httpService);
        const registrationData = {
            familyName: 'Smith',
            name: 'John',
            email: 'existing@example.com',
            password: 'password123',
            passwordConfirmation: 'password123',
        };
        mock.onPost(`${baseURL}/register`).reply(422, {
            message: 'The email has already been taken.',
            errors: {email: ['The email has already been taken.']},
        });

        // Act & Assert
        await expect(authService.register(registrationData)).rejects.toThrow();

        mock.restore();
    });

    it('should convert camelCase to snake_case for API request', async () => {
        // Arrange
        const mock = new MockAdapter(axios);
        const httpService = createHttpService(baseURL);
        const authService = createAuthService<TestProfile>(httpService);
        const registrationData = {
            familyName: 'Smith',
            name: 'John',
            email: 'john@example.com',
            password: 'password123',
            passwordConfirmation: 'password123',
        };
        const responseData = {id: 1, email: 'john@example.com', created_at: '2024-01-01T00:00:00Z'};

        let capturedData: unknown;
        mock.onPost(`${baseURL}/register`).reply((config) => {
            capturedData = JSON.parse(config.data as string);
            return [200, responseData];
        });

        // Act
        await authService.register(registrationData);

        // Assert
        expect(capturedData).toEqual({
            family_name: 'Smith',
            name: 'John',
            email: 'john@example.com',
            password: 'password123',
            password_confirmation: 'password123',
        });

        mock.restore();
    });
});

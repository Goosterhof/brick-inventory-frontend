import type {HttpService} from "@script-development/fs-http";
import type {DeepSnakeKeys} from "string-ts";
import type {ComputedRef, ShallowRef} from "vue";

import {NotLoggedInError} from "@shared/errors/not-logged-in";
import {toCamelCaseTyped} from "@shared/helpers/string";
import {isAxiosError} from "axios";
import {deepSnakeKeys} from "string-ts";
import {computed, shallowRef} from "vue";

import type {AuthService, Credentials, RegistrationData} from "./types";

export const createAuthService = <Profile extends {id: number}>(httpService: HttpService): AuthService<Profile> => {
    const userRef: ShallowRef<Profile | null> = shallowRef(null);

    const isLoggedIn = computed(() => userRef.value !== null);
    const user: ComputedRef<Profile | null> = computed(() => userRef.value);

    const userId = (): number => {
        const currentUser = userRef.value;
        if (!currentUser) throw new NotLoggedInError();

        return currentUser.id;
    };

    const register = async (registrationData: RegistrationData): Promise<void> => {
        const {data} = await httpService.postRequest<DeepSnakeKeys<Profile>>(
            "/register",
            deepSnakeKeys(registrationData),
        );
        userRef.value = toCamelCaseTyped<Profile>(data);
    };

    const login = async (loginData: Credentials): Promise<void> => {
        const {data} = await httpService.postRequest<DeepSnakeKeys<Profile>>("/login", loginData);
        userRef.value = toCamelCaseTyped<Profile>(data);
    };

    const logout = async (): Promise<void> => {
        await httpService.postRequest("/logout", {});
        userRef.value = null;
    };

    const checkIfLoggedIn = async (): Promise<void> => {
        try {
            const {data} = await httpService.getRequest<DeepSnakeKeys<Profile>>("/me");
            userRef.value = toCamelCaseTyped<Profile>(data);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                userRef.value = null;

                return;
            }

            throw error;
        }
    };

    return {isLoggedIn, user, userId, register, login, logout, checkIfLoggedIn};
};

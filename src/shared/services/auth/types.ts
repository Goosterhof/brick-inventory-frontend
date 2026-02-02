import type {ComputedRef} from "vue";

export interface Credentials {
    email: string;
    password: string;
}

export interface ResetPassword {
    token: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

export interface AuthService<Profile> {
    isLoggedIn: ComputedRef<boolean>;
    user: ComputedRef<Profile | null>;
    userId: () => number;
    login: (loginData: Credentials) => Promise<void>;
    logout: () => Promise<void>;
    checkIfLoggedIn: () => Promise<void>;
    sendEmailResetPassword: (email: string) => Promise<void>;
    resetPassword: (data: ResetPassword) => Promise<void>;
}

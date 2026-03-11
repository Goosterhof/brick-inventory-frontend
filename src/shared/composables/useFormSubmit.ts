import type {UseValidationErrors} from "@shared/composables/useValidationErrors";

import {isAxiosError} from "axios";

/** @public */
export const useFormSubmit = <T extends string>(validationErrors: UseValidationErrors<T>) => {
    const handleSubmit = async (action: () => Promise<void>) => {
        validationErrors.clearErrors();

        try {
            await action();
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 422) {
                return;
            }
            throw error;
        }
    };

    return {handleSubmit};
};

import {createHttpService} from "@script-development/fs-http";

const API_BASE_URL: string =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.brick-inventory.com/api";

export const familyHttpService = createHttpService(API_BASE_URL);

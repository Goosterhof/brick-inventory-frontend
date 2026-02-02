import {createHttpService} from "@shared/services/http";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://api.brick-inventory.com/api";

export const httpService = createHttpService(API_BASE_URL);

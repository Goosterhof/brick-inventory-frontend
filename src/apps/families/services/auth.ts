import type {Profile} from "@app/types/profile";

import {createAuthService} from "@shared/services/auth";

import {httpService} from "./http";

export const authService = createAuthService<Profile>(httpService);

import type {RouteRecordRaw} from "vue-router";

import {routes as aboutRoutes} from "@app/domains/about";
import {routes as authRoutes} from "@app/domains/auth";
import {routes as homeRoutes} from "@app/domains/home";
import {routes as setsRoutes} from "@app/domains/sets";
import {routes as settingsRoutes} from "@app/domains/settings";
import {routes as storageRoutes} from "@app/domains/storage";
import {createRouterService} from "@shared/services/router";

const routes = [
    ...homeRoutes,
    ...aboutRoutes,
    ...authRoutes,
    ...setsRoutes,
    ...storageRoutes,
    ...settingsRoutes,
] as const satisfies readonly RouteRecordRaw[];

export type FamilyAppRoutes = typeof routes;

const routerService = createRouterService([...routes], "home", import.meta.env.BASE_URL);

export const familyRouterService = routerService;
export const FamilyRouterView = routerService.RouterView;
export const FamilyRouterLink = routerService.RouterLink;

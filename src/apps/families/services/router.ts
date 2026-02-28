import type {RouteRecordRaw} from "vue-router";

import {routes as aboutRoutes} from "@app/pages/about";
import {routes as authRoutes} from "@app/pages/auth";
import {routes as homeRoutes} from "@app/pages/home";
import {createRouterService} from "@shared/services/router";

const routes = [...homeRoutes, ...aboutRoutes, ...authRoutes] as const satisfies readonly RouteRecordRaw[];

export type FamilyAppRoutes = typeof routes;

const routerService = createRouterService([...routes], "home", import.meta.env.BASE_URL);

export const familyRouterService = routerService;
export const FamilyRouterView = routerService.RouterView;
export const FamilyRouterLink = routerService.RouterLink;

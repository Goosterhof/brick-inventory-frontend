import type {UnregisterMiddleware} from "@script-development/fs-router";
import type {BioRouterService} from "@shared/services/router";
import type {RouteRecordRaw} from "vue-router";

import type {AuthService} from "./types";

export const registerAuthGuard = <Profile, Routes extends RouteRecordRaw[]>(
    authService: AuthService<Profile>,
    routerService: BioRouterService<Routes>,
    loginRouteName: BioRouterService<Routes>["dashboardRouteName"],
    dashboardRouteName: BioRouterService<Routes>["dashboardRouteName"] = routerService.dashboardRouteName,
): UnregisterMiddleware =>
    routerService.registerBeforeRouteMiddleware((to) => {
        const isLoggedIn = authService.isLoggedIn.value;

        if (to.meta?.authOnly && !isLoggedIn) {
            void routerService.goToRoute(loginRouteName);

            return true;
        }

        if (to.meta?.canSeeWhenLoggedIn === false && isLoggedIn) {
            void routerService.goToRoute(dashboardRouteName);

            return true;
        }

        return false;
    });

import type {RouteName, RouterService} from "@script-development/fs-router";
import type {RouteRecordRaw} from "vue-router";

import {createRouterService as createBaseRouterService} from "@script-development/fs-router";

export interface BioRouterService<Routes extends RouteRecordRaw[]> extends RouterService<Routes> {
    dashboardRouteName: RouteName<Routes>;
    goToDashboard: () => Promise<void>;
}

export const createRouterService = <Routes extends RouteRecordRaw[]>(
    routes: Routes,
    dashboardRouteName: RouteName<Routes>,
    base?: string,
): BioRouterService<Routes> => {
    const service = createBaseRouterService(routes, {base});

    // BIO-specific: "from" query middleware
    service.registerBeforeRouteMiddleware((to) => {
        if (to.meta?.ignoreFrom) return false;

        const fromQuery = service.currentRouteRef.value.query.from;
        if (fromQuery) {
            if (fromQuery.toString() === to.name) return false;
            void service.goToRoute(fromQuery.toString());
            return true;
        }

        return false;
    });

    return {...service, dashboardRouteName, goToDashboard: () => service.goToRoute(dashboardRouteName)};
};

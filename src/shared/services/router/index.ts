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

    return {...service, dashboardRouteName, goToDashboard: () => service.goToRoute(dashboardRouteName)};
};

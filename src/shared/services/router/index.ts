import type {NavigationHookAfter, RouteLocationRaw, RouteRecordRaw} from "vue-router";

import {replace} from "string-ts";
import {computed} from "vue";
import {createRouter, createWebHistory} from "vue-router";

import type {BeforeRouteMiddleware, RouteName, RouterService} from "./types";

import {createRouterLink, createRouterView} from "./components";
import {CREATE_PAGE_NAME, EDIT_PAGE_NAME, OVERVIEW_PAGE_NAME, SHOW_PAGE_NAME} from "./routes";

export const createRouterService = <Routes extends RouteRecordRaw[] = []>(
    routes: Routes,
    dashboardRouteName: RouteName<Routes>,
    base?: string,
): RouterService<Routes> => {
    /* Creating a router instance. */
    const router = createRouter({history: createWebHistory(base), routes});

    const flattenedRoutes = routes
        .flatMap((route) => {
            if ("children" in route) return route.children;

            return route;
        })
        .filter((route): route is RouteRecordRaw => Boolean(route));

    const goToRoute: RouterService<Routes>["goToRoute"] = async (name, id, query, parentId) => {
        const route: RouteLocationRaw = {name};

        if (id) route.params = {...route.params, id: id.toString()};
        if (parentId) route.params = {...route.params, parentId: parentId.toString()};
        if (query) route.query = query;

        await router.push(route);
    };

    const normalizedRouteToSpecificRoute: RouterService<Routes>["normalizedRouteToSpecificRoute"] = (route) => {
        const specificRoute = flattenedRoutes.find(({path, name}) => name === route.name || path === route.path);

        if (!specificRoute) {
            // handle special case for root route
            const dashboardRoute = flattenedRoutes.find(({name}) => name === dashboardRouteName);
            if (dashboardRoute && (route.path === "/" || route.path === "")) return dashboardRoute;
            throw new Error(`${route.path} is an unknown route`);
        }

        return specificRoute;
    };

    const getUrlForRouteName: RouterService<Routes>["getUrlForRouteName"] = (name, id, query) =>
        router.resolve({name, params: {id}, query}).fullPath;

    const beforeRouteMiddleware: BeforeRouteMiddleware<Routes>[] = [
        (to) => {
            if (to.meta?.ignoreFrom) return false;

            const fromQuery = currentRouteRef.value.query.from;
            if (fromQuery) {
                if (fromQuery.toString() === to.name) return false;
                void router.push({name: fromQuery.toString(), query: {}});

                return true;
            }

            return false;
        },
    ];
    router.beforeEach(async (to, from, next) => {
        const toNormalized = normalizedRouteToSpecificRoute(to);
        const fromNormalized = normalizedRouteToSpecificRoute(from);

        for (const middleware of beforeRouteMiddleware)
            if (await middleware(toNormalized, fromNormalized)) return next(false);

        next();
    });

    const afterRouteMiddleware: NavigationHookAfter[] = [];
    router.afterEach((to, from, failure) => {
        for (const middleware of afterRouteMiddleware) middleware(to, from, failure);
    });

    const goBack: RouterService<Routes>["goBack"] = () => {
        router.back();
    };

    const currentRouteRef = router.currentRoute;

    const onPage: RouterService<Routes>["onPage"] = (pageName) => {
        const currentName = currentRouteRef.value.name;
        if (!currentName) return false;

        return currentName.toString() === pageName;
    };

    const routeExists = (to: RouteLocationRaw): boolean => {
        try {
            return !!router.resolve(to).name;
        } catch {
            return false;
        }
    };

    const fullPath = replace(location.pathname, base ?? "", "") + location.search;

    return {
        dashboardRouteName,
        normalizedRouteToSpecificRoute,

        goToRoute,
        goToCreatePage: (name) => goToRoute(`${name}${CREATE_PAGE_NAME}`),
        goToOverviewPage: (name) => goToRoute(`${name}${OVERVIEW_PAGE_NAME}`),
        goToEditPage: (name, id) => goToRoute(`${name}${EDIT_PAGE_NAME}`, id),
        goToShowPage: (name, id, query) => goToRoute(`${name}${SHOW_PAGE_NAME}`, id, query),
        goToDashboard: () => goToRoute(dashboardRouteName),

        getUrlForRouteName,
        registerBeforeRouteMiddleware: (middleware) => {
            beforeRouteMiddleware.push(middleware);

            return () => {
                const index = beforeRouteMiddleware.indexOf(middleware);
                if (index > -1) beforeRouteMiddleware.splice(index, 1);
            };
        },
        registerAfterRouteMiddleware: (middleware) => {
            afterRouteMiddleware.push(middleware);

            return () => {
                const index = afterRouteMiddleware.indexOf(middleware);
                if (index > -1) afterRouteMiddleware.splice(index, 1);
            };
        },
        goBack,
        currentRouteRef,
        currentRouteQuery: computed(() => currentRouteRef.value.query),
        currentRouteId: computed(() => {
            const currentRouteId = currentRouteRef.value.params.id;
            if (!currentRouteId) throw new Error("This route has no route id");

            return Number.parseInt(currentRouteId.toString(), 10);
        }),
        currentParentId: computed(() => {
            const currentParentId = currentRouteRef.value.params.parentId;
            if (!currentParentId) throw new Error("This route has no route parentId");

            return Number.parseInt(currentParentId.toString(), 10);
        }),
        changeRouteQuery: (query) => void router.push({query}),
        install: () => void router.push(fullPath),
        onPage,
        onCreatePage: (baseRouteName) => onPage(baseRouteName + CREATE_PAGE_NAME),
        onEditPage: (baseRouteName) => onPage(baseRouteName + EDIT_PAGE_NAME),
        onOverviewPage: (baseRouteName) => onPage(baseRouteName + OVERVIEW_PAGE_NAME),
        onShowPage: (baseRouteName) => onPage(baseRouteName + SHOW_PAGE_NAME),
        routeExists,

        RouterView: createRouterView(currentRouteRef),
        RouterLink: createRouterLink(getUrlForRouteName, goToRoute),
    };
};

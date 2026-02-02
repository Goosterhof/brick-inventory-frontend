import type {RouteRecordRaw} from "vue-router";

import {createRouterService} from "@shared/services/router";

import HomeView from "@app/views/HomeView.vue";

const routes = [
    {path: "/", name: "home", component: HomeView},
    {
        path: "/about",
        name: "about",
        component: () => import("@app/views/AboutView.vue"),
    },
    {
        path: "/register",
        name: "register",
        component: () => import("@app/views/RegisterView.vue"),
        meta: {canSeeWhenLoggedIn: false},
    },
] as const satisfies readonly RouteRecordRaw[];

export type AppRoutes = typeof routes;

export const routerService = createRouterService([...routes], "home", import.meta.env.BASE_URL);

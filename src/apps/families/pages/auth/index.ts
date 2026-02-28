import type {RouteRecordRaw} from "vue-router";

export const routes = [
    {
        path: "/register",
        name: "register",
        component: () => import("./RegisterView.vue"),
        meta: {canSeeWhenLoggedIn: false},
    },
    {path: "/login", name: "login", component: () => import("./LoginView.vue"), meta: {canSeeWhenLoggedIn: false}},
] as const satisfies readonly RouteRecordRaw[];

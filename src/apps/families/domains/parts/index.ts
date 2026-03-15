import type {RouteRecordRaw} from "vue-router";

export const routes = [
    {
        path: "/parts",
        name: "parts",
        component: () => import("./pages/PartsPage.vue"),
        meta: {authOnly: true, title: "pageTitle.parts"},
    },
] as const satisfies readonly RouteRecordRaw[];

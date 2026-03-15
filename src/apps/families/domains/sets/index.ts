import type {RouteRecordRaw} from "vue-router";

export const routes = [
    {path: "/sets", name: "sets", component: () => import("./pages/SetsOverviewPage.vue"), meta: {authOnly: true}},
    {path: "/sets/add", name: "sets-add", component: () => import("./pages/AddSetPage.vue"), meta: {authOnly: true}},
    {
        path: "/sets/:id",
        name: "sets-detail",
        component: () => import("./pages/SetDetailPage.vue"),
        meta: {authOnly: true},
    },
    {
        path: "/sets/:id/edit",
        name: "sets-edit",
        component: () => import("./pages/EditSetPage.vue"),
        meta: {authOnly: true},
    },
    {path: "/sets/scan", name: "sets-scan", component: () => import("./pages/ScanSetPage.vue"), meta: {authOnly: true}},
] as const satisfies readonly RouteRecordRaw[];

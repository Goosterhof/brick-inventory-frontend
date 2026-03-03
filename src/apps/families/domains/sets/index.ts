import type {RouteRecordRaw} from "vue-router";

export const routes = [
    {path: "/sets", name: "sets", component: () => import("./pages/SetsOverviewView.vue"), meta: {authOnly: true}},
    {path: "/sets/add", name: "sets-add", component: () => import("./pages/AddSetView.vue"), meta: {authOnly: true}},
    {
        path: "/sets/:id",
        name: "sets-detail",
        component: () => import("./pages/SetDetailView.vue"),
        meta: {authOnly: true},
    },
    {
        path: "/sets/:id/edit",
        name: "sets-edit",
        component: () => import("./pages/EditSetView.vue"),
        meta: {authOnly: true},
    },
] as const satisfies readonly RouteRecordRaw[];

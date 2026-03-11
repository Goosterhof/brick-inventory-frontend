import type {RouteRecordRaw} from "vue-router";

export const routes = [
    {
        path: "/storage",
        name: "storage",
        component: () => import("./pages/StorageOverviewView.vue"),
        meta: {authOnly: true},
    },
    {
        path: "/storage/add",
        name: "storage-add",
        component: () => import("./pages/AddStorageView.vue"),
        meta: {authOnly: true},
    },
    {
        path: "/storage/:id",
        name: "storage-detail",
        component: () => import("./pages/StorageDetailView.vue"),
        meta: {authOnly: true},
    },
    {
        path: "/storage/:id/edit",
        name: "storage-edit",
        component: () => import("./pages/EditStorageView.vue"),
        meta: {authOnly: true},
    },
] as const satisfies readonly RouteRecordRaw[];

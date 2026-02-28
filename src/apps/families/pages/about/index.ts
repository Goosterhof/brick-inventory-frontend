import type {RouteRecordRaw} from "vue-router";

export const routes = [
    {path: "/about", name: "about", component: () => import("./AboutView.vue")},
] as const satisfies readonly RouteRecordRaw[];

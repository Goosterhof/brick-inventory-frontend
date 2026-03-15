import type {RouteRecordRaw} from "vue-router";

import HomePage from "./pages/HomePage.vue";

export const routes = [
    {path: "/", name: "home", component: HomePage, meta: {title: "pageTitle.home"}},
] as const satisfies readonly RouteRecordRaw[];

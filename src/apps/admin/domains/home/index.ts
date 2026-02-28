import type {RouteRecordRaw} from "vue-router";

import HomeView from "./pages/HomeView.vue";

export const routes = [{path: "/", name: "home", component: HomeView}] as const satisfies readonly RouteRecordRaw[];

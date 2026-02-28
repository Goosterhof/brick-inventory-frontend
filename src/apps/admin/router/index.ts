import {routes as homeRoutes} from "@app/pages/home";
import {createRouter, createWebHistory} from "vue-router";

const router = createRouter({history: createWebHistory(import.meta.env.BASE_URL), routes: [...homeRoutes]});

export {router};

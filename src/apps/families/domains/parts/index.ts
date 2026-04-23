import type {RouteRecordRaw} from 'vue-router';

export const routes = [
    {
        path: '/parts',
        name: 'parts',
        component: () => import('./pages/PartsPage.vue'),
        meta: {authOnly: true, title: 'pageTitle.parts'},
    },
    {
        path: '/parts/missing',
        name: 'parts-missing',
        component: () => import('./pages/PartsMissingPage.vue'),
        meta: {authOnly: true, title: 'pageTitle.partsMissing'},
    },
] as const satisfies readonly RouteRecordRaw[];

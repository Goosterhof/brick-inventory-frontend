import type {Ref} from "vue";
import type {LocationQueryRaw, RouteLocationNormalizedLoaded, RouteRecordRaw} from "vue-router";

import {computed, defineComponent, h} from "vue";

/* eslint-disable vue/one-component-per-file */
import type {RouteName, SpecificRouterLink, RouterService, RouterView} from "./types";

export const createRouterView = (currentRouteRef: Ref<RouteLocationNormalizedLoaded>): RouterView =>
    defineComponent<{depth?: number}>(
        ({depth = 0}) => {
            const component = computed(() => {
                const matched = currentRouteRef.value.matched[depth];
                const matchedComponentFromRoute = matched && matched.components?.default;
                if (!matched || !matchedComponentFromRoute) return null;

                return matchedComponentFromRoute;
            });

            return () => {
                // TODO :: use the proper 404 component
                if (!component.value) return h("p", ["404"]);

                const key = `${currentRouteRef.value.name?.toString() ?? ""}-${currentRouteRef.value.path}`;

                return h(component.value, {key});
            };
        },
        // https://vuejs.org/api/general.html#function-signature
        // manual runtime props declaration is currently still needed
        // eslint-disable-next-line vue/require-prop-types
        {props: ["depth"]},
    );

export const createRouterLink = <Routes extends RouteRecordRaw[]>(
    getUrlForRouteName: RouterService<Routes>["getUrlForRouteName"],
    goToRoute: RouterService<Routes>["goToRoute"],
): SpecificRouterLink<Routes> =>
    defineComponent<{to: {name: RouteName<Routes>; query?: LocationQueryRaw; id?: number}}>(
        (props, {slots}) =>
            () =>
                h(
                    "a",
                    {
                        href: getUrlForRouteName(props.to.name, props.to.id, props.to.query),
                        onClick: (event) => {
                            event.preventDefault();
                            void goToRoute(props.to.name, props.to.id, props.to.query);
                        },
                    },
                    slots.default?.(),
                ),
        // https://vuejs.org/api/general.html#function-signature
        // manual runtime props declaration is currently still needed
        // eslint-disable-next-line vue/require-prop-types
        {props: ["to"]},
    );

import type {RouteComponent} from "vue-router";

import type {CrudRoute, LazyRouteComponent, NestedParentCrudRoute, OptionalComponent, ParentCrudRoute} from "./types";

export const CREATE_PAGE_NAME = ".create";
export const EDIT_PAGE_NAME = ".edit";
export const OVERVIEW_PAGE_NAME = ".overview";
export const SHOW_PAGE_NAME = ".show";

export const createStandardRouteConfig = <T extends string, P extends string, C extends OptionalComponent>(
    path: P,
    name: T,
    component: C,
): C extends undefined ? undefined : CrudRoute<P, T, NonNullable<C>> => {
    if (!component) return <C extends undefined ? undefined : CrudRoute<P, T, NonNullable<C>>>undefined;

    return <C extends undefined ? undefined : CrudRoute<P, T, NonNullable<C>>>{
        path,
        name,
        component,
        meta: <const>{authOnly: true, canSeeWhenLoggedIn: true, isAdmin: false},
    };
};

export const createCrudRoutes = <
    N extends string,
    OverviewComponent extends OptionalComponent,
    CreateComponent extends OptionalComponent,
    EditComponent extends OptionalComponent,
    ShowComponent extends OptionalComponent,
>(
    basePath: string,
    baseRouteName: N,
    baseComponent: LazyRouteComponent | RouteComponent,
    components: {overview: OverviewComponent; create: CreateComponent; edit: EditComponent; show: ShowComponent},
): ParentCrudRoute<N, OverviewComponent, CreateComponent, EditComponent, ShowComponent> => {
    // @ts-expect-error FilterUndefined is a compile-time tuple filter, but .filter() produces a generic array — TypeScript can't prove runtime filtering matches the conditional tuple type
    const children: ParentCrudRoute<N, OverviewComponent, CreateComponent, EditComponent, ShowComponent>["children"] = [
        createStandardRouteConfig("", `${baseRouteName}${OVERVIEW_PAGE_NAME}`, components.overview),
        createStandardRouteConfig("create", `${baseRouteName}${CREATE_PAGE_NAME}`, components.create),
        createStandardRouteConfig(":id/edit", `${baseRouteName}${EDIT_PAGE_NAME}`, components.edit),
        createStandardRouteConfig(":id", `${baseRouteName}${SHOW_PAGE_NAME}`, components.show),
    ].filter((route) => route !== undefined);

    return {path: `/${basePath}`, component: baseComponent, children};
};

export const createNestedCrudRoutes = <
    N extends string,
    CreateComponent extends OptionalComponent,
    EditComponent extends OptionalComponent,
    ShowComponent extends OptionalComponent,
>(
    path: {parent: string; child: string},
    baseRouteName: N,
    baseComponent: RouteComponent,
    components: {create: CreateComponent; edit: EditComponent; show: ShowComponent},
): NestedParentCrudRoute<N, CreateComponent, EditComponent, ShowComponent> => {
    // @ts-expect-error FilterUndefined is a compile-time tuple filter, but .filter() produces a generic array — TypeScript can't prove runtime filtering matches the conditional tuple type
    const children: NestedParentCrudRoute<N, CreateComponent, EditComponent, ShowComponent>["children"] = [
        createStandardRouteConfig("create", `${baseRouteName}${CREATE_PAGE_NAME}`, components.create),
        createStandardRouteConfig(":id/edit", `${baseRouteName}${EDIT_PAGE_NAME}`, components.edit),
        createStandardRouteConfig(":id", `${baseRouteName}${SHOW_PAGE_NAME}`, components.show),
    ].filter((route) => route !== undefined);

    return {path: `/${path.parent}/:parentId/${path.child}`, component: baseComponent, children};
};

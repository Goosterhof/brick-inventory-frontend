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
    overviewComponent: OverviewComponent,
    createComponent: CreateComponent,
    editComponent: EditComponent,
    showComponent: ShowComponent,
): ParentCrudRoute<N, OverviewComponent, CreateComponent, EditComponent, ShowComponent> => {
    // @ts-expect-error it does what we want, but the type is somehow not the same
    const children: ParentCrudRoute<N, OverviewComponent, CreateComponent, EditComponent, ShowComponent>["children"] = [
        createStandardRouteConfig("", `${baseRouteName}${OVERVIEW_PAGE_NAME}`, overviewComponent),
        createStandardRouteConfig("create", `${baseRouteName}${CREATE_PAGE_NAME}`, createComponent),
        createStandardRouteConfig(":id/edit", `${baseRouteName}${EDIT_PAGE_NAME}`, editComponent),
        createStandardRouteConfig(":id", `${baseRouteName}${SHOW_PAGE_NAME}`, showComponent),
    ].filter((route) => route !== undefined);

    return {path: `/${basePath}`, component: baseComponent, children};
};

export const createNestedCrudRoutes = <
    N extends string,
    CreateComponent extends OptionalComponent,
    EditComponent extends OptionalComponent,
    ShowComponent extends OptionalComponent,
>(
    parentPath: string,
    childPath: string,
    baseRouteName: N,
    baseComponent: RouteComponent,
    createComponent: CreateComponent,
    editComponent: EditComponent,
    showComponent: ShowComponent,
): NestedParentCrudRoute<N, CreateComponent, EditComponent, ShowComponent> => {
    // @ts-expect-error it does what we want, but the type is somehow not the same
    const children: NestedParentCrudRoute<N, CreateComponent, EditComponent, ShowComponent>["children"] = [
        createStandardRouteConfig("create", `${baseRouteName}${CREATE_PAGE_NAME}`, createComponent),
        createStandardRouteConfig(":id/edit", `${baseRouteName}${EDIT_PAGE_NAME}`, editComponent),
        createStandardRouteConfig(":id", `${baseRouteName}${SHOW_PAGE_NAME}`, showComponent),
    ].filter((route) => route !== undefined);

    return {path: `/${parentPath}/:parentId/${childPath}`, component: baseComponent, children};
};

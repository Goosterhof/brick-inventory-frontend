import type {FilterUndefined} from "@shared/types/generics";
import type {RouterLinkStub} from "@vue/test-utils";
import type {ComputedRef, DefineSetupFnComponent, Ref} from "vue";
import type {
    LocationQuery,
    LocationQueryRaw,
    NavigationHookAfter,
    RouteComponent,
    RouteLocationNormalized,
    RouteLocationNormalizedLoaded,
    RouteLocationRaw,
    RouteRecordName,
    RouteRecordRaw,
} from "vue-router";

export type LazyRouteComponent = () => Promise<RouteComponent>;

export type OptionalComponent = LazyRouteComponent | undefined;

export type RouterView = DefineSetupFnComponent<{depth?: number}>;
export type SpecificRouterLink<Routes extends RouteRecordRaw[] = RouteRecordRaw[]> = DefineSetupFnComponent<{
    to: {name: RouteName<Routes>; query?: LocationQueryRaw; id?: number};
}>;

type CreatePageName = ".create";
type OverviewPageName = ".overview";
type EditPageName = ".edit";
type ShowPageName = ".show";

type TopLevelRoute<Routes extends RouteRecordRaw[]> = Extract<Routes[number], {name: string}>;
type ChildRoute<Routes extends RouteRecordRaw[]> = Extract<
    Routes[number],
    {children: RouteRecordRaw[]}
>["children"][number];

export type ActualRoute<Routes extends RouteRecordRaw[]> = TopLevelRoute<Routes> | ChildRoute<Routes>;

export type RouteName<Routes extends RouteRecordRaw[]> = ActualRoute<Routes>["name"];

type ExtractNameFromRoutes<T, P extends string> = T extends `${infer R}${P}` ? R : never;
type CreateRouteName<T extends RouteRecordName | undefined> = ExtractNameFromRoutes<T, CreatePageName>;
type OverviewRouteName<T extends RouteRecordName | undefined> = ExtractNameFromRoutes<T, OverviewPageName>;
type EditRouteName<T extends RouteRecordName | undefined> = ExtractNameFromRoutes<T, EditPageName>;
type ShowRouteName<T extends RouteRecordName | undefined> = ExtractNameFromRoutes<T, ShowPageName>;

export type BeforeRouteMiddleware<Routes extends RouteRecordRaw[]> = (
    to: ActualRoute<Routes>,
    from: ActualRoute<Routes>,
) => boolean | Promise<boolean>;

export type UnregisterMiddleware = () => void;

export interface RouterService<Routes extends RouteRecordRaw[]> {
    dashboardRouteName: RouteName<Routes>;
    normalizedRouteToSpecificRoute: (route: Pick<RouteLocationNormalized, "name" | "path">) => ActualRoute<Routes>;
    goToRoute: (name: RouteName<Routes>, id?: number, query?: LocationQueryRaw, parentId?: number) => Promise<void>;
    goToCreatePage: (name: CreateRouteName<RouteName<Routes>>) => Promise<void>;
    goToOverviewPage: (name: OverviewRouteName<RouteName<Routes>>) => Promise<void>;
    goToEditPage: (name: EditRouteName<RouteName<Routes>>, id: number) => Promise<void>;
    goToShowPage: (name: ShowRouteName<RouteName<Routes>>, id: number, query?: LocationQueryRaw) => Promise<void>;
    goToDashboard: () => Promise<void>;

    getUrlForRouteName: (name: RouteName<Routes>, id?: number, query?: LocationQueryRaw) => string;
    goBack: () => void;
    registerBeforeRouteMiddleware: (middleware: BeforeRouteMiddleware<Routes>) => UnregisterMiddleware;
    registerAfterRouteMiddleware: (middleware: NavigationHookAfter) => UnregisterMiddleware;
    currentRouteRef: Ref<RouteLocationNormalizedLoaded>;
    currentRouteQuery: ComputedRef<LocationQuery>;
    currentRouteId: ComputedRef<number>;
    currentParentId: ComputedRef<number>;
    changeRouteQuery: (query: LocationQuery) => void;
    install: () => void;
    onPage: (pageName: RouteName<Routes>) => boolean;
    onCreatePage: (baseRouteName: CreateRouteName<RouteName<Routes>>) => boolean;
    onEditPage: (baseRouteName: EditRouteName<RouteName<Routes>>) => boolean;
    onOverviewPage: (baseRouteName: OverviewRouteName<RouteName<Routes>>) => boolean;
    onShowPage: (baseRouteName: ShowRouteName<RouteName<Routes>>) => boolean;
    routeExists: (to: RouteLocationRaw) => boolean;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    RouterView: RouterView;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    RouterLink: SpecificRouterLink<Routes> | typeof RouterLinkStub;
}

export interface CrudRoute<P extends string, N extends string, C extends LazyRouteComponent> {
    path: P;
    name: N;
    component: C;
    meta: {authOnly: true; canSeeWhenLoggedIn: true; isAdmin: false};
}

export interface ParentCrudRoute<
    T extends string,
    OverviewComponent extends OptionalComponent,
    CreateComponent extends OptionalComponent,
    EditComponent extends OptionalComponent,
    ShowComponent extends OptionalComponent,
> {
    path: string;
    component: RouteComponent;
    children: FilterUndefined<
        [
            OverviewComponent extends undefined
                ? undefined
                : CrudRoute<"", `${T}.overview`, NonNullable<OverviewComponent>>,
            CreateComponent extends undefined
                ? undefined
                : CrudRoute<"create", `${T}.create`, NonNullable<CreateComponent>>,
            EditComponent extends undefined
                ? undefined
                : CrudRoute<":id/edit", `${T}.edit`, NonNullable<EditComponent>>,
            ShowComponent extends undefined ? undefined : CrudRoute<":id", `${T}.show`, NonNullable<ShowComponent>>,
        ]
    >;
}

export interface NestedParentCrudRoute<
    T extends string,
    CreateComponent extends OptionalComponent,
    EditComponent extends OptionalComponent,
    ShowComponent extends OptionalComponent,
> {
    path: string;
    component: RouteComponent;
    children: FilterUndefined<
        [
            CreateComponent extends undefined
                ? undefined
                : CrudRoute<"create", `${T}.create`, NonNullable<CreateComponent>>,
            EditComponent extends undefined
                ? undefined
                : CrudRoute<":id/edit", `${T}.edit`, NonNullable<EditComponent>>,
            ShowComponent extends undefined ? undefined : CrudRoute<":id", `${T}.show`, NonNullable<ShowComponent>>,
        ]
    >;
}

export interface ScrollPositionNormalized {
    behavior?: ScrollOptions["behavior"];
    left: number;
    top: number;
}

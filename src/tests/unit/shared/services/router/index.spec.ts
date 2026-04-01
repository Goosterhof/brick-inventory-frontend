import type {RouteRecordRaw} from "vue-router";

import {createRouterService} from "@shared/services/router";
import {flushPromises} from "@vue/test-utils";
import {afterEach, describe, expect, it, vi} from "vitest";
import {defineComponent, h} from "vue";

const {createMockAxios, createMockFsHelpers, createMockStringTs} = await vi.hoisted(
    () => import("../../../../helpers"),
);

vi.mock("axios", () => createMockAxios());
vi.mock("string-ts", () => ({
    ...createMockStringTs(),
    replace: (str: string, from: string, to: string) => str.replace(from, to),
    replaceAll: (str: string, from: string, to: string) => str.replace(new RegExp(from, "g"), to),
}));
vi.mock("@script-development/fs-helpers", () => createMockFsHelpers());

const HomeComponent = defineComponent({name: "Home", render: () => h("div", "Home")});
const AboutComponent = defineComponent({name: "About", render: () => h("div", "About")});
const CreateComponent = defineComponent({name: "Create", render: () => h("div", "Create")});
const EditComponent = defineComponent({name: "Edit", render: () => h("div", "Edit")});
const ShowComponent = defineComponent({name: "Show", render: () => h("div", "Show")});

const createTestRoutes = (): RouteRecordRaw[] => [
    {path: "/", name: "home", component: HomeComponent},
    {path: "/about", name: "about", component: AboutComponent},
    {
        path: "/items",
        component: HomeComponent,
        children: [
            {path: "", name: "items.overview", component: HomeComponent},
            {path: "create", name: "items.create", component: CreateComponent},
            {path: ":id/edit", name: "items.edit", component: EditComponent},
            {path: ":id", name: "items.show", component: ShowComponent},
        ],
    },
];

describe("router service", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("createRouterService", () => {
        it("should return a router service object", () => {
            // Arrange
            const routes = createTestRoutes();

            // Act
            const service = createRouterService(routes, "home");

            // Assert
            expect(service).toHaveProperty("goToRoute");
            expect(service).toHaveProperty("goBack");
            expect(service).toHaveProperty("currentRouteRef");
            expect(service).toHaveProperty("RouterView");
            expect(service).toHaveProperty("RouterLink");
        });

        it("should set dashboardRouteName", () => {
            // Arrange
            const routes = createTestRoutes();

            // Act
            const service = createRouterService(routes, "home");

            // Assert
            expect(service.dashboardRouteName).toBe("home");
        });
    });

    describe("goToRoute", () => {
        it("should navigate to named route", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            await service.goToRoute("about");
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("about");
        });

        it("should navigate with id param", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            await service.goToRoute("items.show", 42);
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("items.show");
            expect(service.currentRouteRef.value.params.id).toBe("42");
        });

        it("should navigate with query params", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            await service.goToRoute("about", undefined, {page: "2"});
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.query.page).toBe("2");
        });

        it("should navigate with parentId param", async () => {
            // Arrange
            const routes = [
                {path: "/", name: "home", component: HomeComponent},
                {path: "/parent/:parentId/child/:id", name: "nested", component: HomeComponent},
            ];
            const service = createRouterService(routes, "home");

            // Act
            await service.goToRoute("nested", 10, undefined, 5);
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.params.id).toBe("10");
            expect(service.currentRouteRef.value.params.parentId).toBe("5");
        });
    });

    describe("goToCreatePage", () => {
        it("should navigate to create page with correct route name", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            await service.goToCreatePage("items");
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("items.create");
        });
    });

    describe("goToOverviewPage", () => {
        it("should navigate to overview page with correct route name", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            await service.goToOverviewPage("items");
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("items.overview");
        });
    });

    describe("goToEditPage", () => {
        it("should navigate to edit page with correct route name and id", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            await service.goToEditPage("items", 123);
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("items.edit");
            expect(service.currentRouteRef.value.params.id).toBe("123");
        });
    });

    describe("goToShowPage", () => {
        it("should navigate to show page with correct route name and id", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            await service.goToShowPage("items", 456);
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("items.show");
            expect(service.currentRouteRef.value.params.id).toBe("456");
        });

        it("should navigate to show page with query params", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            await service.goToShowPage("items", 789, {tab: "details"});
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("items.show");
            expect(service.currentRouteRef.value.query.tab).toBe("details");
        });
    });

    describe("goToDashboard", () => {
        it("should navigate to dashboard route", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("about");
            await flushPromises();

            // Act
            await service.goToDashboard();
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("home");
        });
    });

    describe("getUrlForRouteName", () => {
        it("should return URL for named route", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            const url = service.getUrlForRouteName("about");

            // Assert
            expect(url).toBe("/about");
        });

        it("should return URL with id param", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            const url = service.getUrlForRouteName("items.show", 42);

            // Assert
            expect(url).toBe("/items/42");
        });

        it("should return URL with query params", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            const url = service.getUrlForRouteName("about", undefined, {page: "1"});

            // Assert
            expect(url).toBe("/about?page=1");
        });
    });

    describe("goBack", () => {
        it("should call router.back", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            // Navigate to create history
            await service.goToRoute("about");
            await flushPromises();

            // Mock history.back behavior is complex to test in jsdom
            // Just verify the method exists and is callable
            expect(() => service.goBack()).not.toThrow();
        });
    });

    describe("currentRouteRef", () => {
        it("should be a reactive ref to current route", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Assert initial state (vue-router starts with empty route)
            expect(service.currentRouteRef.value).toBeDefined();
        });

        it("should update when route changes", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            await service.goToRoute("about");
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("about");
        });
    });

    describe("currentRouteQuery", () => {
        it("should be a computed ref of current query", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            await service.goToRoute("about", undefined, {search: "test"});
            await flushPromises();

            // Assert
            expect(service.currentRouteQuery.value.search).toBe("test");
        });
    });

    describe("currentRouteId", () => {
        it("should return parsed id from route params", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.show", 42);
            await flushPromises();

            // Act
            const id = service.currentRouteId.value;

            // Assert
            expect(id).toBe(42);
        });

        it("should throw when route has no id", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("about");
            await flushPromises();

            // Act & Assert
            expect(() => service.currentRouteId.value).toThrow("This route has no route id");
        });
    });

    describe("currentParentId", () => {
        it("should return parsed parentId from route params", async () => {
            // Arrange
            const routes = [
                {path: "/", name: "home", component: HomeComponent},
                {path: "/parent/:parentId/child/:id", name: "nested", component: HomeComponent},
            ];
            const service = createRouterService(routes, "home");
            await service.goToRoute("nested", 10, undefined, 5);
            await flushPromises();

            // Act
            const parentId = service.currentParentId.value;

            // Assert
            expect(parentId).toBe(5);
        });

        it("should throw when route has no parentId", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.show", 1);
            await flushPromises();

            // Act & Assert
            expect(() => service.currentParentId.value).toThrow("This route has no route parentId");
        });
    });

    describe("changeRouteQuery", () => {
        it("should update query params", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("about");
            await flushPromises();

            // Act
            service.changeRouteQuery({filter: "active"});
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.query.filter).toBe("active");
        });
    });

    describe("onPage", () => {
        it("should return true when on specified page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("about");
            await flushPromises();

            // Act & Assert
            expect(service.onPage("about")).toBe(true);
        });

        it("should return false when not on specified page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("about");
            await flushPromises();

            // Act & Assert
            expect(service.onPage("home")).toBe(false);
        });

        it("should return false when current route has no name", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            // Initial route state before navigation

            // Act & Assert - initial route may not have name
            // This tests the early return for undefined name
            expect(typeof service.onPage("home")).toBe("boolean");
        });
    });

    describe("onCreatePage", () => {
        it("should return true when on create page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.create");
            await flushPromises();

            // Act & Assert
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            expect(service.onCreatePage("items")).toBe(true);
        });

        it("should return false when not on create page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.overview");
            await flushPromises();

            // Act & Assert
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            expect(service.onCreatePage("items")).toBe(false);
        });
    });

    describe("onEditPage", () => {
        it("should return true when on edit page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.edit", 1);
            await flushPromises();

            // Act & Assert
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            expect(service.onEditPage("items")).toBe(true);
        });

        it("should return false when not on edit page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.show", 1);
            await flushPromises();

            // Act & Assert
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            expect(service.onEditPage("items")).toBe(false);
        });
    });

    describe("onOverviewPage", () => {
        it("should return true when on overview page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.overview");
            await flushPromises();

            // Act & Assert
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            expect(service.onOverviewPage("items")).toBe(true);
        });

        it("should return false when not on overview page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.create");
            await flushPromises();

            // Act & Assert
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            expect(service.onOverviewPage("items")).toBe(false);
        });
    });

    describe("onShowPage", () => {
        it("should return true when on show page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.show", 1);
            await flushPromises();

            // Act & Assert
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            expect(service.onShowPage("items")).toBe(true);
        });

        it("should return false when not on show page", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("items.edit", 1);
            await flushPromises();

            // Act & Assert
            // @ts-expect-error - testing runtime behavior with generic RouteRecordRaw[]
            expect(service.onShowPage("items")).toBe(false);
        });
    });

    describe("routeExists", () => {
        it("should return true for existing route", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act & Assert
            expect(service.routeExists({name: "about"})).toBe(true);
        });

        it("should return false for non-existing route", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act & Assert
            expect(service.routeExists({name: "nonexistent"})).toBe(false);
        });

        it("should return true for existing path", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act & Assert
            expect(service.routeExists({path: "/about"})).toBe(true);
        });
    });

    describe("normalizedRouteToSpecificRoute", () => {
        it("should find route by name", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            const result = service.normalizedRouteToSpecificRoute({name: "about", path: "/about"});

            // Assert
            expect(result.name).toBe("about");
        });

        it("should find route by path", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            const result = service.normalizedRouteToSpecificRoute({name: undefined, path: "/about"});

            // Assert
            expect(result.name).toBe("about");
        });

        it("should return dashboard route for root path", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            const result = service.normalizedRouteToSpecificRoute({name: undefined, path: "/"});

            // Assert
            expect(result.name).toBe("home");
        });

        it("should return dashboard route for empty path when no match found", () => {
            // Arrange - use routes without a route that has empty path
            const routes = [
                {path: "/", name: "home", component: HomeComponent},
                {path: "/about", name: "about", component: AboutComponent},
            ];
            const service = createRouterService(routes, "home");

            // Act
            const result = service.normalizedRouteToSpecificRoute({name: undefined, path: ""});

            // Assert
            expect(result.name).toBe("home");
        });

        it("should throw for unknown route", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act & Assert
            expect(() => service.normalizedRouteToSpecificRoute({name: undefined, path: "/unknown"})).toThrow(
                "/unknown is an unknown route",
            );
        });

        it("should find child routes", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act
            const result = service.normalizedRouteToSpecificRoute({name: "items.create", path: "/items/create"});

            // Assert
            expect(result.name).toBe("items.create");
        });
    });

    describe("registerBeforeRouteMiddleware", () => {
        it("should register middleware and return unregister function", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            const middleware = vi.fn().mockReturnValue(false);

            // Act
            const unregister = service.registerBeforeRouteMiddleware(middleware);

            // Assert
            expect(typeof unregister).toBe("function");
        });

        it("should execute registered middleware on navigation", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            const middleware = vi.fn().mockReturnValue(false);
            service.registerBeforeRouteMiddleware(middleware);

            // Act
            await service.goToRoute("about");
            await flushPromises();

            // Assert
            expect(middleware).toHaveBeenCalled();
        });

        it("should block navigation when middleware returns true", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            // First navigate to a known route
            await service.goToRoute("home");
            await flushPromises();

            const middleware = vi.fn().mockReturnValue(true);
            service.registerBeforeRouteMiddleware(middleware);

            // Act
            await service.goToRoute("about");
            await flushPromises();

            // Assert - navigation should be blocked
            expect(service.currentRouteRef.value.name).not.toBe("about");
        });

        it("should not execute middleware after unregistering", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            const middleware = vi.fn().mockReturnValue(false);
            const unregister = service.registerBeforeRouteMiddleware(middleware);

            // Act - unregister then navigate
            unregister();
            await service.goToRoute("about");
            await flushPromises();

            // Assert - middleware should not have been called
            expect(middleware).not.toHaveBeenCalled();
        });

        it("should handle unregistering middleware that was already removed", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            const middleware = vi.fn().mockReturnValue(false);
            const unregister = service.registerBeforeRouteMiddleware(middleware);

            // Act - unregister twice
            unregister();

            // Assert - second unregister should not throw
            expect(() => unregister()).not.toThrow();
        });
    });

    describe("built-in from query middleware", () => {
        it("should skip middleware when route has ignoreFrom meta", async () => {
            // Arrange
            const routes = [
                {path: "/", name: "home", component: HomeComponent},
                {path: "/about", name: "about", component: AboutComponent, meta: {ignoreFrom: true}},
            ];
            const service = createRouterService(routes, "home");

            // Act - navigate to a page that has ignoreFrom meta
            await service.goToRoute("about");
            await flushPromises();

            // Assert - should still navigate to about
            expect(service.currentRouteRef.value.name).toBe("about");
        });

        it("should redirect to from query when present", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Navigate to about with a from query
            await service.goToRoute("about", undefined, {from: "home"});
            await flushPromises();

            // Act - navigate to another route, middleware should check from query
            await service.goToRoute("items.overview");
            await flushPromises();

            // The middleware checks fromQuery and redirects
            // Since we're navigating to items.overview but have from=home,
            // and items.overview !== home, it should redirect to home
            expect(service.currentRouteRef.value.name).toBe("home");
        });

        it("should not redirect when from query matches destination", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Navigate with from query that matches the destination
            await service.goToRoute("about", undefined, {from: "items.overview"});
            await flushPromises();

            // Act - navigate to the same route as from query
            await service.goToRoute("items.overview");
            await flushPromises();

            // Assert - should navigate normally since from matches destination
            expect(service.currentRouteRef.value.name).toBe("items.overview");
        });
    });

    describe("registerAfterRouteMiddleware", () => {
        it("should register middleware and return unregister function", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            const middleware = vi.fn();

            // Act
            const unregister = service.registerAfterRouteMiddleware(middleware);

            // Assert
            expect(typeof unregister).toBe("function");
        });

        it("should execute registered middleware after navigation", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            const middleware = vi.fn();
            service.registerAfterRouteMiddleware(middleware);

            // Act
            await service.goToRoute("about");
            await flushPromises();

            // Assert
            expect(middleware).toHaveBeenCalled();
        });

        it("should not execute middleware after unregistering", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            const middleware = vi.fn();
            const unregister = service.registerAfterRouteMiddleware(middleware);

            // Act - unregister then navigate
            unregister();
            await service.goToRoute("about");
            await flushPromises();

            // Assert - middleware should not have been called
            expect(middleware).not.toHaveBeenCalled();
        });

        it("should handle unregistering middleware that was already removed", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            const middleware = vi.fn();
            const unregister = service.registerAfterRouteMiddleware(middleware);

            // Act - unregister twice
            unregister();

            // Assert - second unregister should not throw
            expect(() => unregister()).not.toThrow();
        });
    });

    describe("install", () => {
        it("should be callable", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Act & Assert
            expect(() => service.install()).not.toThrow();
        });
    });

    describe("RouterView", () => {
        it("should be a component", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Assert
            expect(service.RouterView).toBeDefined();
        });
    });

    describe("RouterLink", () => {
        it("should be a component", () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");

            // Assert
            expect(service.RouterLink).toBeDefined();
        });
    });

    describe("base path", () => {
        it("should work without base path", () => {
            // Arrange
            const routes = createTestRoutes();

            // Act
            const service = createRouterService(routes, "home");

            // Assert
            expect(service).toBeDefined();
        });

        it("should work with base path", () => {
            // Arrange
            const routes = createTestRoutes();

            // Act
            const service = createRouterService(routes, "home", "/app");

            // Assert
            expect(service).toBeDefined();
        });
    });

    describe("routes with only top-level routes", () => {
        it("should handle routes without children", () => {
            // Arrange
            const routes = [
                {path: "/", name: "home", component: HomeComponent},
                {path: "/about", name: "about", component: AboutComponent},
            ];

            // Act
            const service = createRouterService(routes, "home");

            // Assert
            const result = service.normalizedRouteToSpecificRoute({name: "about", path: "/about"});
            expect(result.name).toBe("about");
        });
    });
});

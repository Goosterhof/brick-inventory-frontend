import type {RouteComponent} from "vue-router";

import {
    CREATE_PAGE_NAME,
    createCrudRoutes,
    createNestedCrudRoutes,
    createStandardRouteConfig,
    EDIT_PAGE_NAME,
    OVERVIEW_PAGE_NAME,
    SHOW_PAGE_NAME,
} from "@shared/services/router/routes";
import {describe, expect, it} from "vitest";
import {defineComponent} from "vue";

const MockComponent = defineComponent({template: "<div>Mock</div>"});
const lazyComponent = () => Promise.resolve(MockComponent);

describe("router routes", () => {
    describe("constants", () => {
        it("should export CREATE_PAGE_NAME as .create", () => {
            expect(CREATE_PAGE_NAME).toBe(".create");
        });

        it("should export EDIT_PAGE_NAME as .edit", () => {
            expect(EDIT_PAGE_NAME).toBe(".edit");
        });

        it("should export OVERVIEW_PAGE_NAME as .overview", () => {
            expect(OVERVIEW_PAGE_NAME).toBe(".overview");
        });

        it("should export SHOW_PAGE_NAME as .show", () => {
            expect(SHOW_PAGE_NAME).toBe(".show");
        });
    });

    describe("createStandardRouteConfig", () => {
        it("should return undefined when component is undefined", () => {
            // Act
            const result = createStandardRouteConfig("test", "test-route", undefined);

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return a route config when component is provided", () => {
            // Act
            const result = createStandardRouteConfig("test-path", "test-route", lazyComponent);

            // Assert
            expect(result).toEqual({
                path: "test-path",
                name: "test-route",
                component: lazyComponent,
                meta: {authOnly: true, canSeeWhenLoggedIn: true, isAdmin: false},
            });
        });

        it("should preserve empty string path", () => {
            // Act
            const result = createStandardRouteConfig("", "overview-route", lazyComponent);

            // Assert
            expect(result.path).toBe("");
        });

        it("should handle path with params", () => {
            // Act
            const result = createStandardRouteConfig(":id/edit", "edit-route", lazyComponent);

            // Assert
            expect(result.path).toBe(":id/edit");
        });
    });

    describe("createCrudRoutes", () => {
        it("should create a parent route with correct path", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            expect(result.path).toBe("/items");
        });

        it("should set the base component", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            expect(result.component).toBe(MockComponent);
        });

        it("should create all four child routes when all components provided", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            expect(result.children).toHaveLength(4);
        });

        it("should create overview route with correct name and empty path", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            const overviewRoute = result.children.find((r) => r.name === "items.overview");
            expect(overviewRoute).toBeDefined();
            expect(overviewRoute?.path).toBe("");
        });

        it("should create create route with correct name and path", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            const createRoute = result.children.find((r) => r.name === "items.create");
            expect(createRoute).toBeDefined();
            expect(createRoute?.path).toBe("create");
        });

        it("should create edit route with correct name and path", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            const editRoute = result.children.find((r) => r.name === "items.edit");
            expect(editRoute).toBeDefined();
            expect(editRoute?.path).toBe(":id/edit");
        });

        it("should create show route with correct name and path", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            const showRoute = result.children.find((r) => r.name === "items.show");
            expect(showRoute).toBeDefined();
            expect(showRoute?.path).toBe(":id");
        });

        it("should exclude overview route when overview component is undefined", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: undefined,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            expect(result.children).toHaveLength(3);
            // @ts-expect-error - testing that excluded route is not in children
            expect(result.children.find((r) => r.name === "items.overview")).toBeUndefined();
        });

        it("should exclude create route when create component is undefined", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: undefined,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            expect(result.children).toHaveLength(3);
            // @ts-expect-error - testing that excluded route is not in children
            expect(result.children.find((r) => r.name === "items.create")).toBeUndefined();
        });

        it("should exclude edit route when edit component is undefined", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: undefined,
                show: lazyComponent,
            });

            // Assert
            expect(result.children).toHaveLength(3);
            // @ts-expect-error - testing that excluded route is not in children
            expect(result.children.find((r) => r.name === "items.edit")).toBeUndefined();
        });

        it("should exclude show route when show component is undefined", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: undefined,
            });

            // Assert
            expect(result.children).toHaveLength(3);
            // @ts-expect-error - testing that excluded route is not in children
            expect(result.children.find((r) => r.name === "items.show")).toBeUndefined();
        });

        it("should handle all undefined components", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: undefined,
                create: undefined,
                edit: undefined,
                show: undefined,
            });

            // Assert
            expect(result.children).toHaveLength(0);
        });

        it("should use different basePath and baseRouteName", () => {
            // Act
            const result = createCrudRoutes("family-sets", "familySets", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            expect(result.path).toBe("/family-sets");
            expect(result.children.find((r) => r.name === "familySets.overview")).toBeDefined();
            expect(result.children.find((r) => r.name === "familySets.create")).toBeDefined();
        });

        it("should set meta properties on all child routes", () => {
            // Act
            const result = createCrudRoutes("items", "items", MockComponent as RouteComponent, {
                overview: lazyComponent,
                create: lazyComponent,
                edit: lazyComponent,
                show: lazyComponent,
            });

            // Assert
            for (const child of result.children) {
                expect(child.meta).toEqual({authOnly: true, canSeeWhenLoggedIn: true, isAdmin: false});
            }
        });
    });

    describe("createNestedCrudRoutes", () => {
        it("should create a parent route with nested path including parentId param", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: lazyComponent, show: lazyComponent},
            );

            // Assert
            expect(result.path).toBe("/categories/:parentId/items");
        });

        it("should set the base component", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: lazyComponent, show: lazyComponent},
            );

            // Assert
            expect(result.component).toBe(MockComponent);
        });

        it("should create three child routes when all components provided", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: lazyComponent, show: lazyComponent},
            );

            // Assert
            expect(result.children).toHaveLength(3);
        });

        it("should not include overview route in nested routes", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: lazyComponent, show: lazyComponent},
            );

            // Assert
            const overviewRoute = result.children.find((r) => r.name.toString().includes(".overview"));
            expect(overviewRoute).toBeUndefined();
        });

        it("should create create route with correct name and path", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: lazyComponent, show: lazyComponent},
            );

            // Assert
            const createRoute = result.children.find((r) => r.name === "category-items.create");
            expect(createRoute).toBeDefined();
            expect(createRoute?.path).toBe("create");
        });

        it("should create edit route with correct name and path", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: lazyComponent, show: lazyComponent},
            );

            // Assert
            const editRoute = result.children.find((r) => r.name === "category-items.edit");
            expect(editRoute).toBeDefined();
            expect(editRoute?.path).toBe(":id/edit");
        });

        it("should create show route with correct name and path", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: lazyComponent, show: lazyComponent},
            );

            // Assert
            const showRoute = result.children.find((r) => r.name === "category-items.show");
            expect(showRoute).toBeDefined();
            expect(showRoute?.path).toBe(":id");
        });

        it("should exclude create route when create component is undefined", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: undefined, edit: lazyComponent, show: lazyComponent},
            );

            // Assert
            expect(result.children).toHaveLength(2);
            // @ts-expect-error - testing that excluded route is not in children
            expect(result.children.find((r) => r.name === "category-items.create")).toBeUndefined();
        });

        it("should exclude edit route when edit component is undefined", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: undefined, show: lazyComponent},
            );

            // Assert
            expect(result.children).toHaveLength(2);
            // @ts-expect-error - testing that excluded route is not in children
            expect(result.children.find((r) => r.name === "category-items.edit")).toBeUndefined();
        });

        it("should exclude show route when show component is undefined", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: lazyComponent, show: undefined},
            );

            // Assert
            expect(result.children).toHaveLength(2);
            // @ts-expect-error - testing that excluded route is not in children
            expect(result.children.find((r) => r.name === "category-items.show")).toBeUndefined();
        });

        it("should handle all undefined components", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: undefined, edit: undefined, show: undefined},
            );

            // Assert
            expect(result.children).toHaveLength(0);
        });

        it("should set meta properties on all child routes", () => {
            // Act
            const result = createNestedCrudRoutes(
                {parent: "categories", child: "items"},
                "category-items",
                MockComponent as RouteComponent,
                {create: lazyComponent, edit: lazyComponent, show: lazyComponent},
            );

            // Assert
            for (const child of result.children) {
                expect(child.meta).toEqual({authOnly: true, canSeeWhenLoggedIn: true, isAdmin: false});
            }
        });
    });
});

import type {RouteRecordRaw} from "vue-router";

import {createRouterService} from "@shared/services/router";
import {flushPromises} from "@vue/test-utils";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {defineComponent, h} from "vue";

const HomeComponent = defineComponent({name: "Home", render: () => h("div", "Home")});
const AboutComponent = defineComponent({name: "About", render: () => h("div", "About")});
const IgnoreFromComponent = defineComponent({name: "IgnoreFrom", render: () => h("div", "IgnoreFrom")});

const createTestRoutes = (): RouteRecordRaw[] => [
    {path: "/", name: "home", component: HomeComponent},
    {path: "/about", name: "about", component: AboutComponent},
    {path: "/ignore-from", name: "ignore-from", component: IgnoreFromComponent, meta: {ignoreFrom: true}},
];

describe("BIO router wrapper", () => {
    beforeEach(() => {
        Object.defineProperty(window, "location", {value: {pathname: "/", search: ""}, writable: true});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("dashboardRouteName", () => {
        it("should expose the dashboard route name", () => {
            // Arrange
            const routes = createTestRoutes();

            // Act
            const service = createRouterService(routes, "home");

            // Assert
            expect(service.dashboardRouteName).toBe("home");
        });
    });

    describe("goToDashboard", () => {
        it("should navigate to the dashboard route", async () => {
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

    describe("from query middleware", () => {
        it("should redirect to the route specified in the from query param", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("home", undefined, {from: "about"});
            await flushPromises();

            // Act
            await service.goToRoute("home");
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("about");
        });

        it("should skip redirect when ignoreFrom meta is set", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("home", undefined, {from: "about"});
            await flushPromises();

            // Act
            await service.goToRoute("ignore-from");
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("ignore-from");
        });

        it("should skip redirect when from query matches destination", async () => {
            // Arrange
            const routes = createTestRoutes();
            const service = createRouterService(routes, "home");
            await service.goToRoute("home", undefined, {from: "about"});
            await flushPromises();

            // Act
            await service.goToRoute("about");
            await flushPromises();

            // Assert
            expect(service.currentRouteRef.value.name).toBe("about");
        });
    });
});

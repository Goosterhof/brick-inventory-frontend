import type {RouterService} from "@shared/services/router/types";
import type {Mock} from "vitest";
import type {RouteLocationNormalizedLoaded, RouteRecordNormalized} from "vue-router";

import {createRouterLink, createRouterView} from "@shared/services/router/components";
import {shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {defineComponent, h, ref} from "vue";

const MockComponent = defineComponent({
    name: "MockComponent",
    render: () => h("div", {class: "mock-component"}, "Mock Content"),
});

const createMockRouteRef = (overrides: Partial<RouteLocationNormalizedLoaded> = {}) =>
    ref<RouteLocationNormalizedLoaded>({
        name: "test-route",
        path: "/test",
        fullPath: "/test",
        hash: "",
        query: {},
        params: {},
        matched: [],
        meta: {},
        redirectedFrom: undefined,
        ...overrides,
    });

describe("router components", () => {
    describe("createRouterView", () => {
        it("should return a Vue component", () => {
            // Arrange
            const routeRef = createMockRouteRef();

            // Act
            const RouterView = createRouterView(routeRef);

            // Assert
            expect(RouterView).toBeDefined();
            expect(typeof RouterView).toBe("object");
        });

        it("should render 404 when no matched route at depth", () => {
            // Arrange
            const routeRef = createMockRouteRef({matched: []});
            const RouterView = createRouterView(routeRef);

            // Act
            const wrapper = shallowMount(RouterView);

            // Assert
            expect(wrapper.text()).toBe("404");
            expect(wrapper.find("p").exists()).toBe(true);
        });

        it("should render 404 when matched route has no default component", () => {
            // Arrange
            const routeRef = createMockRouteRef({matched: [{components: {}} as unknown as RouteRecordNormalized]});
            const RouterView = createRouterView(routeRef);

            // Act
            const wrapper = shallowMount(RouterView);

            // Assert
            expect(wrapper.text()).toBe("404");
        });

        it("should render the matched component at depth 0", () => {
            // Arrange
            const routeRef = createMockRouteRef({
                matched: [{components: {default: MockComponent}} as unknown as RouteRecordNormalized],
            });
            const RouterView = createRouterView(routeRef);

            // Act
            const wrapper = shallowMount(RouterView);

            // Assert
            expect(wrapper.findComponent(MockComponent).exists()).toBe(true);
        });

        it("should render 404 when depth exceeds matched routes", () => {
            // Arrange
            const routeRef = createMockRouteRef({
                matched: [{components: {default: MockComponent}} as unknown as RouteRecordNormalized],
            });
            const RouterView = createRouterView(routeRef);

            // Act
            const wrapper = shallowMount(RouterView, {props: {depth: 1}});

            // Assert
            expect(wrapper.text()).toBe("404");
        });

        it("should render component at specified depth", () => {
            // Arrange
            const NestedComponent = defineComponent({name: "NestedComponent", render: () => h("div", "Nested")});
            const routeRef = createMockRouteRef({
                matched: [
                    {components: {default: MockComponent}} as unknown as RouteRecordNormalized,
                    {components: {default: NestedComponent}} as unknown as RouteRecordNormalized,
                ],
            });
            const RouterView = createRouterView(routeRef);

            // Act
            const wrapper = shallowMount(RouterView, {props: {depth: 1}});

            // Assert
            expect(wrapper.findComponent(NestedComponent).exists()).toBe(true);
        });

        it("should use depth 0 by default", () => {
            // Arrange
            const FirstComponent = defineComponent({name: "First", render: () => h("div", "First")});
            const SecondComponent = defineComponent({name: "Second", render: () => h("div", "Second")});
            const routeRef = createMockRouteRef({
                matched: [
                    {components: {default: FirstComponent}} as unknown as RouteRecordNormalized,
                    {components: {default: SecondComponent}} as unknown as RouteRecordNormalized,
                ],
            });
            const RouterView = createRouterView(routeRef);

            // Act
            const wrapper = shallowMount(RouterView);

            // Assert
            expect(wrapper.findComponent(FirstComponent).exists()).toBe(true);
            expect(wrapper.findComponent(SecondComponent).exists()).toBe(false);
        });

        it("should update when route changes", async () => {
            // Arrange
            const NewComponent = defineComponent({name: "NewComponent", render: () => h("div", "New")});
            const routeRef = createMockRouteRef({
                matched: [{components: {default: MockComponent}} as unknown as RouteRecordNormalized],
            });
            const RouterView = createRouterView(routeRef);
            const wrapper = shallowMount(RouterView);

            // Act
            routeRef.value = {
                ...routeRef.value,
                name: "new-route",
                path: "/new",
                matched: [{components: {default: NewComponent}} as unknown as RouteRecordNormalized],
            };
            await wrapper.vm.$nextTick();

            // Assert
            expect(wrapper.findComponent(NewComponent).exists()).toBe(true);
        });

        it("should render different components for different routes based on key", async () => {
            // Arrange
            const routeRef = createMockRouteRef({
                name: "route-1",
                path: "/path-1",
                matched: [{components: {default: MockComponent}} as unknown as RouteRecordNormalized],
            });
            const RouterView = createRouterView(routeRef);
            const wrapper = shallowMount(RouterView);

            // Verify initial render
            expect(wrapper.findComponent(MockComponent).exists()).toBe(true);

            // Act - change route
            routeRef.value = {...routeRef.value, name: "route-2", path: "/path-2"};
            await wrapper.vm.$nextTick();

            // Assert - component still renders (key change triggers re-render)
            expect(wrapper.findComponent(MockComponent).exists()).toBe(true);
        });

        it("should handle undefined route name gracefully", () => {
            // Arrange
            const routeRef = createMockRouteRef({
                name: undefined,
                path: "/test",
                matched: [{components: {default: MockComponent}} as unknown as RouteRecordNormalized],
            });
            const RouterView = createRouterView(routeRef);

            // Act
            const wrapper = shallowMount(RouterView);

            // Assert - component renders without error
            expect(wrapper.findComponent(MockComponent).exists()).toBe(true);
        });
    });

    describe("createRouterLink", () => {
        type TestRouterService = RouterService<[]>;
        type GetUrlFn = TestRouterService["getUrlForRouteName"];
        type GoToRouteFn = TestRouterService["goToRoute"];

        let mockGetUrlForRouteName: Mock & GetUrlFn;
        let mockGoToRoute: Mock & GoToRouteFn;

        beforeEach(() => {
            mockGetUrlForRouteName = vi.fn().mockReturnValue("/test-url") as Mock & GetUrlFn;
            mockGoToRoute = vi.fn().mockResolvedValue(undefined) as Mock & GoToRouteFn;
        });

        it("should return a Vue component", () => {
            // Act
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);

            // Assert
            expect(RouterLink).toBeDefined();
            expect(typeof RouterLink).toBe("object");
        });

        it("should render an anchor element", () => {
            // Arrange
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);

            // Act
            const wrapper = shallowMount(RouterLink, {props: {to: {name: "test-route"}}});

            // Assert
            expect(wrapper.find("a").exists()).toBe(true);
        });

        it("should set href from getUrlForRouteName", () => {
            // Arrange
            mockGetUrlForRouteName.mockReturnValue("/custom-url");
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);

            // Act
            const wrapper = shallowMount(RouterLink, {props: {to: {name: "test-route"}}});

            // Assert
            expect(wrapper.find("a").attributes("href")).toBe("/custom-url");
            expect(mockGetUrlForRouteName).toHaveBeenCalledWith("test-route", undefined, undefined);
        });

        it("should pass id to getUrlForRouteName", () => {
            // Arrange
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);

            // Act
            shallowMount(RouterLink, {props: {to: {name: "test-route", id: 42}}});

            // Assert
            expect(mockGetUrlForRouteName).toHaveBeenCalledWith("test-route", 42, undefined);
        });

        it("should pass query to getUrlForRouteName", () => {
            // Arrange
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);

            // Act
            shallowMount(RouterLink, {props: {to: {name: "test-route", query: {page: "1"}}}});

            // Assert
            expect(mockGetUrlForRouteName).toHaveBeenCalledWith("test-route", undefined, {page: "1"});
        });

        it("should render slot content", () => {
            // Arrange
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);

            // Act
            const wrapper = shallowMount(RouterLink, {props: {to: {name: "test-route"}}, slots: {default: "Click me"}});

            // Assert
            expect(wrapper.text()).toBe("Click me");
        });

        it("should prevent default on click", async () => {
            // Arrange
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);
            const wrapper = shallowMount(RouterLink, {props: {to: {name: "test-route"}}});
            const event = {preventDefault: vi.fn()};

            // Act
            await wrapper.find("a").trigger("click", event);

            // Assert
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it("should call goToRoute on click", async () => {
            // Arrange
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);
            const wrapper = shallowMount(RouterLink, {props: {to: {name: "test-route"}}});

            // Act
            await wrapper.find("a").trigger("click");

            // Assert
            expect(mockGoToRoute).toHaveBeenCalledWith("test-route", undefined, undefined);
        });

        it("should pass id to goToRoute on click", async () => {
            // Arrange
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);
            const wrapper = shallowMount(RouterLink, {props: {to: {name: "test-route", id: 123}}});

            // Act
            await wrapper.find("a").trigger("click");

            // Assert
            expect(mockGoToRoute).toHaveBeenCalledWith("test-route", 123, undefined);
        });

        it("should pass query to goToRoute on click", async () => {
            // Arrange
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);
            const wrapper = shallowMount(RouterLink, {props: {to: {name: "test-route", query: {filter: "active"}}}});

            // Act
            await wrapper.find("a").trigger("click");

            // Assert
            expect(mockGoToRoute).toHaveBeenCalledWith("test-route", undefined, {filter: "active"});
        });

        it("should render slot with HTML content", () => {
            // Arrange
            const RouterLink = createRouterLink(mockGetUrlForRouteName, mockGoToRoute);

            // Act
            const wrapper = shallowMount(RouterLink, {
                props: {to: {name: "test-route"}},
                slots: {default: "<span>Link Text</span>"},
            });

            // Assert
            expect(wrapper.find("span").exists()).toBe(true);
            expect(wrapper.find("span").text()).toBe("Link Text");
        });
    });
});

import {shallowMount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";
import {createMemoryHistory, createRouter} from "vue-router";

import App from "../../../../apps/admin/App.vue";

describe("App", () => {
    it("should render header with Admin title", async () => {
        // Arrange
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{path: "/", component: {template: "<div>Dashboard</div>"}}],
        });

        // Act
        const wrapper = shallowMount(App, {global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const header = wrapper.find("header");
        expect(header.exists()).toBe(true);
        expect(header.text()).toContain("Admin");
    });

    it("should render Dashboard navigation link", async () => {
        // Arrange
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{path: "/", component: {template: "<div>Dashboard</div>"}}],
        });

        // Act
        const wrapper = shallowMount(App, {global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const navLink = wrapper.findComponent({name: "NavLink"});
        expect(navLink.exists()).toBe(true);
        expect(navLink.props("to")).toBe("/");
        expect(navLink.text()).toBe("Dashboard");
    });

    it("should render RouterView in main section", async () => {
        // Arrange
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{path: "/", component: {template: "<div>Dashboard</div>"}}],
        });

        // Act
        const wrapper = shallowMount(App, {global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const main = wrapper.find("main");
        expect(main.exists()).toBe(true);
        const routerView = wrapper.findComponent({name: "RouterView"});
        expect(routerView.exists()).toBe(true);
    });
});

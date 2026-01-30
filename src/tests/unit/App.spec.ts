import {mount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";
import {createMemoryHistory, createRouter} from "vue-router";

import App from "@/App.vue";

describe("App", () => {
    it("should render navigation links", async () => {
        // Arrange
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [
                {path: "/", component: {template: "<div>Home</div>"}},
                {path: "/about", component: {template: "<div>About</div>"}},
            ],
        });

        // Act
        const wrapper = mount(App, {global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const links = wrapper.findAllComponents({name: "RouterLink"});
        expect(links).toHaveLength(2);
        expect(links[0].text()).toBe("Home");
        expect(links[1].text()).toBe("About");
    });
});

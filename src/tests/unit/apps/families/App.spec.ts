import App from "@app/App.vue";
import {mount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";
import {createMemoryHistory, createRouter} from "vue-router";

describe("App", () => {
    it("should render navigation links", async () => {
        // Arrange
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [
                {path: "/", component: {template: "<div>Home</div>"}},
                {path: "/scanner", component: {template: "<div>Scanner</div>"}},
                {path: "/about", component: {template: "<div>About</div>"}},
            ],
        });

        // Act
        const wrapper = mount(App, {global: {plugins: [router]}});
        await router.isReady();

        // Assert
        const links = wrapper.findAllComponents({name: "RouterLink"});
        expect(links).toHaveLength(3);
        const [homeLink, scannerLink, aboutLink] = links;
        expect(homeLink?.text()).toBe("Home");
        expect(scannerLink?.text()).toBe("Scanner");
        expect(aboutLink?.text()).toBe("About");
    });
});

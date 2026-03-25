import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "@shared/assets/icons.css";
import "@shared/assets/accessibility.css";
import {registerAuthGuard} from "@shared/services/auth/guards";
import {createApp} from "vue";

import App from "./App.vue";
import {familyAuthService, familyRouterService, familyTranslationService} from "./services";

const app = createApp(App);

app.provide("weight", "bold");
app.provide("size", "1.25em");
app.provide("color", "currentColor");

familyRouterService.install();
registerAuthGuard(familyAuthService, familyRouterService, "login");

await familyAuthService.checkIfLoggedIn();

const {t} = familyTranslationService;
const APP_TITLE = "Brick Inventory";

familyRouterService.registerAfterRouteMiddleware((to) => {
    const titleKey = to.meta.title as string | undefined;
    document.title = titleKey ? `${t(titleKey as Parameters<typeof t>[0]).value} | ${APP_TITLE}` : APP_TITLE;
});

app.mount("#app");

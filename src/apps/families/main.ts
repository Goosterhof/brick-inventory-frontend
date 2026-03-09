import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "@shared/assets/icons.css";
import {registerAuthGuard} from "@shared/services/auth/guards";
import {createApp} from "vue";

import App from "./App.vue";
import {familyAuthService, familyRouterService} from "./services";

const app = createApp(App);

app.provide("weight", "bold");
app.provide("size", "1.25em");
app.provide("color", "currentColor");

familyRouterService.install();
registerAuthGuard(familyAuthService, familyRouterService, "login");

app.mount("#app");

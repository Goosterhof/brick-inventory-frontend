import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import {registerAuthGuard} from "@shared/services/auth/guards";
import {createApp} from "vue";

import App from "./App.vue";
import {familyAuthService, familyRouterService} from "./services";

const app = createApp(App);

familyRouterService.install();
registerAuthGuard(familyAuthService, familyRouterService, "login");

app.mount("#app");

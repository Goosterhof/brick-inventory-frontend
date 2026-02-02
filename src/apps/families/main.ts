import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import {createApp} from "vue";

import App from "./App.vue";
import {familyRouterService} from "./services";

const app = createApp(App);

familyRouterService.install();

app.mount("#app");

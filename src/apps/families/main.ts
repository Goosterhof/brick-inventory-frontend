import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import {createApp} from "vue";

import App from "./App.vue";
import {routerService} from "./services";

const app = createApp(App);

routerService.install();

app.mount("#app");

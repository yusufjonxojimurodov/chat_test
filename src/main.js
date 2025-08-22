import { createApp } from "vue";
import App from "./App.vue";
import router from "."; // router import qilamiz

const app = createApp(App);

app.use(router); // Vue ilovaga routerni ulash
app.mount("#app");

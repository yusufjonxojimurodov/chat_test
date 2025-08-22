import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
import ChatComponent from "./components/ChatComponent.vue";

const routes = [
  { path: "/", name: "Home", component: HelloWorld },
  { path: "/chat/message", name: "Chat", component: ChatComponent }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

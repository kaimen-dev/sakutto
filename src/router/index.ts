import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ToolsView from "../views/ToolsVIew.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/tools",
      name: "tools",
      component: ToolsView,
    },
  ],
});

export default router;

// vite-env.d.ts
/// <reference types="vite-plugin-pages/client" />
import { nextTick } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import routes from "~pages";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
/**
 * ページタイトルの変更
 * ベースのタイトルを設定し、遷移先のmeta.title or meta.nameを追加してタイトルを生成する
 * */
router.afterEach(async (to) => {
  // Use next tick to handle router history correctly
  // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
  const DEFAULT_TITLE = "サクッと。 -Trial-";
  let title = DEFAULT_TITLE;
  if (to.meta.name_ja) {
    title = to.meta.name_ja + " | " + DEFAULT_TITLE;
  }
  await nextTick();
  if (to.meta.name_ja) {
    document.title = title;
  }
});
export default router;

<script setup lang="ts">
import { RouterLink } from "vue-router";
import router from "../router";

import type { RouteRecordRaw } from "vue-router";
import Button from "@/components/ui/button/Button.vue";
const routes = router.getRoutes();
const appLinks = routes
  .filter((route: RouteRecordRaw) => route.meta?.appLink)
  .sort((a, b) => (a.meta.appLink as number) - (b.meta.appLink as number));
console.log("home");

</script>

<template>
  <main class="container flex flex-col items-center justify-center">
    <div class="py-8">
      <h1
        class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        ホーム
      </h1>
    </div>

    <div
      class="w-full max-w-3xl grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      <div
        v-for="link in appLinks"
        :key="link.path"
        class="flex flex-col items-center justify-center aspect-square border-2 border-slate-400 dark:border-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 duration-300">
        <RouterLink
          :to="link.path"
          class="w-full h-full flex flex-col items-center justify-center">
          <Button variant="link" class="text-xl">
            {{ link.meta.name_ja }}
          </Button>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ link.meta.description_ja }}
          </span>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped></style>

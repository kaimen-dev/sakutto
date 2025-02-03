<script setup lang="ts">
import { ref } from "vue";
import { useSettingsStore, storeToRefs } from "@/stores/settings";
// import { storeToRefs } from "pinia";
import { RouterLink, RouterView } from "vue-router";
import router from "./router";
import { Toaster } from "@/components/ui/sonner";
import SettingsView from "./components/SettingsView.vue";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const store = useSettingsStore();
const { appStatusText } = storeToRefs(store);
const BreadcrumbItems = ref<string[]>(["/"]);
// console.log("Routes", router.getRoutes(), router, BreadcrumbItems.value);
router.afterEach((to) => {
  appStatusText.value = "";
  const pathList = to.fullPath.split("/").filter((path) => path !== "");
  BreadcrumbItems.value = pathList;
});

function toTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <header>
    <div class="border-b border-slate-300 dark:border-white/10">
      <div
        class="container border-r border-l border-slate-300 dark:border-white/10">
        <div class="bg-white dark:bg-gray-950">
          <div class="flex h-10 items-center justify-between gap-86">
            <div class="w-24">
              <svg
                id="title_rogo"
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                viewBox="0 0 400 116.5">
                <path
                  d="M106.2,41.5c0,.8-.3,1.5-.9,2.1-.6.6-1.3.9-2.1.9h-11.8v2.8c0,12.3-2.7,21.9-8.1,28.6-5.8,7.2-15.3,11.8-28.3,13.8-.9.1-1.7-.1-2.4-.8-.7-.6-1.1-1.4-1.1-2.3,0-1.8.9-2.8,2.6-3.1,11.2-1.7,19.2-5.6,24.1-11.8,4.3-5.5,6.5-13.3,6.5-23.4v-3.8h-31.7v18.8c0,.9-.3,1.7-1,2.3-.6.6-1.4,1-2.3,1s-1.7-.3-2.3-1c-.6-.6-1-1.4-1-2.3v-18.8h-11.8c-.8,0-1.5-.3-2.1-.9-.6-.6-.9-1.3-.9-2.1s.3-1.5.9-2.1,1.3-.9,2.1-.9h11.8v-13c0-.9.3-1.7,1-2.3.6-.6,1.4-1,2.3-1s1.7.3,2.3,1c.6.6,1,1.4,1,2.3v13h31.7v-13c0-.9.3-1.7,1-2.3.6-.6,1.4-1,2.4-1s1.7.3,2.4,1c.6.6,1,1.4,1,2.3v13h11.8c.8,0,1.5.3,2.1.9s.9,1.3.9,2.1Z" />
                <path
                  d="M174.9,26.9c5.9,0,8.8,2.6,8.8,7.7s0,1.2-.2,1.8c-1.1,7.6-3,14.4-5.6,20.4-8,18.3-22.9,29.2-44.7,32.9-.9.2-1.8,0-2.5-.7-.7-.6-1.1-1.4-1.1-2.4,0-1.8.9-2.8,2.6-3.1,25.4-4.4,40.1-19.8,44.1-46.3.4-2.8-.8-4.3-3.7-4.3h-27.8c-2.5,0-4.3,1.1-5.4,3.4-4.1,8.3-9.6,14.8-16.6,19.6-.5.3-1.1.5-1.8.5s-1.7-.3-2.3-.9c-.6-.6-1-1.4-1-2.3s.4-2,1.3-2.6c5.9-4.2,10.6-9.7,13.9-16.6,2.3-4.8,5.9-7.3,10.6-7.3h31.1Z" />
                <path
                  d="M209.7,63.7c.2.8,0,1.5-.5,2.2-.5.6-1.2,1-2,1-1.5,0-2.4-.7-2.6-2.2-1.1-5.5-2.6-11.3-4.7-17.6,0-.2-.1-.5-.1-.7,0-.6.2-1.2.7-1.7.5-.5,1.1-.8,1.8-.8,1.2,0,1.9.6,2.4,1.8,2.4,6.8,4.1,12.8,5.2,18.1ZM212.8,89.7c-.8.2-1.5,0-2.1-.5-.6-.5-.9-1.2-.9-1.9,0-1.3.6-2.1,1.9-2.4,10.1-2.4,17.7-7.1,22.5-14,4.4-6.3,6.8-14.7,7.1-25.2,0-.7.3-1.3.8-1.8.5-.5,1.2-.8,1.9-.8s1.5.3,2,.8c.6.6.8,1.2.8,2-.8,24.1-12.1,38.7-33.9,43.8ZM227.1,62.8c.1.8,0,1.5-.6,2.2-.5.6-1.2,1-2,1-1.5,0-2.4-.7-2.6-2.2-1-5.1-2.5-11-4.4-17.4,0-.2,0-.5,0-.7,0-.7.3-1.3.8-1.8.5-.5,1.1-.7,1.8-.7,1.2,0,2,.6,2.4,1.8,1.9,5.6,3.4,11.5,4.7,17.9Z" />
                <path
                  d="M331.3,84.3c0,1.8-.9,2.9-2.7,3.2-9.1,1.5-17.6,2.3-25.5,2.3-12,0-21-1.9-26.9-5.8-5.2-3.5-7.8-8.3-7.8-14.4,0-11,8.5-19.1,25.4-24.4-.5-3.9-1.2-9.8-2.3-17.7-.1-1,.2-1.9.8-2.7.7-.8,1.5-1.2,2.5-1.2,2,0,3.1,1,3.3,3.1.3,3.6.9,9.2,1.8,16.8,7.8-1.8,16.5-3.1,26.3-3.7.9,0,1.7.2,2.3.9.7.6,1,1.4,1,2.3,0,2-1,3.1-3,3.2-15.1.7-27.1,2.9-36.2,6.6-10.2,4.1-15.3,9.6-15.3,16.3,0,9.6,9.3,14.4,28,14.4s14.7-.8,24.3-2.3c.9-.2,1.8,0,2.6.7.8.6,1.2,1.5,1.2,2.5Z" />
                <path
                  d="M368.2,82.8c0,3.2-1.1,5.9-3.3,8.1-2.2,2.2-4.9,3.3-8,3.3s-5.8-1.1-8-3.3c-2.3-2.2-3.4-4.9-3.4-8.1s1.1-5.9,3.4-8.1c2.3-2.2,4.9-3.3,8-3.3s5.9,1.1,8,3.3c2.2,2.2,3.3,4.9,3.3,8.1ZM363.5,82.8c0-1.9-.6-3.5-1.9-4.8-1.3-1.3-2.9-1.9-4.8-1.9s-3.4.7-4.7,2-2,2.9-2,4.7.7,3.4,2,4.7c1.3,1.3,2.9,2,4.7,2s3.5-.6,4.8-1.9c1.3-1.3,1.9-2.9,1.9-4.8Z" />
              </svg>
            </div>
            <Sheet>
              <SheetTrigger
                ><Icon icon="icons:mdi-settings-outline" class="text-3xl"></Icon
              ></SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle></SheetTitle>
                  <SheetDescription> </SheetDescription>
                </SheetHeader>
                <SettingsView />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  </header>
  <div
    class="breadcrumb container h-[1rem] border-r border-l border-slate-300 dark:border-white/10">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as-child
            ><RouterLink to="/"> Home </RouterLink></BreadcrumbLink
          >
        </BreadcrumbItem>
        <template v-for="(item, index) in BreadcrumbItems">
          <BreadcrumbSeparator />
          <template v-if="index === BreadcrumbItems.length - 1">
            <BreadcrumbPage>{{ item }}</BreadcrumbPage>
          </template>
          <template v-else>
            <BreadcrumbItem>
              <BreadcrumbLink :key="index" as-child
                ><RouterLink :to="'/' + item" class="underline">{{
                  item
                }}</RouterLink></BreadcrumbLink
              >
            </BreadcrumbItem>
          </template>
        </template>
        <BreadcrumbSeparator />
        <BreadcrumbItem as-child>
          <span>{{ appStatusText }}</span>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
  <div
    class="main_block lg:py-6 container border-r border-l border-slate-300 dark:border-white/10">
    <RouterView />
  </div>
  <footer>
    <div class="fixed bottom-0.5 right-0.5 p-2" @click="toTop">
      <Icon
        icon="icons:emojione-v1-top-arrow"
        class="text-2xl cursor-pointer"></Icon>
    </div>

    <div class="flex items-center flex-col">
      <small>sakutto.app ©Hiroaki Sato 2025</small>
      <div v-if="BreadcrumbItems.length === 0" class="flex items-center flex-col">
        <img
          src="/link_qrcode.png"
          alt="サイトリンクQRコード"
          style="width: 150px" />
        <span class="text-xs text-muted-foreground"
          >このサイトのURLをスマートフォンで読み取ってアクセスできます。</span
        >
      </div>
    </div>
  </footer>
  <Toaster richColors />
</template>

<style scoped>
.main_block {
  min-height: calc(100vh - 3.5rem);
}
</style>

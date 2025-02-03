<template>
  <div>
    <div v-if="names.length === 0"></div>
    <div v-else class="mb-4 max-h-96 overflow-y-auto">
      <p class="text-center mb-4">保存された画像(500件まで)</p>
      <input
        v-model="search"
        type="search"
        class="w-full p-1 border border-gray-300 rounded-md"
        placeholder="ファイル名検索" />
      <ul class="max-h-64 overflow-y-auto">
        <li
          v-for="name in fillterdNames"
          class="flex flex-wrap md:justify-between items-center gap-2 mb-2 text-xs">
          <p class="text-sm">{{ name }}</p>
          <Button
            variant="outline"
            class="px-2 py-1"
            @click="putRestoreImage(name)"
            >復元</Button
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Button } from "../ui/button";
import { type IndexableTypeArray } from "dexie";
import { getDBImageFileNames, getDBImageByFileName } from "../../js/IDB";

const names = ref<IndexableTypeArray>([]);
onMounted(() => {
  getDBImageFileNames().then((res) => {
    names.value = res;
  });
});

const search = ref("");
const fillterdNames = computed(() => {
  return names.value.filter((name: unknown) => {
    if (typeof name !== "string") {
      return false;
    }
    console.log(name, search.value.toLowerCase());
    return name.toLowerCase().includes(search.value);
  });
});

const putRestoreImage = (name: unknown) => {
  if (!name) {
    return;
  }
  if (typeof name === "string") {
    getDBImageByFileName(name).then((res) => {
      if (!res) {
        return;
      }
      console.log(res.fileName, res.image);
      // 画像をファイル名=res.fileName、画像データ=res.imageで復元し、ダウンロードする
      const a = document.createElement("a");
      a.href = res.image;
      a.download = res.fileName;
      a.click();
    });
  }
};
</script>

<style scoped></style>

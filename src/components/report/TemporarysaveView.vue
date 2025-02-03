<template>
  <div>
    <div v-if="temporarySave.length === 0"></div>
    <div v-else class="mb-4 max-h-80 overflow-y-auto">
      <p class="text-center mb-4">データ履歴(100件まで)</p>
      <ul class="max-h-64 overflow-y-auto">
        <li
          v-for="item in temporarySave"
          class="flex justify-between items-center mb-2 text-xs">
          <span class="text-sm">{{ dateToJPLocaleString(item) }}</span
          ><Button variant="outline" class="px-2 py-1" @click="putRestoreValue(item)">復元</Button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button } from "../ui/button";
import { type IndexableTypeArray } from "dexie";
import { getTemporarySave, getTemporarySaveList } from "../../js/IDB";
const emits = defineEmits<{
  (e: "putRestoreValue", value: string): void;
}>();

const temporarySave = ref<IndexableTypeArray>([]);
onMounted(() => {
  getTemporarySaveList().then((res) => {
    temporarySave.value = res;
  });
});
const dateToJPLocaleString = (timestamp: unknown) => {
  if (typeof timestamp !== "number") {
    return "";
  }
  const date = new Date(timestamp);
  return date.toLocaleString("ja-JP");
};

const putRestoreValue = (timestamp: unknown) => {
  if (typeof timestamp !== "number") {
    return;
  }
  getTemporarySave(timestamp as number).then((res) => {
    if (!res) {
      return;
    }
    emits("putRestoreValue", res);
  });
};
</script>

<style scoped></style>

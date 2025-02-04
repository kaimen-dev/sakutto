<template>
  <div>
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>画像データの管理</AccordionTrigger>
        <AccordionContent>
          <div>
            <details class="mb-4 border border-gray-300 p-2">
              <summary>クリックで説明が開きます</summary>
              <span>ここでは画像データの使用状況の確認と削除が出来ます</span>
              <p class="my-2 font-bold indented">画像データとは</p>
              <p>
                サイトにアップロードした画像は加工を繰り返す事が出来るように元データをブラウザに保存しています。<br />
              </p>
              <p>
                画像を削除するとエクセルファイルを再編集したい時に画像が加工後のみとなってしまい、一度編集画像を消して再アップロードをする必要が生じます
              </p>
              <p class="my-2 font-bold indented">画像の削除</p>
              <p>
                [日付を指定して画像削除]では指定した日付からそれ以前までの保存データを削除できます。
              </p>
              <p>
                カレンダーボタンから日付を指定すると、削除される枚数が表示されます。確認後削除ボタンで実行してください
              </p>
              <p class="my-2 font-bold indented">画像の復元</p>
              <p>
                [画像の復元]では保存された画像をダウンロードできます。ダウンロードした画像は元の画像と同じ状態で保存されます<br>ファイル名での検索が可能ですので、枚数が多い場合でも簡単に探す事が出来ます
              </p>
            </details>
            <p class="text-xs">データの使用率={{ DBUsage }}%</p>
            <p class="text-xs">画像の枚数={{ DBImageCount }}枚</p>
            <p class="font-bold mt-4">日付を指定して画像削除</p>
            <p class="text-xs text-muted-foreground">
              選択した日付までの画像を消去できます
            </p>
            <input
              v-model="deleteDate"
              type="date"
              class="border border-gray-300 rounded-md p-2" />
            <p>{{ NumberToBeDeleted }}</p>
            <div class="flex justify-end">
              <Button variant="outline" @click="deleteImage">削除</Button>
            </div>
          </div>
          <div>
            <p class="font-bold mt-4">画像の復元</p>
            <Dialog>
              <DialogTrigger
                ><Button variant="outline" @click="deleteImage"
                  >復元ウィンドウを開く</Button
                ></DialogTrigger
              >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle
                    >ブラウザに保存されている画像をダウンロード出来ます</DialogTitle
                  >
                </DialogHeader>
                <DialogDescription>
                  <SavedImagesView />
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { computedAsync } from "@vueuse/core";
import SavedImagesView from "./SavedImagesView.vue";
import { Button } from "../ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { countDBImageByDate, deleteDBImageByDate } from "../../js/IDB";

import { useSettingsStore, storeToRefs } from "@/stores/settings";
const settingStore = useSettingsStore();
const { updateDBUsage } = settingStore;
const { DBUsage, DBImageCount } = storeToRefs(settingStore);
onMounted(() => {
  updateDBUsage();
});

const deleteDate = ref<string | null>(null);
const NumberToBeDeleted = computedAsync(async () => {
  if (deleteDate.value) {
    const count = await countDBImageByDate(deleteDate.value);
    console.log(count);
    return `${count}枚が削除されます`;
  }
  return "";
});
const deleteImage = async () => {
  if (deleteDate.value) {
    await deleteDBImageByDate(deleteDate.value);
    updateDBUsage();
    deleteDate.value = null;
  }
};
</script>

<style scoped>
.indented {
text-indent:1em;
}
details > summary::marker {
  color: var(--sky-400);
}
</style>

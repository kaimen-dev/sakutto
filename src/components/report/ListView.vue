<template>
  <div class="list_view mt-4 pt-4">
    <div class="flex justify-center">
      <VirtualList
        v-if="rows.length > 0"
        id="VirtualList"
        v-model="rows"
        dataKey="UNIQUEKEY"
        handle=".handle"
        class="py-4 w-full"
        ghostClass="ghost"
        @drag="dragEvent"
        @drop="dropEvent"
        ref="draglist">
        <template v-slot:item="{ record, index, dataKey }">
          <Card class="--list-card mb-4">
            <CardHeader>
              <CardTitle class="flex justify-between items-center"
                ><Icon
                  icon="icons:lucide-lab-layout-list-move"
                  class="handle cursor-move w-5 mr-2 text-xl float-left" />
                <div
                  style="width: 100%; text-align: center; cursor: move"
                  class="">
                  {{ index + 1 }}
                </div>
                <div class="--list_image">
                  <div v-if="record.image !== null" class="flex justify-center">
                    <img
                      cover
                      :src="record.image"
                      class="w-16"
                      @click="
                        openCropperDialog(record.UNIQUEKEY, record.image)
                      " />
                  </div>
                  <div
                    v-else
                    class="d-flex align-center justify-center"
                    style="background-color: #eee">
                    <div>
                      <label
                        ><Icon
                          icon="icons:mdi-image-plus"
                          class="text-4xl"
                          title="画像選択。クリックで選択かこの枠へドラッグしてください"></Icon>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/gif, image/jpg, image/heic"
                          @change="loadImage($event, record.UNIQUEKEY)"
                          class="hidden"
                      /></label>
                    </div>
                  </div>
                </div>
                <input
                  placeholder="場所"
                  v-model="record.place"
                  class="w-full text-center" />
              </CardTitle>
            </CardHeader>
            <CardContent class="CardContent sm:px-6 p-0 w-full">
              <div class="w-full flex flex-wrap justify-around gap-4">
                <div class="flex flex-col min-w-[245px] w-full sm:w-auto">
                  <fieldset>
                    <legend class="px-2">内容</legend>
                    <!-- <label>内容</label> -->
                    <textarea
                      v-model="record.summary"
                      variant="plain"
                      rows="1"
                      class="w-full"></textarea>
                  </fieldset>
                </div>
                <div class="flex flex-col min-w-[245px] w-full sm:w-auto">
                  <fieldset>
                    <legend class="px-2">詳細</legend>
                    <textarea
                      v-model="record.detail"
                      variant="plain"
                      rows="1"
                      class="w-full"></textarea>
                  </fieldset>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>行操作</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      ><span @click="emits('addRow', $event, index)"
                        >上に行追加</span
                      ></DropdownMenuItem
                    >
                    <DropdownMenuItem
                      ><span
                        @click="
                          emits('addCopyRow', $event, record.UNIQUEKEY, index)
                        "
                        >上にコピー追加</span
                      ></DropdownMenuItem
                    >
                    <DropdownMenuItem
                      ><span @click="emits('addRow', $event, index + 1)"
                        >下に行追加</span
                      ></DropdownMenuItem
                    >
                    <DropdownMenuItem
                      ><span
                        @click="
                          emits(
                            'addCopyRow',
                            $event,
                            record.UNIQUEKEY,
                            index + 1
                          )
                        "
                        >下にコピー追加</span
                      ></DropdownMenuItem
                    >
                    <DropdownMenuItem
                      ><span
                        @click="emits('deleteRow', $event, record.UNIQUEKEY)"
                        >行を削除</span
                      ></DropdownMenuItem
                    >
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
            <CardFooter class="CardFooter flex justify-around items-baseline">
            </CardFooter>
          </Card>
        </template>
      </VirtualList>
    </div>
  </div>
  <div>
    <div v-if="rows.length > 0" class="w-full flex justify-center mt-4">
      <Button
        @click="emits('addRow', $event)"
        class="add_Button"
        >データ追加</Button
      >
    </div>
    <div v-else="rows.length === 0">
      <h2 class="text-center text-2xl">データが0件です</h2>
      <div class="flex justify-center gap-6 p-6">
        <Button @click="emits('addRow', $event)">新規行を追加する</Button>
        <Button
          ><label
            >画像一括追加
            <input
              type="file"
              prepend-icon="mdi-image-plus"
              accept="image/png, image/jpeg, image/gif, image/jpg, image/heic"
              @change="multiImageLoad"
              class="hidden"
              multiple /></label
        ></Button>
      </div>
      <p class="text-center">
        保存されたデータから作業を再開する場合は、右上の【読み込み】ボタンからファイルを選択してください
      </p>
    </div>
    <Dialog
      v-model:open="isOpenDialog"
      id="cropperDialog"
      @update:open="delete_file_data">
      <!-- <DialogTrigger> Edit Profile </DialogTrigger> -->
      <DialogContent>
        <DialogHeader>
          <DialogTitle>画像編集</DialogTitle>
          <DialogDescription>
            <template v-if="isTouchDevice">
              ドラッグで画像を移動、ピンチ操作で拡大縮小。回転と配置リセットはボタンをクリックしてください。
            </template>
            <template v-else>
              ドラッグで画像を移動、スクロールで拡大縮小。回転と配置リセットはボタンをクリックしてください。
            </template>
          </DialogDescription>
        </DialogHeader>
        <div class="image__inner">
          <div class="h-full overflow-hidden flex justify-center items-center">
            <img
              id="dialog_cropper_image"
              src=""
              alt="Picture"
              initial-center-size="cover"
              scalable
              translatable
              rotatable
              tabindex="1" />
          </div>
          <div class="command_buttons" collapse>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  ><Button icon @click="CROPPER.resetPosition">
                    <Icon icon="icons:mdi-fit-to-page-outline"></Icon> </Button
                ></TooltipTrigger>
                <TooltipContent>
                  <p>配置リセット</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  ><Button icon @click="CROPPER.rotateImage">
                    <Icon icon="icons:mdi-file-rotate-right-outline"></Icon>
                  </Button>
                  <TooltipContent>
                    <p>右90°回転</p>
                  </TooltipContent>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <DialogFooter>
          <div class="flex gap-2">
            <div>
              <Button
                block
                outlined
                variant="secondary"
                prepend-icon="mdi-close-circle"
                @click="isOpenDialog = false"
                aria-label="Close"
                >キャンセル</Button
              >
            </div>
            <div>
              <Button
                color="indigo-darken-4"
                prepend-icon="mdi-check-circle"
                block
                @click="cropperSave"
                aria-label="Save">
                保存</Button
              >
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { type dataValues } from "../../js/report_types";
import { ref, computed, onMounted, nextTick, useTemplateRef } from "vue";

/** pinia */
import { useSettingsStore } from "@/stores/settings";
const store = useSettingsStore();

// @see https://mfuu.github.io/vue-virtual-drag-list/
import VirtualList from "vue-virtual-draglist";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { saveNewImage } from "../../js/images";
import { getDBImage, setDBImageTransform, deleteDBImage } from "../../js/IDB";
import Cropper, { on } from "cropperjs";
import * as CROPPER from "../../js/cropper";
const props = defineProps<{
  modelValue: dataValues[];
}>();

const emits = defineEmits<{
  (e: "update:modelValue", value: dataValues[]): void;
  (e: "addRow", event: MouseEvent, index?: number): void;
  (e: "addCopyRow", event: MouseEvent, key: string, index: number): void;
  (
    e: "moveRow",
    event: MouseEvent,
    key: string,
    direction: "up" | "down"
  ): void;
  (e: "deleteRow", event: MouseEvent, key: string): void;
  (e: "addRowFromMultiImages", files: File[]): void;
}>();

const rows = computed({
  get: () => props.modelValue,
  set: (inputted) => emits("update:modelValue", inputted),
});

const isTouchDevice = "ontouchstart" in window;
const isOpenDialog = ref(false);
const draglistRef = useTemplateRef("draglist");

/**
 * 指定時間待機する
 * @param ms 待機時間
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function multiImageLoad(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target) return;
  const files = target.files;
  if (!files) return;
  emits("addRowFromMultiImages", Array.from(files));
}

/**
 * ****************************************************
 * textareaの自動リサイズ
 * ****************************************************
 */
const resizeTextarea = (e: Event | HTMLTextAreaElement) => {
  if (!e) return;

  let target: HTMLTextAreaElement;
  if (e instanceof Event) {
    target = e.target as HTMLTextAreaElement;
  } else {
    target = e;
  }

  target.style.height = "auto";
  target.style.height = target.scrollHeight + "px";
};
document.addEventListener("input", (e) => {
  resizeTextarea(e);
});
// ウィンドウサイズが640pxをまたぐ毎にリサイズ
let isWide = false;
const mediaQuery = window.matchMedia("(min-width: 640px)");
mediaQuery.addEventListener("change", (e) => {
  if (e.matches && !isWide) {
    // 640px以上のときにisWide=falseならリサイズしてisWide=trueにする
    isWide = true;
    document.querySelectorAll("textarea").forEach((ele) => {
      resizeTextarea(ele);
    });
  } else if (isWide) {
    // 640px未満のときにisWide=trueならリサイズしてisWide=falseにする
    isWide = false;
    document.querySelectorAll("textarea").forEach((ele) => {
      resizeTextarea(ele);
    });
  }
});
// マウント時にウィンドウサイズを判定してisWideを設定する
onMounted(() => {
  window.innerWidth > 640 ? (isWide = true) : (isWide = false);
});

/**
 * ****************************************************
 * 画像・Cropper
 * ****************************************************
 */

let cropper: Cropper | null = null;
let openedUNIQUEKEY: string = "";

function delete_file_data(open: boolean) {
  console.log("delete_file_data", open);
  [].forEach.call(
    document.querySelectorAll('input[type="file"]'),
    (ele: HTMLInputElement) => {
      ele.value = "";
    }
  );
}
/**
 * 画像編集ダイアログを開く
 * オリジナル画像があればそれを表示し編集状態(変形)を再現する。なければクロップ済みの画像を表示する
 * @param key UniqueKey
 * @param image
 */
function openCropperDialog(key: string, image: string) {
  let transform: number[] | null = null;

  getDBImage(key).then((result) => {
    if (result) {
      console.log("get saved image");
      image = result.image as string;
      transform = result.transform;
    } else {
      console.log("saved image is null");
    }

    // cropperDialog.value = true;
    isOpenDialog.value = true;
    nextTick(async () => {
      const dialog_cropper_image = document.querySelector(
        "#dialog_cropper_image"
      ) as HTMLImageElement | null;
      if (!dialog_cropper_image)
        return console.error("dialog_cropper_image is null");

      dialog_cropper_image.setAttribute("src", image);
      dialog_cropper_image.onload = async () => {
        openedUNIQUEKEY = key;
        // await sleep(200); // 読み込み処理を待つ
        cropper = new Cropper("#dialog_cropper_image", {
          template: `
        <cropper-canvas
          id="dialog_load"
          background
          data-index="-1"
          class="cursor-move">
          <cropper-image
            alt="Picture"
            initial-center-size="cover"
            scalable
            translatable
            rotatable></cropper-image>
          <cropper-handle action="move" plain></cropper-handle>
        </cropper-canvas>`,
        });
        if (!cropper) return console.error("cropper is null");
        const image = cropper.getCropperImage();
        if (!image) return;
        image.style.opacity = "0";
        setTimeout(async () => {
          if (transform) {
            image.$setTransform(transform);
            image.style.opacity = "1";
          } else {
            image.$center("cover");
            image.style.opacity = "1";
          }
        }, 0);
        // console.log("cropper", cropper);
      };
    });
  });
}

/**
 * Cropperの画像を保存する
 * 合わせて画像の変形情報を記録する
 */
async function cropperSave() {
  // const Cropper = getCropperElements();
  if (!cropper) return console.error("dialog is null");
  // console.log("cropperSave", cropper);

  const croppedCanvas = await cropper.getCropperCanvas()?.$toCanvas();
  if (!croppedCanvas) return console.error("croppedCanvas is null");
  const ctx = croppedCanvas.getContext("2d");
  if (ctx) {
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, croppedCanvas.width - 2, croppedCanvas.height - 2);
  }
  const index = openedUNIQUEKEY;
  const findRow = rows.value.find((row) => row.UNIQUEKEY === index);
  if (findRow && index) {
    findRow.image = croppedCanvas.toDataURL();
    setDBImageTransform(
      index,
      cropper.getCropperImage()?.$getTransform() || [1, 0, 0, 1, 0, 0]
    );
    // originImages[index].transform = cropper.image.$getTransform()
  }
  isOpenDialog.value = false;
}

/**
 * 画像の新規読み込み
 * @param file
 * @param key UniqueKey
 */
function loadImage(file: File[] | File | Event, UniqueKey: string): void {
  let _file;
  if (file instanceof Event) {
    const target = file.target as HTMLInputElement;
    if (!target) return;
    if (target.files) _file = target.files[0];
  } else if (Array.isArray(file)) {
    _file = file[0];
  } else {
    _file = file;
  }
  if (!_file) return;
  // console.log("loadImage", _file, UniqueKey);
  // 既に画像がある場合は読み込みと書き込みがコンフリクトしてしまうので、削除してから新しい画像を読み込む
  const row = rows.value.find((row) => row.UNIQUEKEY === UniqueKey);
  if (row && row.UNIQUEKEY) {
    deleteDBImage(UniqueKey).then(() => {
      saveNewImage(_file, UniqueKey, (image, UniqueKey) => {
        openCropperDialog(UniqueKey, image);
      });
    });
  } else {
    saveNewImage(_file, UniqueKey, (image, UniqueKey) => {
      openCropperDialog(UniqueKey, image);
    });
  }
}

/**
 * ****************************************************
 * 行操作
 * ****************************************************
 */
const dragEvent = (e: DragEvent) => {
  console.log("dragEvent", e);
  const parent = document.getElementById("VirtualList");
  parent?.classList.add("dragging");
};
const dropEvent = (e: DragEvent) => {
  console.log("dropEvent", e);
  console.log(draglistRef.value);
  const parent = document.getElementById("VirtualList");
  parent?.classList.remove("dragging");
  setTimeout(() => {
    // @ts-ignore ビルトインのメソッドがないと怒られるが、実際にはある
    draglistRef.value.scrollToIndex(e.newIndex);
  }, 150);
};
</script>

<style scoped>
.--list-card h3 {
  display: grid;
  grid-template-columns: 1em 2em 2em 1fr;
}
/* .CardContent > div > div {
  width: 250px;
} */
.CardContent textarea {
  /* width: 244.578px; */
  line-break: strict;
  resize: none;
  line-height: 1.2;
  overflow: hidden;
}
.command_buttons {
  text-align: center;
  width: 15em;
}
.command_buttons li {
  padding: 0.25rem;
  cursor: pointer;
}
.command_buttons li:hover {
  background: var(--slate-200);
}
#VirtualList {
  padding: 0.5rem;
  height: calc(100vh - 280px);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}
#VirtualList .CardContent {
  display: grid;
  grid-template-rows: 1fr;
  transition: 250ms grid-template-rows ease;
}
#VirtualList .CardContent fieldset {
  margin: 0;
  padding: 5px;
  border: 1px solid;
}
#VirtualList .CardContent > div {
  overflow: hidden;
}
#VirtualList.dragging .CardContent {
  grid-template-rows: 0fr;
}
#VirtualList.dragging .CardFooter {
  display: none;
}
#VirtualList.dragging * {
  padding: 0;
}
.ghost {
  height: auto !important;
}
.ghost * {
  padding: 0;
}
.ghost .CardFooter {
  display: none;
}
.ghost .CardContent > div {
  overflow: hidden;
}
.ghost .CardContent {
  grid-template-rows: 0fr;
}
</style>

<template>
  <div>
    <div class="w-full flex justify-center items-center gap-4 pt-4">
      <span>表示件数</span>
      <Select v-model="pagingLength" default-value="10">
        <SelectTrigger class="w-20">
          <SelectValue class="text-base" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="10"> 10 </SelectItem>
            <SelectItem value="20"> 20 </SelectItem>
            <SelectItem value="30"> 30 </SelectItem>
            <SelectItem value="50"> 50 </SelectItem>
            <SelectItem value="100"> 100 </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    <div v-if="rows.length > 0" class="w-full flex justify-center">
      <Pagination
        v-slot="{ page }"
        :total="rows.length"
        :itemsPerPage="pagingLengthNumber"
        :sibling-count="1"
        v-model:page="pageView"
        show-edges
        :default-page="1">
        <PaginationList v-slot="{ items }" class="flex items-center gap-1">
          <PaginationFirst />
          <PaginationPrev />

          <template v-for="(item, index) in items">
            <PaginationListItem
              v-if="item.type === 'page'"
              :key="index"
              :value="item.value"
              as-child>
              <Button
                class="w-10 h-10 p-0"
                :variant="item.value === page ? 'default' : 'outline'">
                {{ item.value }}
              </Button>
            </PaginationListItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>

          <PaginationNext />
          <PaginationLast />
        </PaginationList>
      </Pagination>
    </div>
    <p class="sm:hidden font-bold text-center">右にスクロール出来ます</p>
    <div
      class="pages_list w-svw md:w-full flex flex-col flex-wrap items-center mt-4 pt-4 overflow-auto sm:overflow-visible">
      <div
        class="rows w-fit"
        v-for="(row, index) in viewRows"
        :key="row.UNIQUEKEY"
        :class="{ page_break: (startIndex + index) % 3 === 2 }"
        :data-page="Math.ceil((startIndex + index) / 3) + 1">
        <div class="command_buttons">
          <details>
            <summary class="cursor-pointer">
              No.{{ startIndex + index + 1 }} 行操作
            </summary>
            <ul>
              <li>
                <span @click="emits('addRow', $event, startIndex + index)"
                  >上に行追加</span
                >
              </li>
              <li>
                <span
                  @click="
                    emits(
                      'addCopyRow',
                      $event,
                      row.UNIQUEKEY,
                      startIndex + index
                    )
                  "
                  >上にコピー追加</span
                >
              </li>
              <li>
                <hr />
              </li>
              <li>
                <span @click="emits('addRow', $event, startIndex + index + 1)"
                  >下に行追加</span
                >
              </li>
              <li>
                <span
                  @click="
                    emits(
                      'addCopyRow',
                      $event,
                      row.UNIQUEKEY,
                      startIndex + index + 1
                    )
                  "
                  >下にコピー追加</span
                >
              </li>
              <li>
                <hr />
              </li>
              <li>
                <span @click="emits('moveRow', $event, row.UNIQUEKEY, 'up')"
                  >上へ移動</span
                >
              </li>
              <li>
                <span @click="emits('moveRow', $event, row.UNIQUEKEY, 'down')"
                  >下へ移動</span
                >
              </li>
              <li>
                <span @click="emits('deleteRow', $event, row.UNIQUEKEY)"
                  >行を削除</span
                >
              </li>
            </ul>
          </details>
        </div>
        <div class="wrap" :data-id="index" :data-uniquekey="row.UNIQUEKEY">
          <article class="articleBox">
            <div class="image">
              <div class="image__inner">
                <div v-if="row.image !== null" class="--image_command">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icon
                          icon="icons:mdi-image-remove"
                          class="text-red-500 text-3xl bg-white rounded"
                          @click="row.image = null"></Icon
                      ></TooltipTrigger>
                      <TooltipContent>
                        <p>画像を削除</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div
                  v-if="row.image !== null"
                  style="height: 100%; overflow: hidden">
                  <img
                    v-bind="props"
                    :src="row.image"
                    style="width: 100%; cursor: pointer"
                    @click="openCropperDialog(row.UNIQUEKEY, row.image)" />
                </div>
                <div v-else style="height: 100%; width: 100%">
                  <DropperBox
                    @drop="loadImage($event, row.UNIQUEKEY)"
                    class="flex justify-center items-center">
                    <label
                      ><Icon icon="icons:mdi-image-plus" class="text-4xl"></Icon
                      >画像選択。クリックで選択かこの枠へドラッグしてください
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/jpg, image/heic"
                        @change="loadImage($event, row.UNIQUEKEY)"
                        class="hidden"
                    /></label>
                  </DropperBox>
                </div>
              </div>
            </div>
            <div class="number_title">写真番号　　　 No.</div>
            <div class="number">
              <span>{{ startIndex + index + 1 }}</span>
            </div>
            <div class="place_title">場所</div>
            <div class="place" style="display: flex; align-items: center">
              <textarea
                v-model="row.place"
                type="text"
                style="width: 100%"
                class="text-center"></textarea>
            </div>
            <div class="summary_title">内容</div>
            <div class="summary">
              <textarea
                v-model="row.summary"
                style="height: 100%; width: 100%"></textarea>
            </div>
            <div class="detail_title">詳細</div>
            <div class="detail">
              <textarea
                v-model="row.detail"
                style="height: 100%; width: 100%"></textarea>
            </div>
          </article>
          <!-- <div class="image">
          <div class="image__inner">
            <div v-if="row.image !== null" class="--image_command">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon
                      icon="icons:mdi-image-remove"
                      class="text-red-500 text-3xl bg-white rounded"
                      @click="row.image = null"></Icon
                  ></TooltipTrigger>
                  <TooltipContent>
                    <p>画像を削除</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div
              v-if="row.image !== null"
              style="height: 100%; overflow: hidden">
              <img
                v-bind="props"
                :src="row.image"
                style="width: 100%; cursor: pointer"
                @click="openCropperDialog(row.UNIQUEKEY, row.image)" />
            </div>
            <div v-else style="height: 100%; width: 100%">
              <DropperBox
                @drop="loadImage($event, row.UNIQUEKEY)"
                class="flex justify-center items-center">
                <label
                  ><Icon icon="icons:mdi-image-plus" class="text-4xl"></Icon
                  >画像選択。クリックで選択かこの枠へドラッグしてください
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/jpg, image/heic"
                    @change="loadImage($event, row.UNIQUEKEY)"
                    class="hidden"
                /></label>
              </DropperBox>
            </div>
          </div>
        </div> -->
          <!-- <div class="detail"> -->
          <!-- <div class="detail__cells">
            <div class="detail__left">
              <span style="height: 32px">写真番号 No.</span>
            </div>
            <div class="detail__right">
              <span>{{ index + 1 }}</span>
            </div>
          </div> -->
          <!-- <div class="detail__cells detail__title">
            <span>場所</span>
          </div>
          <div class="detail__cells">
            <input
              v-model="row.place"
              type="text"
              style="height: 35px; width: 100%"
              class="text-center" />
          </div> -->
          <!-- <div class="detail__cells detail__title">
            <span>内容</span>
          </div>
          <div class="detail__cells">
            <textarea
              v-model="row.summary"
              rows="3"
              style="height: 59px; width: 100%"></textarea>
          </div> -->
          <!-- <div class="detail__cells detail__title">
            <span>詳細</span>
          </div>
          <div class="detail__cells">
            <textarea
              v-model="row.detail"
              rows="8"
              style="height: 157px; width: 100%"></textarea>
          </div> -->
          <!-- </div> -->
        </div>
        <div
          v-if="rows.length === (startIndex + index +1)"
          class="w-full flex justify-center mt-4">
          <Button
            @click="emits('addRow', $event)"
            class="add_Button"
            >データ追加</Button
          >
        </div>
      </div>

      <div v-if="rows.length === 0" class="w-full">
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
            <div
              class="h-full overflow-hidden flex justify-center items-center">
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
                      <Icon
                        icon="icons:mdi-fit-to-page-outline"></Icon> </Button
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
  </div>
</template>

<script setup lang="ts">
import { type dataValues } from "../../js/report_types";
import { ref, computed, nextTick, watch } from "vue";

/** pinia */
import { useSettingsStore } from "@/stores/settings";
const store = useSettingsStore();

import DropperBox from "./DropperBox.vue";
import { Button } from "../ui/button";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from "@/components/ui/pagination";

import { saveNewImage } from "../../js/images";
import { getDBImage, setDBImageTransform, deleteDBImage } from "../../js/IDB";
import Cropper from "cropperjs";
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
defineExpose({
  resetPage,
});

const rows = computed({
  get: () => props.modelValue,
  set: (inputted) => emits("update:modelValue", inputted),
});

const isTouchDevice = "ontouchstart" in window;
const isOpenDialog = ref(false);

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
 * ページング
 * ****************************************************
 */

const pageView = ref(1);
const pagingLength = ref("10");
const pagingLengthNumber = computed(() => {
  return parseInt(pagingLength.value);
});
const startIndex = computed((): number => {
  return parseInt(pagingLength.value) * (pageView.value - 1);
});

const viewRows = computed(() => {
  const pageLength = parseInt(pagingLength.value);
  // ページングで抽出したrowの配列を返す
  return rows.value.slice(
    startIndex.value,
    startIndex.value + pagingLengthNumber.value
  );
});

function resetPage() {
  pageView.value = 1;
  pagingLength.value = "10";
}

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
</script>

<style scoped>
cropper-image {
  transition-duration: 0.5s;
}

.rows {
  position: relative;
}
.rows:nth-of-type(3n) {
  counter-increment: pages 1;
}
.page_break::before {
  content: "↓ページ" attr(data-page);
  display: block;
  height: 0px;
  border-top: 1px solid var(--slate-200);
  margin-bottom: 13.2656px;
  text-align: center;
  line-height: 0;
  font-size: 0.9rem;
  color: var(--slate-400);
  text-shadow: 0 0 3px var(--slate-200);
}
.rows .command_buttons {
  display: none;
  position: absolute;
  z-index: 100;
  top: -1.2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 8em;
  padding: 4px 8px;
  border-radius: 4px;
  background: white;
  border: 1px solid var(--slate-200);
  box-shadow: 0px 0px 10px var(--slate-400);
}
.rows:hover .command_buttons,
.rows:hover .--image_command {
  display: block;
}

.rows .command_buttons details > summary {
  font-size: 0.8rem;
  text-align: center;
}
.rows .command_buttons ul {
  padding: 5px;
  list-style: none;
}
.rows .command_buttons ul li {
  font-size: 0.8rem;
  margin: 8px 4px;
  padding: 0;
  cursor: pointer;
}
.rows .command_buttons ul li:hover {
  background-color: var(--slate-200);
}
.rows .command_buttons ul li span {
  display: block;
}

.add_Button[data-limit="true"] {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.5;
}

.wrap {
  display: flex;
  /* border: 1px solid #000; */
}

.image__inner {
  aspect-ratio: 4 / 3;
  position: relative;
  /* height: 333px; */
}
.image__inner .--image_command {
  display: none;
  position: absolute;
  left: 0.5rem;
  top: -2rem;
}
.image__inner .command_buttons {
  position: absolute;
  z-index: 1;
  top: 0;
  left: -64px;
  width: 48px;
}
@media (max-width: 480px) {
  .image__inner {
    margin-bottom: 3rem;
  }
  .image__inner .command_buttons {
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 50%;
    width: auto;
    transform: translateX(-50%);
  }
}
.image__inner .command_buttons > * {
  margin: 4px 0;
}
.image__inner .image_droppable {
  transition-duration: 0.3s;
}
.image__inner .image_droppable.dragover {
  background-color: #c4daff !important;
}
.delete_image_show .v-icon {
  position: absolute !important;
  top: 0.5rem;
  left: 0.5rem;
}
.delete_image .v-icon {
  display: none;
}
/*
.detail {
  width: 240px;
  border-left: 1px solid #000;
  font-size: 14px;
}
.detail textarea {
  line-break: strict;
  resize: none;
  overflow: hidden;
  line-height: 20px;
}
.detail__cells {
  display: flex;
  border-bottom: 1px solid #000;
}
.detail__cells:last-child {
  border-bottom: none;
}
.detail__left {
  width: 149px;
}
.detail__right {
  width: 81px;
}
.detail__title {
  height: 18px;
  border-bottom-color: #ddd;
}
.detail__title + .detail__cells {
  border-top: none;
} */

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.table-group-item {
  cursor: move;
}
.delete-item {
  position: relative;
}
.delete-item .comfirm_delete {
  position: absolute;
  top: 50%;
  left: -50%;
  transform: translate(-50%, -50%);
}

.articleBox {
  display: grid;
  grid-template-columns: 406.078px 134.7px 110.906px;
  grid-template-rows: 32px 18px 47.7969px 18px 59px 18px 113.266px 13.2656px;
  gap: 0px 0px;
  grid-template-areas:
    "image number_title number"
    "image place_title place_title"
    "image place place"
    "image summary_title summary_title"
    "image summary summary"
    "image detail_title detail_title"
    "image detail detail"
    ". . .";

  font-size: 11pt;
  line-height: 1.2;
}
.articleBox textarea {
  resize: none;
}
.image {
  border: 1px solid #000;
}
.number,
.place,
.summary,
.detail {
  border-right: 1px solid #000;
}
.detail {
  border-bottom: 1px solid #000;
}
.number_title,
.number,
.place_title,
.summary_title,
.detail_title {
  border-right: 1px solid #000;
  border-top: 1px solid #000;
}
.number_title {
  border-right: none;
}
.place_title,
.summary_title,
.detail_title {
  border-bottom: 1px solid #ccc;
}

.image {
  border: 1px solid #000;
  grid-area: image;
}
.number_title {
  grid-area: number_title;
  display: flex;
  align-items: center;
}
.number {
  grid-area: number;
  display: flex;
  align-items: center;
  justify-content: center;
}
.place_title {
  grid-area: place_title;
}
.place {
  grid-area: place;
  text-align: center;
}
.summary_title {
  grid-area: summary_title;
}
.summary {
  grid-area: summary;
}
.detail_title {
  grid-area: detail_title;
}
.detail {
  grid-area: detail;
}
</style>

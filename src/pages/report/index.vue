<route>
  {
    meta: {
      appLink: 2,
      name_ja: "工事報告書作成",
      description_ja: "工事報告書を作成します。(制限版)",
    }
  }
</route>
<script lang="ts" setup>
// typescript で未定義のFilePicker系を定義
// @see https://developer.mozilla.org/ja/docs/Web/API/Window/showSaveFilePicker
declare global {
  interface Window {
    showSaveFilePicker?: (options: any) => Promise<FileSystemFileHandle>;
    showOpenFilePicker?: (options: any) => Promise<FileSystemFileHandle>;
    showDirectoryPicker?: (options: any) => Promise<FileSystemDirectoryHandle>;
  }
}

import { type dataValues } from "../../js/report_types";
import { ref, nextTick, watch, onMounted } from "vue";
import { useThrottledRefHistory } from "@vueuse/core";
import { setTemporarySave } from "../../js/IDB";
import * as EXCEL from "../../js/excel";
import { Workbook } from "exceljs";
import { saveNewImage } from "../../js/images";
import { cropImage } from "../../js/cropper";

import { toast } from "vue-sonner";
import PageView from "@/components/report/PageView.vue";
import ListView from "@/components/report/ListView.vue";
import CreateCover from "@/components/report/CreateCover.vue";
import TemporarysaveView from "@/components/report/TemporarysaveView.vue";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** pinia */
import { useSettingsStore, storeToRefs } from "@/stores/settings";
import { useCompanyStore } from "@/stores/company";
const settingStore = useSettingsStore();
const { useThemeFont } = settingStore; // データ数制限
const { appStatusText } = storeToRefs(settingStore);

const companyStore = useCompanyStore();
const { company } = storeToRefs(companyStore);

/**
 * ****************************************************
 * 変数定義
 * ****************************************************
 */
const useCover = ref(false);
const resroreMode = ref<"data" | "image">("data");
type Construction = {
  [key: string]: string;
  subject: string;
  name: string;
  period: string;
  company_name: string;
  rogo: string;
};
const construction = ref<Construction>({
  subject: "",
  name: "",
  period: "",
  company_name: company.value.会社名,
  rogo: company.value.ロゴ画像,
});

// データの初期化
const rowData: dataValues[] = [];
const rows = ref(rowData);

/**
 * ****************************************************
 * システム関数
 * ****************************************************
 */
const PageViewRef = ref<InstanceType<typeof PageView>>();
// 履歴管理(即時保存)
const { history, undo, redo } = useThrottledRefHistory(rows, {
  deep: true,
  capacity: 100,
  throttle: 1000,
});

// 復元用自動保存
let saveTimer = 0;
watch(
  rows,
  (newRows) => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (document.querySelector('[role="dialog"]')) return;
      setTemporarySave(JSON.stringify(newRows));
    }, 5000);
  },
  { deep: true }
);

// データの復元 event from TemporarysaveView
const restore = (data: string) => {
  rows.value = JSON.parse(data);
};

/**
 * キー操作イベント
 * Ctrl+zでundo、Ctrl+Shift+zでredo、Alt+sで保存、Alt+oで読み込み
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "z") {
      e.preventDefault(); // デフォルトの動作を無効化
      undo(); // Ctrl+Z (Undo)
    } else if (e.key === "Z") {
      e.preventDefault(); // デフォルトの動作を無効化
      console.log("redo");
      redo(); // Ctrl+Shift+Z (Redo)
    }
  }
  if (e.altKey) {
    if (e.key === "s") {
      e.preventDefault(); // デフォルトの動作を無効化
      exportHundler(); // Alt+s (Save)
    } else if (e.key === "o") {
      e.preventDefault(); // デフォルトの動作を無効化
      document.getElementById("secretloadfile")?.click(); // Alt+o (Open)Hidden　inputをクリック
    }
  }
};
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

const changeUseCover = (use: boolean) => {
  useCover.value = use;
};

/**
 * ****************************************************
 * EXCELテンプレートデータ初期化
 * ****************************************************
 */
let fileName: null | string = null,
  // temp_book: Workbook,
  temp_pages_ws: EXCEL.Worksheet | undefined,
  temp_header: EXCEL.Row[] | undefined = [],
  temp_rows: EXCEL.Row[] | undefined = [],
  rows_schma: EXCEL.RowValues = {};
const themeFont = ref<string[]>(["游ゴシック", "Calibri"]);

const temp_pages = "./xlsx/pages.xlsx";
const temp_cover = "./xlsx/cover.xlsx";

const sheet_fomat = {
  pageSetup: {
    // A4、縦、余白標準
    paperSize: 9,
    orientation: "portrait",
    margins: {
      // ページの余白=標準
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
  },
  order_in_page: ["header", "row", "row", "row"],
};

/**
 * ****************************************************
 * へルパー関数
 * ****************************************************
 */

/**
 * 親要素にdetailタグがあれば表示を閉じる
 */
function closeDetail(event: Event) {
  const target = event.target as HTMLElement;
  const parent = target.closest("details");
  if (parent) parent.removeAttribute("open");
}

/**
 * 一意のキーを取得する。16文字のBase64エンコード
 * @returns string
 */
function getUniqueKey(): string {
  const N = 16;
  return btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(N)))
  ).substring(0, N);
}

/**
 * 要素に--new-item-entryクラスを付与してアニメーションする
 * 終了時にクラスを削除する
 */
function addEntryAnimFromUniquekey(UNIQUEKEY: string): void {
  nextTick(() => {
    const target = document.querySelector(`[data-uniquekey="${UNIQUEKEY}"]`);
    console.log("addEntryAnimFromUniquekey", target);
    if (!target) return;
    target.classList.add("--new-item-entry");
    target.addEventListener("animationend", () => {
      target.classList.remove("--new-item-entry");
    });
  });
}

/**
 * UNIQUEKEYで指定したセルへスクロールする
 */
function scrollToFromUniqueKey(UNIQUEKEY: string): void {
  nextTick(() => {
    const target = document.querySelector(
      `[data-uniquekey="${UNIQUEKEY}"]`
    ) as HTMLElement;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/**
 * ****************************************************
 * EXCEL
 * ****************************************************
 */

// データの追加、削除
function addRow(e: MouseEvent, toAppendIndex?: number) {
  // console.log("addRow", toAppendIndex);
  const UNIQUEKEY = getUniqueKey();
  const emptyValue: dataValues = {
    UNIQUEKEY: UNIQUEKEY,
  };
  for (const key in rows_schma) {
    if (Object.prototype.hasOwnProperty.call(rows_schma, key)) {
      emptyValue[key] = null;
    }
  }

  if (toAppendIndex !== undefined) {
    rows.value.splice(toAppendIndex, 0, emptyValue);
  } else {
    rows.value.push(emptyValue);
  }
  addEntryAnimFromUniquekey(UNIQUEKEY);
  scrollToFromUniqueKey(UNIQUEKEY);

  closeDetail(e);
}

function addCopyRow(e: MouseEvent, UNIQUEKEY: string, toAppendIndex?: number) {
  // console.log("addCopyRow", toAppendIndex);
  const copiedIndex = rows.value.findIndex(
    (row) => row.UNIQUEKEY === UNIQUEKEY
  );
  const index = toAppendIndex ? toAppendIndex : copiedIndex;
  const copyRow = JSON.parse(JSON.stringify(rows.value[copiedIndex]));
  copyRow.UNIQUEKEY = getUniqueKey();
  rows.value.splice(index, 0, copyRow);

  closeDetail(e);
  addEntryAnimFromUniquekey(copyRow.UNIQUEKEY);
  scrollToFromUniqueKey(copyRow.UNIQUEKEY);
}

function deleteRow(e: MouseEvent, UNIQUEKEY: string) {
  const index = rows.value.findIndex((row) => row.UNIQUEKEY === UNIQUEKEY);
  rows.value.splice(index, 1);
  // console.log("delete Rows");
  closeDetail(e);
}

function moverow(e: MouseEvent, UNIQUEKEY: string, direction: "up" | "down") {
  const index = rows.value.findIndex((row) => row.UNIQUEKEY === UNIQUEKEY);
  if (direction === "up") {
    if (index === 0) return;
    const target = rows.value[index];
    rows.value.splice(index, 1);
    rows.value.splice(index - 1, 0, target);
  } else {
    if (index === rows.value.length - 1) return;
    const target = rows.value[index];
    rows.value.splice(index, 1);
    rows.value.splice(index + 1, 0, target);
  }

  addEntryAnimFromUniquekey(UNIQUEKEY);
  scrollToFromUniqueKey(UNIQUEKEY);
}

function clearRows() {
  // console.log("clear ALL Rows");
  construction.value = {
    subject: "",
    name: "",
    period: "",
    company_name: company.value.会社名,
    rogo: company.value.ロゴ画像,
  };
  rows.value.splice(0, rows.value.length);
  if (PageViewRef.value) {
    PageViewRef.value.resetPage();
  }
}
function clearRowsWithConfirm() {
  if (rows.value.length === 0) return;
  if (confirm("データをリセットしますか？")) {
    clearRows();
  }
}

/**
 * エクスポート、インポート
 */
// TODO?: printAreaの設定(今回は不要)
async function exportHundler(): Promise<void> {
  if (fileName === null)
    fileName = "工事報告書_" + new Date().toISOString().split("T")[0] + ".xlsx";
  const opts = {
    suggestedName: fileName,
    types: [
      {
        accept: {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
        },
      },
    ],
  };

  /**
   * ファイル保存処理
   * showSaveFilePickerは限定対応。保存先を選択できるようになる
   * それ以外は通常のダウンロード処理
   * toast.promiseの対応のため、Promiseを返す
   */
  const promise = (): Promise<string | null> =>
    new Promise((resolve, reject) => {
      if (window.showSaveFilePicker) {
        // const suggestedName = '工事報告書.xlsx'

        window
          .showSaveFilePicker(opts)
          .then((fileHandle) => {
            console.log("fileHandle", fileHandle);
            exportExcel(fileHandle);
            resolve(fileName);
          })
          .catch((e) => {
            console.error(e);
            reject();
          });
      } else {
        exportExcel();
        resolve(fileName);
      }
    });

  // 完了後トースト表示
  toast.promise(promise, {
    loading: "Saving...",
    success: (fileName: string | null) => {
      if (!fileName) fileName = "新規文書";
      return `${fileName} を保存しました`;
    },
    error: (data: any) => "保存されませんでした。",
  });

  async function exportExcel(fileHandle?: FileSystemFileHandle) {
    console.log(
      "rows",
      rows,
      "temp_rows",
      temp_rows,
      "fileHandle instance",
      fileHandle instanceof FileSystemFileHandle
    );
    if (temp_pages_ws === undefined) return alert("temp_pages_ws is undefined");

    const workbook = EXCEL.createBook();
    const sheet_pages = EXCEL.createSheetFromTemplate(
      workbook,
      "報告書",
      temp_pages_ws
    );
    // rowを非参照でコピー
    const rowsReader = JSON.parse(JSON.stringify(rows.value));

    // テンプレート内にデータ行が何行あるかを取得。それを元にページ数を計算する（端数切り上げ）
    const rowsPerPage = sheet_fomat.order_in_page.filter(
      (order) => order === "row"
    ).length;
    const allPagesNum = Math.ceil(rowsReader.length / rowsPerPage);
    console.log("allPagesNum", allPagesNum);

    let currentPagesNum = 0;
    let rowIndex = 0;
    // let printAreas: string[] | string = [];

    while (rowsReader.length > 0) {
      currentPagesNum++;
      // 行の追加法則に従ってデータを追加する。ヘッダーは各ページの先頭に追加される
      // 一部コメントは改ページ登録のためのコード
      sheet_fomat.order_in_page.forEach((order) => {
        if (order === "header") {
          if (temp_header === undefined) return;

          EXCEL.addRowFromTemp(
            temp_header,
            {
              pageinfo: {
                address: [0, 2],
                type: "string",
                val: `Page ${currentPagesNum} / ${allPagesNum}`,
              },
            },
            sheet_pages
          );
          // lastRow += temp_header.length;
        } else if (order === "row") {
          if (temp_rows === undefined) return; // なんでこれが関数の先頭にあるとエラーになるのかわからん
          // インデックスを足しながらデータを追加
          rowIndex++;
          const row = rowsReader.shift();
          if (row !== undefined) {
            const instData: EXCEL.RowValues = {};
            for (const prop in row) {
              if (Object.prototype.hasOwnProperty.call(row, prop)) {
                const value = rows_schma[prop];
                // UNIQUEKEYは除外
                if (prop === "UNIQUEKEY") continue;
                if (prop === "counter") {
                  value.val = rowIndex;
                } else if (prop === "image") {
                  // imageの場合は、DB検索用のkeyを追加する
                  value.val = row[prop];
                  value["key"] = row["UNIQUEKEY"];
                } else {
                  value.val = row[prop];
                }
                if (value !== null) {
                  instData[prop] = value;
                }
              }
            }
            EXCEL.addRowFromTemp(
              temp_rows as EXCEL.Row[],
              instData,
              sheet_pages
            );
          }
          // lastRow += temp_rows.length;
        }
      });
      // console.log("lastRow", lastRow);
    }

    // 表紙を使う
    if (useCover.value) {
      const logoImageBase64 = construction.value.rogo;
      // const logoImageUrl = "./images/logo.png";
      // テンプレートを読み込む
      const temp_cover_book = await EXCEL.readXlsxAjax(temp_cover);
      console.log("temp_cover_book", temp_cover_book);
      // EXCEL.readXlsxAjax(temp_cover).then((temp_cover_book: Workbook) => {
      const temp_ws_cover = temp_cover_book.getWorksheet(1);
      const constructionData: EXCEL.RowValues = {};

      if (temp_ws_cover === undefined || !temp_ws_cover.lastRow)
        return alert("worksheet template cover file is undefined");

      // テンプレートの行データを取得。1-12行目まで
      const cover_temp_rows = temp_ws_cover.getRows(1, 12);
      if (!cover_temp_rows) {
        return alert("cover_temp_rows is null");
      }
      // スキーマを作成し、データを反映させる
      const cover_rows_schma = EXCEL.createRowsSchma(cover_temp_rows);
      // 表紙シートを作成
      const sheet_cover = EXCEL.createSheetFromTemplate(
        workbook,
        "表紙",
        temp_ws_cover
      );
      sheet_cover.pageSetup = Object.assign(
        sheet_cover.pageSetup,
        sheet_fomat.pageSetup
      );
      sheet_cover.properties.defaultColWidth = 200;

      // データ名は固定なのでここで代入する。
      const constructionHeader: { [key: string]: string } = {
        subject: "【件　　名】　",
        name: "【工 事 名】　",
        period: "【工　　期】　",
      };
      for (const key in cover_rows_schma) {
        const value = cover_rows_schma[key];
        if (value !== null) {
          value.val = constructionHeader[key] + construction.value[key];
          constructionData[key] = value;
        }
      }

      // console.log(
      //   "constructionData",
      //   constructionData,
      //   "cover_temp_rows",
      //   cover_temp_rows
      // );
      // シートへデータを反映
      EXCEL.addRowFromTemp(cover_temp_rows, constructionData, sheet_cover);

      // 会社ロゴの挿入

      // './images/logo.png'を読み込みbase64に変換
      const logoImageCell = sheet_cover.getCell("A10") as EXCEL.Cell;
      // console.log("logoImageCell", logoImageCell);
      const imageBase64 = await EXCEL.createCellContainImage(
        logoImageCell,
        logoImageBase64
      );
      const imageID = workbook.addImage({
        base64: imageBase64,
        extension: "png",
      });
      sheet_cover.addImage(imageID, "A10:A10");
    }
    console.log("export workbook", workbook);

    // printAreas.push(
    //   worksheet.getCell(firstRow + 1, 1).address +
    //     ":" +
    //     worksheet.getCell(lastRow, worksheet.columns.length).address
    // );
    // console.log("printAreas", printAreas);

    // printAreas = printAreas.join("&&");
    // worksheet.pageSetup.printArea = printAreas;
    if (fileName === null) {
      console.error("fileName is null");
      fileName = "test";
    }
    if (fileHandle) {
      EXCEL.writeXlsx(workbook, fileHandle).then(() => {
        console.log("export success");
        if (fileName === null) fileName = "test";
      });
    } else {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      console.log("blob", blob);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
    }
  }
}

async function inportHundler(e: Event) {
  e.preventDefault();
  if (e.target === null) return console.error("target is null");
  const files = (e.target as HTMLInputElement).files;
  if (files === null || files[0] === undefined)
    return console.error("files is null");
  const file = files[0];

  /**
   * ファイル読み込み
   * toast.promiseの対応のため、Promiseを返す
   */
  const promise = (): Promise<string | null> =>
    new Promise((resolve) => {
      readExcel(file).then(() => {
        resolve(fileName);
      });
    });
  // 完了後トースト表示
  toast.promise(promise, {
    loading: "Loading...",
    success: (fileName: string | null) => {
      if (!fileName) fileName = "新規文書";
      return `${fileName} を読み込みました`;
    },
    error: (data: any) => "Error",
  });

  async function readExcel(file: File) {
    fileName = file.name;
    appStatusText.value = fileName;

    const loadBook = await EXCEL.readXlsxInput(file);
    /**
     * 報告書のロード
     */
    // const load_reportWs = loadBook.getWorksheet(1)
    const load_reportWs = loadBook.getWorksheet("報告書");
    // console.log("loadBook", loadBook, "load_reportWs", load_reportWs);
    if (load_reportWs === undefined)
      return console.error("worksheet is undefined");

    clearRows();

    const pageHeaderRowsLength = 1;
    const pageDataSchema = [8, 8, 8];
    const lastRow = load_reportWs.lastRow?.number
      ? load_reportWs.lastRow.number
      : 0;
    let currentRow = 0;
    // テンプレート書式のセルを取得するための正規表現
    const regTemplateCell = new RegExp(/{{.+}}/g);
    // 画像の配置リストを取得
    // @ts-expect-error _mediaはprivateなので、型定義には存在しない
    const mediaBuffers = load_reportWs._media.map((media) => {
      // @ts-expect-error mediaはprivateなので、型定義には存在しない
      return loadBook.media[media.imageId].buffer;
    });

    // console.log('mediaList', mediaBuffers)
    // console.log("rows_schma", rows_schma);

    while (currentRow < lastRow) {
      currentRow = currentRow + pageHeaderRowsLength;
      for (let rowLength = 0; rowLength < pageDataSchema.length; rowLength++) {
        const len = pageDataSchema[rowLength];
        // console.log('currentRow', currentRow, 'len', len, 'currentRow + len', currentRow + len)
        const loadRows = load_reportWs.getRows(currentRow, currentRow + len);
        if (loadRows === undefined)
          return console.error("loadRows is undefined");
        const rowValue: { [key: string]: string | null } = {};
        for (const prop in rows_schma) {
          if (Object.prototype.hasOwnProperty.call(rows_schma, prop)) {
            if (prop === "counter") continue;
            if (prop === "image") {
              // 画像の場合は、mediaBuffersから取得する。形式上インデックス順にmediaBuffersに保存されているのでshiftで取得する
              const buffer = mediaBuffers.shift();
              if (buffer) {
                const blob = new Blob([buffer], { type: "image/png" });
                const item = rows_schma[prop];
                const cell = loadRows[item.address[0] + 1].getCell(
                  item.address[1]
                );
                // セルの値がテンプレート書式ではない場合は、値をUNIQUEKEYとして扱う
                if (!regTemplateCell.test(cell.value as string)) {
                  rowValue[prop] = cell.value as string;
                }
                rowValue[prop] = await readBlobImageSync(blob);
              }
              continue;
            }
            const item = rows_schma[prop];
            const cell = loadRows[item.address[0] + 1].getCell(item.address[1]);
            rowValue[prop] = cell.value as string;
          }
        }
        // rowValue内の値が全てnullの場合は追加しない
        const isAllNull = Object.values(rowValue).every(
          (value) => value === null
        );
        if (!isAllNull) {
          // counterとUNIQUEKEYを追加しdataValuesに適応させる
          rowValue["counter"] = null;
          if (!Object.prototype.hasOwnProperty.call(rowValue, "UNIQUEKEY"))
            rowValue["UNIQUEKEY"] = getUniqueKey();

          rows.value.push(rowValue as dataValues);
          currentRow = currentRow + len;
        }
      }
    }

    /**
     * 表紙のロード
     */
    const load_coverWs = loadBook.getWorksheet("表紙");
    // eslint全角スペースエラーは除外
    const constructionTitlesReg = new RegExp(
      /【件　　名】　|【工 事 名】　|【工　　期】　/g
    ); // eslint-disable-line

    if (load_coverWs) {
      useCover.value = true;
      EXCEL.readXlsxAjax(temp_cover).then((temp_cover_book: Workbook) => {
        const temp_ws_cover = temp_cover_book.getWorksheet(1);
        if (temp_ws_cover === undefined || !temp_ws_cover.lastRow)
          return alert("worksheet template cover file is undefined");

        const cover_temp_rows = temp_ws_cover.getRows(1, 12);
        if (!cover_temp_rows) {
          return alert("cover_temp_rows is null");
        }
        const cover_rows_schma = EXCEL.createRowsSchma(cover_temp_rows);

        for (const key in cover_rows_schma) {
          const value = cover_rows_schma[key];
          if (value !== null) {
            // データの取得。行は+1して参照する
            const cell = load_coverWs.getCell(
              value.address[0] + 1,
              value.address[1]
            );
            if (cell.value !== null) {
              // 件名、工事名、工期のタイトル部分は削除
              const cellValue = (cell.value as string).replace(
                constructionTitlesReg,
                ""
              );
              construction.value[key] = cellValue;
            }
          }
        }
      });
    }

    function readBlobImageSync(blob: Blob): Promise<string> {
      return new Promise((resolve, reject) => {
        // bufferからbase64画像を生成する
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target === null) return;
          resolve(e.target.result as string);
        };
        reader.onerror = (e) => {
          reject(e);
        };
        reader.readAsDataURL(blob);
      });
    }
  }
  // console.log("rows", rows);
}

/**
 * 画像を一括で登録する
 * @param files File[] 画像ファイル（複数）
 */
async function addRowFromMultiImages(files: File[] | Event): Promise<void> {
  if (files instanceof Event) {
    const target = files.target as HTMLInputElement;
    files = target.files ? Array.from(target.files) : [];
  }
  if (files.length === 0) return;

  function readImage(file: File): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!file) reject(console.error("file is null"));
      if (Array.isArray(file)) file = file[0];
      const key = getUniqueKey();
      saveNewImage(file, key, async (image, key) => {
        let preViewImage = await cropImage(image);
        if (!preViewImage) preViewImage = image;
        const emptyValue: dataValues = {
          UNIQUEKEY: key,
        };
        for (const key in rows_schma) {
          if (Object.prototype.hasOwnProperty.call(rows_schma, key)) {
            if (key === "image") {
              emptyValue[key] = preViewImage;
            } else {
              emptyValue[key] = null;
            }
          }
        }
        rows.value.push(emptyValue);
        resolve();
      });
    });
  }

  /**
   * 画像の読み込み処理
   * toast.promiseの対応のため、Promiseを返す
   */
  const loadPromise = (): Promise<void> =>
    new Promise(async (resolve) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await readImage(file);
      }
      resolve();
    });
  // 完了後トースト表示
  toast.promise(loadPromise, {
    loading: "Loading...",
    success: files.length + "枚の画像を追加しました",
    error: "Error",
  });

  // console.log("allRows", rows);
}

/**
 * ****************************************************
 * initialize
 * ****************************************************
 */
function init() {
  // テンプレートファイルの読み込み。ページのみ
  EXCEL.readXlsxAjax(temp_pages).then((book: Workbook) => {
    temp_pages_ws = book.getWorksheet(1);
    if (!temp_pages_ws) return;
    temp_pages_ws.pageSetup = Object.assign(
      temp_pages_ws.pageSetup,
      sheet_fomat.pageSetup
    );

    if (temp_pages_ws.lastRow) {
      temp_header = [temp_pages_ws.getRow(1)];
      temp_rows = temp_pages_ws.getRows(2, 8);
      if (temp_rows) {
        rows_schma = EXCEL.createRowsSchma(temp_rows);
      } else {
        console.error("temp_rows is null");
      }
      console
        .log
        // 'init temp_book',
        // temp_book,
        // "temp_rows",
        // temp_rows,
        // "rows_schma",
        // rows_schma,
        // "rows",
        // rows
        ();
      const fonts = EXCEL.getThemeFonts(book);
      // console.log("fonts", fonts);
      themeFont.value = [fonts[0].minorFont.jpan, fonts[0].minorFont.latin];
    }
  });
}

init();
</script>
<template>
  <div class="report-container">
    <!-- #secretloadfile Alt+o キーボード操作専用隠し要素 -->
    <input
      type="file"
      class="hidden"
      id="secretloadfile"
      name="excelfile"
      accept=".xlsx"
      @change="inportHundler($event)" />
    <div class="--report_header_flexify report-head px-2 py-2 md:py-0">
      <h1
        class="scroll-m-20 text-center text-4xl font-extrabold tracking-tight lg:text-5xl">
        工事報告書作成
      </h1>
      <div class="flex justify-center top-2 my-6 md:my-2">
        <Dialog>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger class="">新規作成</MenubarTrigger>
              <MenubarContent>
                <MenubarItem style="padding: 0">
                  <span class="w-full px-2 py-1.5" @click="clearRowsWithConfirm"
                    >データをリセット</span
                  >
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem style="padding: 0">
                  <label class="w-full px-2 py-1.5"
                    >画像一括追加
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/gif, image/jpg, image/heic"
                      @change="addRowFromMultiImages"
                      class="hidden"
                      multiple /></label
                ></MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>読み込み</MenubarTrigger>
              <MenubarContent>
                <MenubarItem style="padding: 0">
                  <label class="w-full px-2 py-1.5"
                    >ファイルを選択
                    <input
                      type="file"
                      class="hidden"
                      id="loadfile"
                      name="excelfile"
                      accept=".xlsx"
                      @change="inportHundler($event)" />
                  </label>
                  <MenubarShortcut>Alt+o</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>保存</MenubarTrigger>
              <MenubarContent>
                <MenubarItem style="padding: 0">
                  <span class="w-full px-2 py-1.5" @click="exportHundler"
                    >エクセルで出力する</span
                  >
                  <MenubarShortcut>Alt+S</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem @click="undo()">
                  <span class="w-full">戻る</span>
                  <MenubarShortcut>Ctrl+z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem @click="redo()">
                  <span class="w-full">進む</span>
                  <MenubarShortcut>Ctrl+Shift+z</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                  <DialogTrigger as-child>
                    <span class="w-full">データを復元</span>
                  </DialogTrigger>

                  <!-- </Dialog> -->
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <DialogContent class="sm:max-w-[300px] md:max-w-[480px]">
              <DialogHeader
                ><DialogTitle class="text-center">データ復元</DialogTitle
                ><DialogDescription>
                  ブラウザに自動保存された履歴からデータを復元します。<br />誤ってデータを消去したり、ブラウザを閉じてしまった場合にご利用ください。
                </DialogDescription></DialogHeader
              >
              <TemporarysaveView @putRestoreValue="restore" />
            </DialogContent>
          </Menubar></Dialog
        >
      </div>
    </div>
    <div
      class="w-full flex justify-center sticky top-2 p-4 md:my-8"
      :style="{ fontFamily: useThemeFont ? themeFont.join(', ') : '' }">
      <Tabs default-value="page_view" class="flex flex-wrap justify-center">
        <TabsList class="grid max-w-96 grid-cols-3 sticky top-2 z-10 shadow-md">
          <TabsTrigger value="page_view">ページビュー</TabsTrigger>
          <TabsTrigger value="list_view">リストビュー</TabsTrigger>
          <TabsTrigger value="cover"> 表紙作成 </TabsTrigger>
        </TabsList>
        <TabsContent value="page_view" class="w-full">
          <PageView
            ref="PageViewRef"
            v-model="rows"
            @addRow="addRow"
            @addCopyRow="addCopyRow"
            @moveRow="moverow"
            @deleteRow="deleteRow"
            @addRowFromMultiImages="addRowFromMultiImages" />
        </TabsContent>
        <TabsContent value="list_view" class="w-full">
          <ListView
            v-model="rows"
            @addRow="addRow"
            @addCopyRow="addCopyRow"
            @moveRow="moverow"
            @deleteRow="deleteRow"
            @addRowFromMultiImages="addRowFromMultiImages" />
        </TabsContent>
        <TabsContent value="cover" class="w-full">
          <CreateCover v-model="construction" v-model:use-cover="useCover" />
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
<style scoped>
[role="menubar"] button {
  cursor: pointer;
}
[role="menubar"] button:hover {
  background-color: hsl(var(--muted));
}
.--report_header_flexify {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
@media (min-width: 768px) {
  .--report_header_flexify {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>

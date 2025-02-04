// ExcelJSのヘルパー関数をまとめたファイルです。
// https://github.com/exceljs/exceljs?tab=readme-ov-file
"use strict";
import ExcelJS from "exceljs";
import {
  isDate,
  isCellHyperlinkValue,
  isCellRichTextValue,
} from "./TypeGuards";
// const toString = Object.prototype.toString;// isDate用。いらないかもしれない

export type Row = ExcelJS.Row;

export type Worksheet = ExcelJS.Worksheet;

export interface Cell extends ExcelJS.Cell {
  _row: ExcelJS.Row;
  _column: ExcelJS.Column;
}

/**
 * 新規エクセルブックを作成する関数です。
 * @returns
 */
export function createBook(): ExcelJS.Workbook {
  return new ExcelJS.Workbook();
}

/**
 * テンプレートを元に新規シートを作成する関数です。
 * @param book
 * @param sheetName
 * @param template
 * @returns
 */
export function createSheetFromTemplate(
  book: ExcelJS.Workbook,
  sheetName: string,
  template: ExcelJS.Worksheet
): ExcelJS.Worksheet {
  const newSheet = book.addWorksheet(sheetName);

  // シートのプロパティをコピー
  newSheet.properties = template.properties;
  newSheet.pageSetup = template.pageSetup;
  newSheet.views = template.views;
  newSheet.headerFooter = template.headerFooter;
  newSheet.autoFilter = template.autoFilter;
  newSheet.state = template.state;
  newSheet.columns = template.columns;

  return newSheet;
}

export function writeXlsx(
  workbook: ExcelJS.Workbook,
  fileHandle: FileSystemFileHandle
): Promise<void> {
  return new Promise((resolve) => {
    workbook.xlsx.writeBuffer().then(async (data) => {
      // console.log(data)
      /* -------use Nodejs------- */
      // const result = await window.api.saveFile(data as Buffer)
      // console.log(result)

      /* -------use Browser------- */
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      // 書き込み先の FileSystemWritableFileStream を作成する
      const writable = await fileHandle.createWritable();

      // ファイルの内容をストリームに書き込む
      await writable.write(blob);

      // ファイルを閉じ、内容をディスクに書き込む
      await writable.close();
      resolve();

      // writeFile(fileHandle, blob)

      // if (window.showSaveFilePicker === undefined) {
      //   const url = window.URL.createObjectURL(blob)
      //   const a = document.createElement('a')
      //   a.href = url
      //   a.download = 'pages.xlsx'
      //   a.click()
      //   window.URL.revokeObjectURL(url)
      // } else {
      //   // const suggestedName = '工事報告書.xlsx'
      //   const suggestedName =
      //     loadedFileName || '工事報告書_' + new Date().toISOString().split('T')[0] + '.xlsx'
      //   const opts = {
      //     suggestedName: suggestedName,
      //     types: [
      //       {
      //         accept: {
      //           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
      //         }
      //       }
      //     ]
      //   }
      //   window.showSaveFilePicker(opts).then((fileHandle) => {
      //     console.log('fileHandle', fileHandle)
      //   writeFile(fileHandle, blob)
      //   }).catch((e) => {
      //     console.error(e)
      //   })
      //   // const fileHandle = await window.showSaveFilePicker(opts)
      //   // console.log('fileHandle', fileHandle)
      //   // writeFile(fileHandle, blob)
      // }
    });
  });
}
// async function writeFile(fileHandle: FileSystemFileHandle, contents: Blob) {
//   // 書き込み先の FileSystemWritableFileStream を作成する
//   const writable = await fileHandle.createWritable()

//   // ファイルの内容をストリームに書き込む
//   await writable.write(contents)

//   // ファイルを閉じ、内容をディスクに書き込む
//   await writable.close()
// }

export function readXlsxInput(file: File): Promise<ExcelJS.Workbook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as ArrayBuffer | null;
      if (data === null) return reject("ファイルが読み込めません");

      const book = new ExcelJS.Workbook();
      book.xlsx.load(data).then((book: ExcelJS.Workbook) => {
        resolve(book);
      });
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
}

export function readXlsxAjax(url: string): Promise<ExcelJS.Workbook> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = () => {
      const data = xhr.response;
      if (data === null) return reject("ファイルが読み込めません");

      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.load(data).then((book: ExcelJS.Workbook) => {
        resolve(book);
      });
    };
    xhr.onerror = (e) => {
      reject(e);
    };
    xhr.send();
  });
}

/**
 * ExcelJSのセル値代入用テンプレートを設定する関数。 assignCellValueで使用する。
 * rows: ExcelJS.Row[]を受け取り、全てのセルを走査。
 * 値が{{  <type>name}}のセルを見つけたら、tempオブジェクトに{ name : {adress,type,value} }を登録し、その後、tempオブジェクトを返します。
 * @param rows
 * @returns {rows:設定された行,template:{プロパティ名:[セルの行,セルの列]}...}のオブジェクト
 *
 * type CellValuesType =
 * | string
 * | number
 * | boolean
 * | Date
 * | ExcelJS.CellHyperlinkValue
 * | ExcelJS.CellRichTextValue
 * | null;
 */
export interface RowValues {
  [keys: string]: {
    address: [number, number];
    type: string;
    val: ExcelJS.CellValue;
    style?: {
      fontSize: number;
      height: number;
      width: number;
    };
    key?: string;
  };
}
export function createRowsSchma(rows: ExcelJS.Row[]): RowValues {
  const temp: RowValues = {};
  rows.forEach((row, rowNum) => {
    row.eachCell((cell, cellNum) => {
      if (cell.type === 1) return;
      if (cell.value) {
        const match = cell.value.toString().match(/{{\s*(\S*?)\s*}}/);
        if (match) {
          const prop = match[1];
          const matchValue = prop.match("^<(.+?)>(.+)");
          if (matchValue === null)
            return "テンプレートセル不正=>" + cell.address;
          temp[matchValue[2]] = {
            address: [rowNum, cellNum],
            type: matchValue[1],
            val: null,
            style: {
              fontSize: cell.font.size || 11,
              // @ts-ignore heightとwidthはprivateなので、型定義には存在しない
              width: cell._column.width,
              // @ts-ignore heightとwidthはprivateなので、型定義には存在しない
              height: cell._row.height,
            },
          };
        }
      }
    });
  });
  return temp;
}

/**
 * Cellに値を割り当てる関数です。セルのタイプによって値の型をチェックし、バリデーションチェックしながら割り当てます。
 * @param cell
 * @param type
 * @param value
 * @returns
 */
function assignCellValue(cell: ExcelJS.Cell, insertValue: any): void {
  let errorMsg = "";
  const type = insertValue.type;
  const value = insertValue.val;
  // nullの場合はnullを代入
  if (value === null || value === undefined) {
    cell.value = null;
    return;
  }
  switch (type) {
    case "date":
      if (typeof value === "boolean")
        console.error("日付セルに日付以外の値が入力されました");
      if (toString.call(new Date()) === "[object Date]") {
        cell.value = value as Date;
      } else {
        const date = new Date(value as string);
        if (Number.isNaN(date.getTime())) {
          cell.value = date;
        } else {
          console.error("日付セルに日付以外の値が入力されました");
        }
      }
      break;

    case "hyperlink":
      errorMsg =
        "ハイパーリンクセルに不適切な値が入力されました。{text:string,hyperlink:string,tooltip?: string;}の形式で入力してください";
      if (isCellHyperlinkValue(value)) {
        cell.value = {
          text: value.text,
          hyperlink: value.hyperlink,
          tooltip: value.tooltip,
        };
      } else {
        console.error(errorMsg);
      }
      break;

    case "rich-text":
      errorMsg =
        "リッチテキストセルに不適切な値が入力されました。規定のオブジェクトで入力してください https://github.com/exceljs/exceljs?tab=readme-ov-file#rich-text";
      if (typeof value === "object" && !isDate(value)) {
        if (isCellRichTextValue(value)) {
          cell.value = value;
        } else {
          console.error(errorMsg);
        }
      }
      break;
    case "boolean":
      if (typeof value !== "boolean")
        return console.error("ブールセルにブール以外の値が入力されました");
      cell.value = value;
      break;
    case "image": {
      if (typeof value !== "string")
        return console.error("画像セルに文字列以外の値が入力されました");
      const ext = value.split(";")[0].split("/")[1];
      type imageExtension = "jpeg" | "png" | "gif"; // Move the declaration here
      if (ext) {
        // => base64
        if (ext !== "jpeg" && ext !== "png" && ext !== "gif") {
          return console.error(
            "画像セルに不適切なファイル形式が入力されました"
          );
        }

        const imageID = cell.workbook.addImage({
          base64: value,
          extension: ext as imageExtension,
        });

        if (cell.isMerged) {
          const address = cell.worksheet.model.merges.find(
            (merge) => merge.indexOf(cell.address) === 0
          );
          if (address === undefined)
            return console.error(
              "システムエラー マージされたセルのアドレスが見つかりません"
            );
          // console.log('Merged address', address, cell.worksheet.model.merges)
          cell.worksheet.addImage(imageID, address);
        } else {
          console.log("addImage address");
          cell.worksheet.addImage(imageID, `${cell.address}:${cell.address}`);
        }

        if (insertValue.key) {
          // cellの値にはUNIQUEKEYを入れる（元画像の再読み込みに必要なため）
          cell.value = insertValue.key;
          // cellの文字色を透明化する
          cell.font = { color: { argb: "FFFFFFFF" } };
        } else {
          cell.value = "{{<image>image}}";
        }
      } else {
        // TODO: 画像のURLを指定して貼り付ける
        return console.error(
          "画像セルに不適切な文字列が入力されました。画像セルにはbase64形式の画像データを入力してください"
        );
      }
      break;
    }
    case "number":
      if (typeof value === "number") {
        cell.value = value;
      } else {
        console.error("数値セルに数値以外の値が入力されました");
      }
      break;
    case "string":
      if (typeof value !== "string")
        return console.error("文字列セルに文字列以外の値が入力されました");
      cell.value = value;
      break;
    // TODO: Null Value,Formula Value,Error Valueの実装
    default:
      console.error("不明なセルタイプです");
  }
}

/**
 * createRowsSchmaで作成したテンプレートにデータを割り当てる関数です。rowsAddToにも適用可能。
 * temp:RowsValusとdata:{[key: string]: any}を受け取り、
 * temp.templateに基づいてdataの値を割り当てます。
 * @param temp ExcelJS.Row[]
 * @param data RowValues
 */
export function assignRowValues(
  temp: ExcelJS.Row[],
  data: RowValues
): ExcelJS.Row[] {
  // コピーされるために、tempのメディア情報をリセットする
  const WS = temp[0].worksheet;
  const WB = WS.workbook;
  // @ts-expect-error mediaはprivateなので、型定義には存在しない
  WB.media = [];
  // @ts-expect-error _mediaはprivateなので、型定義には存在しない
  WS._media = [];

  // console.log('assignRowValues', WS)

  // dataの値をtempに割り当てる
  for (const prop in data) {
    const insertValue = data[prop];
    const cell = temp[insertValue.address[0]].getCell(insertValue.address[1]);
    assignCellValue(cell, insertValue);
  }
  return temp;
}

function copyMedia(
  sheetFrom: ExcelJS.Worksheet,
  sheetTo: ExcelJS.Worksheet,
  startRow: number
) {
  const WB_media_from = sheetFrom.workbook.model.media;
  const WS_media_from = sheetFrom.getImages();
  const WB_to = sheetTo.workbook;

  // console.log('copyMedia', WB_media_from, WS_media_from)

  for (let i = 0; i < WB_media_from.length; i++) {
    const media = WB_media_from[i];
    if (media.type === "image") {
      // book_fromのmedia情報からbook_toに画像を追加する。media情報内のオブジェクトからImageオブジェクトを作成するが、Imageオブジェクトはtypeプロパティを持っていないので、削除する
      const prop = JSON.parse(JSON.stringify(media));
      delete prop.type;
      const newImageID = WB_to.addImage(prop as ExcelJS.Image);

      // sheet_fromのmedia情報からmediaを使用している画像のオブジェクトを取得する
      const usedImage = WS_media_from.filter(
        (ws_image) => Number(ws_image.imageId) === i
      );
      for (const image of usedImage) {
        // console.log("image.range", image.range);
        image.range.br.nativeRow =
          image.range.br.nativeRow - image.range.tl.nativeRow + startRow;
        image.range.tl.nativeRow = startRow;
        // console.log("image add sheet");
        sheetTo.addImage(newImageID, image.range);
      }
    } else {
      // TODO: backgroundタイプへの対応。ただbook内の値なので多分ないはず
      console.warn("未対応のメディアタイプです", media);
    }
  }
}

/**
 * エクセルの行選択⇒コピーの代替関数。コピー先は値渡し、末尾に追加される。
 * ExcelJSでgetRowsを使って取得した複数行をコピーして、addRowsで新しい行を追加する。
 * スタイルやマージセルもコピーするかどうかはdeepCopyで指定します。
 * @param rows コピー元の行(ExcelJS.Row[])
 * @param worksheet 貼り付けるシート
 * @param deepCopy 行・セルごとのスタイルやマージセルのコピー可否
 * @returns 追加された行
 */
export function rowsAddTo(
  rows: ExcelJS.Row[],
  worksheet: ExcelJS.Worksheet,
  deepCopy: boolean = false
): ExcelJS.Row[] {
  const startRow = worksheet.lastRow ? worksheet.lastRow.number : 0;

  // rowsの値の配列を取得して、新しい行をまとめて追加する
  const rowValues = rows.map((row) => row.values);
  const addedRows = worksheet.addRows(rowValues);

  // deepCopyがtrueの場合、更にスタイルやマージセルもコピーする
  if (deepCopy) {
    /**
     * [mergeTable]
     * マージセルのマスターセルとスレーブセル末尾を保存する変数。key:valueを
     * [旧マスターセルのアドレス(ループ時参照用)]:{
     *  start:旧マスターセルのアドレスに対応した新セルのアドレス
     *  end:スレーブ対象の新セル
     * }
     * とする
     * ループの仕組みから、マスターに従ずるスレーブセル(end)はスレーブセルの発生ごとに更新し続けると
     * 最後はマージするセルのrightBottomになり
     * "start:end.address"で範囲を表すことができる
     * 全ての主従を登録したら、一括してマージする
     * endをセルで保持しているのは、マージ後にスタイルを適用するため↓[適応バッチ]
     */

    const mergeTable: {
      [keys: string]: {
        start: string;
        end: ExcelJS.Cell;
      };
    } = {};

    rows.forEach((row_from, index) => {
      // indexの同じ追加行に高さや非表示、スタイルをコピーする
      const row_to = addedRows[index];
      row_to.height = row_from.height;
      row_to.hidden = row_from.hidden;
      // @ts-expect-error styleはprivateなので、型定義には存在しない
      row_to.style = row_from.style;

      // セルごとにスタイルをコピーしマージ情報を登録する
      row_from.eachCell(
        {
          includeEmpty: true,
        },
        (cell_from, colNumber) => {
          const cell_to = row_to.getCell(colNumber);
          cell_to.style = cell_from.style;

          if (cell_from.isMerged) {
            if (cell_from.address === cell_from.master.address) {
              // アドレスが同じ場合はマスターセル。新旧セルのアドレス変換表に登録する
              mergeTable[cell_from.address] = {
                start: cell_to.address,
                end: cell_to,
              };
            } else {
              // アドレスが異なる場合はスレーブセル。マスターセルのendを更新する
              mergeTable[cell_from.master.address].end = cell_to;
            }
          }
        }
      );
    });
    // console.log("mergeTable", mergeTable);
    /**
     * セルの一括マージ。mergeTableからループで取得したvalueを使ってマージする
     * [適応バッチ] 最終セルのスタイルが保持されずborderが消える問題を解決するため、
     * endセルのスタイルを保持し、マージ後の最終セルに保持したスタイルを適用する
     */
    for (const key in mergeTable) {
      if (Object.prototype.hasOwnProperty.call(mergeTable, key)) {
        const merge = mergeTable[key];
        const saveCellStyle = merge.end.style;
        worksheet.mergeCells(merge.start + ":" + merge.end.address);
        merge.end.style = saveCellStyle;
      }
    }
  }

  // 画像情報をコピーする
  copyMedia(rows[0].worksheet, worksheet, startRow);
  return addedRows;
}

/**
 * addRowFromTemp → rowsAddTo の一連の処理をまとめた関数です。
 *
 * @param temp Row[]
 * @param data RowValues
 * @param worksheet ExcelJS.Worksheet
 */
export function addRowFromTemp(
  temp: Row[],
  data: RowValues,
  worksheet: ExcelJS.Worksheet
) {
  const rowValues = assignRowValues(temp, data);
  // console.log('rowValues', rowValues)
  rowsAddTo(rowValues, worksheet, true);
}

/**
 * セル内に収まる最大の画像を生成する。セルサイズの透過画像を作成し上下左右中央に画像を配置する
 * @param cell
 * @param imageUrl
 */
export function createCellContainImage(
  cell: Cell,
  imageUrl: string
): Promise<string> {
  // 参考 : https://github.com/exceljs/exceljs/issues/467
  // 結論 : exceljsのバグ。画像を引き延ばさず規定サイズ外のセルに収めるための設定ができない。ので独自実装する
  return new Promise((resolve) => {
    function createNewImage(img: HTMLImageElement) {
      // セルのサイズをピクセルに変換する係数。幅は基本のフォント設定から算出するので、環境によって替わる可能性がある
      const widthToPixelCoefficient = 8.05;
      const heightToPixelCoefficient = 1.33;

      if (img.width === 0 || img.height === 0)
        return console.error("image size is undefined");
      if (cell._column.width === undefined || cell._row.height === undefined)
        return console.error("cell size is undefined");

      // 画像の高さと幅と縦横比を取得
      const imageWidth = img.width;
      const imageHeight = img.height;

      // セルの高さと幅をピクセルに変換すし、縦横比を取得する
      const cellWidthPxcel = cell._column.width * widthToPixelCoefficient;
      const cellHeightPxcel = cell._row.height * heightToPixelCoefficient;

      const drawImageSettings = {
        dx: 0,
        dy: 0,
        dWidth: 0,
        dHeight: 0,
      };

      // 画像とセルの縦横毎に倍率を比較し、値が小さい方を短辺とし基準の縮尺に決定する
      // longSideは長辺側の判定。squareの場合はどちらでもいい
      const widthRatio = cellWidthPxcel / imageWidth;
      const heightRatio = cellHeightPxcel / imageHeight;
      let scale = 1,
        longSide = "";
      if (widthRatio === heightRatio) {
        scale = widthRatio;
        longSide = "square";
      } else {
        scale = Math.min(widthRatio, heightRatio);
        longSide = widthRatio > heightRatio ? "width" : "height";
      }

      drawImageSettings.dWidth = imageWidth * scale;
      drawImageSettings.dHeight = imageHeight * scale;
      // 左右上下中央配置のための余白の設定。セルの縦横比と画像の縦横比が異なる場合、余白を設ける
      switch (longSide) {
        case "width":
          /* default drawImageSettings.dy = 0 */
          drawImageSettings.dx =
            (cellWidthPxcel - drawImageSettings.dWidth) / 2;
          break;

        case "height":
          /* default drawImageSettings.dx = 0; */
          drawImageSettings.dy =
            (cellHeightPxcel - drawImageSettings.dHeight) / 2;
          break;

        default: // square
          /* default drawImageSettings.dx = drawImageSettings.dy = 0; */
          break;
      }

      // セルサイズのCanvasを作成し、その中に画像を配置する
      const canvas = document.createElement("canvas");
      canvas.height = cellHeightPxcel;
      canvas.width = cellWidthPxcel;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const stg = drawImageSettings;
        // console.log("drawImageSettings", stg);

        // 画像を描画 & キャンバス全体を出力
        ctx.drawImage(img, stg.dx, stg.dy, stg.dWidth, stg.dHeight);
        resolve(canvas.toDataURL("image/png"));
      }
    }

    // 画像を読み込み、読み込み完了後にcreateNewImageを実行
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      createNewImage(img);
    };
    img.onerror = (e) => {
      console.error(e);
    };
  });
}

/**
 * ブックからテーマフォントを取得する関数です。日本仕様。
 * テーマフォントは幅の単位としても使用されるため、取得することでセルの幅をピクセルに変換する係数を取得したりできます。
 * @param workbook
 * @returns ThemeFont[]
 */
type ThemeFont = {
  themeName: string;
  majorFont: {
    latin: string;
    jpan: string;
  };
  minorFont: {
    latin: string;
    jpan: string;
  };
};
export function getThemeFonts(workbook: ExcelJS.Workbook): ThemeFont[] {
  const reg_majorFont =
    '<a:majorFont><a:latin typeface="(.+?)".+<a:font script="Jpan" typeface="(.+?)"/>.+</a:majorFont>';
  const reg_minorFont =
    '<a:minorFont><a:latin typeface="(.+?)".+<a:font script="Jpan" typeface="(.+?)"/>.+</a:minorFont>';
  // @ts-ignore _themeはprivateなので、型定義には存在しない
  const themes = workbook._themes;
  const themeList = [];
  for (const theme in themes) {
    const name = theme;
    const themeStr = themes[theme];
    const majorFont = themeStr.match(reg_majorFont);
    const minorFont = themeStr.match(reg_minorFont);
    themeList.push({
      themeName: name,
      majorFont: {
        latin: majorFont[1],
        jpan: majorFont[2],
      },
      minorFont: {
        latin: minorFont[1],
        jpan: minorFont[2],
      },
    });
  }

  return themeList;
}

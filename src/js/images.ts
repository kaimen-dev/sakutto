import heic2any from "heic2any";
import * as DB from "./IDB";
import { toast } from "vue-sonner";

/**
 * HEICファイルをJPGに変換する
 * Heic2any https://alexcorvi.github.io/heic2any/#getting-started
 * @param file
 * @returns string // 画像のURL
 */

async function heicConverter(file: File): Promise<Blob> {
  toast("HEICファイルはJPGに変換されます");
  const conversionResult = (await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.7,
  })) as Blob;
  console.log("blob", conversionResult);
  // blobを画像に変換
  return conversionResult;
}

/**
 * 新しい画像ファイルをkey名でDataBaseに保存し、別でDataUrlに変換したものをコールバックに渡す
 * Promiseでコールバックで
 * @param file
 * @param key
 * @param callback
 */
export function saveNewImage(
  file: File,
  key: string,
  callback: (imageData: string, key: string) => void
): void {
  const reader = new FileReader();

  reader.onerror = (e: ProgressEvent<FileReader>) => {
    console.error("fileReader error", e);
  };
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const imageData = e.target?.result as string;
    if (imageData !== null) {
      DB.putDBImage(key, imageData, file.name).then((response) => {
        if (!response) {
          console.error("saveNewImage error");
          return;
        }
        callback(imageData, key);
      });
    }
  };
  // 引数のファイルはDataBaseにBlobとして保存し、即時編集のためにDataURLに変換する
  // HEICファイルの場合はJPG変換してから読み込む
  if (file.type === "image/heic" || file.name.match(/\.(heic|HEIC)$/)) {
    console.log("heic file");
    heicConverter(file).then((blob) => {
      reader.readAsDataURL(blob);
    });
  } else {
    reader.readAsDataURL(file);
  }
}

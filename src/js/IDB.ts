/**
 * IndexedDBを使って素材画像を保存し管理する。
 */

/**
 * 関連資料
 * Dexie.js
 * https://dexie.org/
 *
 * IndexedDBの容量超過時の動作確認のやり方 (Chrome)
 * https://zenn.dev/tosa/articles/0f1f82afd9a8aa
 */

"use strict";
import Dexie, { type EntityTable, type IndexableTypeArray } from "dexie";

import myWorker from "./IDB_worker?worker";
const worker = new myWorker();

interface Image {
  key: string;
  image: string;
  fileName: string;
  transform: number[] | null;
  isCompressed: boolean;
  created_at: number;
}

interface temporarySave {
  json: string;
  created_at: number;
}

const db = new Dexie("ichikawa_completion_report") as Dexie & {
  images: EntityTable<Image, "key">;
  temporarySave: EntityTable<temporarySave, "created_at">;
};
db.version(1).stores({
  images: "key,fileName, created_at",
  temporarySave: "created_at",
});

/**
 * 画像のbase64文字列をDBに保存する。keyが同じ場合は上書きする。
 * @param key
 * @param image base64形式の画像データ
 * @param transform? = null
 */
const putDBImage = async (
  key: string,
  image: string,
  fileName = "",
  transform = null,
  limit = 500
): Promise<boolean> => {
  // dbのレコード数を取得し、それが500以上なら最も古いレコードを削除する
  const count = await db.images.count();
  if (count >= limit) {
    const oldest = await db.images.orderBy("created_at").first();
    if (oldest) {
      await db.images.delete(oldest.key);
    }
  }
  // 作成日時を取得
  const created_at = Date.now();

  // 画像をDBに保存
  try {
    if (window.CompressionStream) {
      worker.postMessage({ type: "compress", buffer: image, key });
      worker.onmessage = async (message: MessageEvent<string>) => {
        const result = message.data;
        const isCompressed = true;
        if (result) {
          await db.images.put({
            key,
            image: result,
            fileName,
            transform,
            isCompressed,
            created_at,
          });
        }
      };
    } else {
      const isCompressed = false;
      await db.images.put({
        key,
        image,
        fileName,
        transform,
        isCompressed,
        created_at,
      });
    }
    return true;
  } catch (error: any) {
    if (error.inner.name === "QuotaExceededError") {
      console.log("IndexedDBの容量が足りません。");
    }
    return false;
  }
};

/**
 * 画像をDBから取得する。
 * @param key
 * @returns
 */
const getDBImage = async (key: string): Promise<Image | null> => {
  return new Promise((resolve) => {
    db.images.get(key).then((data) => {
      if (!data) {
        resolve(null);
      } else {
        if (!data.isCompressed) {
          resolve(data);
        }
        worker.postMessage({ type: "decompress", buffer: data.image });
        worker.onmessage = (message: MessageEvent<string>) => {
          // console.log("decompress", message.data);
          const result = message.data;
          data.image = result;
          resolve(data);
        };
      }
    });
  });
};

/**
 * DBからfileNameの一覧を取得する。
 */
const getDBImageFileNames = async (): Promise<IndexableTypeArray> => {
  return new Promise((resolve) => {
    db.images.orderBy("fileName").keys((fileNames) => {
      resolve(fileNames);
    });
  });
};

/**
 * fileNameからDBのimage値を取得する。
 */
const getDBImageByFileName = async (
  fileName: string
): Promise<Image | null> => {
  return new Promise((resolve) => {
    db.images
      .where("fileName")
      .equals(fileName)
      .first((data) => {
        if (!data) {
          resolve(null);
        } else {
          if (!data.isCompressed) {
            resolve(data);
          }
          worker.postMessage({ type: "decompress", buffer: data.image });
          worker.onmessage = (message: MessageEvent<string>) => {
            const result = message.data;
            data.image = result;
            resolve(data);
          };
        }
      });
  });
};

/**
 * DBから画像を削除する。
 * @param key
 */
const deleteDBImage = async (key: string) => {
  await db.images.delete(key);
};

/**
 * 保存されている画像のtransform値を更新する。
 * @param key
 * @param transform
 */
const setDBImageTransform = async (key: string, transform: number[]) => {
  const image = await db.images.get(key);
  if (image) {
    image.transform = transform;
    await db.images.put(image);
  }
};

/**
 * 一時保存用のデータをDBに保存する。
 * @param json
 */
const setTemporarySave = async (json: string) => {
  // dbのレコード数を取得し、それが100以上なら最も古いレコードを削除する
  const limit = 100;
  const count = await db.temporarySave.count();
  if (count >= limit) {
    const oldest = await db.temporarySave.orderBy("created_at").first();
    if (oldest) {
      await db.temporarySave.delete(oldest.created_at);
    }
  }
  const created_at = Date.now();
  await db.temporarySave.put({ json, created_at });
};

/**
 * temporarySaveからcreated_atを引数に一時保存用のデータをDBから取得する。
 * @param created_at
 * @returns json | null
 */
const getTemporarySave = async (created_at: number): Promise<string | null> => {
  return new Promise((resolve) => {
    db.temporarySave.get(created_at).then((data) => {
      if (!data) {
        resolve(null);
      } else {
        resolve(data.json);
      }
    });
  });
};

/**
 * temporarySaveからcreated_atのリストを取得する。
 * @returns created_at[]
 */
const getTemporarySaveList = async (): Promise<IndexableTypeArray> => {
  return new Promise((resolve) => {
    db.temporarySave
      .orderBy("created_at")
      .reverse()
      .keys((created_at) => {
        resolve(created_at);
      });
  });
};

export {
  db,
  putDBImage,
  getDBImage,
  getDBImageFileNames,
  getDBImageByFileName,
  deleteDBImage,
  setDBImageTransform,
  setTemporarySave,
  getTemporarySave,
  getTemporarySaveList,
};

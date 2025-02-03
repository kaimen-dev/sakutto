import Cropper from "cropperjs";
/**
 * 指定時間待機する
 * @param ms 待機時間
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export interface CropperImage extends HTMLElement {
  rotatable: boolean;
  translatable: boolean;
  scalable: boolean;
  $setTransform: (a: number | Array<number>) => CropperImage;
  $getTransform: () => Array<number>;
  $rotate: (deg: string, x?: number, y?: number) => CropperImage;
}
export interface CropperCanvas {
  dataset: any;
  $toCanvas(size?: {
    width: number;
    height: number;
  }): Promise<HTMLCanvasElement>;
}

/**
 * 画像の配置をリセットする。imageのsrcを一度クリアして再度設定することでリセットされる
 * @param e
 */
export function resetPosition(e: { target: HTMLButtonElement }): void {
  console.log("resetPosition", e);
  const image = e.target
    .closest(".image__inner")
    ?.querySelector("cropper-canvas")
    ?.querySelector("cropper-image") as HTMLImageElement;
  if (!image) return;
  const src = image.src;
  image.src = "";
  image.src = src;
}

/**
 * 画像をdeg値分時計回りに回転させる
 * 90度回転させる場合はdeg=90
 * @param e
 * @param deg: 回転角度
 */
export function rotateImage(
  e: { target: HTMLButtonElement },
  deg: number
): void {
  if (!deg) deg = 90; // 右90度回転
  console.log("rotateImage", e);
  const cropper = e.target
    .closest(".image__inner")
    ?.querySelector("cropper-canvas")
    ?.querySelector("cropper-image") as CropperImage;
  if (!cropper) return;
  cropper.$rotate(deg + "deg");
}

/**
 * 画像をキャンバスサイズにクロップして取得する
 * @param cropper
 * @param size クロップサイズ{width: number, height: number}
 *
 * return クロップされた画像のbase64データ
 */
export async function getCropedImage(
  cropper: CropperCanvas,
  size?: { width: number; height: number }
): Promise<string> {
  let canvas: HTMLCanvasElement;
  if (size) {
    canvas = await cropper.$toCanvas(size);
  } else {
    canvas = await cropper.$toCanvas();
  }

  return canvas.toDataURL();
}

/**
 * キャンバスを表示させずにCropperを起動させてクロップした画像を取得する
 * @param base64Image
 * @returns Promise クロップされた画像のbase64データ
 */
export function cropImage(base64Image: string): Promise<string | void> {
  return new Promise(async (resolve) => {
    const image = document.createElement("img");
    image.src = base64Image;
    image.onload = async () => {
      const cropper = new Cropper(image, {
        template: `
        <cropper-canvas
          id="silent-cropper"
          style="opacity:0;position:absolute;bottom:0;left:0;pointer-events:none;">
          <cropper-image
            initial-center-size="cover"
            scalable
            translatable
            rotatable></cropper-image>
        </cropper-canvas>`,
      });
      // console.log(cropper);
      await sleep(200);
      const cropperImage = cropper.getCropperImage();
      if (!cropperImage) return;
      const cropperCanvas = cropper.getCropperCanvas();
      if (!cropperCanvas) return;
      cropperCanvas.$toCanvas().then((canvas) => {
        document.querySelector("#silent-cropper")?.remove();
        resolve(canvas.toDataURL());
      });
    };
  });
}

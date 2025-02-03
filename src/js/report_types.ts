/**
 * ****************************************************
 * report 型定義
 * ****************************************************
 */

export interface dataValues {
  [keys: string]: string | null;
  UNIQUEKEY: string;
}

export interface CropperCanvas {
  dataset: {
    index: string;
  };
  $toCanvas(size?: {
    width: number;
    height: number;
  }): Promise<HTMLCanvasElement>;
}
export interface CropperImage extends HTMLImageElement {
  $setTransform(transform: number[]): CropperImage;
  $getTransform(): number[];
}

import * as EXCEL from './excel'
import type { Ref } from 'vue'

type imageBox = {
  top: number
  left: number
  bottom: number
  right: number
}
export function getBoundingboxForContainImage(cell: EXCEL.Cell, url: string): Promise<imageBox> {
  const widthToPixelCoefficient = 8.05
  const heightToPixelCoefficient = 1.33
  return new Promise((resolve) => {
    if (cell._column.width === undefined || cell._row.height === undefined)
      return console.error('cell size is undefined')
    const cellHeight = cell._row.height * heightToPixelCoefficient
    const cellWidth = cell._column.width * widthToPixelCoefficient
    if (cellHeight === undefined || cellWidth === undefined)
      return console.error('cell size is undefined')
    const cellRatio = cellHeight / cellWidth

    console.log('cellHeight', cellHeight, 'cellWidth', cellWidth, 'cellRatio', cellRatio)

    // urlから画像を読み込み高さと幅を取得
    const img = new Image()
    img.src = url
    img.onload = () => {
      const imgHeight = img.height
      const imgWidth = img.width
      const imgRatio = imgHeight / imgWidth

      let newHeight, newWidth

      // cellHeightとcellWidthを比較して、縦横比を保持したままリサイズ
      if (cellWidth > cellHeight || cellWidth === cellHeight) {
        newHeight = cellHeight
        newWidth = cellHeight / imgRatio
      } else {
        newWidth = cellWidth
        newHeight = cellWidth * imgRatio
      }
      console.log('newHeight', newHeight, 'newWidth', newWidth)

      // contain. 画像がセルより大きい場合、セルに収まるようにリサイズし、rectボックスを算出
      const rect: imageBox = { top: 0, left: 0, bottom: 0, right: 0 }
      // topを計算。配置の上端を求め、その値がcellHeightを1としたときの何パーセントかを求める(小数点)
      rect.top = (cellHeight - newHeight) / 2 / cellHeight || 0
      // leftを計算。配置の左端を求め、その値がcellWidthを1としたときの何パーセントかを求める(小数点)
      rect.left = (cellWidth - newWidth) / 2 / cellWidth || 0
      // botoomとrightはtopとleftの逆
      rect.bottom = 1 - rect.top
      rect.right = 1 - rect.left

      console.log('rect', rect)

      resolve(rect)

      // const newHeight = cellWidth * ratio
      // if (newHeight > cellHeight) {
      //   const newWidth = cellHeight / ratio
      //   cell.value = { image: url, width: newWidth, height: cellHeight }
      // } else {
      //   cell.value = { image: url, width: cellWidth, height: newHeight }
      // }
      // const canvas = document.createElement('canvas')
      // canvas.width = img.width
      // canvas.height = img.height
      // const ctx = canvas.getContext('2d')
      // if (ctx) {
      //   ctx.drawImage(img, 0, 0)
      //   return canvas.toDataURL('image/png')
      // }
    }
  })
}

/**
 * URLから画像を読み込みbase64に変換する
 */
export function urlToBase64(url: string): Promise<string> {
  return new Promise((resolve) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader()
        reader.onloadend = function () {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(blob)
      })
  })
}

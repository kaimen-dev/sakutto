import ExcelJS from 'exceljs'

// toString.call([obj])でオブジェクトの組み込み型を出力出来る。Date型は"[object Date]"となる
export const isDate = (value: unknown): value is Date => {
  return toString.call(value) === '[object Date]'
}
export const isCellHyperlinkValue = (value: unknown): value is ExcelJS.CellHyperlinkValue => {
  if (
    value !== null &&
    typeof value === 'object' &&
    Object.prototype.hasOwnProperty.call(value, 'hyperlinks')
  )
    return true
  else return false
}
export const isCellRichTextValue = (value: unknown): value is ExcelJS.CellRichTextValue => {
  if (
    value !== null &&
    typeof value === 'object' &&
    Object.prototype.hasOwnProperty.call(value, 'richText')
  ) {
    return true
  } else {
    return false
  }
}

import type { HistoryItem } from './History.vue'

export const parseCsvStringToHistoryItems = (csvString: string): HistoryItem[] => {
  if (!csvString) {
    return []
  }

  const items: HistoryItem[] = csvString
    .split('\n')
    .map((historyItemString, index) => {
      // The first item is the column names
      if (index === 0) {
        return
      }

      const [value1, action, value2, result, timeStamp] = historyItemString.split(',')

      if (!value1 || !action || !value2 || !result || !timeStamp) {
        return
      }

      const historyItem = {
        value1: parseFloat(value1),
        action,
        value2: parseFloat(value2),
        result: parseFloat(result),
        timeStamp: new Date(timeStamp)
      }

      return historyItem
    })
    .filter(
      (item) =>
        !!item &&
        !!item.value1 &&
        !!item.value2 &&
        !!item.action &&
        !!item.result &&
        !!item.timeStamp
    ) as HistoryItem[]

  return items
}

export const parseDataIntoCsvFormat = (data: HistoryItem[], headerString = ''): string => {
  const finalString = data.reduce((builtString, historyItem) => {
    const { value1, action, value2, result, timeStamp } = historyItem

    const dataRow = `${value1},${action},${value2},${result},${timeStamp.toString()}`

    return builtString + dataRow + '\n'
  }, headerString)

  return finalString
}

export const parseNumberValueFromString = (value: string): number => {
  return value.includes('.') ? parseFloat(value) : parseInt(value)
}

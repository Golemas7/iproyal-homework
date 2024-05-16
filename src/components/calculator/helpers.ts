import { MAX_INPUT_LENGTH } from './constants'
import type { HistoryItem } from './History.vue'
import type { CalculatorActions } from './ResultAndAction.vue'

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
        value1,
        action,
        value2,
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

export const insertTextAtCursor = (
  element?: HTMLInputElement | null,
  text?: string,
  isBefore = true
): string => {
  if (!element || !text) {
    return ''
  }

  // Ensure the input element is focused
  element.focus()

  // Get the current selection range in the input element
  let start = element?.selectionStart
  let end = element?.selectionEnd

  // Determine the new cursor position
  let newPos = (isBefore ? start : end) ?? 0

  // Insert the text at the current selection
  element?.setRangeText(text, newPos, newPos, 'end')

  // Update the cursor position after insertion
  element?.setSelectionRange(newPos + text.length, newPos + text.length)

  // Return new text content
  return element?.value
}

export const calculateResult = (
  value1: string,
  value2: string,
  action: CalculatorActions | ''
): string | undefined => {
  const value1Number = parseFloat(value1)
  const value2Number = parseFloat(value2)

  // Get the placement of the decimal values
  const decimalPointValue1 = value1Number.toString().indexOf('.') + 1 || 0
  const decimalPointValue2 = value2Number.toString().indexOf('.') + 1 || 0

  const decimalPointOffset =
    decimalPointValue1 > decimalPointValue2 ? decimalPointValue1 : decimalPointValue2
  const decimalPointModifier = Math.pow(10, decimalPointOffset)

  let result: string | number | undefined

  switch (action) {
    case '^':
      const cleanedNumber = Math.floor(value1Number * Math.pow(10, decimalPointValue1))

      const powResult =
        Math.pow(cleanedNumber, value2Number) /
        Math.pow(Math.pow(10, decimalPointValue1), value2Number)

      // const cleanedPowResult =
      //   powResult.toString().length > MAX_INPUT_LENGTH ? powResult.toExponential() : powResult

      result = powResult

      break
    case '/':
      const divValue1 = Math.floor(value1Number * decimalPointModifier)
      const divValue2 = Math.floor(value2Number * decimalPointModifier)

      const divResult = divValue1 / divValue2

      result = divResult

      break
    case 'X':
      const mulValue1 = Math.floor(value1Number * decimalPointModifier)
      const mulValue2 = Math.floor(value2Number * decimalPointModifier)

      const mulResult = (mulValue1 * mulValue2) / Math.pow(decimalPointModifier, 2)

      result = mulResult

      break
    case '+':
      const addValue1 = Math.floor(value1Number * decimalPointModifier)
      const addValue2 = Math.floor(value2Number * decimalPointModifier)

      const addResult = (addValue1 + addValue2) / decimalPointModifier

      result = addResult

      break
    case '-':
      const subValue1 = Math.floor(value1Number * decimalPointModifier)
      const subValue2 = Math.floor(value2Number * decimalPointModifier)

      const subResult = (subValue1 - subValue2) / decimalPointModifier

      result = subResult

      break
    default:
      result = 0
  }

  return result !== undefined ? result.toString() : result
}

export const calculateInputWidth = (inputValue?: string) => {
  let width = 1.2

  const floatNumberSize = 0.3
  const characterSize = 1.2

  const hasFloatCharacter = inputValue?.includes('.')
  const floatCharacterModifyer = hasFloatCharacter ? 1 : 0

  if (inputValue?.length && inputValue?.length > 0) {
    width =
      inputValue.replace('.', '').length * characterSize + floatCharacterModifyer * floatNumberSize
  }

  return `${width}ch`
}

export const shouldIgnoreButtonInput = ({
  key,
  currentValue,
  result
}: {
  key: string
  currentValue: string
  result: string
}) => {
  const isNumber = !isNaN(parseInt(key))

  const isTryingToEnterMultipleLeadingZeros = key === '0' && result === '' && currentValue === '0'
  const isTryingToEnterMultipleDecimalPoints =
    key === '.' && result === '' && currentValue?.includes('.')
  const isTryngToCalculateAFinishedCalculation = key === '=' && result !== ''
  const isTryingToExceedMaximumLength =
    currentValue.length >= MAX_INPUT_LENGTH && (isNumber || key === '.')

  return (
    isTryingToEnterMultipleLeadingZeros ||
    isTryingToEnterMultipleDecimalPoints ||
    isTryngToCalculateAFinishedCalculation ||
    isTryingToExceedMaximumLength
  )
}

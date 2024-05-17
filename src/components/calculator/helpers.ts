import { MAX_INPUT_LENGTH } from './constants'
import type { HistoryItem } from './History.vue'
import type { CalculatorActions, CalculatorButton } from './ResultAndAction.vue'

export const parseCsvStringToHistoryItems = (csvString: string): HistoryItem[] => {
  if (!csvString) {
    return []
  }

  const items: HistoryItem[] = csvString
    .split('\n')
    .map((historyItemString, index): HistoryItem | undefined => {
      // The first item is the column names
      if (index === 0) {
        return
      }

      const [value1, action, value2, result, timeStamp] = historyItemString.split(',')

      const hasMissingValues = !value1 || !action || !value2 || !result || !timeStamp

      if (hasMissingValues) {
        return
      }

      const invalidValues =
        Number.isNaN(parseFloat(value1)) ||
        Number.isNaN(parseFloat(value2)) ||
        Number.isNaN(parseFloat(result))
      const invalidDate = new Date(timeStamp).toString() === 'Invalid Date'
      // eslint-disable-next-line no-useless-escape
      const invalidAction = !/^[\^\/Xx\-+]+$/.test(action)

      const hasInvalidValues = invalidValues || invalidDate || invalidAction

      if (hasInvalidValues) {
        return
      }

      const historyItem = {
        value1,
        action,
        value2,
        result,
        timeStamp: new Date(timeStamp)
      }

      // eslint-disable-next-line consistent-return
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

    return `${builtString + dataRow}\n`
  }, headerString)

  return finalString
}

export const parseNumberValueFromString = (value: string): number =>
  value.includes('.') ? parseFloat(value) : parseInt(value, 10)

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
  const start = element?.selectionStart
  const end = element?.selectionEnd

  // Determine the new cursor position
  const newPos = (isBefore ? start : end) ?? 0

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
  const decimalPointModifier = 10 ** decimalPointOffset

  let result: string | number | undefined

  switch (action) {
    case '^': {
      const cleanedNumber = Math.floor(value1Number * 10 ** decimalPointValue1)

      const powResult = cleanedNumber ** value2Number / (10 ** decimalPointValue1) ** value2Number

      result = powResult

      break
    }
    case '/': {
      const divValue1 = Math.floor(value1Number * decimalPointModifier)
      const divValue2 = Math.floor(value2Number * decimalPointModifier)

      const divResult = divValue1 / divValue2

      result = divResult

      break
    }
    case 'x': {
      const mulValue1 = Math.floor(value1Number * decimalPointModifier)
      const mulValue2 = Math.floor(value2Number * decimalPointModifier)

      const mulResult = (mulValue1 * mulValue2) / decimalPointModifier ** 2

      result = mulResult

      break
    }
    case '+': {
      const addValue1 = Math.floor(value1Number * decimalPointModifier)
      const addValue2 = Math.floor(value2Number * decimalPointModifier)

      const addResult = (addValue1 + addValue2) / decimalPointModifier

      result = addResult

      break
    }
    case '-': {
      const subValue1 = Math.floor(value1Number * decimalPointModifier)
      const subValue2 = Math.floor(value2Number * decimalPointModifier)

      const subResult = (subValue1 - subValue2) / decimalPointModifier

      result = subResult

      break
    }
    default:
      result = 0
  }

  const exceedsMaxLength = result?.toString().length > MAX_INPUT_LENGTH

  return result !== undefined && exceedsMaxLength
    ? result.toPrecision(MAX_INPUT_LENGTH - 5)
    : result?.toString()
}

export const calculateInputWidth = (inputValue?: string) => {
  let width = 1.2

  const floatNumberSize = 0.3
  const negativeNumberSignSize = 0.3
  const characterSize = 1.2

  const hasFloatCharacter = inputValue?.includes('.')
  const floatCharacterModifyer = hasFloatCharacter ? 1 : 0
  const hasNegativeNumberSign = inputValue.includes('-')
  const negativeNumberSignModifyer = hasNegativeNumberSign ? 1 : 0

  if (inputValue?.length && inputValue?.length > 0) {
    width =
      inputValue.replace(/[.-]/g, '').length * characterSize +
      floatCharacterModifyer * floatNumberSize +
      negativeNumberSignModifyer * negativeNumberSignSize
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
  const isNumber = !Number.isNaN(parseInt(key, 10))

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

export const getButton = (buttonKey: CalculatorButton) => {
  let title = ''

  // eslint-disable-next-line default-case
  switch (buttonKey) {
    case 'C':
      title = 'Clear current calculation'

      break
    case '^':
      title = '... to the power of ...'

      break
    case '↹':
      title = 'Switch which number are you typing'

      break
    case '/':
      title = '... divided by ...'

      break
    case 'x':
      title = '... times ...'

      break
    case '-':
      title = '... minus ...'

      break
    case '+':
      title = '... plus ...'

      break
    case '=':
      title = 'Calculate result'

      break
    case '.':
      title = 'Insert floating point'

      break
  }

  return {
    title,
    value: buttonKey
  }
}

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, inject, reactive, ref, watch, type Ref } from 'vue'
import type { ResultAndAction } from './ResultAndAction.vue'
import type { History, HistoryItem } from './History.vue'

type CalculatorActions = 'C' | '^' | '%' | '/' | 'X' | '-' | '+' | '='
type CalculatorNumbers = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type CalculatorButton = CalculatorActions | CalculatorNumbers | '.'

const buttons: CalculatorButton[][] = [
  ['C', '^', '%', '/'],
  ['7', '8', '9', 'X'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '=']
]

const numberButtons = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const calculatorRegExp = /^[Cc\^%/789Xx456\-123\+0.=]+$/

// Inject the data for binding with result and action
const { value: calculation } = inject<Ref<ResultAndAction>>(
  'resultAndAction'
) as Ref<ResultAndAction>

// Inject the data for binding with history
const { value: history } = inject<Ref<History>>('history') as Ref<History>

onMounted(() => {
  window.addEventListener('keydown', calculatorKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', calculatorKeydown)
})

const handleCalculationAction = (
  oldValue: number,
  currentValue: number,
  action: CalculatorActions
): number | undefined => {
  switch (action) {
    case 'C':
      return undefined
    case '^':
      return Math.pow(oldValue, currentValue)
    case '%':
      return 0 // TODO IMPLEMENT THIS
    case '/':
      return oldValue / currentValue
    case 'X':
      return oldValue * currentValue
    case '+':
      return oldValue + currentValue
    case '-':
      return oldValue - currentValue
    case '=':
      return oldValue
    default:
      return 0
  }
}

const parseValueFromString = (value: string): number => {
  return value.includes('.') ? parseFloat(value) : parseInt(value)
}

// TODO IF EQUAL IS PRESSED AND WE START TYPING, START A NEW CALCULATION

/**
 * We use strings to represent current and history values, which are parsed only when needed for calculations. This makes the process of adding numbers to the end and handling floating points a lot easier.
 */
const handleCalculationValue = (value: string, digit: CalculatorButton) => {
  let newValue = value

  // Check if it's a digit we are entering
  const parsedDigit = parseValueFromString(digit)
  const isNumber = !isNaN(parsedDigit)

  // We are entering digits
  if (isNumber) {
    // If we faked a float number visually, now we do it for real since it's a valid float number now
    if (calculation.fakeDecimal) {
      let nonEmptyValue = value || '0'

      newValue = nonEmptyValue + '.' + digit
      calculation.fakeDecimal = false
    } else {
      // If we are not faking floats, just add the digit to the end
      newValue = value === '0' ? digit : value + digit
    }
  } else if (digit === '.') {
    // We are making a float

    // If we don't have a float type yet and we are not faking it yet, fake it
    if (!value.includes('.') && !calculation.fakeDecimal) {
      calculation.fakeDecimal = true
    }
  } else {
    // If it's an action

    // If it's a clear action, reset everything
    if (digit === 'C') {
      calculation.action = ''
      calculation.previousValue = ''
      calculation.actionStarted = false
      calculation.fakeDecimal = false
      calculation.value = '0'

      return
    }

    // Reset the fake decimal
    if (calculation.fakeDecimal) {
      calculation.fakeDecimal = false
    }

    // If a previous action is pending and a value was provided
    if (calculation.action && calculation.previousValue) {
      // Resolve previous calculation

      // If we have a value to resolve it to
      if (calculation.value !== '') {
        const parsedValue = parseValueFromString(calculation.value)
        const parsedPreviousValue = parseValueFromString(calculation.previousValue)

        // Calculate new value
        const calculatedValue = handleCalculationAction(
          parsedPreviousValue,
          parsedValue,
          calculation.action as CalculatorActions
        )

        const newHistoryItem = {
          value1: calculation.previousValue,
          action: calculation.action,
          value2: calculation.value,
          result: calculatedValue?.toString() || ''
        }

        history.items.push(newHistoryItem)

        calculation.previousValue = calculatedValue?.toString() || ''

        // Set current value to empty string
        newValue = ''
      }

      // Set the action
      calculation.action = digit
    } else {
      // No previous action or no previous value

      // Set the new action
      calculation.action = digit
      calculation.previousValue = value
      newValue = ''
    }

    // Set state to active
    calculation.actionStarted = true
  }

  calculation.value = newValue
}

const calculatorKeydown = (e: KeyboardEvent) => {
  handleButtonInput(calculation.value, e.key.toUpperCase())
}

const handleButtonInput = (value: string, button: string) => {
  if (
    calculatorRegExp.test(button) ||
    button === 'Backspace' ||
    button === 'Delete' ||
    button === '*'
  ) {
    if (button === 'Backspace' || button === 'Delete') {
      // TODO IF THERE IS TIME ADD SUPPORT FOR DELETING DIGETS
      handleCalculationValue(value, 'C')
    } else if (button === '*') {
      handleCalculationValue(value, 'X')
    } else {
      handleCalculationValue(value, button as CalculatorButton)
    }
  }
}

const handleButtonClick = (buttonValue: CalculatorButton) => {
  handleButtonInput(calculation.value, buttonValue.toString())
}

calculation.onButtonClick = handleButtonClick

const handleHistoryClick = (hisotryItem: HistoryItem) => {
  const { value1, action, value2 } = hisotryItem

  calculation.action = action
  calculation.previousValue = value1
  calculation.actionStarted = true
  calculation.fakeDecimal = false
  calculation.value = value2
}

history.setCurrentCalculationToEntry = handleHistoryClick
</script>

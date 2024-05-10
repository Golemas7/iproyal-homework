<script setup lang="ts">
import type { CalculatorActions } from '@/components/ActionButton.vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, type Ref } from 'vue'

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

const calculation = reactive<{
  value: string
  action: string
  actionStarted: boolean
  previousValue: string
  fakeDecimal: boolean
}>({
  value: '0',
  action: '',
  actionStarted: false,
  previousValue: '',
  fakeDecimal: false
})

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

const visibleValue = computed(() => {
  if (calculation.value === '') {
    if (calculation.fakeDecimal) {
      return '0'
    }

    return calculation.previousValue
  }

  return calculation.value
})
</script>

<template>
  <div class="calculator">
    <div class="calculator-inner-container">
      <div class="calculator-header">
        <span>←</span>
        <h1 class="title">Calculator</h1>
        <span>...</span>
      </div>
      <div class="screen">
        <div class="history">
          <template v-if="calculation.previousValue">
            <span>{{ calculation.previousValue }}</span>
            <span>{{ ` ${calculation.action}` }}</span>
          </template>
        </div>

        <div class="current">
          <span>{{ visibleValue }}{{ calculation.fakeDecimal ? '.' : '' }}</span>
        </div>
      </div>
      <div class="buttons-container">
        <template v-for="buttonsRow in buttons">
          <template v-for="button in buttonsRow">
            <button
              class="calculator-button"
              @click="handleButtonClick(button)"
              :class="{
                'two-rows': button === '+',
                'number-button': numberButtons.includes(button)
              }"
            >
              {{ button }}
            </button>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calculator {
}

.calculator-inner-container {
  width: 450px;
  height: 950px;
  background-color: #414141;
  border-radius: 40px;
  padding: 60px 35px;
}

.title {
  font-size: 1rem;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  color: white;
}

.screen {
  background-color: #0b0b0b1a;
  height: 300px;
  width: 380px;
  padding: 30px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  margin-bottom: 60px;
  box-shadow: 5px 5px 60px 0px rgba(11, 11, 11, 0.1);
}

.history {
  font-size: 2.5rem;
  color: #9e9c9c;
}

.current {
  font-size: 1.875rem;
  color: white;
}

.buttons-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(5, 1fr);
  column-gap: 40px;
  row-gap: 20px;
}

.calculator-button {
  height: 65px;
  width: 65px;
  border-radius: 100%;
  border: none;
  font-size: 1.563rem;
  color: white;
}

.two-rows {
  grid-row: span 2;
  height: 150px;
  border-radius: 42.5px;
}

.calculator-button:not(.number-button) {
  background-color: #5a5757;
  box-shadow: 5px 5px 40px 0px rgba(11, 11, 11, 0.3);
}
.number-button {
  background-color: #3f3f3f;
  box-shadow: 4px 3px 20px 0px rgba(0, 0, 0, 0.5);
  box-shadow: -4px -2px 20px 0px rgba(195, 193, 191, 0.2);
}

button {
  cursor: pointer;
}
</style>

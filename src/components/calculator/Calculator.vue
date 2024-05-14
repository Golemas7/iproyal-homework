<script setup lang="ts">
import { inject, type Ref, watch, ref } from 'vue'
import {
  type CalculatorActions,
  type CalculatorButton,
  type ResultAndAction
} from './ResultAndAction.vue'
import type { History, HistoryItem } from './History.vue'

type InputData = {
  value1: number
  value2: number
  currentInputActive: 'value1' | 'value2'
}

const { value: inputData } = ref<InputData>({
  value1: 0,
  value2: 0,
  currentInputActive: 'value1'
})
const input1 = ref<HTMLInputElement | null>(null)
const input2 = ref<HTMLInputElement | null>(null)

// Inject the data for binding with result and action
const { value: resultAndAction } = inject<Ref<ResultAndAction>>(
  'resultAndAction'
) as Ref<ResultAndAction>

// Inject the data for binding with history
const { value: history } = inject<Ref<History>>('history') as Ref<History>
const isHistoryMode = inject<Ref<Boolean>>('isHistoryMode') as Ref<Boolean>

const calculateResult = (
  value1: number,
  value2: number,
  action: CalculatorActions | ''
): number | undefined => {
  switch (action) {
    case '^':
      return Math.pow(value1, value2)
    case '/':
      return value1 / value2
    case 'X':
      return value1 * value2
    case '+':
      return value1 + value2
    case '-':
      return value1 - value2
    default:
      return 0
  }
}

const handleHistoryClick = (historyItem: HistoryItem, handleResultClick?: boolean) => {
  const { value1, action, value2, result } = historyItem

  if (handleResultClick) {
    resultAndAction.action = ''
    inputData.value1 = result || 0
    inputData.value2 = 0
    resultAndAction.result = null
  } else {
    resultAndAction.action = action as CalculatorActions
    inputData.value1 = value1
    inputData.value2 = value2
    resultAndAction.result = null
  }

  inputData.currentInputActive = 'value2'
  input2.value?.focus()
}

const handleHistoryEntryClick = (historyItem: HistoryItem) => {
  handleHistoryClick(historyItem)
}

const handleHistoryResultClick = (historyItem: HistoryItem) => {
  handleHistoryClick(historyItem, true)
}

// Clear the result if a previous calculation has just finished and we start typing
// Start a new calculcation with the result as a starting point
const restartCalculationWithResultValue = (buttonValue: CalculatorButton) => {
  if (buttonValue !== '=' && resultAndAction.result !== null) {
    inputData.value1 = resultAndAction.result
    inputData.value2 = 0
    resultAndAction.result = null
  }
}

// TODO HANDLE FLOAT VALUES
const handleButtonClick = (buttonValue: CalculatorButton) => {
  restartCalculationWithResultValue(buttonValue)

  const isANumber = !isNaN(parseInt(buttonValue))

  if (isANumber || buttonValue === '.') {
    // Handle number inputs
    const oldNumber = inputData[inputData.currentInputActive]
    const newNumber = '' + oldNumber + buttonValue

    inputData[inputData.currentInputActive] = parseFloat(newNumber)
  } else if (buttonValue === '↹') {
    // Handle switching the inputs
    if (inputData.currentInputActive === 'value1') {
      input2.value?.click()
      input2.value?.focus()
    } else {
      input1.value?.click()
      input1.value?.focus()
    }
  } else if (buttonValue === '=') {
    // Handle calculation

    // We return if the action is missing
    if (!resultAndAction.action) {
      return
    }

    // Calculate the value
    const newValue = calculateResult(inputData.value1, inputData.value2, resultAndAction.action)

    // Set the result
    resultAndAction.result = newValue ?? null

    // Create history entry

    const newHistoryItem = {
      value1: inputData.value1,
      action: resultAndAction.action as CalculatorActions,
      value2: inputData.value2,
      result: resultAndAction.result ?? 0,
      timeStamp: new Date()
    }

    // Add to history
    history.items.push(newHistoryItem)
  } else if (buttonValue === 'C') {
    // Handle clear

    inputData.value1 = 0
    resultAndAction.action = ''
    inputData.value2 = 0
    resultAndAction.result = null
    inputData.currentInputActive = 'value1'

    input1.value?.focus()
  } else {
    // Handle Actions
    resultAndAction.action = buttonValue as CalculatorActions

    if (inputData.currentInputActive !== 'value2') {
      inputData.currentInputActive = 'value2'
      input2.value?.focus()
    }
  }
}

const onInputChange = (event: Event, valueName: 'value1' | 'value2') => {
  const target = event.target as HTMLInputElement
  const newValue = target.value

  if (newValue === '') {
    inputData[valueName] = 0
  }
}

//  TODO HANDLE ACCESSIBILITY CASES
const onInputBlur = (e: Event, valueName: 'value1' | 'value2') => {
  // We set a timeout, so click will register first before we start processing if new input was clicked. We need this, because the blur event is fired first.
  setTimeout(() => {
    if (inputData.currentInputActive === valueName) {
      const input = e.target as HTMLInputElement

      inputData.currentInputActive = valueName
      input.focus()

      // Browser limitation, sometimes we need to wait for blur to finish
      setTimeout(() => {
        input.focus()
      }, 100)
    }
  }, 100)
}

const onFocusChanged = (valueName: 'value1' | 'value2') => {
  inputData.currentInputActive = valueName
}

const onKeyboardInput = (e: KeyboardEvent) => {
  const key = e.key.toUpperCase()
  const validKeys = ['C', '^', '/', 'X', '-', '+', '=', 'TAB', '*', 'ENTER']

  if (validKeys.includes(key)) {
    let validKey = key

    if (key === 'TAB') {
      validKey = '↹'
    } else if (key === '*') {
      validKey = 'X'
    } else if (key === 'ENTER') {
      validKey = '='
    }

    handleButtonClick(validKey as CalculatorButton)
  }
}

const onIputKeyDown = (e: KeyboardEvent) => {
  const isANumber = !isNaN(parseInt(e.key))

  if (!isANumber && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== '.') {
    e.preventDefault()
    e.stopPropagation()

    onKeyboardInput(e)
  } else if (resultAndAction.result !== null && e.key !== '=') {
    if (isANumber) {
      restartCalculationWithResultValue(e.key as CalculatorButton)
    } else {
      restartCalculationWithResultValue('0')
    }

    resultAndAction.result = null
  }
}

// Set the method references to apropriate methods
resultAndAction.onButtonClick = handleButtonClick
history.setCurrentCalculationToEntry = handleHistoryEntryClick
history.setCurrentCalculationToResult = handleHistoryResultClick

watch(isHistoryMode, (value) => {
  if (!value) {
    if (resultAndAction.action) {
      // Focus the second
      inputData.currentInputActive = 'value2'
      input2.value?.focus()

      // Browser limitation, sometimes we need to wait for blur to finish
      setTimeout(() => {
        input2.value?.focus()
      }, 100)
    } else {
      // Focus the first
      inputData.currentInputActive = 'value1'
      input1.value?.focus()

      // Browser limitation, sometimes we need to wait for blur to finish
      setTimeout(() => {
        input1.value?.focus()
      }, 100)
    }
  }
})
</script>

<!-- TODO HANDLE :style width with decimal numbers -->
<template>
  <div v-if="!isHistoryMode" class="calculator-calculations" @keydown="onKeyboardInput">
    <input
      ref="input1"
      autofocus
      :style="{ width: `${inputData.value1.toString().length * 1.2}ch` }"
      type="number"
      v-model="inputData.value1"
      class="calculator-input"
      @keydown="onIputKeyDown($event)"
      @input="(e) => onInputChange(e, 'value1')"
      @blur="(e) => onInputBlur(e, 'value1')"
      @click="onFocusChanged('value1')"
    />
    <span class="calculator-action">{{ resultAndAction.action.toLocaleLowerCase() || '+' }}</span>
    <input
      ref="input2"
      :style="{ width: `${inputData.value2.toString().length * 1.2}ch` }"
      type="number"
      v-model="inputData.value2"
      class="calculator-input"
      @keydown="onIputKeyDown($event)"
      @input="(e) => onInputChange(e, 'value2')"
      @blur="(e) => onInputBlur(e, 'value2')"
      @click="onFocusChanged('value2')"
    />
  </div>
</template>

<style scoped>
.calculator-calculations {
  color: #9e9c9c;
  display: flex;
  font-size: 2.5rem;
  justify-content: flex-end;
  line-height: 1;
  width: 100%;
}

.calculator-action {
  color: inherit;
  min-width: 40px;
  text-align: center;
}

.calculator-input {
  background: transparent;
  border: none;
  color: inherit;
  display: inline-block;
  flex-shrink: 1;
  font-size: inherit;
  height: 3.125rem;
  max-width: 140px;
  width: 100%;
  width: min-content;
}

.calculator-input:focus {
  outline: none;
}

/* Remove arrows/spinners from input type number */
/* Chrome, Safari, Edge, Opera */
.calculator-input::-webkit-outer-spin-button,
.calculator-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.calculator-input[type='number'] {
  -moz-appearance: textfield;
}
</style>

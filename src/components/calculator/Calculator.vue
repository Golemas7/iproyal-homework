<script setup lang="ts">
import { inject, type Ref, watch, ref, onBeforeUnmount, onMounted } from 'vue'
import {
  type CalculatorActions,
  type CalculatorButton,
  type ResultAndAction
} from './ResultAndAction.vue'
import type { History, HistoryItem } from './History.vue'
import {
  calculateInputWidth,
  calculateResult,
  insertTextAtCursor,
  shouldIgnoreButtonInput
} from './helpers'

type InputType = 'value1' | 'value2'

type InputData = {
  value1: string
  value2: string
  currentInputActive: InputType
}

const actions = ['^', '/', 'x', '-', '+']

const { value: inputData } = ref<InputData>({
  value1: '',
  value2: '',
  currentInputActive: 'value1'
})
const input1 = ref<HTMLInputElement | null>(null)
const input2 = ref<HTMLInputElement | null>(null)

const input1Width = ref('1.2ch')
const input2Width = ref('1.2ch')

// Inject the data for binding with result and action
const { value: resultAndAction } = inject<Ref<ResultAndAction>>(
  'resultAndAction'
) as Ref<ResultAndAction>

// Inject the data for binding with history
const { value: history } = inject<Ref<History>>('history') as Ref<History>
const isHistoryMode = inject<Ref<Boolean>>('isHistoryMode') as Ref<Boolean>

// Clear the result if a previous calculation has just finished and we start typing
// Start a new calculcation with the result as a starting point
const restartCalculationWithResultValue = (buttonValue: CalculatorButton) => {
  if (buttonValue !== '=' && resultAndAction.result !== '') {
    inputData.value1 = resultAndAction.result
    inputData.value2 = ''
    resultAndAction.result = ''
  }
}

// Focus input when entering using a keyboard to prevent user not typing anything in case of lost focus
const focusInput = (e: KeyboardEvent) => {
  if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Enter') {
    return
  }

  if (inputData.currentInputActive === 'value1') {
    input1.value.focus()
  } else {
    input2.value.focus()
  }
}

// Handle history clicks
const handleHistoryClick = (historyItem: HistoryItem, handleResultClick?: boolean) => {
  const { value1, action, value2, result } = historyItem

  if (handleResultClick) {
    resultAndAction.action = ''
    inputData.value1 = result.toString() || '0'
    inputData.value2 = '0'
    resultAndAction.result = ''
  } else {
    resultAndAction.action = action as CalculatorActions
    inputData.value1 = value1
    inputData.value2 = value2
    resultAndAction.result = ''
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

// Handle calculator button click OR an action click from keyboard
// CORE Logic
const handleButtonClick = (buttonValue: CalculatorButton) => {
  if (
    shouldIgnoreButtonInput({
      key: buttonValue,
      currentValue: inputData[inputData.currentInputActive],
      result: resultAndAction.result
    })
  ) {
    return
  }

  restartCalculationWithResultValue(buttonValue)

  const isANumber = !Number.isNaN(parseInt(buttonValue, 10))

  if (isANumber || buttonValue === '.') {
    if (inputData.currentInputActive === 'value1') {
      // If we have 0 and type in a different number, override it
      const newValue =
        inputData.value1 === '0' && buttonValue !== '.'
          ? buttonValue
          : insertTextAtCursor(input1?.value, buttonValue)

      inputData.value1 = newValue
    } else {
      // If we have 0 and type in a different number, override it
      const newValue =
        inputData.value2 === '0' && buttonValue !== '.'
          ? buttonValue
          : insertTextAtCursor(input2?.value, buttonValue)

      inputData.value2 = newValue
    }
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
    const newValue = calculateResult(
      inputData.value1 || '0',
      inputData.value2 || '0',
      resultAndAction.action
    )

    // Set the result
    resultAndAction.result = newValue ?? ''

    // Create history entry
    const newHistoryItem = {
      value1: inputData.value1 || '0',
      action: resultAndAction.action as CalculatorActions,
      value2: inputData.value2 || '0',
      result: resultAndAction.result ?? '',
      timeStamp: new Date()
    }

    // Add to history
    history.items.push(newHistoryItem)
  } else if (buttonValue === 'C') {
    // Handle clear

    inputData.value1 = ''
    resultAndAction.action = ''
    inputData.value2 = ''
    resultAndAction.result = ''
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

// Toggle active input
const onFocusChanged = (valueName: InputType) => {
  inputData.currentInputActive = valueName
}

// Check validity of keyboard input keys and remap some to appropriate ones
const onKeyboardInput = (e: KeyboardEvent) => {
  const key = e.key.toUpperCase()

  const validKeys = ['C', '^', '/', 'X', '-', '+', '=', ' ', '*', 'ENTER']

  if (validKeys.includes(key)) {
    let validKey = key

    if (key === ' ') {
      validKey = '↹'
    } else if (key === '*' || key === 'X') {
      validKey = 'x'
    } else if (key === 'ENTER') {
      validKey = '='
    }

    handleButtonClick(validKey as CalculatorButton)
  }
}

// Filter out what gets through to the input
const onIputKeyDown = (e: KeyboardEvent, currentValue = '') => {
  // Let user navigate using tabs and shift tabs
  if (e.key === 'Tab' || e.key === 'Shift') {
    return
  }

  const isANumber = !Number.isNaN(parseInt(e.key, 10))
  const ignoreButton = shouldIgnoreButtonInput({
    key: e.key,
    currentValue,
    result: resultAndAction.result
  })

  if (!isANumber && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== '.') {
    e.preventDefault()
    e.stopPropagation()

    onKeyboardInput(e)
  } else if (ignoreButton) {
    e.preventDefault()
    e.stopPropagation()
  } else if (resultAndAction.result !== '' && e.key !== '=') {
    if (isANumber) {
      restartCalculationWithResultValue(e.key as CalculatorButton)
    } else {
      restartCalculationWithResultValue('0')
    }

    resultAndAction.result = ''
  } else if (currentValue === '0' && isANumber) {
    // Override the 0
    inputData[inputData.currentInputActive] = ''
  }
}

// Reset the result if we change the action and have a result
const onActionChanged = () => {
  if (resultAndAction.action && resultAndAction.result) {
    resultAndAction.result = ''
  }
}

// Set the method references to apropriate methods
resultAndAction.onButtonClick = handleButtonClick
history.setCurrentCalculationToEntry = handleHistoryEntryClick
history.setCurrentCalculationToResult = handleHistoryResultClick

// Retain focus when switching between calcaulation and history mode
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

// Recalculate the width of the inputs when the input data changes
// TODO Optimize this to reduce recalculation amount
watch(inputData, (value) => {
  const { value1, value2 } = value

  input1Width.value = calculateInputWidth(value1)
  input2Width.value = calculateInputWidth(value2)
})

// Handle keyboard input when calculator inputs are not actively focused
onMounted(() => {
  window.addEventListener('keydown', focusInput)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', focusInput)
})
</script>

<template>
  <div v-if="!isHistoryMode" class="calculator-calculations" @keydown="onKeyboardInput">
    <label class="sr-only" for="value1">First number of the calculation</label>
    <input
      id="value1"
      ref="input1"
      autofocus
      :style="{ width: input1Width }"
      type="text"
      v-model="inputData.value1"
      class="calculator-input"
      placeholder="0"
      @keydown="(e) => onIputKeyDown(e, inputData.value1)"
      @click="onFocusChanged('value1')"
    />
    <label class="sr-only" for="action">The operation of the calculation</label>
    <select
      v-model="resultAndAction.action"
      id="action"
      class="calculator-select"
      placeholder="_"
      @change="onActionChanged"
    >
      <option value="" disabled selected hidden>_</option>
      <option :key="action" v-for="action in actions" :value="action">{{ action }}</option>
    </select>
    <label class="sr-only" for="value2">Second number of the calculation</label>
    <input
      id="value2"
      ref="input2"
      :style="{ width: input2Width }"
      type="text"
      v-model="inputData.value2"
      placeholder="0"
      class="calculator-input"
      @keydown="(e) => onIputKeyDown(e, inputData.value2)"
      @click="onFocusChanged('value2')"
    />
  </div>
</template>

<style scoped>
.calculator-calculations {
  color: #9e9c9c;
  display: flex;
  flex-wrap: wrap;
  font-size: 2.5rem;
  justify-content: flex-end;
  line-height: 1;
  width: 100%;
}

.calculator-input,
.calculator-select {
  background: transparent;
  border: none;
  color: inherit;
}

.calculator-input {
  display: inline-block;
  flex-shrink: 1;
  height: 3.125rem;
  max-width: 300px;
  font-size: inherit;
  width: 100%;
}

.calculator-select {
  /* for Firefox */
  -moz-appearance: none;
  /* for Chrome */
  -webkit-appearance: none;

  font-size: 2.2rem;
  cursor: pointer;
  min-width: 40px;
  text-align: center;
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

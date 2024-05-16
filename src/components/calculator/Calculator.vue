<script setup lang="ts">
import { inject, type Ref, watch, ref } from 'vue'
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

// Clear the result if a previous calculation has just finished and we start typing
// Start a new calculcation with the result as a starting point
const restartCalculationWithResultValue = (buttonValue: CalculatorButton) => {
  if (buttonValue !== '=' && resultAndAction.result !== '') {
    inputData.value1 = resultAndAction.result
    inputData.value2 = ''
    resultAndAction.result = ''
  }
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

  const isANumber = !isNaN(parseInt(buttonValue))

  if (isANumber || buttonValue === '.') {
    if (inputData.currentInputActive === 'value1') {
      // If we have 0 and type in a different number, override it
      let newValue =
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

// TODO HANDLE ACCESSIBILITY CASES
// Instead of holding the users focus, we could just use the active variable to add to value
const onInputBlur = (e: Event, valueName: InputType) => {
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

const onFocusChanged = (valueName: InputType) => {
  inputData.currentInputActive = valueName
}

// Check validity of keyboard input keys and remap some to appropriate ones
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

// Filter out what gets through to the input
const onIputKeyDown = (e: KeyboardEvent, currentValue = '') => {
  const isANumber = !isNaN(parseInt(e.key))
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
</script>

<!-- TODO Optimize stylesheets with a more extensive global config with variables -->
<template>
  <div v-if="!isHistoryMode" class="calculator-calculations" @keydown="onKeyboardInput">
    <input
      ref="input1"
      autofocus
      :style="{ width: input1Width }"
      type="text"
      v-model="inputData.value1"
      class="calculator-input"
      placeholder="0"
      @keydown="(e) => onIputKeyDown(e, inputData.value1)"
      @blur="(e) => onInputBlur(e, 'value1')"
      @click="onFocusChanged('value1')"
    />
    <span class="calculator-action">{{ resultAndAction.action.toLocaleLowerCase() || '_' }}</span>
    <input
      ref="input2"
      :style="{ width: input2Width }"
      type="text"
      v-model="inputData.value2"
      placeholder="0"
      class="calculator-input"
      @keydown="(e) => onIputKeyDown(e, inputData.value2)"
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
  flex-wrap: wrap;
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
  max-width: 300px;
  width: 100%;
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

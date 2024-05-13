<script setup lang="ts">
import { onBeforeUnmount, onMounted, inject, type Ref, watch, ref } from 'vue'
import {
  type CalculatorActions,
  type CalculatorButton,
  type ResultAndAction
} from './ResultAndAction.vue'
import type { History, HistoryItem } from './History.vue'
import { parseNumberValueFromString } from './helpers'

// const calculatorRegExp = /^[Cc\^%/789Xx456\-123\+0.=]+$/

// Inject the data for binding with result and action
const { value: calculation } = inject<Ref<ResultAndAction>>(
  'resultAndAction'
) as Ref<ResultAndAction>

// Inject the data for binding with history
const { value: history } = inject<Ref<History>>('history') as Ref<History>
const isHistoryMode = inject<Ref<Boolean>>('isHistoryMode') as Ref<Boolean>

const input1 = ref<HTMLInputElement | null>(null)
const input2 = ref<HTMLInputElement | null>(null)

const handleCalculationAction = (
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

const handleHistoryClick = (hisotryItem: HistoryItem) => {
  const { value1, action, value2, result } = hisotryItem

  calculation.action = action as CalculatorActions
  calculation.value1 = value1
  calculation.value2 = value2
  calculation.result = result
}

// TODO HANDLE FLOAT VALUES
const handleButtonClick = (buttonValue: CalculatorButton) => {
  if (buttonValue !== '=' && calculation.result !== null) {
    calculation.result = null
  }

  const isANumber = !isNaN(parseInt(buttonValue))

  if (isANumber || buttonValue === '.') {
    // Handle number inputs
    const oldNumber = calculation[calculation.currentInputActive]
    const newNumber = '' + oldNumber + buttonValue

    calculation[calculation.currentInputActive] = parseFloat(newNumber)
  } else if (buttonValue === '↹') {
    // Handle switching the inputs
    if (calculation.currentInputActive === 'value1') {
      input2.value?.click()
      input2.value?.focus()
    } else {
      input1.value?.click()
      input1.value?.focus()
    }
  } else if (buttonValue === '=') {
    // Handle calculation

    // We return if the action is missing
    if (!calculation.action) {
      return
    }

    // Calculate the value
    const newValue = handleCalculationAction(
      calculation.value1,
      calculation.value2,
      calculation.action
    )

    // Set the result
    calculation.result = newValue ?? null

    // Create history entry

    const newHistoryItem = {
      value1: calculation.value1,
      action: calculation.action as CalculatorActions,
      value2: calculation.value2,
      result: calculation.result ?? 0,
      timeStamp: new Date()
    }

    history.items.push(newHistoryItem)
  } else if (buttonValue === 'C') {
    // Handle clear

    calculation.value1 = 0
    calculation.action = ''
    calculation.value2 = 0
    calculation.result = null
    calculation.currentInputActive = 'value1'

    input1.value?.focus()
  } else {
    // Handle Actions
    calculation.action = buttonValue as CalculatorActions

    if (calculation.currentInputActive !== 'value2') {
      calculation.currentInputActive = 'value2'
      input2.value?.focus()
    }
  }
}

const onInputChange = (event: Event, valueName: 'value1' | 'value2') => {
  const target = event.target as HTMLInputElement
  const newValue = target.value

  if (newValue === '') {
    calculation[valueName] = 0
  }
}

//  TODO HANDLE ACCESSIBILITY CASES
const onInputBlur = (e: Event, valueName: 'value1' | 'value2') => {
  // We set a timeout, so click will register first before we start processing if new input was clicked. We need this, because the blur event is fired first.
  setTimeout(() => {
    if (calculation.currentInputActive === valueName) {
      const input = e.target as HTMLInputElement

      calculation.currentInputActive = valueName
      input.focus()

      // Browser limitation, sometimes we need to wait for blur to finish
      setTimeout(() => {
        input.focus()
      }, 100)
    }
  }, 100)
}

const onFocusChanged = (valueName: 'value1' | 'value2') => {
  console.log('click simulated')

  calculation.currentInputActive = valueName
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
  if (isNaN(parseInt(e.key)) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== '.') {
    e.preventDefault()
    e.stopPropagation()

    onKeyboardInput(e)
  } else if (calculation.result !== null && e.key !== '=') {
    calculation.result = null
  }
}

// Set the method references to apropriate methods
calculation.onButtonClick = handleButtonClick
history.setCurrentCalculationToEntry = handleHistoryClick

// TODO RETAIN FOCUS AFTER SWITCHING BETWEEN HISTORY/CALCULATOR
watch(isHistoryMode.value, (value) => {
  if (!value) {
    input1.value?.focus()
  }
})
</script>

<!-- TODO HANDLE :style width with decimal numbers -->
<template>
  <div v-if="!isHistoryMode" class="calculator-calculations" @keydown="onKeyboardInput">
    <input
      ref="input1"
      autofocus
      :style="{ width: `${calculation.value1.toString().length * 1.2}ch` }"
      type="number"
      v-model="calculation.value1"
      class="calculator-input"
      @keydown="onIputKeyDown($event)"
      @input="(e) => onInputChange(e, 'value1')"
      @blur="(e) => onInputBlur(e, 'value1')"
      @click="onFocusChanged('value1')"
    />
    <span class="calculator-action">{{ calculation.action.toLocaleLowerCase() || '+' }}</span>
    <input
      ref="input2"
      :style="{ width: `${calculation.value2.toString().length * 1.2}ch` }"
      type="number"
      v-model="calculation.value2"
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
  font-size: 2.5rem;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  line-height: 1;
  color: #9e9c9c;
}

.calculator-action {
  min-width: 40px;
  color: inherit;
  text-align: center;
}

.calculator-input {
  background: transparent;
  border: none;
  width: min-content;
  height: 3.125rem;
  font-size: inherit;
  flex-shrink: 1;
  display: inline-block;
  max-width: 140px;
  width: 100%;
  color: inherit;
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

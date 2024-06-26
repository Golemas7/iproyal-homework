<script setup lang="ts">
import { provide, ref, watch } from 'vue'

import Button from '@components/Button.vue'
import { useWindowSize } from '@/utils/window'
import History from './History.vue'
import { getButton } from './helpers'

export type CalculatorActions = 'C' | '^' | '↹' | '/' | 'x' | '-' | '+' | '='
export type CalculatorNumbers = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
export type CalculatorButton = CalculatorActions | CalculatorNumbers | '.'

export type ResultAndAction = {
  action: CalculatorActions | ''
  result: string
  // eslint-disable-next-line no-unused-vars
  onButtonClick: (e: CalculatorButton) => void
}

// TODO ADD TITLES SO PEOPLE CAN UNDERSTAND BY HOVER WHAT IT DOES
const buttons: CalculatorButton[][] = [
  ['C', '^', '↹', '/'],
  ['7', '8', '9', 'x'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '=']
]

const calculatorButtons = buttons.map((buttonArray) =>
  buttonArray.map((button) => getButton(button))
)

const buttonsMobile: CalculatorButton[][] = [
  ['C', '^', '/'],
  ['x', '-', '+'],
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', '.', '↹'],
  ['=']
]

const calculatorMobileButtons = buttonsMobile.map((buttonArray) =>
  buttonArray.map((button) => getButton(button))
)

// Could just do a check of !isNaN(parseInt(value)) instead
const numberButtons = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const resultAndAction = ref<ResultAndAction>({
  action: '',
  result: '',
  onButtonClick: () => {}
})
const isHistoryMode = ref(false)

provide('resultAndAction', resultAndAction)
provide('isHistoryMode', isHistoryMode)

const handleButtonClick = (e: CalculatorButton) => {
  resultAndAction.value.onButtonClick(e)
}

// Handle media queries programically
const { width } = useWindowSize()
const isTablet = ref(width.value >= 768)

watch(width, (value) => {
  isTablet.value = value >= 768
})
</script>

<template>
  <div class="calculator">
    <div class="calculator-inner-container">
      <div class="calculator-header">
        <Button as-icon @click="isHistoryMode = false">
          <h1 v-if="!isHistoryMode" class="title title--active">Calculator</h1>
          <h2 v-else class="title">Calculator</h2>
        </Button>
        <Button as-icon @click="isHistoryMode = true">
          <h1 v-if="isHistoryMode" class="title title--active">History</h1>
          <h2 v-else class="title">History</h2>
        </Button>
      </div>
      <div class="screen" :class="{ 'screen--history-mode': isHistoryMode }">
        <History />

        <template v-if="!isHistoryMode">
          <div v-if="resultAndAction.result !== ''" class="result">
            <span class="result-symbol">=</span>
            <span class="result-value">{{ resultAndAction.result }}</span>
          </div>
        </template>
      </div>
      <div v-if="!isHistoryMode" class="buttons-container">
        <template v-for="buttonsRow in isTablet ? calculatorButtons : calculatorMobileButtons">
          <template :key="button" v-for="{ value: button, title } in buttonsRow">
            <Button
              :title="title"
              :type="numberButtons.includes(button) ? 'Secondary' : 'Primary'"
              class="calculator-button"
              @click="handleButtonClick(button)"
              :class="{
                'two-rows': button === '+',
                'three-columns': button === '='
              }"
            >
              {{ button }}
            </Button>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calculator-inner-container {
  --max-calculator-width: 450px;

  background-color: var(--color-gray-250);
  border-radius: 40px;
  height: 1050px;
  margin: 0 auto;
  max-width: var(--max-calculator-width);
  padding: 30px 20px;
  position: relative;
  width: 100%;
}

.title {
  color: var(--color-white);
  font-size: 1rem;
  padding-bottom: 0.25rem;
}

.title--active {
  border-bottom: 1.5px solid var(--color-white);
}

.calculator-header {
  align-items: center;
  color: var(--color-white);
  display: flex;
  gap: 32px;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.screen {
  align-items: flex-end;
  background-color: #0b0b0b1a;
  border-radius: 20px;
  box-shadow: 5px 5px 60px 0px #0b0b0b1a;
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: flex-end;
  margin: 0 auto 40px;
  max-width: 300px;
  overflow: visible;
  padding: 30px;
  position: relative;
  width: 100%;
}

.screen--history-mode {
  height: 600px;
}

.result {
  color: var(--color-white);
  font-size: 1.875rem;

  .result-symbol {
    padding-right: 1rem;
  }
}

.buttons-container {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  justify-content: space-between;
  margin: 0 auto;
  max-width: 300px;
  row-gap: 20px;
}

.calculator-button {
  border-radius: 100%;
  border: none;
  color: var(--color-white);
  font-size: 1.563rem;
  height: 65px;
  width: 65px;
}

.three-columns {
  border-radius: 42.5px;
  grid-column: span 3;
  width: 100%;
}

@media screen and (min-width: 768px) {
  .calculator-inner-container {
    height: 950px;
    padding: 60px 35px;
    width: var(--max-calculator-width);
  }

  .calculator-header {
    margin-bottom: 40px;
  }

  .screen {
    margin-bottom: 60px;
    padding: 30px;
    width: 380px;
    max-width: none;
  }

  .screen--history-mode {
    height: 700px;
  }

  .two-rows {
    border-radius: 42.5px;
    grid-row: span 2;
    height: 150px;
  }

  .three-columns {
    border-radius: 100%;
    grid-column: span 1;
    height: 65px;
  }

  .buttons-container {
    column-gap: 40px;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(5, 1fr);
    margin: 0;
    max-width: none;
    row-gap: 20px;
  }
}
</style>

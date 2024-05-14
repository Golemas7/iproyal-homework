<script setup lang="ts">
import { provide, ref } from 'vue'

// TODO HANDLE ABSOLUTE PATHS

import History from './History.vue'
import Button from '../Button.vue'

export type ResultAndAction = {
  action: CalculatorActions | ''
  result: number | null
  onButtonClick: (e: CalculatorButton) => void
}

export type CalculatorActions = 'C' | '^' | '↹' | '/' | 'X' | '-' | '+' | '='
export type CalculatorNumbers = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
export type CalculatorButton = CalculatorActions | CalculatorNumbers | '.'

const buttons: CalculatorButton[][] = [
  ['C', '^', '↹', '/'],
  ['7', '8', '9', 'X'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '=']
]

const buttonsMobile: CalculatorButton[][] = [
  ['C', '^', '/'],
  ['X', '-', '+'],
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', '.', '↹'],
  ['=']
]

// Could just do a check of !isNaN(parseInt(value)) instead
const numberButtons = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

// TODO CHECK IF WE CAN USE REACTIVE OR ONLY REF
const resultAndAction = ref<ResultAndAction>({
  action: '',
  result: null,
  onButtonClick: (e: CalculatorButton) => {}
})
const isHistoryMode = ref(false)

provide('resultAndAction', resultAndAction)
provide('isHistoryMode', isHistoryMode)

const handleButtonClick = (e: CalculatorButton) => {
  resultAndAction.value.onButtonClick(e)
}
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
          <div v-if="resultAndAction.result !== null" class="result">
            <span class="result-symbol">=</span>
            <span class="result-value">{{ resultAndAction.result }}</span>
          </div>
        </template>
      </div>
      <div v-if="!isHistoryMode" class="buttons-container">
        <template v-for="buttonsRow in buttons">
          <template v-for="button in buttonsRow">
            <Button
              :type="numberButtons.includes(button) ? 'Secondary' : 'Primary'"
              class="calculator-button"
              @click="handleButtonClick(button)"
              :class="{
                'two-rows': button === '+'
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
  --max-calculator-width: 28.125rem;

  width: 100%;
  max-width: var(--max-calculator-width);
  height: 59.375rem;
  background-color: #414141;
  border-radius: 40px;
  padding: 30px 20px;
}

.title {
  font-size: 1rem;
  color: white;
  padding-bottom: 0.25rem;
}

.title--active {
  border-bottom: 1.5px solid white;
}

.calculator-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  gap: 2rem;
}

.screen {
  background-color: #0b0b0b1a;
  height: 18.75rem;
  width: 100%;
  padding: 30px;
  border-radius: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  margin-bottom: 60px;
  box-shadow: 5px 5px 60px 0px rgba(11, 11, 11, 0.1);
  overflow: hidden;
}

@media screen and (min-width: 768px) {
  .calculator-inner-container {
    width: var(--max-calculator-width);
    height: 59.375rem;
    border-radius: 2.5rem;
    padding: 60px 35px;
  }

  .calculator-header {
    margin-bottom: 2.5rem;
  }

  .screen {
    height: 18.75rem;
    width: 23.75rem;
    padding: 30px;
    border-radius: 1.25rem;
    margin-bottom: 60px;
  }
}

.screen--history-mode {
  height: 700px;
  position: relative;
  overflow: visible;
}

.result {
  font-size: 1.875rem;

  .result-symbol {
    padding-right: 1rem;
  }

  .result-value {
    color: white;
  }
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
</style>

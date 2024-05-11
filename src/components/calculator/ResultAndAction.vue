<script setup lang="ts">
import { computed, provide, ref } from 'vue'

import History from './History.vue'

export type ResultAndAction = {
  value: string
  action: string
  actionStarted: boolean
  previousValue: string
  fakeDecimal: boolean
  onButtonClick: (e: CalculatorButton) => void
}

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

// TODO CHECK IF WE CAN USE REACTIVE OR ONLY REF
const calculation = ref<ResultAndAction>({
  value: '0',
  action: '',
  actionStarted: false,
  previousValue: '',
  fakeDecimal: false,
  onButtonClick: (e: CalculatorButton) => {}
})

provide('resultAndAction', calculation)

const visibleValue = computed(() => {
  const { value, fakeDecimal, previousValue } = calculation.value

  if (value === '') {
    if (fakeDecimal) {
      return '0'
    }

    return previousValue
  }

  return value
})

const handleButtonClick = (e: CalculatorButton) => {
  calculation.value.onButtonClick(e)
}
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
  <History />
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

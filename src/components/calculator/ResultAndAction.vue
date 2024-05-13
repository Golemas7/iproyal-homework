<script setup lang="ts">
import { computed, provide, ref } from 'vue'

// TODO HANDLE ABSOLUTE PATHS

import History from './History.vue'
import Button from '../Button.vue'

export type ResultAndAction = {
  value: string
  action: string
  actionStarted: boolean
  previousValue: string
  fakeDecimal: boolean
  onButtonClick: (e: CalculatorButton) => void
}

export type CalculatorActions = 'C' | '^' | '%' | '/' | 'X' | '-' | '+' | '='
export type CalculatorNumbers = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
export type CalculatorButton = CalculatorActions | CalculatorNumbers | '.'

const buttons: CalculatorButton[][] = [
  ['C', '^', '%', '/'],
  ['7', '8', '9', 'X'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '=']
]

// Could just do a check of !isNaN(parseInt(value)) instead
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
const isHistoryMode = ref(false)

provide('resultAndAction', calculation)
provide('isHistoryMode', isHistoryMode)

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
          <div class="history">
            <template v-if="calculation.previousValue">
              <span>{{ calculation.previousValue }}</span>
              <span>{{ ` ${calculation.action}` }}</span>
            </template>
          </div>

          <div class="current">
            <span>{{ visibleValue }}{{ calculation.fakeDecimal ? '.' : '' }}</span>
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
  width: 450px;
  height: 950px;
  background-color: #414141;
  border-radius: 40px;
  padding: 60px 35px;
}

.title {
  font-size: 1rem;
  padding-bottom: 0.25rem;
  color: white;
}

.title--active {
  border-bottom: 1.5px solid white;
}

.calculator-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;
  color: white;
  gap: 2rem;
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
  overflow: hidden;
}

.screen--history-mode {
  height: 700px;
  position: relative;
  overflow: visible;
}

.history {
  font-size: 2.5rem;
  color: #9e9c9c;
  min-height: 6rem;
  display: flex;
  align-items: flex-end;
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
</style>

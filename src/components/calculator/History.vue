<script setup lang="ts">
import { provide, ref } from 'vue'
import Calculator from './Calculator.vue'

defineProps<{
  hasCalculator?: boolean
}>()

export type HistoryItem = {
  value1: string
  action: string
  value2: string
  result: string
}

export type History = {
  items: HistoryItem[]
  setCurrentCalculationToEntry: (entry: HistoryItem) => void
}

const history = ref<History>({
  items: [],
  setCurrentCalculationToEntry: (e: HistoryItem) => {}
})

provide('history', history)
</script>

<template>
  <div class="history">
    <button
      v-for="historyItem in history.items"
      class="history-entry"
      @click="history.setCurrentCalculationToEntry(historyItem)"
    >
      {{ `${historyItem.value1} ${historyItem.action} ${historyItem.value2}` }}
    </button>
  </div>
  <template v-if="hasCalculator">
    <Calculator />
  </template>
</template>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.history-entry {
  cursor: pointer;
  background: transparent;
  font-size: 1.2rem;
  color: #6b6a6a;
  height: 2rem;
  border: 0;
}
</style>

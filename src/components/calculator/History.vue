<script setup lang="ts">
import { computed, inject, provide, ref, type Ref } from 'vue'
import Calculator from './Calculator.vue'
import Button from '../Button.vue'

export type HistoryItem = {
  value1: string
  action: string
  value2: string
  result: string
  timeStamp: Date
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

const isHistoryMode = inject<Ref<Boolean>>('isHistoryMode') as Ref<Boolean>

const handleButtonClick = (historyItem: HistoryItem) => {
  history.value.setCurrentCalculationToEntry(historyItem)
  isHistoryMode.value = false
}

const sortedItems = computed(() => {
  const unsortedItems = [...history.value.items]

  let sortedItems = unsortedItems

  if (isHistoryMode.value) {
    sortedItems = unsortedItems.sort((a, b) => (a > b ? -1 : 1))
  }

  return sortedItems
})

const saveToFile = (filename: string, data: string) => {
  const blob = new Blob([data], { type: 'text/csv' })

  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename)
  } else {
    const elem = window.document.createElement('a')
    const href = window.URL.createObjectURL(blob)

    elem.href = href
    elem.download = filename
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
    URL.revokeObjectURL(href)
  }
}

const parseDataIntoXlsFormat = (data: HistoryItem[]) => {
  const initialString = 'value 1,action,value 2,result,timestamp\n'

  const finalString = data.reduce((builtString, historyItem) => {
    const { value1, action, value2, result, timeStamp } = historyItem

    const dataRow = `${value1},${action},${value2},${result},${JSON.stringify(timeStamp)}`

    return builtString + dataRow + '\n'
  }, initialString)

  return finalString
}

const onHistoryExport = () => {
  const data = parseDataIntoXlsFormat(sortedItems.value)

  saveToFile('test', data)
}
const onHistoryImport = () => {}
</script>

<template>
  <div class="history" :class="{ 'history--history-mode': isHistoryMode }">
    <Button
      v-for="historyItem in sortedItems"
      as-icon
      class="history-entry"
      @click="handleButtonClick(historyItem)"
    >
      {{ `${historyItem.value1} ${historyItem.action} ${historyItem.value2}` }}
    </Button>
  </div>
  <div v-if="isHistoryMode" class="history-actions">
    <Button class="history-action">Import</Button>
    <Button class="history-action" @click="onHistoryExport">Export</Button>
  </div>
  <Calculator />
</template>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  width: 100%;
  align-items: flex-end;
  gap: 0.1rem;
  height: 100%;
  overflow-y: hidden;
  justify-content: flex-end;
}

.history--history-mode {
  overflow-y: auto;
  padding-right: 0.25rem;
  gap: 0.5rem;
  justify-content: flex-start;

  .history-entry {
    color: white;
  }
}

.history-entry {
  cursor: pointer;
  background: transparent;
  font-size: 1.2rem;
  color: #6b6a6a;
  height: 2rem;
  border: 0;
}

.history-actions {
  position: absolute;
  bottom: -4rem;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  right: 0;
  font-size: 1.563rem;
  gap: 2rem;

  .history-action {
    padding: 0.25rem 1rem;
  }
}
</style>

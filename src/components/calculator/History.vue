<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch, type Ref } from 'vue'
import Calculator from './Calculator.vue'
import Button from '../Button.vue'
import { it } from 'node:test'

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

const input = ref<HTMLInputElement | null>(null)
const importData = ref<string>('')

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

  let sortedItemsArray = unsortedItems

  sortedItemsArray = unsortedItems.sort((a, b) => b.timeStamp - a.timeStamp)

  if (!isHistoryMode.value) {
    sortedItemsArray = sortedItemsArray.reverse()
  }
  return [...sortedItemsArray]
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

const parseDataIntoCsvFormat = (data: HistoryItem[]) => {
  const initialString = 'value 1,action,value 2,result,timestamp\n'

  const finalString = data.reduce((builtString, historyItem) => {
    const { value1, action, value2, result, timeStamp } = historyItem

    const dataRow = `${value1},${action},${value2},${result},${timeStamp.toString()}`

    return builtString + dataRow + '\n'
  }, initialString)

  return finalString
}

const readFileData = (e: Event) => {
  const target = e.target as HTMLInputElement

  if (target?.files && target?.files?.[0]) {
    const myFile = target?.files?.[0]
    const reader = new FileReader()

    reader.addEventListener('load', (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer

      // Convert the ArrayBuffer to a string
      const decoder = new TextDecoder('utf-8')
      const csvString = decoder.decode(arrayBuffer)

      importData.value = csvString
    })

    reader.readAsArrayBuffer(myFile)
  }
}

const onHistoryExport = () => {
  const data = parseDataIntoCsvFormat(sortedItems.value)

  saveToFile('calculator_history', data)
}
const onHistoryImport = () => {
  if (input.value) {
    input.value.click()
  }
}

const parseCsvStringToHistoryItems = (csvString: string) => {
  if (!csvString) {
    return []
  }

  const items: HistoryItem[] = csvString
    .split('\n')
    .map((historyItemString, index) => {
      // The first item is the column names
      if (index === 0) {
        return
      }

      const [value1, action, value2, result, timeStamp] = historyItemString.split(',')

      if (!value1 || !action || !value2 || !result || !timeStamp) {
        return
      }

      const historyItem = {
        value1,
        action,
        value2,
        result,
        timeStamp: new Date(timeStamp)
      }

      return historyItem
    })
    .filter(
      (item) =>
        !!item &&
        !!item.value1 &&
        !!item.value2 &&
        !!item.action &&
        !!item.result &&
        !!item.timeStamp
    ) as HistoryItem[]

  return items
}

watch(importData, (data) => {
  if (!!data) {
    const importedHistoryItems = parseCsvStringToHistoryItems(data)

    // Merge with current history items
    const currentHistoryItems = [...history.value.items]
    const combinedHistoryItems = [...currentHistoryItems, ...importedHistoryItems]
    const sortedItems = [...combinedHistoryItems]

    history.value.items = sortedItems
  }
})
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
    <Button class="history-action" @click="onHistoryImport">Import</Button>
    <Button class="history-action" @click="onHistoryExport">Export</Button>
    <input
      ref="input"
      tabindex="-1"
      class="history-action--hidden"
      type="file"
      accept=".xls,.xlsx,.csv"
      @change="readFileData($event)"
    />
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

  .history-action--hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
}
</style>

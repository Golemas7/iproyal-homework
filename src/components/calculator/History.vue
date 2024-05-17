<script setup lang="ts">
import { computed, inject, provide, ref, watch, type Ref } from 'vue'
import { saveToFile, readFileData } from '@utils/file'
import Button from '@components/Button.vue'
import Calculator from './Calculator.vue'
import { parseCsvStringToHistoryItems, parseDataIntoCsvFormat } from './helpers'

export type HistoryItem = {
  value1: string
  action: string
  value2: string
  result: string
  timeStamp: Date
}

export type History = {
  items: HistoryItem[]
  // eslint-disable-next-line no-unused-vars
  setCurrentCalculationToEntry: (entry: HistoryItem) => void
  // eslint-disable-next-line no-unused-vars
  setCurrentCalculationToResult: (entry: HistoryItem) => void
}

const allowedExtensions = '.xls,.xlsx,.csv'

const input = ref<HTMLInputElement | null>(null)
const importData = ref<string>('')
const history = ref<History>({
  items: [],
  setCurrentCalculationToEntry: () => {},
  setCurrentCalculationToResult: () => {}
})

provide('history', history)

const isHistoryMode = inject<Ref<Boolean>>('isHistoryMode') as Ref<Boolean>

const sortedItems = computed(() => {
  const unsortedItems = [...history.value.items]

  let sortedItemsArray = unsortedItems

  sortedItemsArray = unsortedItems.sort((a, b) => +b.timeStamp - +a.timeStamp)

  if (!isHistoryMode.value) {
    const itemsLength = sortedItemsArray.length

    // Get the last 2 items
    sortedItemsArray = sortedItemsArray.reverse().slice(itemsLength - 2)
  }
  return [...sortedItemsArray]
})

const onHistoryExport = () => {
  const headerRowString = 'value 1,action,value 2,result,timestamp\n'

  const data = parseDataIntoCsvFormat(sortedItems.value, headerRowString)

  saveToFile('calculator_history', data)
}

const onHistoryImport = () => {
  if (input.value) {
    input.value.click()
  }
}

const onHistoryClear = () => {
  history.value.items = []
}

const onFileAttached = (e: Event) => {
  readFileData(e, importData, allowedExtensions.split(','))
}

const handleButtonClick = (historyItem: HistoryItem, isResult?: boolean) => {
  if (isResult) {
    history.value.setCurrentCalculationToResult(historyItem)
  } else {
    history.value.setCurrentCalculationToEntry(historyItem)
  }

  isHistoryMode.value = false
}

watch(importData, (data) => {
  if (data) {
    const importedHistoryItems = parseCsvStringToHistoryItems(data)

    // Merge with current history items
    const currentHistoryItems = [...history.value.items]
    const combinedHistoryItems = [...currentHistoryItems, ...importedHistoryItems]

    history.value.items = combinedHistoryItems
  }
})
</script>

<template>
  <div class="history" :class="{ 'history--history-mode': isHistoryMode }">
    <template v-if="sortedItems?.length > 0">
      <div
        :key="historyItem.timeStamp.toString()"
        v-for="historyItem in sortedItems"
        class="history-entry-container"
      >
        <Button
          as-icon
          class="history-entry history-entry--calculation"
          @click="handleButtonClick(historyItem)"
        >
          <span>{{ historyItem.value1 }}</span>
          <span>&nbsp;{{ historyItem.action }}&nbsp;</span>
          <span>{{ historyItem.value2 }}</span>
        </Button>
        <Button as-icon class="history-entry" @click="handleButtonClick(historyItem, true)">
          {{ `=  ${historyItem.result}` }}
        </Button>
      </div>
    </template>
    <span v-else-if="isHistoryMode" class="no-history">No history found</span>
  </div>
  <div v-if="isHistoryMode" class="history-actions">
    <Button class="history-action" @click="onHistoryImport">Import</Button>
    <Button class="history-action" @click="onHistoryExport">Export</Button>
    <input
      ref="input"
      tabindex="-1"
      class="sr-only"
      type="file"
      :accept="allowedExtensions"
      @change="onFileAttached($event)"
    />
    <Button type="Secondary" class="history-action" @click="onHistoryClear">Clear</Button>
  </div>
  <Calculator />
</template>

<style scoped>
.history {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  height: 100%;
  justify-content: flex-end;
  margin-bottom: 16px;
  overflow-y: hidden;
  width: 100%;
}

.history--history-mode {
  gap: 24px;
  justify-content: flex-start;
  overflow-y: auto;
  padding-right: 4px;
  color: white;

  .history-entry {
    color: white;
  }

  .history-entry--calculation {
    display: flex;
    flex-wrap: wrap;
    font-size: 1.5rem;
    height: auto;
    justify-content: flex-end;
  }
}

.history-entry-container {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
}

.history-entry {
  background: transparent;
  border: 0;
  color: #6b6a6a;
  cursor: pointer;
  font-size: 1.2rem;
  height: 2rem;
}

.history-actions {
  bottom: -310px;
  display: flex;
  flex-direction: column;
  font-size: 1.563rem;
  gap: 24px;
  justify-content: space-between;
  position: absolute;
  right: 0;
  width: 100%;

  .history-action {
    padding: 12px 16px;
  }
}

@media screen and (min-width: 768px) {
  .history-actions {
    bottom: -80px;
    flex-direction: row;
  }
}
</style>

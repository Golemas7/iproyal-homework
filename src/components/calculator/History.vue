<script setup lang="ts">
import { computed, inject, provide, ref, watch, type Ref } from 'vue'
import { saveToFile, readFileData } from '@/utils/file'
import Calculator from './Calculator.vue'
import Button from '../Button.vue'
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
  readFileData(e, importData)
}

const handleButtonClick = (historyItem: HistoryItem) => {
  history.value.setCurrentCalculationToEntry(historyItem)
  isHistoryMode.value = false
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

const sortedItems = computed(() => {
  const unsortedItems = [...history.value.items]

  let sortedItemsArray = unsortedItems

  sortedItemsArray = unsortedItems.sort((a, b) => +b.timeStamp - +a.timeStamp)

  if (!isHistoryMode.value) {
    sortedItemsArray = sortedItemsArray.reverse()
  }
  return [...sortedItemsArray]
})
</script>

<template>
  <div class="history" :class="{ 'history--history-mode': isHistoryMode }">
    <template v-if="sortedItems?.length > 0">
      <Button
        v-for="historyItem in sortedItems"
        as-icon
        class="history-entry"
        @click="handleButtonClick(historyItem)"
      >
        {{ `${historyItem.value1} ${historyItem.action} ${historyItem.value2}` }}
      </Button>
    </template>
    <span v-else-if="isHistoryMode">No history found</span>
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
      @change="onFileAttached($event)"
    />
    <Button type="Secondary" class="history-action" @click="onHistoryClear">Clear</Button>
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
  bottom: -5rem;
  display: flex;
  justify-content: space-between;
  width: 100%;
  right: 0;
  font-size: 1.563rem;
  gap: 2rem;

  .history-action {
    padding: 0.75rem 1rem;
  }

  /* As per https://www.a11yproject.com/posts/how-to-hide-content/ */
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

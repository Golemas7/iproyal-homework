<script setup lang="ts">
import { computed, inject, provide, ref, watch, type Ref } from 'vue'
import { saveToFile, readFileData } from '@/utils/file'
import Button from '@/components/Button.vue'
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
          <!-- {{ `${historyItem.value1} ${historyItem.action} ${historyItem.value2}` }} -->
        </Button>
        <Button as-icon class="history-entry" @click="handleButtonClick(historyItem, true)">
          {{ `=  ${historyItem.result}` }}
        </Button>
      </div>
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
  overflow-y: auto;
  padding-right: 4px;
  gap: 24px;
  justify-content: flex-start;

  .history-entry {
    color: white;
  }

  .history-entry--calculation {
    font-size: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    height: auto;
  }
}

.history-entry-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
  bottom: -310px;
  flex-direction: column;
  display: flex;
  justify-content: space-between;
  width: 100%;
  right: 0;
  font-size: 1.563rem;
  gap: 24px;

  .history-action {
    padding: 12px 16px;
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

@media screen and (min-width: 768px) {
  .history-actions {
    flex-direction: row;
    bottom: -80px;
  }
}
</style>

<script setup lang="ts">
export type CalculatorNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type CalculatorNumbersAndFloat = CalculatorNumbers | '.'

defineProps<{
  number: CalculatorNumbersAndFloat
}>()
</script>

<template>
  <Button>
    {{ number }}
  </Button>
</template>

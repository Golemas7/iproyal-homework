<script setup lang="ts">
export type CalculatorActions = 'C' | '^' | '%' | '/' | 'X' | '-' | '+' | '='

defineProps<{
  action: CalculatorActions
}>()
</script>

<template>
  <Button>
    {{ action }}
  </Button>
</template>

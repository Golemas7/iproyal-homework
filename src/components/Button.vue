<script setup lang="ts">
defineProps<{
  class?: string
}>()
</script>
<template>
  <button class="button" :class="class"><slot></slot></button>
</template>

<style scoped>
.button {
  border: none;
  background: transparent;
  cursor: pointer;
  color: white;
}

.button:hover {
  opacity: 0.7;
}
</style>

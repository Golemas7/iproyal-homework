<script setup lang="ts">
import Button from '@components/Button.vue'
</script>

<template>
  <Button class="help-button">?</Button>
</template>

<style scoped>
.help-button {
  position: absolute;
  right: 16px;
  top: 16px;
  font-size: 2rem;
  border-radius: 100%;
  width: 50px;
  height: 50px;
}
</style>

<script setup lang="ts">
defineProps<{
  asIcon?: boolean
  type?: 'Primary' | 'Secondary'
}>()
</script>

<template>
  <button
    class="button"
    :class="{
      'as-icon': asIcon,
      primary: type === 'Primary' || !type,
      secondary: type === 'Secondary'
    }"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.button {
  border-radius: 50px;
  border: none;
  font-size: 1.563rem;
  cursor: pointer;
}

.button:not(.button.as-icon) {
  color: var(--color-white);
}

.button.primary:not(.button.as-icon) {
  background-color: var(--color-gray-350);
  box-shadow: 5px 5px 40px 0px #0b0b0b4d;
}

.button.secondary:not(.button.as-icon) {
  background-color: var(--color-gray-250);
  box-shadow: 4px 3px 20px 0px #00000080;
  box-shadow: -4px -2px 20px 0px #c3c1bf33;
}

.button.as-icon {
  border: none;
  background: transparent;
}

.button:hover {
  opacity: 0.7;
}
</style>

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
  color: white;
}

.button.primary:not(.button.as-icon) {
  background-color: #5a5757;
  box-shadow: 5px 5px 40px 0px rgba(11, 11, 11, 0.3);
}

.button.secondary:not(.button.as-icon) {
  background-color: #3f3f3f;
  box-shadow: 4px 3px 20px 0px rgba(0, 0, 0, 0.5);
  box-shadow: -4px -2px 20px 0px rgba(195, 193, 191, 0.2);
}

.button.as-icon {
  border: none;
  background: transparent;
}

.button:hover {
  opacity: 0.7;
}
</style>

import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Reactive window size.
 * Inspired by:
 * https://vueuse.org/useWindowSize
 */
export function useWindowSize() {
  const width = ref(Number.POSITIVE_INFINITY)
  const height = ref(Number.POSITIVE_INFINITY)

  const update = () => {
    if (window) {
      width.value = window.innerWidth
      height.value = window.innerHeight
    }
  }

  update()

  onMounted(() => {
    window.addEventListener('resize', update, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { width, height }
}

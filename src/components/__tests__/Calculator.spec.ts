import { describe, it, expect, vi } from 'vitest'

import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import Calculator from '../calculator'

// Mock implementation
vi.mock('vue', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...vue,
    // eslint-disable-next-line consistent-return
    inject: vi.fn((key: string) => {
      if (key === 'resultAndAction') {
        return ref({
          action: '',
          result: '',
          onButtonClick: () => {}
        })
      }
      if (key === 'history') {
        return ref({
          items: [],
          setCurrentCalculationToEntry: () => {},
          setCurrentCalculationToResult: () => {}
        })
      }
    })
  }
})

describe('Calculator', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(Calculator)

    expect(wrapper.exists()).toBe(true)
  })
})

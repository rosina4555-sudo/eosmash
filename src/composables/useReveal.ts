import { onUnmounted, ref } from 'vue'

export interface RevealOptions {
  delay?: number
  threshold?: number
}

export type TemplateRef = (element: unknown) => void

export function useReveal(options: RevealOptions = {}) {
  const { delay = 0, threshold = 0.15 } = options
  const target = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  const setRef: TemplateRef = (element) => {
    target.value = (element as HTMLElement | null) ?? null

    if (target.value && !observer) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            observer?.disconnect()
            observer = null
          }
        },
        { threshold, rootMargin: '0px 0px -40px 0px' },
      )
      observer.observe(target.value)
    }
  }

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  const style = { transitionDelay: `${delay}ms` } as const

  return { setRef, isVisible, style }
}

export function useRevealGroup(_count: number, baseDelay = 80, threshold = 0.12) {
  const target = ref<HTMLElement | null>(null)
  const visible = ref(false)
  let observer: IntersectionObserver | null = null

  const setRef: TemplateRef = (element) => {
    target.value = (element as HTMLElement | null) ?? null

    if (target.value && !observer) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visible.value = true
            observer?.disconnect()
            observer = null
          }
        },
        { threshold, rootMargin: '0px 0px -40px 0px' },
      )
      observer.observe(target.value)
    }
  }

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  function itemStyle(index: number): { transitionDelay: string } {
    return { transitionDelay: visible.value ? `${index * baseDelay}ms` : '0ms' }
  }

  return { setRef, visible, itemStyle }
}

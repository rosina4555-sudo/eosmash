<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  item: { question: string; answer: string }
  isOpen?: boolean
  index?: number
}>()

const open = ref(false)

const uid = `faq-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div>
    <h3>
      <button
        type="button"
        class="group flex w-full items-start justify-between gap-6 px-6 py-5 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-electric-lime md:px-7 md:py-6"
        :aria-expanded="open"
        :aria-controls="`panel-${uid}`"
        :id="`button-${uid}`"
        @click="open = !open"
      >
        <span
          class="text-base font-semibold tracking-tight text-pure-white transition-colors duration-200 group-hover:text-electric-lime md:text-lg"
        >
          {{ item.question }}
        </span>
        <span
          class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-midnight text-electric-lime transition-all duration-200"
          :class="open ? 'rotate-45 bg-electric-lime text-midnight' : ''"
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1v10M1 6h10"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </span>
      </button>
    </h3>
    <div
      v-show="open"
      :id="`panel-${uid}`"
      role="region"
      :aria-labelledby="`button-${uid}`"
      class="px-6 pb-6 md:px-7 md:pb-7"
    >
      <p class="max-w-2xl pr-8 text-[15px] leading-relaxed text-muted-slate md:text-base">
        {{ item.answer }}
      </p>
    </div>
  </div>
</template>

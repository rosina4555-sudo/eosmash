<script setup lang="ts">
import { useReveal } from '../../composables/useReveal'
import { trackEvent } from '../../composables/useAnalytics'

const { setRef, isVisible, style } = useReveal()

function scrollToWaitlist() {
  trackEvent('cta_click', { location: 'final_cta' })
  document.querySelector('#waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section class="py-24 md:py-32" aria-labelledby="final-cta-heading">
    <div class="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-16">
      <div
        :ref="setRef"
        class="mx-auto max-w-2xl text-center reveal"
        :class="{ 'is-visible': isVisible }"
        :style="style"
      >
        <h2
          id="final-cta-heading"
          class="text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-pure-white md:text-[48px]"
        >
          Your rival is waiting.
        </h2>
        <p class="mt-4 text-base leading-relaxed text-muted-slate md:text-lg">
          The competition is almost here. Get on the list and be part of the crew from day one.
        </p>
        <button type="button" class="btn-primary mt-9 min-w-[220px]" @click="scrollToWaitlist">
          Join the waitlist
        </button>
      </div>
    </div>
  </section>
</template>

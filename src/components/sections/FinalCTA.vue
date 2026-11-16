<script setup lang="ts">
import { useReveal } from '../../composables/useReveal'

const { setRef, isVisible, style } = useReveal()

function scrollToWaitlist() {
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
        <div class="mb-6 flex items-center justify-center gap-3">
          <span class="h-px w-8 bg-electric-lime" aria-hidden="true" />
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.28em] text-electric-lime md:text-xs"
          >
            Last chance
          </p>
          <span class="h-px w-8 bg-electric-lime" aria-hidden="true" />
        </div>
        <h2
          id="final-cta-heading"
          class="text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-pure-white md:text-[48px]"
        >
          Think you have what it takes?
        </h2>
        <p class="mt-4 text-base leading-relaxed text-muted-slate md:text-lg">
          The competition is almost here. Get on the list and be part of the crew from day one.
        </p>
        <button
          type="button"
          class="cta-sweep mt-9 inline-flex h-13 min-w-[220px] items-center justify-center bg-electric-lime px-8 text-sm font-semibold tracking-wide text-midnight uppercase transition-colors duration-200 hover:bg-lime-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-lime md:h-14 md:text-base"
          @click="scrollToWaitlist"
        >
          Join the waitlist
        </button>
      </div>
    </div>
  </section>
</template>

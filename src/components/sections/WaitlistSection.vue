<script setup lang="ts">
import { useReveal } from '../../composables/useReveal'
import WaitlistForm from '../ui/WaitlistForm.vue'

const { setRef, isVisible, style } = useReveal()
</script>

<template>
  <section
    id="waitlist"
    class="scroll-mt-20 py-20 md:py-28 lg:py-32"
    aria-labelledby="waitlist-heading"
  >
    <div class="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-16">
      <div
        :ref="setRef"
        class="grid overflow-hidden rounded-[16px] bg-deep-navy reveal lg:grid-cols-2"
        :class="{ 'is-visible': isVisible }"
        :style="style"
      >
        <div class="relative p-6 sm:p-8 md:p-12 lg:p-14">
          <div
            class="absolute left-0 top-0 h-1.5 w-24 bg-electric-lime draw-line lg:w-32"
            :class="{ 'is-visible': isVisible }"
            aria-hidden="true"
          />

          <div class="mt-4">
            <div class="mb-5 flex items-center gap-3">
              <span class="h-px w-8 bg-electric-lime" aria-hidden="true" />
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.28em] text-electric-lime md:text-xs"
              >
                Early access
              </p>
            </div>
            <h2
              id="waitlist-heading"
              class="text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-pure-white md:text-[40px]"
            >
              Join the waitlist.
            </h2>
            <p class="mt-4 max-w-md text-base leading-relaxed text-muted-slate md:text-lg">
              Hop on the list and you will hear about launch dates, supported games and early
              access before anyone else.
            </p>

            <ul class="mt-9 space-y-3.5">
              <li
                v-for="(item, i) in [
                  'Launch and early access updates',
                  'News on supported games',
                  'Free to join, no strings attached',
                ]"
                :key="item"
                class="flex items-baseline gap-3.5 text-[15px] text-soft-white"
                :style="{ transitionDelay: `${200 + i * 80}ms` }"
              >
                <span class="text-electric-lime" aria-hidden="true">→</span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <div class="bg-elevated-navy/60 p-6 sm:p-8 md:p-12 lg:p-14">
          <WaitlistForm />
        </div>
      </div>
    </div>
  </section>
</template>

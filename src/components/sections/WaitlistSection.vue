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
          <div class="mt-4">
            <h2
              id="waitlist-heading"
              class="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-pure-white md:text-[40px]"
            >
              Join the waitlist.
            </h2>
            <p class="mt-4 max-w-md text-base leading-relaxed text-muted-slate md:text-lg">
              Hop on the list and you will hear about launch dates, supported games and early
              access before anyone else.
            </p>

            <ul class="mt-9 list-disc space-y-3.5 pl-5 marker:text-electric-lime">
              <li
                v-for="item in [
                  'Launch and early access updates',
                  'News on supported games',
                  'Free to join, no strings attached',
                ]"
                :key="item"
                class="text-[15px] text-soft-white"
              >
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

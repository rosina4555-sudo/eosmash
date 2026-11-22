<script setup lang="ts">
import { useReveal, useRevealGroup } from '../../composables/useReveal'

const { setRef: headerRef, isVisible: headerVisible, style: headerStyle } = useReveal()
const { setRef: gridRef, visible: gridVisible, itemStyle } = useRevealGroup(4, 100)

const steps = [
  {
    title: 'Choose your game',
    description: 'Browse the games we support and pick the competition you want to enter.',
    icon: 'gamepad',
  },
  {
    title: 'Find your opponent',
    description: 'We match you with another player, or you can challenge someone directly.',
    icon: 'versus',
  },
  {
    title: 'Play to win',
    description: 'Compete under clear rules. No grey areas, just pure skill.',
    icon: 'swords',
  },
  {
    title: 'Claim your victory',
    description:
      'Once the result is verified, the winner takes the prize, subject to platform rules and eligibility.',
    icon: 'trophy',
  },
]
</script>

<template>
  <section
    id="how-it-works"
    class="scroll-mt-20 py-20 md:py-28 lg:py-32"
    aria-labelledby="how-heading"
  >
    <div class="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-16">
      <div
        :ref="headerRef"
        class="mb-12 max-w-2xl reveal md:mb-16"
        :class="{ 'is-visible': headerVisible }"
        :style="headerStyle"
      >
        <h2
          id="how-heading"
          class="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-pure-white md:text-[42px] lg:text-[48px]"
        >
          Four steps. That is it.
        </h2>
        <p class="mt-4 max-w-lg text-base leading-relaxed text-muted-slate md:text-lg">
          Getting into a match should feel as easy as loading up the game itself.
        </p>
      </div>

      <div
        :ref="gridRef"
        class="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8"
      >
        <div
          v-for="(step, i) in steps"
          :key="step.title"
          class="group reveal"
          :class="{ 'is-visible': gridVisible }"
          :style="itemStyle(i)"
        >
          <div
            class="mb-5 h-14 w-14 text-electric-lime transition-colors duration-200 group-hover:text-pure-white"
            aria-hidden="true"
          >
            <svg v-if="step.icon === 'gamepad'" viewBox="0 0 56 56" fill="none" class="h-full w-full">
              <rect x="8" y="18" width="40" height="24" rx="8" stroke="currentColor" stroke-width="2" />
              <circle cx="20" cy="30" r="2.5" fill="currentColor" />
              <circle cx="24" cy="26" r="2.5" fill="currentColor" />
              <circle cx="24" cy="34" r="2.5" fill="currentColor" />
              <circle cx="28" cy="30" r="2.5" fill="currentColor" />
              <path d="M36 28v4M34 30h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M14 18V14M42 18V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>

            <svg v-else-if="step.icon === 'versus'" viewBox="0 0 56 56" fill="none" class="h-full w-full">
              <circle cx="18" cy="28" r="8" stroke="currentColor" stroke-width="2" />
              <circle cx="38" cy="28" r="8" stroke="currentColor" stroke-width="2" />
              <path d="M28 20v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3" />
              <path d="M14 40c2-3 6-5 10-5M46 40c-2-3 6-5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M18 24v4M16 26h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M38 24v4M36 26h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>

            <svg v-else-if="step.icon === 'swords'" viewBox="0 0 56 56" fill="none" class="h-full w-full">
              <path d="M12 12l16 16M44 12L28 28" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M12 12l4 12 12-4M44 12l-4 12-12-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M28 32v12" stroke="currentColor" stroke-width="2" />
              <path d="M22 44h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M24 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <svg v-else viewBox="0 0 56 56" fill="none" class="h-full w-full">
              <path d="M18 12h20v14c0 6-4.5 10-10 10s-10-4-10-10V12z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              <path d="M18 16H12c0 6 2 10 6 12M38 16h6c0 6-2 10-6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M28 36v6M20 48h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M20 48c0-3 3.5-4 8-4s8 1 8 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M24 20l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>

          <h3 class="text-lg font-semibold tracking-tight text-pure-white md:text-xl">
            {{ step.title }}
          </h3>
          <p class="mt-2.5 text-[15px] leading-relaxed text-muted-slate md:text-base">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

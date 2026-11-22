<script setup lang="ts">
import { useReveal, useRevealGroup } from '../../composables/useReveal'

const { setRef: leftRef, isVisible: leftVisible, style: leftStyle } = useReveal()
const { setRef: cardsRef, visible: cardsVisible, itemStyle } = useRevealGroup(4, 90)

const features = [
  {
    title: 'Real competition',
    description: 'Play people who actually want to win, not just mess around in casual lobbies.',
    icon: 'crosshair',
  },
  {
    title: 'Find your rivals',
    description: 'Get matched with opponents or challenge someone yourself for a proper 1v1.',
    icon: 'radar',
  },
  {
    title: 'Build your reputation',
    description:
      'Your match history, rankings and results all add up to a competitive identity you can show off.',
    icon: 'rank',
  },
  {
    title: 'Fair play matters',
    description:
      'Clear rules, verified results and a real dispute process. No sketchy outcomes, no nonsense.',
    icon: 'shield',
  },
]

function scrollToWaitlist() {
  document.querySelector('#waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section
    id="why-eosmash"
    class="scroll-mt-20 bg-deep-navy/50 py-20 md:py-28 lg:py-32"
    aria-labelledby="why-heading"
  >
    <div class="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-16">
      <div class="grid gap-12 lg:grid-cols-12 lg:gap-20">
        <div
          :ref="leftRef"
          class="reveal-left lg:col-span-5"
          :class="{ 'is-visible': leftVisible }"
          :style="leftStyle"
        >
          <h2
            id="why-heading"
            class="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-pure-white md:text-[42px] lg:text-[46px]"
          >
            Why settle for casual?
          </h2>
          <p class="mt-5 max-w-md text-base leading-relaxed text-muted-slate md:text-lg">
            Casual lobbies only go so far. Eosmash is for players who want to compete properly,
            climb the ranks and prove their skill under fair rules.
          </p>
          <button type="button" class="btn-primary mt-8" @click="scrollToWaitlist">
            Join the waitlist
          </button>
        </div>

        <div
          :ref="cardsRef"
          class="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:gap-5"
        >
          <article
            v-for="(feature, i) in features"
            :key="feature.title"
            class="card p-6 reveal md:p-7"
            :class="{ 'is-visible': cardsVisible }"
            :style="itemStyle(i)"
          >
            <div class="mb-5 h-11 w-11 text-electric-lime" aria-hidden="true">
              <svg v-if="feature.icon === 'crosshair'" viewBox="0 0 44 44" fill="none" class="h-full w-full">
                <circle cx="22" cy="22" r="12" stroke="currentColor" stroke-width="2" />
                <circle cx="22" cy="22" r="4" stroke="currentColor" stroke-width="2" />
                <path d="M22 6v6M22 32v6M6 22h6M32 22h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>

              <svg v-else-if="feature.icon === 'radar'" viewBox="0 0 44 44" fill="none" class="h-full w-full">
                <circle cx="22" cy="22" r="14" stroke="currentColor" stroke-width="2" />
                <circle cx="22" cy="22" r="7" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2" />
                <path d="M22 22L32 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <circle cx="30" cy="15" r="2.5" fill="currentColor" />
                <circle cx="16" cy="26" r="2" fill="currentColor" />
                <circle cx="26" cy="30" r="1.5" fill="currentColor" />
              </svg>

              <svg v-else-if="feature.icon === 'rank'" viewBox="0 0 44 44" fill="none" class="h-full w-full">
                <path d="M8 34V22M22 34V14M36 34V20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                <path d="M6 36h32" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="M8 18l6-6 5 4 9-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="28" cy="6" r="2" fill="currentColor" />
              </svg>

              <svg v-else viewBox="0 0 44 44" fill="none" class="h-full w-full">
                <path d="M22 6l14 5v10c0 8-6 14-14 17C14 35 8 29 8 21V11l14-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                <path d="M15 22l5 5 9-10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

            <h3 class="text-lg font-semibold tracking-tight text-pure-white md:text-xl">
              {{ feature.title }}
            </h3>
            <p class="mt-2 text-[15px] leading-relaxed text-muted-slate md:text-base">
              {{ feature.description }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useReveal, useRevealGroup } from '../../composables/useReveal'
import { trackEvent } from '../../composables/useAnalytics'

const slides = [
  '/images/art-speed.svg',
  '/images/art-versus.svg',
  '/images/art-grid.svg',
  '/images/art-ranks.svg',
  '/images/art-shards.svg',
]

const activeSlide = ref(0)

const { setRef: titleRef, isVisible: titleVisible, style: titleStyle } = useReveal({ delay: 100 })
const { setRef: bodyRef, isVisible: bodyVisible, style: bodyStyle } = useReveal({ delay: 200 })
const { setRef: actionsRef, isVisible: actionsVisible, style: actionsStyle } = useReveal({ delay: 300 })
const { setRef: statsRef, visible: statsVisible, itemStyle } = useRevealGroup(3, 100)

function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onHeroWaitlistClick() {
  trackEvent('cta_click', { location: 'hero_primary' })
  scrollTo('#waitlist')
}
</script>

<template>
  <section class="relative min-h-[100svh] overflow-hidden" aria-labelledby="hero-heading">
    <div class="absolute inset-0" aria-hidden="true">
      <img
        v-for="(slide, i) in slides"
        :key="slide"
        :src="slide"
        alt=""
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out"
        :class="i === activeSlide ? 'opacity-95' : 'opacity-0'"
        :fetchpriority="i === 0 ? 'high' : 'auto'"
        :loading="i === 0 ? 'eager' : 'lazy'"
        decoding="async"
      />
      <div class="absolute inset-0 hero-scrim" />
      <div class="absolute inset-0 hero-scrim-bottom" />
      <div
        class="absolute right-0 top-0 hidden h-1.5 w-1/3 origin-right -skew-x-[28deg] bg-electric-lime/90 lg:block"
      />
    </div>

    <div
      class="relative mx-auto flex min-h-[100svh] max-w-[1280px] flex-col justify-end px-5 pb-16 pt-32 md:px-8 md:pb-20 md:pt-40 lg:px-16 lg:pb-24"
    >
      <div class="max-w-[720px]">
        <h1
          id="hero-heading"
          :ref="titleRef"
          class="text-[38px] font-bold leading-[1.02] tracking-[-0.03em] text-pure-white md:text-[64px] lg:text-[76px]"
          :class="{ 'is-visible': titleVisible }"
          :style="titleStyle"
        >
          <span class="block mask-reveal" :class="{ 'is-visible': titleVisible }">Your skills.</span>
          <span class="block mask-reveal" :class="{ 'is-visible': titleVisible }" :style="{ transitionDelay: '120ms' }">Your rival.</span>
          <span class="relative inline-block mask-reveal" :class="{ 'is-visible': titleVisible }" :style="{ transitionDelay: '240ms' }">
            Your moment.
          </span>
        </h1>

        <p
          :ref="bodyRef"
          class="mt-7 max-w-lg text-base leading-relaxed text-soft-white/80 reveal md:text-lg"
          :class="{ 'is-visible': bodyVisible }"
          :style="bodyStyle"
        >
          Skill-based matches, clear rules, real rivals. Join the waitlist for early access.
        </p>

        <div
          :ref="actionsRef"
          class="mt-9 flex flex-col gap-3 reveal sm:flex-row sm:gap-4"
          :class="{ 'is-visible': actionsVisible }"
          :style="actionsStyle"
        >
          <button type="button" class="btn-primary min-w-[200px]" @click="onHeroWaitlistClick">
            Join the waitlist
          </button>
          <button type="button" class="btn-quiet min-w-[200px]" @click="scrollTo('#how-it-works')">
            How it works
          </button>
        </div>

        <p
          class="mt-6 text-sm text-muted-slate reveal"
          :class="{ 'is-visible': actionsVisible }"
          :style="actionsStyle"
        >
          Be first in line when we launch
        </p>
      </div>

      <dl
        :ref="statsRef"
        class="mt-14 hidden max-w-3xl gap-10 md:grid md:grid-cols-3"
      >
        <div
          v-for="(stat, i) in [
            { label: 'Format', value: 'Head-to-head' },
            { label: 'Focus', value: 'Skill-based' },
            { label: 'Status', value: 'Pre-launch' },
          ]"
          :key="stat.label"
          class="reveal"
          :class="{ 'is-visible': statsVisible }"
          :style="itemStyle(i)"
        >
          <dt class="label-quiet">{{ stat.label }}</dt>
          <dd
            class="mt-1.5 font-heading text-lg font-semibold"
            :class="stat.label === 'Status' ? 'text-electric-lime' : 'text-pure-white'"
          >
            {{ stat.value }}
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.hero-scrim {
  background: linear-gradient(
    105deg,
    var(--color-midnight) 0%,
    var(--color-midnight) 46%,
    color-mix(in oklab, var(--color-midnight) 85%, transparent) 66%,
    color-mix(in oklab, var(--color-midnight) 55%, transparent) 100%
  );
}

.hero-scrim-bottom {
  background: linear-gradient(to top, var(--color-midnight) 0%, transparent 38%);
}
</style>

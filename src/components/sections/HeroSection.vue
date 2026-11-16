<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useReveal, useRevealGroup } from '../../composables/useReveal'

const slides = [
  '/images/art-speed.svg',
  '/images/art-versus.svg',
  '/images/art-grid.svg',
  '/images/art-ranks.svg',
  '/images/art-shards.svg',
]

const activeSlide = ref(0)
let slideTimer: number | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  slideTimer = window.setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length
  }, 5500)
})

onUnmounted(() => {
  if (slideTimer !== undefined) window.clearInterval(slideTimer)
})

const { setRef: eyebrowRef, isVisible: eyebrowVisible, style: eyebrowStyle } = useReveal()
const { setRef: titleRef, isVisible: titleVisible, style: titleStyle } = useReveal({ delay: 100 })
const { setRef: bodyRef, isVisible: bodyVisible, style: bodyStyle } = useReveal({ delay: 200 })
const { setRef: actionsRef, isVisible: actionsVisible, style: actionsStyle } = useReveal({ delay: 300 })
const { setRef: microRef, isVisible: microVisible, style: microStyle } = useReveal({ delay: 380 })
const { setRef: statsRef, visible: statsVisible, itemStyle } = useRevealGroup(3, 100)

function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
        :class="i === activeSlide ? 'opacity-75' : 'opacity-0'"
        :fetchpriority="i === 0 ? 'high' : 'auto'"
        :loading="i === 0 ? 'eager' : 'lazy'"
        decoding="async"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(105deg,#0B1020_0%,#0B1020_46%,rgba(11,16,32,0.85)_66%,rgba(11,16,32,0.55)_100%)]"
      />
      <div class="absolute inset-0 bg-[linear-gradient(to_top,#0B1020_0%,transparent_38%)]" />
      <div
        class="absolute right-0 top-0 hidden h-1.5 w-1/3 origin-right -skew-x-[28deg] bg-electric-lime/90 lg:block"
      />
    </div>

    <div
      class="relative mx-auto flex min-h-[100svh] max-w-[1280px] flex-col justify-end px-5 pb-16 pt-32 md:px-8 md:pb-20 md:pt-40 lg:px-16 lg:pb-24"
    >
      <div class="max-w-[720px]">
        <div
          :ref="eyebrowRef"
          class="mb-6 flex items-center gap-3 reveal"
          :class="{ 'is-visible': eyebrowVisible }"
          :style="eyebrowStyle"
        >
          <span class="block h-[3px] w-3.5 -skew-x-[28deg] bg-electric-lime" aria-hidden="true" />
          <p
            class="text-[10px] font-semibold uppercase tracking-[0.2em] text-electric-lime md:text-xs md:tracking-[0.28em]"
          >
            The next era of competitive gaming
          </p>
        </div>

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
            <span
              class="absolute -bottom-2 left-0 h-[3px] w-full origin-left bg-electric-lime draw-line"
              :class="{ 'is-visible': titleVisible }"
              :style="{ transitionDelay: '500ms' }"
              aria-hidden="true"
            />
          </span>
        </h1>

        <p
          :ref="bodyRef"
          class="mt-7 max-w-lg text-base leading-relaxed text-soft-white/80 reveal md:text-lg"
          :class="{ 'is-visible': bodyVisible }"
          :style="bodyStyle"
        >
          Take on skilled players in games that reward talent. Prove you have what it takes and
          compete for real rewards. Something big is on the way.
        </p>

        <div
          :ref="actionsRef"
          class="mt-9 flex flex-col gap-3 reveal sm:flex-row sm:gap-4"
          :class="{ 'is-visible': actionsVisible }"
          :style="actionsStyle"
        >
          <button
            type="button"
            class="cta-sweep inline-flex h-13 min-w-[200px] items-center justify-center bg-electric-lime px-8 text-sm font-semibold tracking-wide text-midnight uppercase transition-colors duration-200 hover:bg-lime-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-lime md:h-14 md:text-base"
            @click="scrollTo('#waitlist')"
          >
            Join the waitlist
          </button>
          <button
            type="button"
            class="inline-flex h-13 min-w-[200px] items-center justify-center border border-soft-white/30 px-8 text-sm font-semibold tracking-wide text-pure-white uppercase transition-all duration-200 hover:border-pure-white hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-lime md:h-14 md:text-base"
            @click="scrollTo('#how-it-works')"
          >
            How it works
          </button>
        </div>

        <p
          :ref="microRef"
          class="mt-6 text-[13px] tracking-wide text-muted-slate uppercase reveal"
          :class="{ 'is-visible': microVisible }"
          :style="microStyle"
        >
          Be first in line when we launch
        </p>
      </div>

      <dl
        :ref="statsRef"
        class="mt-14 hidden max-w-3xl gap-10 md:grid md:grid-cols-3"
        aria-hidden="true"
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
          <dt class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-slate">
            {{ stat.label }}
          </dt>
          <dd
            class="mt-1.5 font-heading text-lg font-semibold"
            :class="stat.label === 'Status' ? 'flex items-center gap-2 text-electric-lime' : 'text-pure-white'"
          >
            <span v-if="stat.label === 'Status'" class="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-electric-lime" />
            {{ stat.value }}
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

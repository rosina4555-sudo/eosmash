<script setup lang="ts">
import { useReveal, useRevealGroup } from '../../composables/useReveal'

const { setRef: leftRef, isVisible: leftVisible, style: leftStyle } = useReveal()
const { setRef: cardsRef, visible: cardsVisible, itemStyle } = useRevealGroup(4, 90)

const categories = [
  {
    title: 'Fighting',
    description: 'Head to head duels where only the sharper player walks away.',
    image: '/images/cat-fighting.jpg',
    span: 'lg:col-span-7 lg:row-span-2',
    aspect: 'aspect-[4/5] lg:aspect-auto lg:h-full',
  },
  {
    title: 'Racing',
    description: 'Battle for position and leave your rival in the dust.',
    image: '/images/cat-racing.jpg',
    span: 'lg:col-span-5',
    aspect: 'aspect-[16/10] lg:aspect-auto lg:h-full',
  },
  {
    title: 'Strategy',
    description: 'Think three moves ahead. One wrong call and you lose.',
    image: '/images/cat-strategy.jpg',
    span: 'lg:col-span-5',
    aspect: 'aspect-[16/10] lg:aspect-auto lg:h-full',
  },
  {
    title: 'Arcade',
    description: 'Quick rounds that test your reflexes and precision under pressure.',
    image: '/images/cat-arcade.jpg',
    span: 'lg:col-span-12',
    aspect: 'aspect-[21/9] lg:aspect-[21/6]',
  },
]
</script>

<template>
  <section id="games" class="scroll-mt-20 py-20 md:py-28 lg:py-32" aria-labelledby="games-heading">
    <div class="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-16">
      <div
        :ref="leftRef"
        class="mb-10 flex flex-col gap-6 reveal md:mb-14 md:flex-row md:items-end md:justify-between"
        :class="{ 'is-visible': leftVisible }"
        :style="leftStyle"
      >
        <div class="max-w-xl">
          <div class="mb-5 flex items-center gap-3">
            <span class="block h-[3px] w-3.5 -skew-x-[28deg] bg-electric-lime" aria-hidden="true" />
            <p
              class="text-[10px] font-semibold uppercase tracking-[0.2em] text-electric-lime md:text-xs md:tracking-[0.28em]"
            >
              Games
            </p>
          </div>
          <h2
            id="games-heading"
            class="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-pure-white md:text-[42px] lg:text-[48px]"
          >
            What you will play.
          </h2>
          <p class="mt-4 max-w-lg text-base leading-relaxed text-muted-slate md:text-lg">
            Whether you enjoy fighting, racing, strategy or arcade games, Eosmash is being built
            around titles where skill is the only thing that matters.
          </p>
        </div>
        <p
          class="shrink-0 self-start rounded-sm bg-elevated-navy px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-slate md:self-auto"
        >
          Games we're exploring
        </p>
      </div>

      <div
        :ref="cardsRef"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5"
      >
        <article
          v-for="(cat, i) in categories"
          :key="cat.title"
          class="group relative overflow-hidden rounded-[14px] bg-deep-navy reveal"
          :class="[cat.span, { 'is-visible': cardsVisible }]"
          :style="itemStyle(i)"
        >
          <div class="absolute inset-0 overflow-hidden" :class="cat.aspect">
            <img
              :src="cat.image"
              :alt="`${cat.title} gaming category`"
              loading="lazy"
              class="img-zoom h-full w-full object-cover grayscale-[0.45] contrast-[1.12] transition-all duration-500 group-hover:grayscale-0"
            />
            <div
              class="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,16,32,0.92)_0%,rgba(11,16,32,0.4)_55%,rgba(11,16,32,0.12)_100%)]"
            />
          </div>

          <div
            class="relative flex h-full min-h-[200px] flex-col justify-end p-5 md:p-6 lg:min-h-[240px]"
          >
            <h3
              class="font-heading text-2xl font-bold tracking-tight text-pure-white transition-transform duration-300 group-hover:-translate-y-1 md:text-3xl"
            >
              {{ cat.title }}
            </h3>
            <p
              class="mt-1.5 max-w-sm text-sm leading-relaxed text-soft-white/75 transition-transform duration-300 group-hover:-translate-y-1 md:text-[15px]"
            >
              {{ cat.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

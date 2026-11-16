<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '../components/ui/BrandLogo.vue'

interface PlaceholderContent {
  eyebrow: string
  heading: string
  description: string
  note?: string
}

const route = useRoute()
const router = useRouter()
const year = new Date().getFullYear()

const content = computed<PlaceholderContent>(() => {
  const data = route.meta.placeholder as PlaceholderContent | undefined
  return data ?? {
    eyebrow: '404',
    heading: 'Page not found',
    description: "The page you're looking for doesn't exist or hasn't been published yet.",
  }
})

function goToWaitlist() {
  router.push({ path: '/', hash: '#waitlist' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header
      class="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-6 md:px-8 md:py-8 lg:px-16"
    >
      <RouterLink to="/" class="group" aria-label="Eosmash home">
        <BrandLogo :mark-size="24" text-class="text-xl md:text-[22px]" />
      </RouterLink>
      <RouterLink
        to="/"
        class="text-[13px] font-medium uppercase tracking-wide text-muted-slate transition-colors hover:text-electric-lime"
      >
        Back to home
      </RouterLink>
    </header>

    <main
      class="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center px-5 py-14 md:px-8 md:py-20"
    >
      <div class="flex items-center gap-3">
        <span class="block h-[3px] w-3.5 -skew-x-[28deg] bg-electric-lime" aria-hidden="true" />
        <p
          class="text-[10px] font-semibold uppercase tracking-[0.2em] text-electric-lime md:text-xs md:tracking-[0.28em]"
        >
          {{ content.eyebrow }}
        </p>
      </div>
      <h1
        class="mt-5 text-[34px] font-bold leading-[1.08] tracking-[-0.02em] text-pure-white md:text-[48px]"
      >
        {{ content.heading }}
      </h1>
      <p class="mt-5 max-w-lg text-base leading-relaxed text-soft-white/80 md:text-lg">
        {{ content.description }}
      </p>
      <p v-if="content.note" class="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-slate">
        {{ content.note }}
      </p>

      <div class="mt-9 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          class="cta-sweep inline-flex h-13 min-w-[200px] items-center justify-center bg-electric-lime px-8 text-sm font-semibold tracking-wide text-midnight uppercase transition-colors duration-200 hover:bg-lime-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-lime md:h-14 md:text-base"
          @click="goToWaitlist"
        >
          Join the waitlist
        </button>
        <RouterLink
          to="/"
          class="inline-flex h-13 min-w-[200px] items-center justify-center border border-soft-white/30 px-8 text-sm font-semibold tracking-wide text-pure-white uppercase transition-all duration-200 hover:border-pure-white hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-lime md:h-14 md:text-base"
        >
          Back to home
        </RouterLink>
      </div>
    </main>

    <footer
      class="mx-auto flex w-full max-w-[1280px] flex-col gap-2 px-5 py-8 sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-16"
    >
      <p class="text-[13px] text-muted-slate">© {{ year }} Eosmash. All rights reserved.</p>
      <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-slate/70">
        Ghana · Africa
      </p>
    </footer>
  </div>
</template>

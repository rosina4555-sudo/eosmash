<script setup lang="ts">
import BrandLogo from '../ui/BrandLogo.vue'

const year = new Date().getFullYear()

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Games', href: '#games' },
  { label: 'Why Eosmash', href: '#why-eosmash' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Join waitlist', href: '#waitlist' },
]
</script>

<template>
  <footer class="bg-deep-navy/60">
    <div class="mx-auto max-w-[1280px] px-5 py-16 md:px-8 md:py-20 lg:px-16">
      <div class="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div class="lg:col-span-5">
          <RouterLink to="/" class="group inline-block" aria-label="Eosmash home">
            <BrandLogo :mark-size="30" text-class="text-2xl" />
          </RouterLink>
          <p class="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-slate">
            A new home for competitive skill-based gaming. Built in Ghana for players across Africa
            and beyond.
          </p>
        </div>

        <nav class="lg:col-span-3 lg:col-start-7" aria-label="Footer">
          <h3 class="mb-5 text-[11px] font-semibold tracking-[0.2em] text-soft-white uppercase">
            Navigate
          </h3>
          <ul class="space-y-3.5">
            <li v-for="link in navLinks" :key="link.href">
              <a
                :href="link.href"
                class="text-sm text-muted-slate transition-colors hover:text-electric-lime"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </nav>

        <nav class="lg:col-span-2" aria-label="Legal">
          <h3 class="mb-5 text-[11px] font-semibold tracking-[0.2em] text-soft-white uppercase">
            Legal
          </h3>
          <ul class="space-y-3.5">
            <li>
              <RouterLink
                to="/privacy"
                class="text-sm text-muted-slate transition-colors hover:text-electric-lime"
              >
                Privacy Policy
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/terms"
                class="text-sm text-muted-slate transition-colors hover:text-electric-lime"
              >
                Terms of Service
              </RouterLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="mt-16 pt-8">
        <p class="max-w-3xl text-[13px] leading-relaxed text-muted-slate">
          Any future competitions with monetary stakes or prizes will follow local laws, platform
          eligibility rules and our terms of service.
        </p>
        <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-[13px] text-muted-slate">
            © {{ year }} Eosmash. All rights reserved.
          </p>
          <p class="text-[11px] font-semibold tracking-[0.2em] text-muted-slate/70 uppercase">
            Ghana · Africa
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

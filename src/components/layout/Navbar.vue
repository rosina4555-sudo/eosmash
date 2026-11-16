<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BrandLogo from '../ui/BrandLogo.vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Games', href: '#games' },
  { label: 'FAQ', href: '#faq' },
]

function onScroll() {
  isScrolled.value = window.scrollY > 24
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function scrollToWaitlist() {
  closeMobileMenu()
  document.querySelector('#waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="isScrolled ? 'bg-midnight/92 backdrop-blur-md' : 'bg-transparent'"
  >
    <nav
      class="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-5 md:h-20 md:px-8 lg:px-16"
      aria-label="Main"
    >
      <RouterLink to="/" class="group" aria-label="Eosmash home">
        <BrandLogo :mark-size="26" text-class="text-[22px] md:text-2xl" />
      </RouterLink>

      <div class="hidden items-center gap-10 md:flex">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="nav-underline text-[13px] font-medium tracking-wide text-soft-white/80 uppercase transition-colors hover:text-pure-white"
        >
          {{ link.label }}
        </a>
      </div>

      <button
        type="button"
        class="cta-sweep hidden h-11 items-center rounded-[10px] bg-electric-lime px-6 text-[13px] font-semibold tracking-wide text-midnight uppercase transition-colors hover:bg-lime-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-lime md:inline-flex"
        @click="scrollToWaitlist"
      >
        Join waitlist
      </button>

      <button
        type="button"
        class="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-[10px] bg-elevated-navy text-pure-white md:hidden"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="mobile-menu"
        aria-label="Toggle menu"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <span
          class="block h-px w-5 bg-current transition-transform duration-200"
          :class="isMobileMenuOpen ? 'translate-y-[3.5px] rotate-45' : ''"
          aria-hidden="true"
        />
        <span
          class="block h-px w-5 bg-current transition-transform duration-200"
          :class="isMobileMenuOpen ? '-translate-y-[3.5px] -rotate-45' : ''"
          aria-hidden="true"
        />
      </button>
    </nav>

    <div
      v-if="isMobileMenuOpen"
      id="mobile-menu"
      class="rounded-b-[16px] bg-midnight px-5 pb-6 pt-2 shadow-xl md:hidden"
    >
      <a
        v-for="link in navLinks"
        :key="link.href"
        :href="link.href"
        class="block py-4 text-sm font-medium tracking-wide text-soft-white uppercase transition-colors hover:text-electric-lime"
        @click="closeMobileMenu"
      >
        {{ link.label }}
      </a>
      <button
        type="button"
        class="mt-5 flex h-12 w-full items-center justify-center rounded-[10px] bg-electric-lime text-sm font-semibold tracking-wide text-midnight uppercase"
        @click="scrollToWaitlist"
      >
        Join waitlist
      </button>
    </div>
  </header>
</template>

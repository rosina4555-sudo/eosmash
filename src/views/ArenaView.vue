<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createArenaGame } from '../../game/src/main'

const host = ref<HTMLElement | null>(null)
const isTouch = ref(false)
const showRotate = ref(false)
let game: import('phaser').Game | null = null
let coarseMq: MediaQueryList | null = null
let portraitMq: MediaQueryList | null = null

function syncMedia() {
  isTouch.value = coarseMq?.matches ?? false
  showRotate.value = isTouch.value && (portraitMq?.matches ?? false)
}

onMounted(() => {
  coarseMq = window.matchMedia('(pointer: coarse)')
  portraitMq = window.matchMedia('(orientation: portrait)')
  coarseMq.addEventListener('change', syncMedia)
  portraitMq.addEventListener('change', syncMedia)
  syncMedia()

  if (host.value) {
    game = createArenaGame(host.value)
  }
})

onUnmounted(() => {
  coarseMq?.removeEventListener('change', syncMedia)
  portraitMq?.removeEventListener('change', syncMedia)
  game?.destroy(true)
  game = null
})
</script>

<template>
  <div class="fixed inset-0 flex touch-none flex-col overflow-hidden bg-midnight select-none">
    <header
      class="flex shrink-0 items-center justify-between px-5 py-4 md:px-8"
    >
      <RouterLink
        to="/"
        class="text-[12px] font-bold uppercase tracking-[0.18em] text-muted-slate transition-colors hover:text-electric-lime"
      >
        ← Back to home
      </RouterLink>
      <p class="text-[11px] font-bold tracking-[0.24em] text-electric-lime/80 uppercase">
        Arena Prototype
      </p>
    </header>

    <div ref="host" class="relative min-h-0 w-full flex-1">
      <div
        v-if="showRotate"
        class="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center"
      >
        <p
          class="rounded-full border border-border bg-deep-navy/95 px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-electric-lime uppercase"
        >
          ↻ Rotate your device to play
        </p>
      </div>
    </div>

    <footer
      v-if="!isTouch"
      class="flex shrink-0 items-center justify-center px-5 py-3 md:px-8"
    >
      <p
        class="text-center text-[11px] font-semibold tracking-[0.14em] text-muted-slate uppercase"
      >
        A/D move · W jump · J light · K heavy · L block · Esc pause · R rematch
      </p>
    </footer>
  </div>
</template>

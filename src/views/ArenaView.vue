<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { createArenaGame } from '../../game/src/main'

const host = ref<HTMLElement | null>(null)
const isTouch = ref(false)
const showRotate = ref(false)
let game: import('phaser').Game | null = null
let coarseMq: MediaQueryList | null = null
let portraitMq: MediaQueryList | null = null
let lockAttempted = false
let pausedScenes: Array<import('phaser').Scene> = []

function syncMedia() {
  isTouch.value = coarseMq?.matches ?? false
  showRotate.value = isTouch.value && (portraitMq?.matches ?? false)
}

function setCovered(covered: boolean) {
  if (!game) return
  game.input.enabled = !covered
  if (covered) {
    pausedScenes = game.scene.getScenes(true)
    for (const scene of pausedScenes) scene.scene.pause()
  } else {
    for (const scene of pausedScenes) scene.scene.resume()
    pausedScenes = []
  }
}

function tryLockOrientation() {
  if (lockAttempted || !isTouch.value) return
  lockAttempted = true
  try {
    screen.orientation.lock('landscape').catch(() => {})
  } catch {
    // Unsupported (most desktop browsers, iOS Safari) — rotate prompt stays authoritative.
  }
}

watch(showRotate, (v) => setCovered(v))

onMounted(() => {
  coarseMq = window.matchMedia('(pointer: coarse)')
  portraitMq = window.matchMedia('(orientation: portrait)')
  coarseMq.addEventListener('change', syncMedia)
  portraitMq.addEventListener('change', syncMedia)
  syncMedia()
  window.addEventListener('pointerdown', tryLockOrientation)

  if (host.value) {
    game = createArenaGame(host.value)
    setCovered(showRotate.value)
  }
})

onUnmounted(() => {
  coarseMq?.removeEventListener('change', syncMedia)
  portraitMq?.removeEventListener('change', syncMedia)
  window.removeEventListener('pointerdown', tryLockOrientation)
  game?.destroy(true)
  game = null
})
</script>

<template>
  <div class="fixed inset-0 flex touch-none flex-col overflow-hidden bg-midnight select-none">
    <header
      class="flex items-center justify-between px-5 py-4 md:px-8"
      :class="
        isTouch
          ? 'pointer-events-none absolute inset-x-0 top-0 z-40 py-3'
          : 'relative shrink-0'
      "
    >
      <RouterLink
        to="/"
        class="pointer-events-auto text-[12px] font-bold uppercase tracking-[0.18em] text-muted-slate transition-colors hover:text-electric-lime"
      >
        ← Back to home
      </RouterLink>
      <p
        v-if="!isTouch"
        class="text-[11px] font-bold tracking-[0.24em] text-electric-lime/80 uppercase"
      >
        Arena Prototype
      </p>
    </header>

    <div ref="host" class="relative min-h-0 w-full flex-1"></div>

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

    <div
      v-if="showRotate"
      @pointerdown.stop.prevent
      class="fixed inset-0 z-50 flex touch-none flex-col items-center justify-center gap-5 bg-midnight px-8 text-center"
    >
      <span class="text-6xl leading-none text-electric-lime" aria-hidden="true">↻</span>
      <h1 class="text-lg font-bold tracking-[0.2em] text-white uppercase">
        Rotate your device
      </h1>
      <p class="max-w-xs text-sm leading-relaxed text-muted-slate">
        Turn on auto-rotate, then hold your phone sideways to play.
      </p>
    </div>
  </div>
</template>

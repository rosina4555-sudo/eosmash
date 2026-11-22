<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  acceptAnalyticsConsent,
  declineAnalyticsConsent,
  initAnalytics,
  isConsentDecided,
} from './composables/useAnalytics'

const showConsentBanner = ref(false)

onMounted(() => {
  initAnalytics()
  showConsentBanner.value = !isConsentDecided()
})

function onAccept() {
  acceptAnalyticsConsent()
  showConsentBanner.value = false
}

function onDecline() {
  declineAnalyticsConsent()
  showConsentBanner.value = false
}
</script>

<template>
  <RouterView />

  <div
    v-if="showConsentBanner"
    role="dialog"
    aria-label="Analytics consent"
    class="fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-deep-navy/95 px-5 py-4 backdrop-blur-sm sm:px-8"
  >
    <div class="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="max-w-2xl">
        <p class="text-sm leading-relaxed text-soft-white">
          We use anonymous visit stats to improve Eosmash. With your permission, we also record
          sessions to see where visitors get stuck.
        </p>
        <p class="mt-1 text-sm leading-relaxed text-muted-slate">
          Decline and only anonymous traffic stats will run.
          <RouterLink to="/privacy" class="underline underline-offset-2 hover:text-electric-lime">
            Privacy Policy
          </RouterLink>
        </p>
      </div>
      <div class="flex shrink-0 gap-3">
        <button type="button" class="btn-primary min-h-10 px-6 text-sm" @click="onAccept">
          Accept
        </button>
        <button type="button" class="btn-quiet min-h-10 px-6 text-sm" @click="onDecline">
          Decline
        </button>
      </div>
    </div>
  </div>
</template>

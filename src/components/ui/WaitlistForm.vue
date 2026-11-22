<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { trackEvent } from '../../composables/useAnalytics'

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error' | 'network'

const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const status = ref<Status>('idle')
const errorMessage = ref('')

const form = reactive({
  email: '',
  country: 'Ghana',
  preferred_game: '',
  device: '',
})

const emailError = ref('')
const emailTouched = ref(false)

const gameOptions = [
  { value: '', label: 'Select a category' },
  { value: 'fighting', label: 'Fighting' },
  { value: 'racing', label: 'Racing' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'arcade', label: 'Arcade' },
  { value: 'other', label: 'Other' },
  { value: 'not_sure', label: 'Not sure yet' },
]

const deviceOptions = [
  { value: '', label: 'Select a device' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'pc', label: 'PC' },
  { value: 'console', label: 'Console' },
  { value: 'multiple', label: 'Multiple devices' },
]

const isValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
const isLoading = computed(() => status.value === 'loading')
const isSuccess = computed(() => status.value === 'success')

function validateEmail() {
  emailTouched.value = true
  if (!form.email.trim()) {
    emailError.value = 'Email address is required.'
    return false
  }
  if (!isValidEmail.value) {
    emailError.value = 'Enter a valid email address.'
    return false
  }
  emailError.value = ''
  return true
}

async function handleSubmit() {
  if (isLoading.value || isSuccess.value) return

  status.value = 'idle'
  errorMessage.value = ''

  if (!validateEmail()) {
    trackEvent('form_field_error', {
      field: 'email',
      reason: form.email.trim() ? 'invalid' : 'required',
    })
    return
  }

  if (!endpoint) {
    status.value = 'error'
    errorMessage.value = 'Signups are temporarily down. Give it another try in a bit.'
    trackEvent('waitlist_error', { reason: 'config' })
    return
  }

  status.value = 'loading'

  try {
    const payload: Record<string, string> = { email: form.email.trim().toLowerCase() }
    if (form.country.trim()) payload.country = form.country.trim()
    if (form.preferred_game) payload.preferred_game = form.preferred_game
    if (form.device) payload.device = form.device

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    }
    if (anonKey) {
      headers.apikey = anonKey
      headers.Authorization = `Bearer ${anonKey}`
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (response.status === 409) {
      status.value = 'duplicate'
      trackEvent('waitlist_duplicate')
      return
    }

    if (!response.ok) {
      status.value = 'error'
      errorMessage.value = 'That did not work. Please try again.'
      trackEvent('waitlist_error', { reason: 'server', status: response.status })
      return
    }

    status.value = 'success'
    trackEvent('waitlist_signup', {
      country: form.country.trim() || 'unspecified',
      preferred_game: form.preferred_game || 'unspecified',
      device: form.device || 'unspecified',
    })
  } catch {
    status.value = 'network'
    errorMessage.value = 'Connection lost. Check your internet and try again.'
    trackEvent('waitlist_error', { reason: 'network' })
  }
}
</script>

<template>
  <div class="w-full">
    <form v-if="!isSuccess" novalidate class="flex flex-col gap-5" @submit.prevent="handleSubmit">
      <div>
        <label for="waitlist-email" class="label-quiet mb-2 block">
          Email address <span class="text-electric-lime" aria-hidden="true">*</span>
        </label>
        <input
          id="waitlist-email"
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          required
          placeholder="you@example.com"
          :aria-invalid="!!emailError"
          :aria-describedby="emailError ? 'waitlist-email-error' : undefined"
          class="field"
          @blur="validateEmail"
          @input="emailTouched && validateEmail()"
        />
        <p
          id="waitlist-email-error"
          role="alert"
          class="mt-2 min-h-[1lh] text-sm text-error"
          :class="emailError ? '' : 'invisible'"
          :aria-hidden="emailError ? undefined : 'true'"
        >
          {{ emailError || 'Placeholder' }}
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label for="waitlist-country" class="label-quiet mb-2 block">Country</label>
          <input
            id="waitlist-country"
            v-model="form.country"
            type="text"
            name="country"
            autocomplete="country-name"
            placeholder="Ghana"
            class="field"
          />
        </div>

        <div>
          <label for="waitlist-game" class="label-quiet mb-2 block">Preferred game</label>
          <select
            id="waitlist-game"
            v-model="form.preferred_game"
            name="preferred_game"
            class="field appearance-none"
          >
            <option v-for="opt in gameOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label for="waitlist-device" class="label-quiet mb-2 block">Gaming device</label>
        <select
          id="waitlist-device"
          v-model="form.device"
          name="device"
          class="field appearance-none"
        >
          <option v-for="opt in deviceOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <p
        v-if="status === 'error' || status === 'network' || status === 'duplicate'"
        role="alert"
        class="rounded-[10px] bg-error/10 px-4 py-3 text-sm text-error"
      >
        {{
          status === 'duplicate'
            ? 'This email is already on the list. You are good to go!'
            : errorMessage
        }}
      </p>

      <button
        type="submit"
        :disabled="isLoading"
        class="btn-primary w-full whitespace-nowrap"
        style="min-width: 200px"
      >
        <svg
          v-if="isLoading"
          class="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span v-if="isLoading" class="whitespace-nowrap">Joining…</span>
        <span v-else class="whitespace-nowrap">Join waitlist</span>
      </button>

      <p class="text-sm leading-relaxed text-muted-slate">
        By joining, you agree to get product and launch updates from Eosmash. Unsubscribe
        whenever you want.
        <RouterLink
          to="/privacy"
          class="text-soft-white underline underline-offset-2 hover:text-electric-lime"
        >
          Privacy Policy
        </RouterLink>
      </p>
    </form>

    <div
      v-else
      role="status"
      aria-live="polite"
      class="rounded-[12px] bg-success/10 p-6 md:p-8"
    >
      <div class="mb-3 flex items-center gap-3">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-full bg-success/20 text-success"
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <h3 class="text-xl font-semibold tracking-tight text-pure-white md:text-2xl">
          You&rsquo;re on the list!
        </h3>
      </div>
      <p class="max-w-md text-[15px] leading-relaxed text-muted-slate">
        You&rsquo;re in. We will keep you posted as launch gets closer.
      </p>
    </div>
  </div>
</template>

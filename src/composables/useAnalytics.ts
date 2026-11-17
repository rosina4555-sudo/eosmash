const UMAMI_SCRIPT_SRC = 'https://cloud.umami.is/script.js'
const CONSENT_KEY = 'eosmash_analytics_consent'

const umamiId = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined
const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined

interface ClarityQueue {
  (...args: unknown[]): void
  q?: unknown[][]
}

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void
    }
    clarity?: ClarityQueue
  }
}

export function trackEvent(eventName: string, eventData: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, eventData)
  }
}

function loadUmami() {
  if (!umamiId || typeof document === 'undefined') return
  if (document.querySelector('script[data-website-id]')) return

  const script = document.createElement('script')
  script.defer = true
  script.src = UMAMI_SCRIPT_SRC
  script.setAttribute('data-website-id', umamiId)
  document.head.appendChild(script)
}

function initClarity() {
  if (!clarityId || typeof window === 'undefined' || window.clarity) return

  const clarity: ClarityQueue = function (...args: unknown[]) {
    clarity.q = clarity.q || []
    clarity.q.push(args)
  }
  window.clarity = clarity

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${clarityId}`
  const firstScript = document.getElementsByTagName('script')[0]
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript)
  } else {
    document.head.appendChild(script)
  }
}

export function hasAnalyticsConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'granted'
}

export function isConsentDecided() {
  return localStorage.getItem(CONSENT_KEY) !== null
}

export function acceptAnalyticsConsent() {
  localStorage.setItem(CONSENT_KEY, 'granted')
  initClarity()
}

export function declineAnalyticsConsent() {
  localStorage.setItem(CONSENT_KEY, 'denied')
}

export function initAnalytics() {
  loadUmami()
  if (hasAnalyticsConsent()) initClarity()
}

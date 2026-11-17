export const MATCH_DURATION_MS = 90000
export const SUDDEN_DEATH_MS = 15000
export const COUNTDOWN_MS = 3000

export type MatchState = 'countdown' | 'fighting' | 'sudden_death' | 'ended'
export type MatchMode = 'quick' | 'practice'
export type MatchWinner = 'rex' | 'nyra' | 'draw'

export interface MatchResult {
  winner: MatchWinner
  reason: 'ko' | 'timeout'
}

export class MatchManager {
  state: MatchState = 'countdown'
  mode: MatchMode = 'quick'
  timeLeftMs = MATCH_DURATION_MS
  countdownMs = COUNTDOWN_MS
  goFlashMs = 0
  bannerText = ''
  bannerMs = 0
  elapsedMs = 0
  result: MatchResult | null = null

  get isFightActive(): boolean {
    return this.state === 'fighting' || this.state === 'sudden_death'
  }

  tick(delta: number) {
    if (this.state === 'countdown') {
      this.countdownMs -= delta
      if (this.countdownMs <= 0) {
        this.state = 'fighting'
        this.countdownMs = 0
        this.goFlashMs = 600
      }
      return
    }
    if (!this.isFightActive) return

    this.elapsedMs += delta
    if (this.goFlashMs > 0) this.goFlashMs -= delta
    if (this.bannerMs > 0) this.bannerMs -= delta
    if (this.mode === 'practice') return
    this.timeLeftMs = Math.max(0, this.timeLeftMs - delta)
  }

  checkKOs(rexDown: boolean, nyraDown: boolean): boolean {
    if (!this.isFightActive) return false
    if (rexDown && nyraDown) {
      this.end('draw', 'ko')
      return true
    }
    if (rexDown) {
      this.end('nyra', 'ko')
      return true
    }
    if (nyraDown) {
      this.end('rex', 'ko')
      return true
    }
    return false
  }

  checkTimeout(rexHealth: number, nyraHealth: number): boolean {
    if (this.timeLeftMs > 0 || !this.isFightActive) return false

    if (this.state === 'fighting') {
      if (rexHealth !== nyraHealth) {
        this.end(rexHealth > nyraHealth ? 'rex' : 'nyra', 'timeout')
      } else {
        this.state = 'sudden_death'
        this.timeLeftMs = SUDDEN_DEATH_MS
        this.bannerText = 'SUDDEN DEATH'
        this.bannerMs = 1600
      }
      return true
    }

    if (rexHealth > nyraHealth) this.end('rex', 'timeout')
    else if (nyraHealth > rexHealth) this.end('nyra', 'timeout')
    else this.end('draw', 'timeout')
    return true
  }

  private end(winner: MatchWinner, reason: 'ko' | 'timeout') {
    this.state = 'ended'
    this.result = { winner, reason }
  }

  reset(mode: MatchMode) {
    this.state = 'countdown'
    this.mode = mode
    this.timeLeftMs = MATCH_DURATION_MS
    this.countdownMs = COUNTDOWN_MS
    this.goFlashMs = 0
    this.bannerText = ''
    this.bannerMs = 0
    this.elapsedMs = 0
    this.result = null
  }
}

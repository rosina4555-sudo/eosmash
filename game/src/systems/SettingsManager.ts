import type { AIDifficulty } from '../ai/DifficultyProfiles'

export interface ArenaSettings {
  master: number
  music: number
  sfx: number
  difficulty: AIDifficulty
}

const STORAGE_KEY = 'eosmash_arena_settings_v1'

const DEFAULTS: ArenaSettings = {
  master: 0.9,
  music: 0.5,
  sfx: 0.8,
  difficulty: 'normal',
}

export function loadSettings(): ArenaSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<ArenaSettings>
    return {
      master: typeof parsed.master === 'number' ? clamp01(parsed.master) : DEFAULTS.master,
      music: typeof parsed.music === 'number' ? clamp01(parsed.music) : DEFAULTS.music,
      sfx: typeof parsed.sfx === 'number' ? clamp01(parsed.sfx) : DEFAULTS.sfx,
      difficulty:
        parsed.difficulty === 'easy' || parsed.difficulty === 'normal' || parsed.difficulty === 'hard'
          ? parsed.difficulty
          : DEFAULTS.difficulty,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings: ArenaSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // storage unavailable; settings stay session-local
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

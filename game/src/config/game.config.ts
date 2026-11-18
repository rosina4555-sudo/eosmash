export const IS_TOUCH =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export const GAME_WIDTH = 1280
export const GAME_HEIGHT = 720
export const GROUND_Y = 620
export const GROUND_HEIGHT = GAME_HEIGHT - GROUND_Y

export const PHYSICS = {
  gravity: 1400,
} as const

export const GAME_CONFIG = {
  backgroundColor: '#0B1020',
} as const

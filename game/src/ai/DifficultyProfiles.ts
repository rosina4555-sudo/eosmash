export type AIDifficulty = 'easy' | 'normal' | 'hard'

export interface DifficultyProfile {
  decisionMinMs: number
  decisionMaxMs: number
  reactionMs: number
  blockChance: number
  attackChance: number
  heavyChance: number
  punishChance: number
  retreatChance: number
  jumpChance: number
  preferredRange: number
  /** Chance to squat-dodge instead of block when threatened */
  dodgeChance: number
  /** Chance to slide in from mid-range */
  slideChance: number
  /** Chance to use crouch uppercut as punish */
  uppercutChance: number
  /** Chance to burn special when in range */
  specialChance: number
  /** Chance to throw an air attack while jumping in */
  airAttackChance: number
}

export const DIFFICULTY_PROFILES: Record<AIDifficulty, DifficultyProfile> = {
  easy: {
    decisionMinMs: 400,
    decisionMaxMs: 700,
    reactionMs: 350,
    blockChance: 0.25,
    attackChance: 0.45,
    heavyChance: 0.18,
    punishChance: 0.1,
    retreatChance: 0.12,
    jumpChance: 0.04,
    preferredRange: 150,
    dodgeChance: 0.12,
    slideChance: 0.08,
    uppercutChance: 0.08,
    specialChance: 0.05,
    airAttackChance: 0.25,
  },
  normal: {
    decisionMinMs: 250,
    decisionMaxMs: 450,
    reactionMs: 220,
    blockChance: 0.45,
    attackChance: 0.6,
    heavyChance: 0.35,
    punishChance: 0.3,
    retreatChance: 0.18,
    jumpChance: 0.06,
    preferredRange: 130,
    dodgeChance: 0.28,
    slideChance: 0.2,
    uppercutChance: 0.22,
    specialChance: 0.14,
    airAttackChance: 0.45,
  },
  hard: {
    decisionMinMs: 150,
    decisionMaxMs: 300,
    reactionMs: 120,
    blockChance: 0.55,
    attackChance: 0.7,
    heavyChance: 0.45,
    punishChance: 0.55,
    retreatChance: 0.22,
    jumpChance: 0.1,
    preferredRange: 115,
    dodgeChance: 0.42,
    slideChance: 0.32,
    uppercutChance: 0.35,
    specialChance: 0.25,
    airAttackChance: 0.65,
  },
}

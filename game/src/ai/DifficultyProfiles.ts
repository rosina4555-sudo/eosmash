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
    jumpChance: 0.02,
    preferredRange: 150,
  },
  normal: {
    decisionMinMs: 250,
    decisionMaxMs: 450,
    reactionMs: 220,
    blockChance: 0.55,
    attackChance: 0.6,
    heavyChance: 0.35,
    punishChance: 0.3,
    retreatChance: 0.18,
    jumpChance: 0.03,
    preferredRange: 130,
  },
  hard: {
    decisionMinMs: 150,
    decisionMaxMs: 300,
    reactionMs: 120,
    blockChance: 0.8,
    attackChance: 0.7,
    heavyChance: 0.45,
    punishChance: 0.55,
    retreatChance: 0.22,
    jumpChance: 0.05,
    preferredRange: 115,
  },
}

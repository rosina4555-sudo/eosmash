export type AttackId = 'light' | 'heavy'

export interface HitboxSpec {
  /** px wide */
  width: number
  /** px tall */
  height: number
  /** px from body center to hitbox inner edge (facing right) */
  reach: number
  /** px above feet to hitbox bottom */
  base: number
}

export interface AttackDefinition {
  id: AttackId
  damage: number
  startupMs: number
  activeMs: number
  recoveryMs: number
  hitstunMs: number
  knockbackX: number
  knockbackY: number
  hitbox: HitboxSpec
}

export const ATTACKS: Record<AttackId, AttackDefinition> = {
  light: {
    id: 'light',
    damage: 40,
    startupMs: 100,
    activeMs: 90,
    recoveryMs: 250,
    hitstunMs: 180,
    knockbackX: 180,
    knockbackY: -60,
    hitbox: { width: 54, height: 42, reach: 26, base: 52 },
  },
  heavy: {
    id: 'heavy',
    damage: 90,
    startupMs: 300,
    activeMs: 120,
    recoveryMs: 550,
    hitstunMs: 320,
    knockbackX: 340,
    knockbackY: -140,
    hitbox: { width: 68, height: 52, reach: 30, base: 46 },
  },
}

export const BLOCK_DAMAGE_MULTIPLIER = 0
export const BLOCK_KNOCKBACK_MULTIPLIER = 0.5
export const BLOCK_MOVE_MULTIPLIER = 0.4

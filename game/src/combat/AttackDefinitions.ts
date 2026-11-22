export type AttackId =
  | 'light'
  | 'heavy'
  | 'uppercut'
  | 'slide'
  | 'air_light'
  | 'air_heavy'
  | 'special'

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
  /** forward dash velocity during active frames (px/s, 0 = none) */
  dashVelocity?: number
  /** vertical velocity applied when attack becomes active (for launchers) */
  liftVelocity?: number
  /** heavier hit feel: used for whoosh/hit sfx tiering */
  heavy: boolean
  /** multi-hit cap during one active window (default 1) */
  maxHits?: number
  /** ms between multi-hits */
  hitGapMs?: number
  /** true when this is a meter-burning power special */
  powered?: boolean
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
    hitbox: { width: 54, height: 42, reach: 26, base: 56 },
    heavy: false,
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
    hitbox: { width: 68, height: 52, reach: 30, base: 40 },
    heavy: true,
  },
  uppercut: {
    id: 'uppercut',
    damage: 85,
    startupMs: 140,
    activeMs: 110,
    recoveryMs: 420,
    hitstunMs: 300,
    knockbackX: 140,
    knockbackY: -480,
    hitbox: { width: 50, height: 78, reach: 18, base: 18 },
    liftVelocity: -420,
    heavy: true,
  },
  slide: {
    id: 'slide',
    damage: 55,
    startupMs: 90,
    activeMs: 160,
    recoveryMs: 340,
    hitstunMs: 210,
    knockbackX: 300,
    knockbackY: -30,
    hitbox: { width: 72, height: 34, reach: 36, base: 6 },
    dashVelocity: 460,
    heavy: false,
  },
  air_light: {
    id: 'air_light',
    damage: 45,
    startupMs: 70,
    activeMs: 130,
    recoveryMs: 160,
    hitstunMs: 170,
    knockbackX: 170,
    knockbackY: -40,
    hitbox: { width: 56, height: 46, reach: 28, base: 48 },
    heavy: false,
  },
  air_heavy: {
    id: 'air_heavy',
    damage: 80,
    startupMs: 120,
    activeMs: 150,
    recoveryMs: 260,
    hitstunMs: 280,
    knockbackX: 260,
    knockbackY: -90,
    hitbox: { width: 64, height: 54, reach: 32, base: 36 },
    heavy: true,
  },
  special: {
    id: 'special',
    damage: 100,
    startupMs: 200,
    activeMs: 160,
    recoveryMs: 520,
    hitstunMs: 360,
    knockbackX: 420,
    knockbackY: -170,
    hitbox: { width: 78, height: 56, reach: 38, base: 34 },
    dashVelocity: 320,
    heavy: true,
  },
}

/** Meter-burning power specials (keyed by fighter). */
export const POWER_SPECIALS: Record<'rex' | 'nyra', AttackDefinition> = {
  rex: {
    id: 'special',
    damage: 145,
    startupMs: 160,
    activeMs: 200,
    recoveryMs: 480,
    hitstunMs: 420,
    knockbackX: 520,
    knockbackY: -200,
    hitbox: { width: 96, height: 64, reach: 44, base: 30 },
    dashVelocity: 520,
    heavy: true,
    powered: true,
  },
  nyra: {
    id: 'special',
    damage: 70,
    startupMs: 140,
    activeMs: 320,
    recoveryMs: 440,
    hitstunMs: 240,
    knockbackX: 280,
    knockbackY: -320,
    hitbox: { width: 84, height: 60, reach: 40, base: 32 },
    dashVelocity: 380,
    heavy: true,
    powered: true,
    maxHits: 2,
    hitGapMs: 150,
  },
}

export const BLOCK_DAMAGE_MULTIPLIER = 0
export const BLOCK_KNOCKBACK_MULTIPLIER = 0.5
export const BLOCK_MOVE_MULTIPLIER = 0.4

/** Crouch shrinks hurtbox so high attacks (light/air) can whiff over you. */
export const CROUCH_BODY_SCALE = 0.55
export const CROUCH_MOVE_MULTIPLIER = 0.45

/** Special meter */
export const METER_MAX = 100
/** Meter gained per point of damage dealt */
export const METER_DEAL_SCALE = 0.1
/** Meter gained per point of damage taken (or blocked through) */
export const METER_TAKE_SCALE = 0.05

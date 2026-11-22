import type Phaser from 'phaser'
import type { Fighter } from '../entities/Fighter'
import { emptyInput, type InputSnapshot } from '../input/InputSnapshot'
import {
  DIFFICULTY_PROFILES,
  type AIDifficulty,
  type DifficultyProfile,
} from './DifficultyProfiles'

type Intent = 'idle' | 'approach' | 'retreat' | 'defend' | 'dodge'
type PendingEdge =
  | 'light'
  | 'heavy'
  | 'jump'
  | 'special'
  | 'slide'
  | 'uppercut'
  | 'air_light'
  | 'air_heavy'
  | null

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export class AIController {
  difficulty: AIDifficulty

  private readonly fighter: Fighter
  private readonly target: Fighter
  private profile: DifficultyProfile
  private intent: Intent = 'idle'
  private intentTimer = 0
  private decisionTimer = 0
  private pendingEdge: PendingEdge = null
  private pendingAir: 'light' | 'heavy' | null = null
  private threatWasActive = false

  constructor(fighter: Fighter, target: Fighter, difficulty: AIDifficulty) {
    this.fighter = fighter
    this.target = target
    this.difficulty = difficulty
    this.profile = DIFFICULTY_PROFILES[difficulty]
    this.decisionTimer = rand(200, 500)
  }

  setDifficulty(difficulty: AIDifficulty) {
    this.difficulty = difficulty
    this.profile = DIFFICULTY_PROFILES[difficulty]
  }

  update(delta: number): InputSnapshot {
    const snap = emptyInput()
    if (this.fighter.phase === 'ko' || this.target.phase === 'ko') return snap
    if (!this.fighter.canAct) return snap

    const body = this.fighter.sprite.body as Phaser.Physics.Arcade.Body
    const grounded = body.blocked.down
    const dist = Math.abs(this.target.sprite.x - this.fighter.sprite.x)
    const targetRight = this.target.sprite.x > this.fighter.sprite.x
    const playerThreat = this.target.phase === 'startup' || this.target.phase === 'active'

    if (playerThreat && !this.threatWasActive) {
      this.decisionTimer = Math.min(this.decisionTimer, this.profile.reactionMs)
    }
    this.threatWasActive = playerThreat

    this.decisionTimer -= delta
    if (this.intent === 'defend' || this.intent === 'dodge') {
      this.intentTimer -= delta
      if (this.intentTimer <= 0) this.intent = 'idle'
    }
    if (this.decisionTimer <= 0) {
      this.decide(dist, playerThreat, grounded)
      this.decisionTimer = rand(this.profile.decisionMinMs, this.profile.decisionMaxMs)
    }

    switch (this.intent) {
      case 'approach':
        if (targetRight) snap.right = true
        else snap.left = true
        break
      case 'retreat':
        if (targetRight) snap.left = true
        else snap.right = true
        break
      case 'defend':
        snap.block = true
        break
      case 'dodge':
        snap.crouch = true
        break
      case 'idle':
        break
    }

    // Air attack once airborne after a jump decision
    if (!grounded && this.pendingAir) {
      if (this.pendingAir === 'light') snap.lightPressed = true
      else snap.heavyPressed = true
      this.pendingAir = null
    }

    if (this.pendingEdge === 'light') snap.lightPressed = true
    else if (this.pendingEdge === 'heavy') snap.heavyPressed = true
    else if (this.pendingEdge === 'jump') snap.jumpPressed = true
    else if (this.pendingEdge === 'special') snap.specialPressed = true
    else if (this.pendingEdge === 'slide') {
      snap.crouch = true
      snap.lightPressed = true
    } else if (this.pendingEdge === 'uppercut') {
      snap.crouch = true
      snap.heavyPressed = true
    } else if (this.pendingEdge === 'air_light') {
      snap.lightPressed = true
    } else if (this.pendingEdge === 'air_heavy') {
      snap.heavyPressed = true
    }
    this.pendingEdge = null

    return snap
  }

  private decide(dist: number, playerThreat: boolean, grounded: boolean) {
    const p = this.profile

    // React to incoming attacks: dodge (squat) or block
    if (playerThreat && dist < 240) {
      // Low slides: jump over instead of squat (squat loses to slides)
      const threatIsLow =
        this.target.currentAttack?.id === 'slide' ||
        this.target.currentAttack?.id === 'uppercut'
      if (!threatIsLow && grounded && Math.random() < p.dodgeChance) {
        this.intent = 'dodge'
        this.intentTimer = 320 + Math.random() * 220
        return
      }
      if (Math.random() < p.blockChance) {
        this.intent = 'defend'
        this.intentTimer = 350 + Math.random() * 250
        return
      }
      if (threatIsLow && grounded && Math.random() < p.jumpChance + 0.15) {
        this.pendingEdge = 'jump'
        this.pendingAir = Math.random() < 0.5 ? 'light' : 'heavy'
        this.intent = 'approach'
        return
      }
    }

    // Punish recovery with advanced options
    if (this.target.phase === 'recovery' && dist < p.preferredRange + 60) {
      if (this.fighter.isMeterFull && grounded && dist < 170 && Math.random() < 0.7) {
        this.pendingEdge = 'special'
        this.intent = 'approach'
        return
      }
      if (Math.random() < p.punishChance) {
        const roll = Math.random()
        if (roll < p.uppercutChance && dist < 100) this.pendingEdge = 'uppercut'
        else if (roll < p.uppercutChance + p.specialChance && dist < 160)
          this.pendingEdge = 'special'
        else this.pendingEdge = 'light'
        this.intent = 'approach'
        return
      }
    }

    // Mid-range: slide in or air approach
    if (dist > p.preferredRange + 50) {
      if (dist < 280 && dist > 160 && Math.random() < p.slideChance) {
        this.pendingEdge = 'slide'
        this.intent = 'idle'
        return
      }
      this.intent = 'approach'
      if (Math.random() < p.jumpChance) {
        this.pendingEdge = 'jump'
        this.pendingAir = Math.random() < p.airAttackChance ? 'heavy' : null
      }
      return
    }

    // Close: mix of slide / special / uppercut / normals
    if (dist < p.preferredRange - 40) {
      if (this.fighter.isMeterFull && grounded && Math.random() < 0.55) {
        this.pendingEdge = 'special'
        this.intent = 'idle'
        return
      }
      if (Math.random() < p.attackChance) {
        const roll = Math.random()
        if (roll < p.specialChance) this.pendingEdge = 'special'
        else if (roll < p.specialChance + p.slideChance && dist > 110)
          this.pendingEdge = 'slide'
        else if (roll < p.specialChance + p.slideChance + p.uppercutChance && dist < 95)
          this.pendingEdge = 'uppercut'
        else this.pendingEdge = Math.random() < p.heavyChance && dist > 95 ? 'heavy' : 'light'
        this.intent = 'idle'
        return
      }
      if (Math.random() < p.retreatChance) {
        this.intent = 'retreat'
        return
      }
      this.intent = Math.random() < 0.5 ? 'dodge' : 'defend'
      this.intentTimer = 300
      return
    }

    // Mid range attack
    if (this.fighter.isMeterFull && grounded && dist < 200 && Math.random() < 0.5) {
      this.pendingEdge = 'special'
      this.intent = 'idle'
      return
    }
    if (Math.random() < p.attackChance) {
      const roll = Math.random()
      if (roll < p.slideChance) this.pendingEdge = 'slide'
      else if (roll < p.slideChance + p.specialChance) this.pendingEdge = 'special'
      else this.pendingEdge = Math.random() < p.heavyChance ? 'heavy' : 'light'
      this.intent = 'idle'
      return
    }

    // Air mixup
    if (grounded && Math.random() < p.airAttackChance * 0.35) {
      this.pendingEdge = 'jump'
      this.pendingAir = 'heavy'
      this.intent = 'approach'
      return
    }

    const roll = Math.random()
    this.intent = roll < 0.4 ? 'retreat' : roll < 0.7 ? 'idle' : 'approach'
  }
}

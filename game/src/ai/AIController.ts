import type { Fighter } from '../entities/Fighter'
import { emptyInput, type InputSnapshot } from '../input/InputSnapshot'
import {
  DIFFICULTY_PROFILES,
  type AIDifficulty,
  type DifficultyProfile,
} from './DifficultyProfiles'

type Intent = 'idle' | 'approach' | 'retreat' | 'defend'
type PendingEdge = 'light' | 'heavy' | 'jump' | null

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

    const dist = Math.abs(this.target.sprite.x - this.fighter.sprite.x)
    const targetRight = this.target.sprite.x > this.fighter.sprite.x
    const playerThreat = this.target.phase === 'startup' || this.target.phase === 'active'

    if (playerThreat && !this.threatWasActive) {
      this.decisionTimer = Math.min(this.decisionTimer, this.profile.reactionMs)
    }
    this.threatWasActive = playerThreat

    this.decisionTimer -= delta
    if (this.intent === 'defend') {
      this.intentTimer -= delta
      if (this.intentTimer <= 0) this.intent = 'idle'
    }
    if (this.decisionTimer <= 0) {
      this.decide(dist, playerThreat)
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
      case 'idle':
        break
    }

    if (this.pendingEdge === 'light') snap.lightPressed = true
    else if (this.pendingEdge === 'heavy') snap.heavyPressed = true
    else if (this.pendingEdge === 'jump') snap.jumpPressed = true
    this.pendingEdge = null

    return snap
  }

  private decide(dist: number, playerThreat: boolean) {
    const p = this.profile

    if (playerThreat && dist < 220 && Math.random() < p.blockChance) {
      this.intent = 'defend'
      this.intentTimer = 350 + Math.random() * 250
      return
    }

    if (
      this.target.phase === 'recovery' &&
      dist < p.preferredRange + 60 &&
      Math.random() < p.punishChance
    ) {
      this.pendingEdge = 'light'
      this.intent = 'approach'
      return
    }

    if (dist > p.preferredRange + 50) {
      this.intent = 'approach'
      if (Math.random() < p.jumpChance) this.pendingEdge = 'jump'
      return
    }

    if (dist < p.preferredRange - 40) {
      if (Math.random() < p.attackChance) {
        this.pendingEdge = Math.random() < p.heavyChance && dist > 95 ? 'heavy' : 'light'
        this.intent = 'idle'
        return
      }
      if (Math.random() < p.retreatChance) {
        this.intent = 'retreat'
        return
      }
      this.intent = 'defend'
      this.intentTimer = 300
      return
    }

    if (Math.random() < p.attackChance) {
      this.pendingEdge = Math.random() < p.heavyChance ? 'heavy' : 'light'
      this.intent = 'idle'
      return
    }

    const roll = Math.random()
    this.intent = roll < 0.4 ? 'retreat' : roll < 0.7 ? 'idle' : 'approach'
  }
}

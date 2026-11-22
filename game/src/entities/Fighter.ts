import Phaser from 'phaser'
import type { FighterDefinition } from '../config/characters.config'
import type { InputSnapshot } from '../input/InputSnapshot'
import {
  ATTACKS,
  BLOCK_DAMAGE_MULTIPLIER,
  BLOCK_KNOCKBACK_MULTIPLIER,
  BLOCK_MOVE_MULTIPLIER,
  CROUCH_BODY_SCALE,
  CROUCH_MOVE_MULTIPLIER,
  METER_MAX,
  POWER_SPECIALS,
  type AttackDefinition,
  type AttackId,
} from '../combat/AttackDefinitions'
import { audio } from '../systems/AudioManager'

export type FighterPhase =
  | 'idle'
  | 'startup'
  | 'active'
  | 'recovery'
  | 'hitstun'
  | 'ko'

export class Fighter {
  readonly sprite: Phaser.Physics.Arcade.Sprite
  hitsLanded = 0
  lastHitMs = 0

  private readonly def: FighterDefinition
  private readonly spawnX: number
  private readonly spawnY: number
  private currentPhase: FighterPhase = 'idle'
  private phaseTimer = 0
  private attack: AttackDefinition | null = null
  private attackPhaseEntered = false
  private blockHeld = false
  private crouching = false
  private hitFlashMs = 0
  private blockFlash = false
  private currentHealth: number
  private currentMeter = 0
  private poweredSpecial = false

  constructor(scene: Phaser.Scene, definition: FighterDefinition, x: number, y: number) {
    this.def = definition
    this.spawnX = x
    this.spawnY = y
    this.currentHealth = definition.health

    const sprite = scene.add.sprite(x, y, definition.key)
    sprite.setOrigin(definition.artOriginX ?? 0.5, 1)
    scene.physics.add.existing(sprite)
    this.sprite = sprite as Phaser.Physics.Arcade.Sprite

    this.applyBodyShape(false)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setDragX(1400)
  }

  get phase(): FighterPhase {
    return this.currentPhase
  }

  get canAct(): boolean {
    return this.currentPhase === 'idle'
  }

  get isCrouching(): boolean {
    return this.crouching
  }

  get currentAttack(): AttackDefinition | null {
    return this.attack
  }

  get hasHitTarget(): boolean {
    if (!this.attack) return false
    return this.hitsLanded >= (this.attack.maxHits ?? 1)
  }

  get meter(): number {
    return this.currentMeter
  }

  get meterPct(): number {
    return this.currentMeter / METER_MAX
  }

  get isMeterFull(): boolean {
    return this.currentMeter >= METER_MAX
  }

  get isPowered(): boolean {
    return this.poweredSpecial
  }

  registerHit() {
    this.hitsLanded += 1
    this.lastHitMs = this.sprite.scene.time.now
  }

  /** Returns true if the bar just filled to max. */
  addMeter(amount: number): boolean {
    if (this.currentPhase === 'ko' || amount <= 0) return false
    const wasFull = this.isMeterFull
    this.currentMeter = Math.min(METER_MAX, this.currentMeter + amount)
    if (!wasFull && this.isMeterFull) {
      return true
    }
    return false
  }

  get isBlocking(): boolean {
    if (!this.blockHeld || !this.canAct) return false
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    return body.blocked.down
  }

  get health(): number {
    return this.currentHealth
  }

  get maxHealth(): number {
    return this.def.health
  }

  startAttack(id: AttackId): boolean {
    if (!this.canAct) return false
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const grounded = body.blocked.down

    // Air-only vs ground-only gating
    if (!grounded && (id === 'slide' || id === 'uppercut' || id === 'special')) return false
    if (grounded && (id === 'air_light' || id === 'air_heavy')) return false
    if (id === 'special' && this.crouching) return false

    if (id === 'special' && this.isMeterFull) {
      this.attack = { ...POWER_SPECIALS[this.def.key as 'rex' | 'nyra'] }
      this.poweredSpecial = true
      this.currentMeter = 0
      audio.play('power_special')
    } else {
      this.attack = ATTACKS[id]
      this.poweredSpecial = false
    }

    this.currentPhase = 'startup'
    this.phaseTimer = this.attack.startupMs
    this.hitsLanded = 0
    this.lastHitMs = 0
    this.attackPhaseEntered = false
    body.setVelocityX(0)
    this.updateAnimation(true)
    return true
  }

  handleInput(input: InputSnapshot, opponent: Fighter) {
    if (!this.canAct) return
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const { moveSpeed, jumpVelocity } = this.def
    const grounded = body.blocked.down

    this.blockHeld = input.block

    // Crouch / dodge squat (grounded, not attacking)
    const wantCrouch = input.crouch && grounded && !input.block
    if (wantCrouch !== this.crouching) {
      this.crouching = wantCrouch
      this.sprite.setScale(1, this.crouching ? CROUCH_BODY_SCALE : 1)
      this.applyBodyShape(this.crouching)
    }

    if (this.isBlocking) {
      let direction = 0
      if (input.left) direction -= 1
      if (input.right) direction += 1
      body.setVelocityX(direction * moveSpeed * BLOCK_MOVE_MULTIPLIER)
      this.faceOpponent(opponent)
      return
    }

    // Context-sensitive attacks
    if (!grounded) {
      if (input.lightPressed && this.startAttack('air_light')) return
      if (input.heavyPressed && this.startAttack('air_heavy')) return
    } else if (this.crouching) {
      if (input.lightPressed && this.startAttack('slide')) return
      if (input.heavyPressed && this.startAttack('uppercut')) return
    } else {
      if (input.specialPressed && this.startAttack('special')) return
      if (input.lightPressed && this.startAttack('light')) return
      if (input.heavyPressed && this.startAttack('heavy')) return
    }

    if (input.jumpPressed && body.blocked.down) {
      body.setVelocityY(jumpVelocity)
      audio.play('jump')
      if (this.crouching) {
        this.crouching = false
        this.sprite.setScale(1, 1)
        this.applyBodyShape(false)
      }
      this.faceOpponent(opponent)
      return
    }

    if (this.crouching) {
      // Slow squat-walk
      let crouchDir = 0
      if (input.left) crouchDir -= 1
      if (input.right) crouchDir += 1
      body.setVelocityX(crouchDir * moveSpeed * CROUCH_MOVE_MULTIPLIER)
      this.faceOpponent(opponent)
      return
    }

    let direction = 0
    if (input.left) direction -= 1
    if (input.right) direction += 1
    body.setVelocityX(direction * moveSpeed)

    this.faceOpponent(opponent)
  }

  updateCombat(delta: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const facingDir = this.sprite.flipX ? -1 : 1

    switch (this.currentPhase) {
      case 'startup':
        body.setVelocityX(0)
        this.sprite.setAngle(-6 * facingDir)
        this.tickPhase(delta, 'active', this.attack?.activeMs ?? 0)
        break
      case 'active': {
        if (!this.attackPhaseEntered) {
          this.attackPhaseEntered = true
          if (this.attack?.liftVelocity) {
            body.setVelocityY(this.attack.liftVelocity)
          }
        }
        const dash = (this.attack?.dashVelocity ?? 0) * facingDir
        if (dash !== 0) body.setVelocityX(dash)
        else body.setVelocityX(70 * facingDir)

        const id = this.attack?.id
        if (id === 'slide') {
          this.sprite.setAngle(-62 * facingDir)
          this.sprite.setScale(1, CROUCH_BODY_SCALE)
        } else if (id === 'uppercut') {
          this.sprite.setAngle(-22 * facingDir)
          this.sprite.setScale(1, 1)
        } else if (id === 'air_light' || id === 'air_heavy') {
          this.sprite.setAngle(18 * facingDir)
          this.sprite.setScale(1, 1)
        } else if (id === 'special') {
          this.sprite.setAngle(10 * facingDir)
          this.sprite.setScale(1, 1)
        } else {
          this.sprite.setAngle(14 * facingDir)
          this.sprite.setScale(1, 1)
        }
        this.tickPhase(delta, 'recovery', this.attack?.recoveryMs ?? 0)
        break
      }
      case 'recovery':
        body.setVelocityX(0)
        this.sprite.setAngle(4 * facingDir)
        if (this.attack?.id === 'slide') {
          this.sprite.setScale(1, CROUCH_BODY_SCALE)
        } else {
          this.sprite.setScale(1, 1)
        }
        this.tickPhase(delta, 'idle', 0)
        break
      case 'hitstun':
        this.tickPhase(delta, 'idle', 0)
        break
      case 'idle':
        this.sprite.setAngle(0)
        this.sprite.setScale(1, this.crouching ? CROUCH_BODY_SCALE : 1)
        break
      case 'ko':
        break
    }

    this.updateAnimation()
    this.applyVisuals(delta)
  }

  private updateAnimation(force = false) {
    const scene = this.sprite.scene
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const grounded = body.blocked.down
    let animKey: string | null = null
    let manualFrame: string | null = null

    if (this.currentPhase === 'ko' || this.currentPhase === 'hitstun') {
      animKey = `${this.def.key}-hurt`
    } else if (
      this.currentPhase === 'startup' ||
      this.currentPhase === 'active' ||
      this.currentPhase === 'recovery'
    ) {
      animKey = this.attackAnimKey()
    } else if (!grounded) {
      const jumpAnim = `${this.def.key}-jump`
      if (scene.anims.exists(jumpAnim)) {
        manualFrame = `jump_${body.velocity.y < 0 ? 0 : 2}`
      }
    } else if (this.crouching) {
      animKey = `${this.def.key}-crouch`
      if (!scene.anims.exists(animKey)) animKey = `${this.def.key}-idle`
    } else {
      const walking = Math.abs(body.velocity.x) > 30
      const walkAnim = `${this.def.key}-walk`
      animKey =
        walking && scene.anims.exists(walkAnim) ? walkAnim : `${this.def.key}-idle`
    }

    if (manualFrame) {
      if (this.sprite.texture.has(manualFrame)) {
        if (this.sprite.anims.isPlaying) this.sprite.anims.stop()
        this.sprite.setFrame(manualFrame)
      }
      return
    }

    if (!animKey || !scene.anims.exists(animKey)) return

    const isLoop = animKey.endsWith('-idle') || animKey.endsWith('-walk') || animKey.endsWith('-crouch')
    const current = this.sprite.anims.currentAnim?.key
    const isPlaying = this.sprite.anims.isPlaying

    if (force || current !== animKey || (isLoop && !isPlaying)) {
      this.sprite.play(animKey, false)
    }
  }

  private attackAnimKey(): string {
    const id = this.attack?.id ?? 'light'
    const base = `${this.def.key}-${id}`
    const scene = this.sprite.scene
    if (scene.anims.exists(base)) return base
    // Fallbacks per character
    if (id === 'air_light' || id === 'air_heavy') {
      const kick = `${this.def.key}-kick`
      if (scene.anims.exists(kick)) return kick
      return `${this.def.key}-punch`
    }
    if (id === 'slide' || id === 'special') {
      const kick = `${this.def.key}-kick`
      if (scene.anims.exists(kick)) return kick
      return `${this.def.key}-punch`
    }
    if (id === 'uppercut') return `${this.def.key}-punch`
    return `${this.def.key}-light`
  }

  private applyBodyShape(crouch: boolean) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const h = crouch
      ? Math.max(24, Math.round(this.def.bodyHeight * CROUCH_BODY_SCALE))
      : this.def.bodyHeight
    body.setSize(this.def.bodyWidth, h)
    body.setOffset(
      Math.round((this.def.artOriginX ?? 0.5) * this.sprite.width - this.def.bodyWidth / 2),
      Math.round(this.sprite.height - h),
    )
  }

  private tickPhase(delta: number, next: FighterPhase, nextMs: number) {
    this.phaseTimer -= delta
    if (this.phaseTimer > 0) return

    this.currentPhase = next
    this.phaseTimer = nextMs
    if (next === 'idle') {
      this.attack = null
      this.hitsLanded = 0
      this.poweredSpecial = false
      this.blockHeld = false
      this.attackPhaseEntered = false
      this.sprite.setAngle(0)
      this.sprite.setScale(1, this.crouching ? CROUCH_BODY_SCALE : 1)
      this.applyBodyShape(this.crouching)
    }
  }

  private applyVisuals(delta: number) {
    if (this.currentPhase === 'ko') {
      this.sprite.setTint(0x556677)
      this.sprite.setAngle(this.sprite.flipX ? -90 : 90)
      return
    }
    if (this.hitFlashMs > 0) {
      this.hitFlashMs -= delta
      this.sprite.setTintFill(this.blockFlash ? 0x9fc6ff : 0xffffff)
      return
    }
    if (this.isBlocking) {
      this.sprite.setTint(0x9db4cf)
      return
    }
    this.sprite.clearTint()
  }

  takeHit(attack: AttackDefinition, attacker: Fighter): { blocked: boolean } {
    if (this.currentPhase === 'ko') return { blocked: false }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const pushDir = this.sprite.x >= attacker.sprite.x ? 1 : -1
    const blocked = this.isBlocking

    // Crouch dodge: high attacks whiff if hurtbox misses hitbox (handled by rect intersect).
    // Low slides still connect. No extra rule needed.

    const damage = blocked ? attack.damage * BLOCK_DAMAGE_MULTIPLIER : attack.damage
    this.currentHealth = Math.max(0, this.currentHealth - damage)

    const kbScale = blocked ? BLOCK_KNOCKBACK_MULTIPLIER : 1
    body.setVelocity(
      pushDir * attack.knockbackX * kbScale,
      blocked ? 0 : attack.knockbackY * kbScale,
    )

    this.hitFlashMs = 70
    this.blockFlash = blocked
    this.sprite.setAngle(0)
    if (this.crouching && !blocked) {
      this.crouching = false
      this.sprite.setScale(1, 1)
      this.applyBodyShape(false)
    }

    if (this.currentHealth <= 0) {
      this.currentPhase = 'ko'
      this.attack = null
      this.blockHeld = false
      this.poweredSpecial = false
      this.updateAnimation(true)
      return { blocked }
    }

    if (!blocked) {
      this.currentPhase = 'hitstun'
      this.phaseTimer = attack.hitstunMs
      this.attack = null
      this.hitsLanded = 0
      this.poweredSpecial = false
      this.updateAnimation(true)
      if (attack.heavy) {
        this.sprite.scene.cameras.main.shake(100, 0.0025)
      }
    } else if (attack.heavy) {
      this.sprite.scene.cameras.main.shake(70, 0.0012)
    }

    return { blocked }
  }

  reset() {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.crouching = false
    this.sprite.setScale(1, 1)
    this.applyBodyShape(false)
    body.reset(this.spawnX, this.spawnY)
    body.setVelocity(0, 0)
    this.currentHealth = this.def.health
    this.currentPhase = 'idle'
    this.phaseTimer = 0
    this.attack = null
    this.blockHeld = false
    this.hitFlashMs = 0
    this.blockFlash = false
    this.hitsLanded = 0
    this.lastHitMs = 0
    this.attackPhaseEntered = false
    this.poweredSpecial = false
    this.currentMeter = 0
    this.crouching = false
    this.sprite.clearTint()
    this.sprite.setAngle(0)
    this.sprite.setScale(1, 1)
    this.applyBodyShape(false)
    const idleAnim = `${this.def.key}-idle`
    if (this.sprite.scene.anims.exists(idleAnim)) {
      this.sprite.anims.play(idleAnim, true)
    }
  }

  private faceOpponent(opponent: Fighter) {
    const opponentLeft = opponent.sprite.x < this.sprite.x
    this.sprite.flipX = opponentLeft
  }
}

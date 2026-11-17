import Phaser from 'phaser'
import type { FighterDefinition } from '../config/characters.config'
import type { InputSnapshot } from '../input/InputSnapshot'
import {
  ATTACKS,
  BLOCK_DAMAGE_MULTIPLIER,
  BLOCK_KNOCKBACK_MULTIPLIER,
  BLOCK_MOVE_MULTIPLIER,
  type AttackDefinition,
  type AttackId,
} from '../combat/AttackDefinitions'

export type FighterPhase = 'idle' | 'startup' | 'active' | 'recovery' | 'hitstun' | 'ko'

export class Fighter {
  readonly sprite: Phaser.Physics.Arcade.Sprite
  hasHitTarget = false

  private readonly def: FighterDefinition
  private readonly spawnX: number
  private readonly spawnY: number
  private currentPhase: FighterPhase = 'idle'
  private phaseTimer = 0
  private attack: AttackDefinition | null = null
  private blockHeld = false
  private hitFlashMs = 0
  private blockFlash = false
  private currentHealth: number

  constructor(scene: Phaser.Scene, definition: FighterDefinition, x: number, y: number) {
    this.def = definition
    this.spawnX = x
    this.spawnY = y
    this.currentHealth = definition.health

    const sprite = scene.add.sprite(x, y, definition.key)
    scene.physics.add.existing(sprite)
    this.sprite = sprite as Phaser.Physics.Arcade.Sprite

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(definition.bodyWidth, definition.bodyHeight)
    body.setOffset(
      (this.sprite.width - definition.bodyWidth) / 2,
      this.sprite.height - definition.bodyHeight,
    )
    body.setCollideWorldBounds(true)
    body.setDragX(1400)

    scene.tweens.add({
      targets: this.sprite,
      scaleY: { from: 1, to: 1.02 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inout',
    })
  }

  get phase(): FighterPhase {
    return this.currentPhase
  }

  get canAct(): boolean {
    return this.currentPhase === 'idle'
  }

  get currentAttack(): AttackDefinition | null {
    return this.attack
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
    if (!body.blocked.down) return false

    this.attack = ATTACKS[id]
    this.currentPhase = 'startup'
    this.phaseTimer = this.attack.startupMs
    this.hasHitTarget = false
    body.setVelocityX(0)
    return true
  }

  handleInput(input: InputSnapshot, opponent: Fighter) {
    if (!this.canAct) return
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const { moveSpeed, jumpVelocity } = this.def

    this.blockHeld = input.block

    if (this.isBlocking) {
      let direction = 0
      if (input.left) direction -= 1
      if (input.right) direction += 1
      body.setVelocityX(direction * moveSpeed * BLOCK_MOVE_MULTIPLIER)
      this.faceOpponent(opponent)
      return
    }

    if (input.lightPressed && this.startAttack('light')) return
    if (input.heavyPressed && this.startAttack('heavy')) return

    let direction = 0
    if (input.left) direction -= 1
    if (input.right) direction += 1
    body.setVelocityX(direction * moveSpeed)

    if (input.jumpPressed && body.blocked.down) {
      body.setVelocityY(jumpVelocity)
    }

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
      case 'active':
        body.setVelocityX(70 * facingDir)
        this.sprite.setAngle(14 * facingDir)
        this.tickPhase(delta, 'recovery', this.attack?.recoveryMs ?? 0)
        break
      case 'recovery':
        body.setVelocityX(0)
        this.sprite.setAngle(4 * facingDir)
        this.tickPhase(delta, 'idle', 0)
        break
      case 'hitstun':
        this.tickPhase(delta, 'idle', 0)
        break
      case 'idle':
        this.sprite.setAngle(0)
        break
      case 'ko':
        break
    }

    this.applyVisuals(delta)
  }

  private tickPhase(delta: number, next: FighterPhase, nextMs: number) {
    this.phaseTimer -= delta
    if (this.phaseTimer > 0) return

    this.currentPhase = next
    this.phaseTimer = nextMs
    if (next === 'idle') {
      this.attack = null
      this.hasHitTarget = false
      this.blockHeld = false
      this.sprite.setAngle(0)
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

    if (this.currentHealth <= 0) {
      this.currentPhase = 'ko'
      this.attack = null
      this.blockHeld = false
      return { blocked }
    }

    if (!blocked) {
      this.currentPhase = 'hitstun'
      this.phaseTimer = attack.hitstunMs
      this.attack = null
      this.hasHitTarget = false
      if (attack.id === 'heavy') {
        this.sprite.scene.cameras.main.shake(100, 0.0025)
      }
    } else if (attack.id === 'heavy') {
      this.sprite.scene.cameras.main.shake(70, 0.0012)
    }

    return { blocked }
  }

  reset() {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.reset(this.spawnX, this.spawnY)
    body.setVelocity(0, 0)
    this.currentHealth = this.def.health
    this.currentPhase = 'idle'
    this.phaseTimer = 0
    this.attack = null
    this.blockHeld = false
    this.hitFlashMs = 0
    this.blockFlash = false
    this.hasHitTarget = false
    this.sprite.clearTint()
    this.sprite.setAngle(0)
  }

  private faceOpponent(opponent: Fighter) {
    const opponentLeft = opponent.sprite.x < this.sprite.x
    this.sprite.flipX = opponentLeft
  }
}

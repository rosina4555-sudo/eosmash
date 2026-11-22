import Phaser from 'phaser'
import type { AttackDefinition } from './AttackDefinitions'
import type { Fighter } from '../entities/Fighter'

export function getHurtboxRect(fighter: Fighter): Phaser.Geom.Rectangle {
  const body = fighter.sprite.body as Phaser.Physics.Arcade.Body
  return new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height)
}

export function getHitboxRect(
  fighter: Fighter,
  attack: AttackDefinition,
): Phaser.Geom.Rectangle {
  const body = fighter.sprite.body as Phaser.Physics.Arcade.Body
  const facingRight = !fighter.sprite.flipX
  const centerX = body.x + body.width / 2
  const feetY = body.y + body.height
  const { width, height, reach, base } = attack.hitbox
  const x = facingRight ? centerX + reach : centerX - reach - width
  const y = feetY - base - height
  return new Phaser.Geom.Rectangle(x, y, width, height)
}

export interface HitResult {
  blocked: boolean
}

export function resolveHit(attacker: Fighter, defender: Fighter): HitResult | null {
  if (attacker.phase !== 'active') return null
  if (attacker.hasHitTarget) return null
  const attack = attacker.currentAttack
  if (!attack) return null
  if (defender.phase === 'ko') return null

  if (attacker.hitsLanded > 0 && attack.hitGapMs) {
    const scene = attacker.sprite.scene
    if (scene.time.now - attacker.lastHitMs < attack.hitGapMs) return null
  }

  const hitbox = getHitboxRect(attacker, attack)
  const hurtbox = getHurtboxRect(defender)
  if (!Phaser.Geom.Intersects.RectangleToRectangle(hitbox, hurtbox)) return null

  const result = defender.takeHit(attack, attacker)
  attacker.registerHit()
  return result
}

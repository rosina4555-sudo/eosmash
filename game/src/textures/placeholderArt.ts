import Phaser from 'phaser'
import { FIGHTERS } from '../config/characters.config'

function drawRex(g: Phaser.GameObjects.Graphics) {
  const { color, accentColor } = FIGHTERS.rex
  // Back leg
  g.fillStyle(accentColor, 1)
  g.fillRoundedRect(10, 66, 16, 38, 6)
  // Front leg
  g.fillStyle(0x3d2b1a, 1)
  g.fillRoundedRect(30, 66, 16, 38, 6)
  // Torso
  g.fillStyle(color, 1)
  g.fillRoundedRect(8, 28, 40, 44, 12)
  // Belt
  g.fillStyle(accentColor, 1)
  g.fillRect(8, 60, 40, 8)
  // Head
  g.fillStyle(0xf0c27a, 1)
  g.fillCircle(28, 18, 16)
  // Hair
  g.fillStyle(0x1a1a2e, 1)
  g.fillEllipse(28, 8, 30, 14)
  // Eye (faces right)
  g.fillStyle(0x1a1a2e, 1)
  g.fillCircle(36, 18, 3)
  // Gloves
  g.fillStyle(0xd4553a, 1)
  g.fillCircle(52, 44, 11)
  g.fillCircle(6, 52, 9)
}

function drawNyra(g: Phaser.GameObjects.Graphics) {
  const { color, accentColor } = FIGHTERS.nyra
  // Legs
  g.fillStyle(accentColor, 1)
  g.fillRoundedRect(10, 66, 14, 38, 6)
  g.fillRoundedRect(26, 66, 14, 38, 6)
  // Torso (slimmer)
  g.fillStyle(color, 1)
  g.fillRoundedRect(10, 30, 32, 40, 10)
  // Head
  g.fillStyle(0xe8b89d, 1)
  g.fillCircle(26, 18, 15)
  // Ponytail (back of head, faces right)
  g.fillStyle(0x12333a, 1)
  g.fillEllipse(12, 16, 16, 10)
  g.fillTriangle(8, 12, 0, 26, 10, 24)
  // Eye
  g.fillStyle(0x12333a, 1)
  g.fillCircle(34, 18, 3)
  // Foot wrap
  g.fillStyle(0xe8e2d6, 1)
  g.fillRect(8, 96, 34, 8)
}

export function generatePlaceholderArt(scene: Phaser.Scene) {
  if (scene.textures.exists(FIGHTERS.rex.key)) return

  const g = scene.add.graphics()

  g.clear()
  drawRex(g)
  g.generateTexture(FIGHTERS.rex.key, 64, 104)

  g.clear()
  drawNyra(g)
  g.generateTexture(FIGHTERS.nyra.key, 50, 104)

  g.destroy()
}

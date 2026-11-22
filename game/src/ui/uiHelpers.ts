import Phaser from 'phaser'
import { audio } from '../systems/AudioManager'

export const UI = {
  font: 'Nunito, system-ui, sans-serif',
  display: 'Bungee, system-ui, sans-serif',
  ink: 0x0b1020,
  deep: 0x0a0e1a,
  panel: 0x111a2e,
  line: 0x26344c,
  lime: 0xc6f36a,
  limeBright: 0xd8ff8a,
  white: 0xffffff,
  muted: 0x97a5b9,
  danger: 0xff7777,
} as const

export const uiText = (
  fontSize: string,
  color: string,
  bold = false,
  display = false,
) => ({
  fontFamily: display ? UI.display : UI.font,
  fontSize,
  color,
  fontStyle: bold ? ('bold' as const) : ('normal' as const),
})

export function tracked(text: Phaser.GameObjects.Text, px: number): Phaser.GameObjects.Text {
  return text.setLetterSpacing(px)
}

export function createEyebrow(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  align: 'center' | 'left' = 'center',
): Phaser.GameObjects.Container {
  const text = scene.add.text(0, 0, label, uiText('13px', '#C6F36A', true, true)).setOrigin(0, 0.5)
  tracked(text, 4)

  const tick = scene.add.graphics()
  tick.fillStyle(UI.lime, 1)
  tick.fillRect(-4, -1.5, 8, 3)
  tick.setAngle(-28)

  if (align === 'center') {
    const total = text.width + 24
    tick.x = -total / 2 + 4
    text.x = -total / 2 + 16
    return scene.add.container(x, y, [tick, text])
  }
  tick.x = 4
  text.x = 18
  return scene.add.container(x, y, [tick, text])
}

export interface ButtonOptions {
  width?: number
  height?: number
  fontSize?: string
  primary?: boolean
  letterSpacing?: number
}

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  options: ButtonOptions = {},
): Phaser.GameObjects.Container {
  const width = options.width ?? 360
  const height = options.height ?? 62
  const fontSize = options.fontSize ?? '19px'
  const primary = options.primary ?? false
  const letterSpacing = options.letterSpacing ?? 3

  const bg = scene.add.graphics()
  const radius = 14
  const draw = (hover: boolean) => {
    bg.clear()
    bg.fillStyle(0x05070f, 0.85)
    bg.fillRoundedRect(-width / 2, -height / 2 + 5, width, height, radius)
    if (primary) {
      bg.fillStyle(hover ? UI.limeBright : UI.lime, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius)
    } else {
      bg.fillStyle(hover ? UI.panel : UI.deep, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius)
      bg.lineStyle(3, hover ? UI.lime : UI.line, 1)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius)
    }
  }
  draw(false)

  const text = scene.add
    .text(0, -2, label, uiText(fontSize, primary ? '#0B1020' : '#FFFFFF', true, true))
    .setOrigin(0.5)
  tracked(text, letterSpacing)

  const container = scene.add.container(x, y, [bg, text])
  container.setSize(width, height)
  container.setInteractive({ useHandCursor: true })
  container.on('pointerover', () => {
    draw(true)
    if (!primary) text.setColor('#C6F36A')
    audio.play('ui_move')
  })
  container.on('pointerout', () => {
    draw(false)
    if (!primary) text.setColor('#FFFFFF')
  })
  container.on('pointerdown', () => {
    audio.ensure()
    audio.play('ui_select')
    onClick()
  })
  return container
}

export interface Slider {
  container: Phaser.GameObjects.Container
  refresh: () => void
}

export function createSlider(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  getValue: () => number,
  setValue: (value: number) => void,
): Slider {
  const width = 420
  const height = 16

  const labelText = scene.add
    .text(x, y - 30, '', uiText('14px', '#97A5B9', true, true))
    .setOrigin(0, 0.5)
  tracked(labelText, 2)

  const track = scene.add.graphics()
  const fill = scene.add.graphics()

  const draw = () => {
    const value = getValue()
    track.clear()
    track.fillStyle(UI.deep, 1)
    track.fillRoundedRect(x, y - height / 2, width, height, height / 2)
    track.lineStyle(2, UI.line, 1)
    track.strokeRoundedRect(x, y - height / 2, width, height, height / 2)
    fill.clear()
    fill.fillStyle(UI.lime, 1)
    fill.fillRoundedRect(x, y - height / 2, Math.max(height, width * value), height, height / 2)
    labelText.setText(`${label}   ${Math.round(value * 100)}%`)
  }
  draw()

  const hitArea = scene.add
    .rectangle(x + width / 2, y, width + 24, 48, 0x000000, 0)
    .setInteractive({ useHandCursor: true })
  hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number) => {
    const rel = Phaser.Math.Clamp((localX ?? pointer.x - x) / width, 0, 1)
    const snapped = Math.round(rel * 20) / 20
    setValue(snapped)
    draw()
    audio.ensure()
    audio.play('ui_move')
  })

  const container = scene.add.container(0, 0, [labelText, track, fill, hitArea])
  return { container, refresh: draw }
}

export function drawMenuBackdrop(scene: Phaser.Scene, width: number, height: number) {
  scene.add.rectangle(width / 2, height / 2, width, height, UI.ink)

  for (let i = 0; i < 8; i++) {
    const colX = 80 + i * 170
    scene.add.rectangle(colX, height / 2 + 40, 90, height - 80, UI.deep)
    scene.add.rectangle(colX, height / 2 + 40, 90, height - 80, UI.panel).setAlpha(0.5)
  }

  const glow = scene.add
    .ellipse(width / 2, height * 0.72, width * 0.8, 300, UI.lime)
    .setAlpha(0.04)
  scene.tweens.add({
    targets: glow,
    alpha: { from: 0.03, to: 0.07 },
    duration: 2800,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inout',
  })

  scene.add.rectangle(width / 2, 4, width, 3, UI.line).setAlpha(0.6)
}

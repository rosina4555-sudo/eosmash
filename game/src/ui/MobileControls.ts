import Phaser from 'phaser'
import type { TouchAction, TouchController } from '../input/TouchController'
import { audio } from '../systems/AudioManager'
import { UI, uiText } from './uiHelpers'

interface TouchButton {
  action: TouchAction
  setPressed: (on: boolean) => void
}

export class MobileControls {
  private readonly container: Phaser.GameObjects.Container
  private readonly buttons: TouchButton[] = []
  private readonly scene: Phaser.Scene
  private readonly touch: TouchController

  constructor(scene: Phaser.Scene, touch: TouchController, onPause: () => void) {
    this.scene = scene
    this.touch = touch
    this.container = scene.add.container(0, 0)

    this.buildActionButton(300, 530, 44, { arrow: 'left' }, 'left')
    this.buildActionButton(430, 530, 44, { arrow: 'right' }, 'right')
    this.buildActionButton(880, 410, 42, { text: 'JUMP' }, 'jump')
    this.buildActionButton(880, 530, 42, { text: 'BLOCK' }, 'block')
    this.buildActionButton(1010, 530, 42, { text: 'LIGHT' }, 'light')
    this.buildActionButton(1010, 410, 42, { text: 'HEAVY' }, 'heavy')

    this.buildPauseButton(onPause)

    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this)
  }

  setActive(show: boolean) {
    this.container.setVisible(show)
    if (!show) {
      this.touch.releaseAll()
      for (const button of this.buttons) button.setPressed(false)
    }
  }

  destroy() {
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this)
    this.container.destroy(true)
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    this.touch.release(pointer.id)
    for (const button of this.buttons) {
      button.setPressed(this.touch.isHeld(button.action))
    }
  }

  private buildActionButton(
    x: number,
    y: number,
    radius: number,
    visual: { text?: string; arrow?: 'left' | 'right' },
    action: TouchAction,
  ) {
    const scene = this.scene
    const bg = scene.add.graphics()
    let glyph: Phaser.GameObjects.GameObject
    let drawGlyph: (pressed: boolean) => void

    if (visual.arrow) {
      const tri = scene.add.graphics()
      drawGlyph = (pressed) => {
        tri.clear()
        tri.fillStyle(pressed ? UI.ink : UI.white, 1)
        if (visual.arrow === 'left') tri.fillTriangle(-10, -16, -10, 16, 16, 0)
        else tri.fillTriangle(10, -16, 10, 16, -16, 0)
      }
      drawGlyph(false)
      glyph = tri
    } else {
      const text = scene.add
        .text(0, 0, visual.text ?? '', uiText('14px', '#FFFFFF', true))
        .setOrigin(0.5)
      text.setLetterSpacing(2)
      drawGlyph = (pressed) => text.setColor(pressed ? '#0B1020' : '#FFFFFF')
      drawGlyph(false)
      glyph = text
    }

    const setPressed = (pressed: boolean) => {
      bg.clear()
      bg.fillStyle(pressed ? UI.lime : UI.panel, pressed ? 0.95 : 0.82)
      bg.fillCircle(0, 0, radius)
      bg.lineStyle(3, pressed ? UI.limeBright : UI.line, 1)
      bg.strokeCircle(0, 0, radius)
      drawGlyph(pressed)
    }
    setPressed(false)

    const hit = scene.add.circle(0, 0, radius, 0x000000, 0).setInteractive()
    hit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.container.visible) return
      this.touch.press(action, pointer.id)
      audio.ensure()
      setPressed(true)
    })

    const button = scene.add.container(x, y, [bg, glyph, hit])
    this.container.add(button)
    this.buttons.push({ action, setPressed })
  }

  private buildPauseButton(onPause: () => void) {
    const scene = this.scene
    const bg = scene.add.graphics()
    const draw = (hover: boolean) => {
      bg.clear()
      bg.fillStyle(UI.panel, 0.85)
      bg.fillCircle(0, 0, 26)
      bg.lineStyle(2, hover ? UI.lime : UI.line, 1)
      bg.strokeCircle(0, 0, 26)
      bg.fillStyle(UI.white, 1)
      bg.fillRect(-8, -9, 5, 18)
      bg.fillRect(3, -9, 5, 18)
    }
    draw(false)

    const hit = scene.add.circle(0, 0, 26, 0x000000, 0).setInteractive({ useHandCursor: true })
    hit.on('pointerover', () => draw(true))
    hit.on('pointerout', () => draw(false))
    hit.on('pointerdown', () => {
      if (!this.container.visible) return
      audio.ensure()
      audio.play('ui_select')
      onPause()
    })

    this.container.add(scene.add.container(1055, 275, [bg, hit]))
  }
}

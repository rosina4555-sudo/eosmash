import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../config/game.config'
import { audio } from '../systems/AudioManager'
import {
  UI,
  createButton,
  createEyebrow,
  drawMenuBackdrop,
  tracked,
  uiText,
} from '../ui/uiHelpers'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu')
  }

  create() {
    drawMenuBackdrop(this, GAME_WIDTH, GAME_HEIGHT)
    audio.ensure()

    createEyebrow(this, GAME_WIDTH / 2, 64, 'PROTOTYPE BUILD')

    const title = this.add
      .text(GAME_WIDTH / 2, 150, 'EOSMASH', uiText('86px', '#FFFFFF', true, true))
      .setOrigin(0.5)
    tracked(title, 10)

    const subtitle = this.add
      .text(GAME_WIDTH / 2, 238, 'ARENA', uiText('86px', '#C6F36A', true, true))
      .setOrigin(0.5)
    tracked(subtitle, 26)

    const rule = this.add.graphics()
    rule.fillStyle(UI.lime, 1)
    rule.fillRect(GAME_WIDTH / 2 - 30, 288, 60, 4)

    this.add
      .text(GAME_WIDTH / 2, 322, 'Enter the fight. Prove your skill.', uiText('18px', '#97A5B9'))
      .setOrigin(0.5)

    createButton(this, GAME_WIDTH / 2, 404, 'QUICK FIGHT', () => {
      this.scene.start('character-select', { mode: 'quick' })
    }, { primary: true, width: 380 })

    createButton(this, GAME_WIDTH / 2, 476, 'PRACTICE', () => {
      this.scene.start('character-select', { mode: 'practice' })
    }, { width: 380 })

    createButton(this, GAME_WIDTH / 2, 548, 'HOW TO PLAY', () => {
      this.scene.start('how-to-play')
    }, { width: 380 })

    createButton(this, GAME_WIDTH / 2, 620, 'SETTINGS', () => {
      this.scene.start('settings')
    }, { width: 380 })

    const hint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 24, 'A 2D FIGHTING GAME BY EOSMASH', uiText('12px', '#97A5B9'))
      .setOrigin(0.5)
      .setAlpha(0.6)
    tracked(hint, 4)

    this.input.keyboard?.once('keydown', () => audio.ensure())
    this.input.once('pointerdown', () => audio.ensure())
  }
}

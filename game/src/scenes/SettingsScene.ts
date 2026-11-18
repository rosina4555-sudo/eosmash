import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, IS_TOUCH } from '../config/game.config'
import { audio } from '../systems/AudioManager'
import { loadSettings, saveSettings } from '../systems/SettingsManager'
import {
  createButton,
  createEyebrow,
  createSlider,
  drawMenuBackdrop,
  tracked,
  uiText,
} from '../ui/uiHelpers'

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('settings')
  }

  create() {
    drawMenuBackdrop(this, GAME_WIDTH, GAME_HEIGHT)
    audio.ensure()

    const settings = loadSettings()

    createEyebrow(this, GAME_WIDTH / 2, IS_TOUCH ? 112 : 64, 'GAME OPTIONS')

    const title = this.add
      .text(GAME_WIDTH / 2, IS_TOUCH ? 155 : 110, 'SETTINGS', uiText('48px', '#FFFFFF', true))
      .setOrigin(0.5)
    tracked(title, 8)

    const commit = () => {
      saveSettings(settings)
      audio.setVolumes(settings.master, settings.sfx, settings.music)
    }

    const sliderY = (desktopY: number, i: number): number =>
      IS_TOUCH ? 240 + i * 90 : desktopY

    const master = createSlider(this, 430, sliderY(250, 0), 'MASTER VOLUME', () => settings.master, (v) => {
      settings.master = v
      commit()
    })
    const sfx = createSlider(this, 430, sliderY(350, 1), 'SOUND EFFECTS', () => settings.sfx, (v) => {
      settings.sfx = v
      commit()
      audio.play('ui_move')
    })
    const music = createSlider(this, 430, sliderY(450, 2), 'MUSIC', () => settings.music, (v) => {
      settings.music = v
      commit()
    })
    this.add.container(0, 0, [master.container, sfx.container, music.container])

    const controls = this.add
      .text(
        GAME_WIDTH / 2,
        IS_TOUCH ? 490 : 545,
        IS_TOUCH
          ? 'TOUCH: ARROWS TO MOVE · JUMP · LIGHT · HEAVY · BLOCK'
          : 'A / D  MOVE      W  JUMP      J  LIGHT      K  HEAVY      L  BLOCK      ESC  PAUSE',
        uiText('14px', '#97A5B9', true),
      )
      .setOrigin(0.5)
    tracked(controls, 2)

    this.add
      .text(
        GAME_WIDTH / 2,
        IS_TOUCH ? 522 : 578,
        'AI difficulty is chosen on the character select screen.',
        uiText('14px', '#97A5B9'),
      )
      .setOrigin(0.5)
      .setAlpha(0.75)

    createButton(
      this,
      GAME_WIDTH / 2,
      IS_TOUCH ? 575 : GAME_HEIGHT - 70,
      'BACK',
      () => this.scene.start('menu'),
      {
        width: 260,
      },
    )
  }
}

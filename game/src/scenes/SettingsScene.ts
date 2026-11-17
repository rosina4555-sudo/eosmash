import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../config/game.config'
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

    createEyebrow(this, GAME_WIDTH / 2, 64, 'GAME OPTIONS')

    const title = this.add
      .text(GAME_WIDTH / 2, 110, 'SETTINGS', uiText('48px', '#FFFFFF', true))
      .setOrigin(0.5)
    tracked(title, 8)

    const commit = () => {
      saveSettings(settings)
      audio.setVolumes(settings.master, settings.sfx, settings.music)
    }

    const master = createSlider(this, 430, 250, 'MASTER VOLUME', () => settings.master, (v) => {
      settings.master = v
      commit()
    })
    const sfx = createSlider(this, 430, 350, 'SOUND EFFECTS', () => settings.sfx, (v) => {
      settings.sfx = v
      commit()
      audio.play('ui_move')
    })
    const music = createSlider(this, 430, 450, 'MUSIC', () => settings.music, (v) => {
      settings.music = v
      commit()
    })
    this.add.container(0, 0, [master.container, sfx.container, music.container])

    const controls = this.add
      .text(
        GAME_WIDTH / 2,
        545,
        'A / D  MOVE      W  JUMP      J  LIGHT      K  HEAVY      L  BLOCK      ESC  PAUSE',
        uiText('14px', '#97A5B9', true),
      )
      .setOrigin(0.5)
    tracked(controls, 2)

    this.add
      .text(
        GAME_WIDTH / 2,
        578,
        'AI difficulty is chosen on the character select screen.',
        uiText('14px', '#97A5B9'),
      )
      .setOrigin(0.5)
      .setAlpha(0.75)

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 70, 'BACK', () => this.scene.start('menu'), {
      width: 260,
    })
  }
}

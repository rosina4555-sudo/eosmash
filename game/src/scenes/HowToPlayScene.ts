import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, IS_TOUCH } from '../config/game.config'
import { audio } from '../systems/AudioManager'
import {
  createButton,
  createEyebrow,
  drawMenuBackdrop,
  tracked,
  uiText,
} from '../ui/uiHelpers'

const LINES: Array<{ text: string; header?: boolean }> = [
  { text: 'Win by knocking your opponent out or having more health when the timer ends.' },
  { text: 'If health is tied at time, a 15-second sudden death round decides the winner.' },
  { text: '' },
  { text: 'DESKTOP CONTROLS · REX', header: true },
  { text: 'A / D  Move          W or Space  Jump' },
  { text: 'J  Light attack          K  Heavy attack          L  Block' },
  { text: '' },
  { text: 'BLOCKING', header: true },
  { text: 'Blocking negates incoming damage but slows you down.' },
  { text: 'Attacks have a wind-up you can read and punish during recovery.' },
  { text: '' },
  { text: 'OTHER KEYS', header: true },
  { text: 'Esc  Pause          R  Rematch          T  Practice mode' },
  { text: '1 / 2 / 3  AI difficulty          B  Hitbox view' },
]

const TOUCH_LINES: Array<{ text: string; header?: boolean }> = [
  { text: 'Win by knocking your opponent out or having more health when the timer ends.' },
  { text: 'If health is tied at time, a 15-second sudden death round decides the winner.' },
  { text: '' },
  { text: 'TOUCH CONTROLS', header: true },
  { text: 'Arrows move · JUMP to hop · BLOCK to guard' },
  { text: 'LIGHT and HEAVY attack · pause button to stop' },
  { text: '' },
  { text: 'BLOCKING', header: true },
  { text: 'Blocking negates incoming damage but slows you down.' },
  { text: 'Attacks have a wind-up you can read and punish during recovery.' },
  { text: '' },
  { text: 'TIPS', header: true },
  { text: 'Read your opponent and punish missed attacks.' },
  { text: 'Watch the timer — sudden death ends ties fast.' },
]

export class HowToPlayScene extends Phaser.Scene {
  constructor() {
    super('how-to-play')
  }

  create() {
    drawMenuBackdrop(this, GAME_WIDTH, GAME_HEIGHT)
    audio.ensure()

    createEyebrow(this, GAME_WIDTH / 2, IS_TOUCH ? 112 : 56, 'GAME RULES')

    const title = this.add
      .text(
        GAME_WIDTH / 2,
        IS_TOUCH ? 152 : 100,
        'HOW TO PLAY',
        uiText('48px', '#FFFFFF', true),
      )
      .setOrigin(0.5)
    tracked(title, 8)

    const lines = IS_TOUCH ? TOUCH_LINES : LINES
    const textStep = IS_TOUCH ? 31 : 36
    const emptyStep = IS_TOUCH ? 12 : 16
    let y = IS_TOUCH ? 176 : 168
    for (const line of lines) {
      if (line.text) {
        const text = this.add.text(
          170,
          y,
          line.text,
          uiText(line.header ? '16px' : '17px', line.header ? '#C6F36A' : '#97A5B9', line.header),
        )
        if (line.header) tracked(text, 4)
      }
      y += line.text === '' ? emptyStep : textStep
    }

    createButton(
      this,
      GAME_WIDTH / 2,
      IS_TOUCH ? 578 : GAME_HEIGHT - 70,
      'BACK',
      () => this.scene.start('menu'),
      {
        width: 260,
      },
    )
  }
}

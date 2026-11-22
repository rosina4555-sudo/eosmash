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
  { text: 'Win by KO or more health when the timer ends. Ties go to sudden death.', header: false },
  { text: '' },
  { text: 'CONTROLS', header: true },
  { text: 'A/D move · W jump · S crouch · L block' },
  { text: 'J light · K heavy · U special' },
  { text: '' },
  { text: 'ADVANCED', header: true },
  { text: 'S+J slide (goes under jabs) · S+K uppercut launcher' },
  { text: 'Attack in the air · U special rush / dive kick' },
  { text: 'SP bar fills from hits · Full bar powers up U special' },
  { text: '' },
  { text: 'DEFENCE', header: true },
  { text: 'Block negates damage · Crouch shrinks hurtbox' },
  { text: 'Punish whiffed attacks during recovery' },
  { text: '' },
  { text: 'Esc pause · R rematch · T practice · B hitboxes · 1/2/3 AI', header: false },
]

const TOUCH_LINES: Array<{ text: string; header?: boolean }> = [
  { text: 'Win by KO or more health when the timer ends. Ties go to sudden death.', header: false },
  { text: '' },
  { text: 'CONTROLS', header: true },
  { text: 'Arrows move · CROUCH · JUMP · BLOCK' },
  { text: 'LIGHT / HEAVY · SP special · pause to stop' },
  { text: '' },
  { text: 'ADVANCED', header: true },
  { text: 'CROUCH+LIGHT slide · CROUCH+HEAVY uppercut' },
  { text: 'Attack in the air · SP for special' },
  { text: 'SP bar fills from hits · Full bar powers up SP' },
  { text: '' },
  { text: 'DEFENCE', header: true },
  { text: 'Block negates damage · Crouch shrinks hurtbox' },
  { text: 'Punish whiffed attacks during recovery' },
  { text: '' },
  { text: 'Read your opponent. Watch the timer.', header: false },
]

export class HowToPlayScene extends Phaser.Scene {
  constructor() {
    super('how-to-play')
  }

  create() {
    drawMenuBackdrop(this, GAME_WIDTH, GAME_HEIGHT)
    audio.ensure()

    createEyebrow(this, GAME_WIDTH / 2, 56, 'GAME RULES')

    const title = this.add
      .text(GAME_WIDTH / 2, 100, 'HOW TO PLAY', uiText('48px', '#FFFFFF', true, true))
      .setOrigin(0.5)
    tracked(title, 8)

    const lines = IS_TOUCH ? TOUCH_LINES : LINES
    let y = 170
    for (const line of lines) {
      if (line.text) {
        const text = this.add.text(
          170,
          y,
          line.text,
          uiText(
            line.header ? '16px' : '17px',
            line.header ? '#C6F36A' : '#97A5B9',
            line.header,
            line.header,
          ),
        )
        if (line.header) tracked(text, 4)
      }
      y += line.text === '' ? 14 : 34
    }

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 70, 'BACK', () => this.scene.start('menu'), {
      width: 260,
    })
  }
}

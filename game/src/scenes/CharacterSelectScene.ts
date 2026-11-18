import Phaser from 'phaser'
import type { AIDifficulty } from '../ai/DifficultyProfiles'
import { FIGHTERS } from '../config/characters.config'
import { GAME_HEIGHT, GAME_WIDTH } from '../config/game.config'
import { generatePlaceholderArt } from '../textures/placeholderArt'
import { audio } from '../systems/AudioManager'
import { loadSettings, saveSettings } from '../systems/SettingsManager'
import {
  UI,
  createButton,
  createEyebrow,
  drawMenuBackdrop,
  tracked,
  uiText,
} from '../ui/uiHelpers'

type FighterKey = 'rex' | 'nyra'
type MatchMode = 'quick' | 'practice'

interface CardData {
  key: FighterKey
  title: string
  style: string
  description: string
  attributes: Array<{ label: string; value: number }>
}

const CARDS: CardData[] = [
  {
    key: 'rex',
    title: 'REX',
    style: 'STREET BOXING',
    description:
      'Balanced and beginner-friendly. Reliable damage and a straightforward rush special.',
    attributes: [
      { label: 'SPEED', value: 6 },
      { label: 'ATTACK', value: 7 },
      { label: 'DEFENCE', value: 6 },
      { label: 'RECOVERY', value: 6 },
    ],
  },
  {
    key: 'nyra',
    title: 'NYRA',
    style: 'MARTIAL ARTS',
    description: 'Fast and mobile. Lower health, quicker attacks, rewards positioning and timing.',
    attributes: [
      { label: 'SPEED', value: 9 },
      { label: 'ATTACK', value: 6 },
      { label: 'DEFENCE', value: 5 },
      { label: 'RECOVERY', value: 8 },
    ],
  },
]

const CARD_W = 360
const CARD_H = 420

export class CharacterSelectScene extends Phaser.Scene {
  private mode: MatchMode = 'quick'
  private difficulty: AIDifficulty = 'normal'
  private selected: FighterKey | null = null
  private cardRedraws: Array<() => void> = []
  private difficultyRedraws: Array<() => void> = []
  private fightButton: Phaser.GameObjects.Container | null = null

  constructor() {
    super('character-select')
  }

  create(data?: { mode?: MatchMode }) {
    generatePlaceholderArt(this)
    drawMenuBackdrop(this, GAME_WIDTH, GAME_HEIGHT)

    this.mode = data?.mode === 'practice' ? 'practice' : 'quick'
    const settings = loadSettings()
    this.difficulty = settings.difficulty
    this.selected = null
    this.cardRedraws = []
    this.difficultyRedraws = []

    createEyebrow(
      this,
      GAME_WIDTH / 2,
      44,
      this.mode === 'practice' ? 'PRACTICE MODE' : 'QUICK FIGHT',
    )

    const title = this.add
      .text(GAME_WIDTH / 2, 84, 'SELECT YOUR FIGHTER', uiText('44px', '#FFFFFF', true))
      .setOrigin(0.5)
    tracked(title, 4)

    this.buildCard(CARDS[0], 430)
    this.buildCard(CARDS[1], 850)

    this.add
      .text(GAME_WIDTH / 2, 556, 'More fighters coming soon.', uiText('14px', '#97A5B9'))
      .setOrigin(0.5)
      .setAlpha(0.7)

    if (this.mode === 'quick') {
      this.buildDifficultyRow(596)
    }

    createButton(this, 210, 668, 'BACK', () => this.scene.start('menu'), { width: 240 })
    this.fightButton = createButton(this, 1070, 668, 'FIGHT', () => this.startFight(), {
      width: 300,
      primary: true,
      letterSpacing: 5,
    })
    this.fightButton.setAlpha(0.45)
  }

  private startFight() {
    if (!this.selected) return
    const settings = loadSettings()
    settings.difficulty = this.difficulty
    saveSettings(settings)
    this.scene.start('arena', {
      mode: this.mode,
      fighter: this.selected,
      difficulty: this.difficulty,
    })
  }

  private buildCard(card: CardData, cx: number) {
    const cy = 330
    const cardH = CARD_H
    const def = FIGHTERS[card.key]

    const panel = this.add.graphics()
    const accent = this.add.graphics()
    const badgeBg = this.add.graphics()
    const badgeText = this.add
      .text(cx + CARD_W / 2 - 24, cy - cardH / 2 + 26, 'SELECTED', uiText('12px', '#0B1020', true))
      .setOrigin(1, 0.5)
      .setVisible(false)
    tracked(badgeText, 2)

    const drawPanel = (selected: boolean, hover: boolean) => {
      panel.clear()
      panel.fillStyle(UI.panel, 1)
      panel.fillRoundedRect(cx - CARD_W / 2, cy - cardH / 2, CARD_W, cardH, 14)
      panel.lineStyle(selected ? 3 : 2, selected ? UI.lime : hover ? UI.lime : UI.line, 1)
      panel.strokeRoundedRect(cx - CARD_W / 2, cy - cardH / 2, CARD_W, cardH, 14)

      accent.clear()
      badgeBg.clear()
      badgeText.setVisible(selected)
      if (selected) {
        accent.fillStyle(UI.lime, 1)
        accent.fillRoundedRect(cx - CARD_W / 2 + 10, cy - cardH / 2 + 10, CARD_W - 20, 6, 3)
        badgeBg.fillStyle(UI.lime, 1)
        badgeBg.fillRoundedRect(cx + CARD_W / 2 - 112, cy - cardH / 2 + 14, 96, 24, 12)
      }
    }
    drawPanel(false, false)
    this.cardRedraws.push(() => drawPanel(this.selected === card.key, false))

    const portrait = this.add.sprite(cx, cy - 126, def.key).setScale(2.4)
    portrait.setFlipX(false)

    const name = this.add
      .text(cx, cy - 44, card.title, uiText('36px', '#FFFFFF', true))
      .setOrigin(0.5)
    tracked(name, 6)

    const style = this.add
      .text(cx, cy - 12, card.style, uiText('14px', '#C6F36A', true))
      .setOrigin(0.5)
    tracked(style, 4)

    const desc = this.add
      .text(cx, cy + 20, card.description, uiText('14px', '#97A5B9'))
      .setOrigin(0.5, 0)
      .setAlign('center')
    desc.setWordWrapWidth(CARD_W - 56)

    let attrY = cy + 108
    for (const attr of card.attributes) {
      const label = this.add
        .text(cx - 136, attrY, attr.label, uiText('12px', '#97A5B9', true))
        .setOrigin(0, 0.5)
      tracked(label, 3)

      const barBg = this.add.graphics()
      barBg.fillStyle(UI.deep, 1)
      barBg.fillRoundedRect(cx - 24, attrY - 5, 176, 10, 5)
      barBg.lineStyle(1, UI.line, 1)
      barBg.strokeRoundedRect(cx - 24, attrY - 5, 176, 10, 5)

      const barFill = this.add.graphics()
      barFill.fillStyle(UI.lime, 1)
      barFill.fillRoundedRect(cx - 24, attrY - 5, (176 * attr.value) / 10, 10, 5)

      this.add
        .text(cx + 168, attrY, `${attr.value}`, uiText('18px', '#FFFFFF', true))
        .setOrigin(0, 0.5)

      attrY += 32
    }

    const hit = this.add
      .rectangle(cx, cy, CARD_W, cardH, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
    hit.on('pointerover', () => drawPanel(this.selected === card.key, true))
    hit.on('pointerout', () => drawPanel(this.selected === card.key, false))
    hit.on('pointerdown', () => {
      this.selected = card.key
      for (const redraw of this.cardRedraws) redraw()
      if (this.fightButton) this.fightButton.setAlpha(1)
      audio.play('ui_select')
    })
  }

  private buildDifficultyRow(y: number) {
    const label = this.add
      .text(490, y, 'AI DIFFICULTY', uiText('14px', '#97A5B9', true))
      .setOrigin(1, 0.5)
    tracked(label, 3)

    const options: Array<{ value: AIDifficulty; label: string; x: number }> = [
      { value: 'easy', label: 'EASY', x: 620 },
      { value: 'normal', label: 'NORMAL', x: 780 },
      { value: 'hard', label: 'HARD', x: 940 },
    ]

    for (const opt of options) {
      const bg = this.add.graphics()
      const text = this.add
        .text(opt.x, y, opt.label, uiText('15px', '#FFFFFF', true))
        .setOrigin(0.5)
      tracked(text, 3)

      const draw = () => {
        const active = this.difficulty === opt.value
        bg.clear()
        if (active) {
          bg.fillStyle(UI.lime, 1)
          bg.fillRoundedRect(opt.x - 72, y - 25, 144, 50, 10)
        } else {
          bg.fillStyle(UI.deep, 1)
          bg.fillRoundedRect(opt.x - 72, y - 25, 144, 50, 10)
          bg.lineStyle(2, UI.line, 1)
          bg.strokeRoundedRect(opt.x - 72, y - 25, 144, 50, 10)
        }
        text.setColor(active ? '#0B1020' : '#FFFFFF')
      }
      draw()
      this.difficultyRedraws.push(draw)

      const hit = this.add
        .rectangle(opt.x, y, 144, 50, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
      hit.on('pointerdown', () => {
        this.difficulty = opt.value
        for (const redraw of this.difficultyRedraws) redraw()
        audio.play('ui_select')
      })
      hit.on('pointerover', () => {
        if (this.difficulty !== opt.value) text.setColor('#C6F36A')
      })
      hit.on('pointerout', () => draw())
    }
  }
}

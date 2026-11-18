import Phaser from 'phaser'
import { AIController } from '../ai/AIController'
import { getHitboxRect, getHurtboxRect, resolveHit, type HitResult } from '../combat/CombatSystem'
import { FIGHTERS } from '../config/characters.config'
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y, IS_TOUCH } from '../config/game.config'
import { Fighter, type FighterPhase } from '../entities/Fighter'
import { emptyInput, mergeInputs, type InputSnapshot } from '../input/InputSnapshot'
import { KeyboardController } from '../input/KeyboardController'
import { TouchController } from '../input/TouchController'
import { audio } from '../systems/AudioManager'
import { MatchManager, type MatchMode } from '../systems/MatchManager'
import { loadSettings } from '../systems/SettingsManager'
import { generatePlaceholderArt } from '../textures/placeholderArt'
import { MobileControls } from '../ui/MobileControls'
import {
  UI,
  createButton,
  createEyebrow,
  tracked,
  uiText,
} from '../ui/uiHelpers'

type FighterKey = keyof typeof FIGHTERS
type MatchSceneData = {
  mode?: MatchMode
  fighter?: FighterKey
  difficulty?: 'easy' | 'normal' | 'hard'
}

interface HealthBar {
  update: (fighter: Fighter) => void
}

export class ArenaScene extends Phaser.Scene {
  private player!: Fighter
  private opponent!: Fighter
  private playerKey: FighterKey = 'rex'
  private opponentKey: FighterKey = 'nyra'
  private p1Ctrl!: KeyboardController
  private p2Ctrl!: KeyboardController
  private ai!: AIController
  private match = new MatchManager()
  private touch: TouchController | null = null
  private touchControls: MobileControls | null = null

  private debugOn = false
  private paused = false
  private debugGfx!: Phaser.GameObjects.Graphics
  private playerBar!: HealthBar
  private opponentBar!: HealthBar
  private timerText!: Phaser.GameObjects.Text
  private subText!: Phaser.GameObjects.Text
  private countdownText!: Phaser.GameObjects.Text
  private goText!: Phaser.GameObjects.Text
  private bannerTextObj!: Phaser.GameObjects.Text
  private bannerPlate!: Phaser.GameObjects.Rectangle
  private resultOverlay: Phaser.GameObjects.Container | null = null
  private pauseOverlay: Phaser.GameObjects.Container | null = null

  private escKey!: Phaser.Input.Keyboard.Key
  private resetKey!: Phaser.Input.Keyboard.Key
  private debugKey!: Phaser.Input.Keyboard.Key
  private practiceKey!: Phaser.Input.Keyboard.Key
  private easyKey!: Phaser.Input.Keyboard.Key
  private normalKey!: Phaser.Input.Keyboard.Key
  private hardKey!: Phaser.Input.Keyboard.Key

  private lastCountdown = -1
  private goWasOn = false
  private endFxDone = false
  private resultShown = false
  private prevGroundedPlayer = true
  private prevGroundedOpponent = true

  private readonly onBlur = () => {
    if (this.match.isFightActive && !this.paused) this.togglePause()
  }

  constructor() {
    super('arena')
  }

  create(data?: MatchSceneData) {
    generatePlaceholderArt(this)
    this.drawBackdrop()
    this.drawGround()

    const settings = loadSettings()
    audio.setVolumes(settings.master, settings.sfx, settings.music)
    audio.ensure()
    audio.startMusic()

    this.playerKey = data?.fighter === 'nyra' ? 'nyra' : 'rex'
    this.opponentKey = this.playerKey === 'rex' ? 'nyra' : 'rex'
    const mode: MatchMode = data?.mode === 'practice' ? 'practice' : 'quick'
    const difficulty = data?.difficulty ?? settings.difficulty

    this.paused = false
    this.endFxDone = false
    this.resultShown = false
    this.lastCountdown = -1
    this.goWasOn = false
    this.prevGroundedPlayer = true
    this.prevGroundedOpponent = true
    this.resultOverlay = null
    this.pauseOverlay = null

    this.player = new Fighter(this, FIGHTERS[this.playerKey], 400, GROUND_Y - 52)
    this.opponent = new Fighter(this, FIGHTERS[this.opponentKey], 880, GROUND_Y - 52)

    this.physics.add.collider(this.player.sprite, this.opponent.sprite)
    this.physics.add.existing(this.groundBody, true)
    this.physics.add.collider(this.player.sprite, this.groundBody)
    this.physics.add.collider(this.opponent.sprite, this.groundBody)

    const kb = this.input.keyboard
    if (kb) {
      this.p1Ctrl = new KeyboardController(this, {
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        jump: Phaser.Input.Keyboard.KeyCodes.W,
        light: Phaser.Input.Keyboard.KeyCodes.J,
        heavy: Phaser.Input.Keyboard.KeyCodes.K,
        block: Phaser.Input.Keyboard.KeyCodes.L,
      })
      this.p2Ctrl = new KeyboardController(this, {
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        jump: Phaser.Input.Keyboard.KeyCodes.UP,
        light: Phaser.Input.Keyboard.KeyCodes.COMMA,
        heavy: Phaser.Input.Keyboard.KeyCodes.PERIOD,
        block: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      })
      this.escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
      this.resetKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.R)
      this.debugKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.B)
      this.practiceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.T)
      this.easyKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE)
      this.normalKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.TWO)
      this.hardKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
      kb.once('keydown', () => audio.ensure())
    }
    this.input.once('pointerdown', () => audio.ensure())

    this.ai = new AIController(this.opponent, this.player, difficulty)

    this.debugGfx = this.add.graphics()
    this.playerBar = this.createHealthBar(
      36,
      30,
      UI.lime,
      false,
      FIGHTERS[this.playerKey].name.toUpperCase(),
      460,
    )
    this.opponentBar = this.createHealthBar(
      GAME_WIDTH - 36,
      30,
      UI.danger,
      true,
      FIGHTERS[this.opponentKey].name.toUpperCase(),
      460,
    )

    const plateY = 18
    const plate = this.add.graphics()
    plate.fillStyle(UI.deep, 1)
    plate.fillRoundedRect(GAME_WIDTH / 2 - 72, plateY, 144, 96, 10)
    plate.lineStyle(2, UI.line, 1)
    plate.strokeRoundedRect(GAME_WIDTH / 2 - 72, plateY, 144, 96, 10)
    plate.fillStyle(UI.lime, 1)
    plate.fillRect(GAME_WIDTH / 2 - 36, plateY + 92, 72, 4)

    const timeLabel = this.add
      .text(GAME_WIDTH / 2, plateY + 20, 'TIME', uiText('12px', '#97A5B9', true))
      .setOrigin(0.5)
    tracked(timeLabel, 4)

    this.timerText = this.add
      .text(GAME_WIDTH / 2, plateY + 56, '90', uiText('46px', '#FFFFFF', true))
      .setOrigin(0.5)
    this.subText = this.add
      .text(GAME_WIDTH / 2, plateY + 110, '', uiText('13px', '#97A5B9', true))
      .setOrigin(0.5, 0)
    tracked(this.subText, 3)

    this.countdownText = this.add
      .text(GAME_WIDTH / 2, 310, '3', uiText('130px', '#C6F36A', true))
      .setOrigin(0.5)
    this.countdownText.setStroke('#05070f', 12)

    this.goText = this.add
      .text(GAME_WIDTH / 2, 310, 'GO!', uiText('130px', '#C6F36A', true))
      .setOrigin(0.5)
      .setVisible(false)
    this.goText.setStroke('#05070f', 12)

    this.bannerPlate = this.add
      .rectangle(GAME_WIDTH / 2, 122, 500, 62, UI.deep)
      .setStrokeStyle(2, UI.danger)
      .setVisible(false)
    this.bannerTextObj = this.add
      .text(GAME_WIDTH / 2, 122, '', uiText('32px', '#FF7777', true))
      .setOrigin(0.5)
      .setVisible(false)
    tracked(this.bannerTextObj, 6)

    const hint = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 24,
        'T PRACTICE · B HITBOXES · 1 2 3 AI DIFFICULTY',
        uiText('13px', '#97A5B9'),
      )
      .setOrigin(0.5)
      .setAlpha(0.75)
    tracked(hint, 2)

    if (IS_TOUCH) {
      this.input.addPointer(4)
      this.touch = new TouchController()
      this.touch.attachSafety()
      this.touchControls = new MobileControls(this, this.touch, () => this.togglePause())
      hint.setVisible(false)
    }

    this.match.reset(mode)

    this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur)
    this.events.once('shutdown', () => {
      this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur)
      this.touch?.detach()
      this.touchControls?.destroy()
      this.touch = null
      this.touchControls = null
    })
  }

  private groundBody!: Phaser.GameObjects.Rectangle

  private drawGround() {
    this.groundBody = this.add.rectangle(
      GAME_WIDTH / 2,
      GROUND_Y + (GAME_HEIGHT - GROUND_Y) / 2,
      GAME_WIDTH,
      GAME_HEIGHT - GROUND_Y,
      0x17243b,
    )
  }

  update(_time: number, delta: number) {
    if (!this.p1Ctrl) return

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) this.togglePause()

    const touchRunning = !this.paused && this.match.state !== 'ended'
    if (this.touchControls) {
      this.touchControls.setActive(touchRunning)
    }

    const kbInput = this.p1Ctrl.snapshot()
    this.p2Ctrl.snapshot()
    const p1Input =
      this.touch && touchRunning ? mergeInputs(kbInput, this.touch.snapshot()) : kbInput

    if (this.paused) return

    if (Phaser.Input.Keyboard.JustDown(this.resetKey)) {
      this.rematch()
      return
    }
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      this.debugOn = !this.debugOn
    }
    if (Phaser.Input.Keyboard.JustDown(this.practiceKey)) {
      this.match.mode = this.match.mode === 'quick' ? 'practice' : 'quick'
      this.rematch()
      return
    }
    if (Phaser.Input.Keyboard.JustDown(this.easyKey)) this.ai.setDifficulty('easy')
    if (Phaser.Input.Keyboard.JustDown(this.normalKey)) this.ai.setDifficulty('normal')
    if (Phaser.Input.Keyboard.JustDown(this.hardKey)) this.ai.setDifficulty('hard')

    this.match.tick(delta)
    this.syncMatchSounds()

    let inputP1: InputSnapshot = emptyInput()
    let inputP2: InputSnapshot = emptyInput()
    if (this.match.isFightActive) {
      inputP1 = p1Input
      inputP2 = this.match.mode === 'practice' ? emptyInput() : this.ai.update(delta)
    }

    const prevPlayerPhase = this.player.phase
    const prevOpponentPhase = this.opponent.phase

    this.player.updateCombat(delta)
    this.opponent.updateCombat(delta)
    this.player.handleInput(inputP1, this.opponent)
    this.opponent.handleInput(inputP2, this.player)

    this.playWhoosh(prevPlayerPhase, prevOpponentPhase)

    const hitP = resolveHit(this.player, this.opponent)
    if (hitP) this.onHitResolved(this.player, this.opponent, hitP)
    const hitO = resolveHit(this.opponent, this.player)
    if (hitO) this.onHitResolved(this.opponent, this.player, hitO)

    if (this.match.isFightActive) {
      const rexDown =
        this.playerKey === 'rex' ? this.player.phase === 'ko' : this.opponent.phase === 'ko'
      const nyraDown =
        this.playerKey === 'nyra' ? this.player.phase === 'ko' : this.opponent.phase === 'ko'
      this.match.checkKOs(rexDown, nyraDown)
      this.match.checkTimeout(this.player.health, this.opponent.health)
    }

    if (this.match.state === 'ended' && !this.endFxDone) this.onMatchEndFx()
    if (this.match.state === 'ended') this.showResult()

    this.updateHud()
    this.updateDebug()
    this.updateLandingDust()
  }

  private syncMatchSounds() {
    const m = this.match
    if (m.state === 'countdown') {
      const n = Math.max(1, Math.ceil(m.countdownMs / 1000))
      if (n !== this.lastCountdown) {
        this.lastCountdown = n
        audio.play('countdown')
        this.countdownText.setScale(1.25)
        this.tweens.add({
          targets: this.countdownText,
          scale: 1,
          duration: 220,
          ease: 'back.out',
        })
      }
    } else if (this.lastCountdown !== -1) {
      this.lastCountdown = -1
    }

    const goOn = m.goFlashMs > 0
    if (goOn && !this.goWasOn) {
      audio.play('go')
      this.goText.setScale(1.5)
      this.tweens.add({ targets: this.goText, scale: 1, duration: 260, ease: 'back.out' })
    }
    this.goWasOn = goOn
  }

  private playWhoosh(prevPlayer: FighterPhase, prevOpponent: FighterPhase) {
    if (this.player.phase === 'active' && prevPlayer !== 'active') {
      audio.play(this.player.currentAttack?.id === 'heavy' ? 'whoosh_heavy' : 'whoosh_light')
    }
    if (this.opponent.phase === 'active' && prevOpponent !== 'active') {
      audio.play(this.opponent.currentAttack?.id === 'heavy' ? 'whoosh_heavy' : 'whoosh_light')
    }
  }

  private onHitResolved(attacker: Fighter, defender: Fighter, result: HitResult) {
    const attackId = attacker.currentAttack?.id ?? 'light'
    audio.play(result.blocked ? 'block' : attackId === 'heavy' ? 'hit_heavy' : 'hit_light')
    this.spawnImpact(defender.sprite.x, defender.sprite.y - 24, result.blocked)
  }

  private onMatchEndFx() {
    this.endFxDone = true

    if (this.match.result?.reason === 'ko') {
      this.cameras.main.flash(240, 255, 255, 255)
      audio.play('ko')
    }

    const winner = this.match.result?.winner
    if (winner && winner !== 'draw') {
      const winnerFighter = winner === this.playerKey ? this.player : this.opponent
      this.hop(winnerFighter, 420)
      this.time.delayedCall(360, () => this.hop(winnerFighter, 360))
    }
  }

  private hop(fighter: Fighter, velocity: number) {
    const body = fighter.sprite.body as Phaser.Physics.Arcade.Body
    if (body.blocked.down) body.setVelocityY(-velocity)
  }

  private spawnImpact(x: number, y: number, blocked: boolean) {
    const ring = this.add
      .circle(x, y, 10, blocked ? 0x9fc6ff : 0xc6f36a)
      .setAlpha(0.9)
    const core = this.add.circle(x, y, 5, blocked ? 0x9fc6ff : 0xffffff)
    this.tweens.add({
      targets: ring,
      scale: 2.4,
      alpha: 0,
      duration: 220,
      onComplete: () => ring.destroy(),
    })
    this.tweens.add({
      targets: core,
      scale: 0,
      alpha: 0,
      duration: 160,
      onComplete: () => core.destroy(),
    })
  }

  private spawnDust(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const d = this.add
        .ellipse(x + (i - 1) * 12, y, 14, 6, 0x97a5b9)
        .setAlpha(0.5)
      this.tweens.add({
        targets: d,
        y: y - 8 - i * 3,
        alpha: 0,
        duration: 300 + i * 60,
        onComplete: () => d.destroy(),
      })
    }
  }

  private updateLandingDust() {
    const check = (fighter: Fighter, prev: boolean): boolean => {
      const body = fighter.sprite.body as Phaser.Physics.Arcade.Body
      const grounded = body.blocked.down
      if (grounded && !prev) {
        this.spawnDust(body.center.x, body.y + body.height)
      }
      return grounded
    }
    this.prevGroundedPlayer = check(this.player, this.prevGroundedPlayer)
    this.prevGroundedOpponent = check(this.opponent, this.prevGroundedOpponent)
  }

  private togglePause() {
    if (this.match.state === 'ended') return
    this.paused = !this.paused
    if (this.paused) {
      this.physics.pause()
      this.showPauseOverlay()
      audio.play('ui_move')
    } else {
      this.physics.resume()
      this.hidePauseOverlay()
      audio.play('ui_select')
    }
  }

  private rematch() {
    this.match.reset(this.match.mode)
    this.player.reset()
    this.opponent.reset()
    this.paused = false
    this.physics.resume()
    this.endFxDone = false
    this.resultShown = false
    this.lastCountdown = -1
    this.goWasOn = false
    this.prevGroundedPlayer = true
    this.prevGroundedOpponent = true
    if (this.resultOverlay) {
      this.resultOverlay.destroy()
      this.resultOverlay = null
    }
    this.hidePauseOverlay()
    audio.play('ui_select')
  }

  private quitToMenu() {
    this.physics.resume()
    this.scene.start('menu')
  }

  private showResult() {
    if (this.resultOverlay || !this.match.result) return
    const { winner, reason } = this.match.result

    if (!this.resultShown) {
      this.resultShown = true
      if (winner !== 'draw') {
        this.time.delayedCall(650, () => {
          audio.play(winner === this.playerKey ? 'victory' : 'defeat')
        })
      }
    }

    const container = this.add.container(0, 0)
    container.add(
      this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0b1020, 0.82).setOrigin(0),
    )

    const eyebrow = createEyebrow(this, GAME_WIDTH / 2, 170, 'MATCH RESULT')
    container.add(eyebrow)

    const title =
      winner === 'draw' ? 'DRAW' : `${FIGHTERS[winner].name.toUpperCase()} WINS`
    const titleColor = winner === 'draw' ? '#97A5B9' : '#C6F36A'
    const titleText = this.add
      .text(GAME_WIDTH / 2, 240, title, uiText('64px', titleColor, true))
      .setOrigin(0.5)
    tracked(titleText, 6)
    titleText.setStroke('#05070f', 10)
    container.add(titleText)

    const reasonText = this.add
      .text(
        GAME_WIDTH / 2,
        312,
        reason === 'ko' ? 'KNOCKOUT' : 'TIMEOUT',
        uiText('18px', '#97A5B9', true),
      )
      .setOrigin(0.5)
    tracked(reasonText, 6)
    container.add(reasonText)

    const rexHealth = this.playerKey === 'rex' ? this.player.health : this.opponent.health
    const nyraHealth = this.playerKey === 'nyra' ? this.player.health : this.opponent.health
    const stats = `REX ${Math.ceil(rexHealth)}    ·    NYRA ${Math.ceil(nyraHealth)}    ·    ${Math.round(this.match.elapsedMs / 1000)}s`

    const statsPlate = this.add.graphics()
    statsPlate.fillStyle(UI.deep, 1)
    statsPlate.fillRoundedRect(GAME_WIDTH / 2 - 290, 352, 580, 56, 10)
    statsPlate.lineStyle(2, UI.line, 1)
    statsPlate.strokeRoundedRect(GAME_WIDTH / 2 - 290, 352, 580, 56, 10)
    container.add(statsPlate)

    const statsText = this.add
      .text(GAME_WIDTH / 2, 380, stats, uiText('18px', '#FFFFFF', true))
      .setOrigin(0.5)
    tracked(statsText, 2)
    container.add(statsText)

    const rematchBtn = createButton(this, GAME_WIDTH / 2, 474, 'REMATCH', () => this.rematch(), {
      primary: true,
      width: 400,
      letterSpacing: 4,
    })
    const changeBtn = createButton(
      this,
      GAME_WIDTH / 2,
      550,
      'CHANGE FIGHTER',
      () => this.scene.start('character-select', { mode: this.match.mode }),
      { width: 400 },
    )
    const menuBtn = createButton(
      this,
      GAME_WIDTH / 2,
      626,
      'MAIN MENU',
      () => {
        this.physics.resume()
        this.scene.start('menu')
      },
      { width: 400 },
    )
    container.add(rematchBtn)
    container.add(changeBtn)
    container.add(menuBtn)

    if (!IS_TOUCH) {
      const hint = this.add
        .text(GAME_WIDTH / 2, 684, 'OR PRESS R TO REMATCH', uiText('13px', '#97A5B9'))
        .setOrigin(0.5)
        .setAlpha(0.75)
      tracked(hint, 3)
      container.add(hint)
    }

    this.resultOverlay = container
  }

  private showPauseOverlay() {
    if (this.pauseOverlay) return
    const container = this.add.container(0, 0)
    container.add(
      this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0b1020, 0.72).setOrigin(0),
    )

    const eyebrow = createEyebrow(this, GAME_WIDTH / 2, 240, 'MATCH PAUSED')
    container.add(eyebrow)

    const title = this.add
      .text(GAME_WIDTH / 2, 310, 'PAUSED', uiText('64px', '#C6F36A', true))
      .setOrigin(0.5)
    tracked(title, 10)
    title.setStroke('#05070f', 10)
    container.add(title)

    container.add(
      createButton(this, GAME_WIDTH / 2, 420, 'RESUME', () => this.togglePause(), {
        primary: true,
        width: 400,
        letterSpacing: 4,
      }),
    )
    container.add(
      createButton(this, GAME_WIDTH / 2, 496, 'RESTART', () => this.rematch(), { width: 400 }),
    )
    container.add(
      createButton(this, GAME_WIDTH / 2, 572, 'QUIT TO MENU', () => this.quitToMenu(), {
        width: 400,
      }),
    )

    if (!IS_TOUCH) {
      const hint = this.add
        .text(GAME_WIDTH / 2, 650, 'PRESS ESC TO RESUME', uiText('14px', '#97A5B9'))
        .setOrigin(0.5)
        .setAlpha(0.8)
      tracked(hint, 3)
      container.add(hint)
    }

    this.pauseOverlay = container
  }

  private hidePauseOverlay() {
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy()
      this.pauseOverlay = null
    }
  }

  private updateHud() {
    const m = this.match
    if (m.state === 'countdown') {
      this.timerText.setText('90')
      this.countdownText.setVisible(true).setText(String(Math.max(1, Math.ceil(m.countdownMs / 1000))))
    } else {
      this.countdownText.setVisible(false)
      if (m.mode === 'practice') {
        this.timerText.setText('—')
      } else {
        this.timerText.setText(String(Math.ceil(m.timeLeftMs / 1000)))
      }
    }

    this.goText.setVisible(m.goFlashMs > 0)
    const bannerOn = m.bannerMs > 0
    this.bannerPlate.setVisible(bannerOn)
    this.bannerTextObj.setVisible(bannerOn).setText(m.bannerText)
    this.timerText.setColor(m.state === 'sudden_death' ? '#FF7777' : '#FFFFFF')
    this.subText.setText(
      m.mode === 'practice' ? 'PRACTICE MODE' : `AI: ${this.ai.difficulty.toUpperCase()}`,
    )

    this.playerBar.update(this.player)
    this.opponentBar.update(this.opponent)
  }

  private createHealthBar(
    x: number,
    y: number,
    color: number,
    fromRight: boolean,
    name: string,
    width: number,
  ): HealthBar {
    const barY = y + 28
    const barH = 26
    const inset = 3

    const nameText = this.add
      .text(x, y, name, uiText('15px', '#FFFFFF', true))
      .setOrigin(fromRight ? 1 : 0, 0)
    tracked(nameText, 4)

    const numText = this.add
      .text(fromRight ? x - width : x + width, y, '', uiText('15px', '#97A5B9', true))
      .setOrigin(fromRight ? 0 : 1, 0)
    tracked(numText, 1)

    const trackX = fromRight ? x - width : x
    const track = this.add.graphics()
    track.fillStyle(UI.deep, 1)
    track.fillRoundedRect(trackX, barY, width, barH, 6)
    track.lineStyle(2, UI.line, 1)
    track.strokeRoundedRect(trackX, barY, width, barH, 6)

    const fillGfx = this.add.graphics()

    const update = (fighter: Fighter) => {
      const pct = Math.max(0, Math.min(1, fighter.health / fighter.maxHealth))
      fillGfx.clear()
      const fw = Math.max(12, (width - inset * 2) * pct)
      const fx = fromRight ? x - inset - fw : x + inset
      fillGfx.fillStyle(color, 1)
      fillGfx.fillRoundedRect(fx, barY + inset, fw, barH - inset * 2, 4)
      numText.setText(String(Math.ceil(fighter.health)))
    }

    return { update }
  }

  private updateDebug() {
    this.debugGfx.clear()
    if (!this.debugOn) return

    for (const fighter of [this.player, this.opponent]) {
      const hurtbox = getHurtboxRect(fighter)
      this.debugGfx.lineStyle(2, 0x66aaff, 0.9)
      this.debugGfx.strokeRect(hurtbox.x, hurtbox.y, hurtbox.width, hurtbox.height)

      if (fighter.currentAttack && (fighter.phase === 'startup' || fighter.phase === 'active')) {
        const hitbox = getHitboxRect(fighter, fighter.currentAttack)
        const alpha = fighter.phase === 'active' ? 0.9 : 0.35
        this.debugGfx.lineStyle(2, 0xc6f36a, alpha)
        this.debugGfx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height)
      }

      const body = fighter.sprite.body as Phaser.Physics.Arcade.Body
      this.debugGfx.lineStyle(1, 0xffffff, 0.4)
      this.debugGfx.strokeRect(body.x, body.y, body.width, body.height)
      this.debugGfx.fillStyle(0xffffff, 0.5)
      this.debugGfx.fillCircle(body.center.x, body.center.y, 3)
    }
  }

  private drawBackdrop() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0b1020)

    for (let i = 0; i < 8; i++) {
      const x = 80 + i * 170
      this.add.rectangle(x, 330, 90, 560, 0x0a0e1a)
      this.add.rectangle(x, 330, 90, 560, 0x111a2e).setAlpha(0.6)
    }

    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 30; i++) {
        const x = 20 + i * 44 + (row % 2) * 22
        const y = 300 + row * 34
        this.add.circle(x, y, 13, 0x05070f).setAlpha(0.85 - row * 0.1)
      }
    }

    const sign = this.add.rectangle(640, 140, 420, 86, 0x111a2e)
    sign.setStrokeStyle(3, 0xc6f36a).setAlpha(0.9)
    this.add
      .text(640, 140, 'EOSMASH  ARENA', uiText('36px', '#C6F36A'))
      .setOrigin(0.5)

    const sideSign = this.add.rectangle(170, 400, 150, 54, 0x17243b)
    sideSign.setStrokeStyle(2, 0xff7777).setAlpha(0.85)
    this.add
      .text(170, 400, 'CIRCUIT', uiText('20px', '#FF7777'))
      .setOrigin(0.5)
      .setAlpha(0.9)

    const light = this.add.ellipse(640, 500, 900, 260, 0xc6f36a).setAlpha(0.04)
    this.tweens.add({
      targets: light,
      alpha: { from: 0.03, to: 0.08 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inout',
    })

    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 2, GAME_WIDTH, 4, 0x26344c)
    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 4, 260, 3, 0xc6f36a).setAlpha(0.5)
  }
}

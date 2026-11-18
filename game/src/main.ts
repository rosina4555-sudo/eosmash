import Phaser from 'phaser'
import {
  GAME_CONFIG,
  GAME_HEIGHT,
  GAME_WIDTH,
  IS_TOUCH,
  PHYSICS,
} from './config/game.config'
import { ArenaScene } from './scenes/ArenaScene'
import { CharacterSelectScene } from './scenes/CharacterSelectScene'
import { HowToPlayScene } from './scenes/HowToPlayScene'
import { MenuScene } from './scenes/MenuScene'
import { SettingsScene } from './scenes/SettingsScene'

export function createArenaGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: GAME_CONFIG.backgroundColor,
    scale: {
      mode: IS_TOUCH ? Phaser.Scale.ENVELOP : Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: PHYSICS.gravity },
        debug: false,
      },
    },
    scene: [MenuScene, CharacterSelectScene, SettingsScene, HowToPlayScene, ArenaScene],
  })
}

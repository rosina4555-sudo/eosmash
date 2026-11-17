import Phaser from 'phaser'
import type { InputSnapshot } from './InputSnapshot'

export interface KeyMap {
  left: number
  right: number
  jump: number
  light: number
  heavy: number
  block: number
}

export class KeyboardController {
  private readonly keys: {
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    jump: Phaser.Input.Keyboard.Key
    light: Phaser.Input.Keyboard.Key
    heavy: Phaser.Input.Keyboard.Key
    block: Phaser.Input.Keyboard.Key
  }

  constructor(scene: Phaser.Scene, map: KeyMap) {
    const kb = scene.input.keyboard
    if (!kb) throw new Error('Keyboard input unavailable')
    this.keys = {
      left: kb.addKey(map.left),
      right: kb.addKey(map.right),
      jump: kb.addKey(map.jump),
      light: kb.addKey(map.light),
      heavy: kb.addKey(map.heavy),
      block: kb.addKey(map.block),
    }
  }

  snapshot(): InputSnapshot {
    return {
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.jump),
      lightPressed: Phaser.Input.Keyboard.JustDown(this.keys.light),
      heavyPressed: Phaser.Input.Keyboard.JustDown(this.keys.heavy),
      block: this.keys.block.isDown,
    }
  }
}

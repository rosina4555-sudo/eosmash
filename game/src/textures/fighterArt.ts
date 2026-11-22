import Phaser from 'phaser'
import { FIGHTERS } from '../config/characters.config'

type FighterKey = keyof typeof FIGHTERS

interface AnimDef {
  prefix: string
  frameRate: number
  repeat: number
}

const ANIM_DEFS: Record<string, AnimDef> = {
  // Rex (punch-only source art — all attacks reuse punch with varied rates)
  'rex-idle': { prefix: 'idle', frameRate: 5, repeat: -1 },
  'rex-walk': { prefix: 'walk', frameRate: 8, repeat: -1 },
  'rex-crouch': { prefix: 'idle', frameRate: 3, repeat: -1 },
  'rex-light': { prefix: 'punch', frameRate: 12, repeat: 0 },
  'rex-heavy': { prefix: 'punch', frameRate: 6, repeat: 0 },
  'rex-uppercut': { prefix: 'punch', frameRate: 10, repeat: 0 },
  'rex-slide': { prefix: 'walk', frameRate: 10, repeat: 0 },
  'rex-air_light': { prefix: 'punch', frameRate: 12, repeat: 0 },
  'rex-air_heavy': { prefix: 'punch', frameRate: 8, repeat: 0 },
  'rex-special': { prefix: 'punch', frameRate: 7, repeat: 0 },
  'rex-hurt': { prefix: 'hurt', frameRate: 10, repeat: 0 },

  // Nyra (full karate moveset)
  'nyra-idle': { prefix: 'idle', frameRate: 5, repeat: -1 },
  'nyra-walk': { prefix: 'walk', frameRate: 12, repeat: -1 },
  'nyra-crouch': { prefix: 'idle', frameRate: 3, repeat: -1 },
  'nyra-light': { prefix: 'jab', frameRate: 14, repeat: 0 },
  'nyra-heavy': { prefix: 'kick', frameRate: 10, repeat: 0 },
  'nyra-uppercut': { prefix: 'punch', frameRate: 10, repeat: 0 },
  'nyra-slide': { prefix: 'kick', frameRate: 12, repeat: 0 },
  'nyra-air_light': { prefix: 'jab', frameRate: 14, repeat: 0 },
  'nyra-air_heavy': { prefix: 'jump_kick', frameRate: 12, repeat: 0 },
  'nyra-special': { prefix: 'dive_kick', frameRate: 10, repeat: 0 },
  'nyra-jump': { prefix: 'jump', frameRate: 0, repeat: 0 },
  'nyra-hurt': { prefix: 'hurt', frameRate: 12, repeat: 0 },
}

export function preloadFighterArt(scene: Phaser.Scene) {
  for (const key of Object.keys(FIGHTERS) as FighterKey[]) {
    const base = `art/fighters/${key}/${key}`
    if (!scene.textures.exists(key)) {
      scene.load.atlas(key, `${base}.png`, `${base}.json`)
    }
  }
}

export function preloadStageArt(scene: Phaser.Scene) {
  if (!scene.textures.exists('stage-street')) {
    scene.load.image('stage-street', 'art/stage/street.png')
  }
}

export function hasFighterArt(scene: Phaser.Scene, key: string): boolean {
  if (!scene.textures.exists(key)) return false
  return scene.textures.get(key).has('idle_0')
}

export function ensureFighterAnims(scene: Phaser.Scene) {
  for (const key of Object.keys(FIGHTERS) as FighterKey[]) {
    if (!hasFighterArt(scene, key)) continue

    const tex = scene.textures.get(key)
    const frameNames = tex.getFrameNames()
    const prefixes = new Set(frameNames.map((n) => n.replace(/_\d+$/, '')))

    for (const [animKey, def] of Object.entries(ANIM_DEFS)) {
      if (!animKey.startsWith(`${key}-`)) continue
      if (scene.anims.exists(animKey)) continue
      if (!prefixes.has(def.prefix)) continue

      const frames = frameNames
        .filter((n) => n.startsWith(`${def.prefix}_`))
        .sort((a, b) => {
          const na = parseInt(a.split('_').pop() ?? '0', 10)
          const nb = parseInt(b.split('_').pop() ?? '0', 10)
          return na - nb
        })
        .map((n) => ({ key, frame: n }))

      if (frames.length === 0) continue

      scene.anims.create({
        key: animKey,
        frames,
        frameRate: def.frameRate || 1,
        repeat: def.repeat,
      })
    }
  }
}

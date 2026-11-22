export interface FighterDefinition {
  key: string
  name: string
  color: number
  accentColor: number
  health: number
  moveSpeed: number
  jumpVelocity: number
  bodyWidth: number
  bodyHeight: number
  artOriginX?: number
}

export const FIGHTERS: Record<'rex' | 'nyra', FighterDefinition> = {
  rex: {
    key: 'rex',
    name: 'Rex',
    color: 0xf59e42,
    accentColor: 0x2a1a0f,
    health: 1000,
    moveSpeed: 240,
    jumpVelocity: -700,
    bodyWidth: 39,
    bodyHeight: 100,
    artOriginX: 0.4603,
  },
  nyra: {
    key: 'nyra',
    name: 'Nyra',
    color: 0x2dd4bf,
    accentColor: 0x0f2a2a,
    health: 900,
    moveSpeed: 320,
    jumpVelocity: -700,
    bodyWidth: 35,
    bodyHeight: 92,
    artOriginX: 0.3571,
  },
}

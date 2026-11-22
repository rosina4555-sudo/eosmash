import type { InputSnapshot } from './InputSnapshot'
import { emptyInput } from './InputSnapshot'

export type TouchAction =
  | 'left'
  | 'right'
  | 'jump'
  | 'light'
  | 'heavy'
  | 'block'
  | 'crouch'
  | 'special'

const EDGE_ACTIONS: ReadonlySet<TouchAction> = new Set<TouchAction>([
  'jump',
  'light',
  'heavy',
  'special',
])

export class TouchController {
  private held = new Set<TouchAction>()
  private edges = new Set<TouchAction>()
  private pointerActions = new Map<number, TouchAction>()
  private actionPointers = new Map<TouchAction, Set<number>>()
  private cleanup: (() => void) | null = null

  press(action: TouchAction, pointerId: number) {
    if (this.pointerActions.has(pointerId)) this.release(pointerId)

    let set = this.actionPointers.get(action)
    if (!set) {
      set = new Set()
      this.actionPointers.set(action, set)
    }
    const wasEmpty = set.size === 0
    set.add(pointerId)
    this.pointerActions.set(pointerId, action)
    this.held.add(action)
    if (wasEmpty && EDGE_ACTIONS.has(action)) this.edges.add(action)
  }

  release(pointerId: number) {
    const action = this.pointerActions.get(pointerId)
    if (!action) return
    this.pointerActions.delete(pointerId)
    const set = this.actionPointers.get(action)
    set?.delete(pointerId)
    if (!set || set.size === 0) this.held.delete(action)
  }

  releaseAll() {
    this.pointerActions.clear()
    this.actionPointers.clear()
    this.held.clear()
    this.edges.clear()
  }

  isHeld(action: TouchAction): boolean {
    return this.held.has(action)
  }

  snapshot(): InputSnapshot {
    const snap = emptyInput()
    snap.left = this.held.has('left')
    snap.right = this.held.has('right')
    snap.block = this.held.has('block')
    snap.crouch = this.held.has('crouch')
    snap.jumpPressed = this.edges.delete('jump')
    snap.lightPressed = this.edges.delete('light')
    snap.heavyPressed = this.edges.delete('heavy')
    snap.specialPressed = this.edges.delete('special')
    return snap
  }

  attachSafety(target: Window = window) {
    if (this.cleanup) return
    const onUp = (e: PointerEvent) => this.release(e.pointerId)
    const onAll = () => this.releaseAll()
    target.addEventListener('pointerup', onUp)
    target.addEventListener('pointercancel', onUp)
    target.addEventListener('blur', onAll)
    this.cleanup = () => {
      target.removeEventListener('pointerup', onUp)
      target.removeEventListener('pointercancel', onUp)
      target.removeEventListener('blur', onAll)
    }
  }

  detach() {
    this.cleanup?.()
    this.cleanup = null
    this.releaseAll()
  }
}

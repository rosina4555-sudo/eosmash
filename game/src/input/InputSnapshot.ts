export interface InputSnapshot {
  left: boolean
  right: boolean
  jumpPressed: boolean
  lightPressed: boolean
  heavyPressed: boolean
  block: boolean
}

export function emptyInput(): InputSnapshot {
  return {
    left: false,
    right: false,
    jumpPressed: false,
    lightPressed: false,
    heavyPressed: false,
    block: false,
  }
}

export function mergeInputs(a: InputSnapshot, b: InputSnapshot): InputSnapshot {
  return {
    left: a.left || b.left,
    right: a.right || b.right,
    jumpPressed: a.jumpPressed || b.jumpPressed,
    lightPressed: a.lightPressed || b.lightPressed,
    heavyPressed: a.heavyPressed || b.heavyPressed,
    block: a.block || b.block,
  }
}

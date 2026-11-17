# Eosmash Arena — Art Brief: Character Sprite Sheets

Hand this document to your artist (or use it as the reference sheet for an AI-assisted
workflow with manual cleanup, per GDD section 6.6).

## How delivery works

1. Artist produces PNG files following the naming and layout rules below.
2. Drop the finished files into `public/arena/assets/characters/<name>/`.
3. Run `node scripts/check-sprites.mjs` to validate every file against the acceptance
   rules (same frame size, correct counts, no empty/cropped edges).
4. Developer wires the sheets into `game/src/config/characters.config.ts` and the
   animation loader. No gameplay code changes are needed.

## Global rules

- PNG with transparency (RGBA), no background baked in.
- All frames of one animation share the exact same cell width and height.
- Every character is drawn **facing right**. The game flips horizontally as needed.
- Ground baseline: the character's feet touch the **bottom edge** of every frame cell.
  No floating, no sinking.
- Consistent scale across every animation of the same character.
- Keep editable source files (Krita / Aseprite / PSD), not only exported PNGs.
- Export a preview GIF for every animation so poses can be checked quickly.

## File naming (exact)

```
public/arena/assets/characters/rex/
  rex_model_sheet.png          # reference only, not loaded by the game
  rex_idle.png
  rex_walk.png
  rex_jump_start.png
  rex_jump_loop.png
  rex_land.png
  rex_light_attack.png
  rex_heavy_attack.png
  rex_block.png
  rex_hit.png
  rex_knockout.png
  rex_victory.png
  rex_power_rush.png
```

Same pattern for `nyra/` (special move file: `nyra_flash_kick.png`).

## Frame layout

Horizontal strip: frames side by side in one row.

| Animation | Frames | Cell size (suggested) |
|---|---:|---|
| idle | 8 | 160 x 220 |
| walk | 8 | 160 x 220 |
| jump_start | 3 | 160 x 220 |
| jump_loop | 4 | 160 x 220 |
| land | 3 | 160 x 220 |
| light_attack | 7 | 220 x 220 |
| heavy_attack | 9 | 240 x 240 |
| block | 3 | 160 x 220 |
| hit | 4 | 160 x 220 |
| knockout | 8 | 260 x 220 |
| victory | 8 | 160 x 240 |
| special | 12 | 280 x 220 |

Cell sizes are suggestions. The hard rules: all frames within one file use the same
cell size, and the fighter is never cropped in any frame. Wider cells are for attacks
so gloves/kicks are never cut off.

## Character specs

### Rex (Street Striker, balanced)
- Warm orange/amber top, dark trousers, athletic build.
- Distinctive red-brown gloves or hand wraps.
- Short practical hairstyle.
- Silhouette cue: gloves read clearly even at small size.

### Nyra (Agile fighter, speed)
- Teal / blue-green outfit, slimmer build than Rex.
- Tied-back hair: ponytail must be visible from the side (silhouette cue).
- Light footwear (foot wraps).
- Silhouette cue: ponytail + slimmer profile.

Do not change face, hairstyle, clothing or palette between animations.
List any detail that must never change and check every exported frame against it.

## Acceptance (checked before integration)

An animation is rejected if:
- Face, hairstyle or proportions change between frames.
- Clothing or accessories disappear in some frames.
- Colour or outline style changes.
- Feet jump vertically between frames (baseline breaks).
- Character scale changes without an intentional animation reason.
- Attack pose is unreadable.
- Any part of the character is cropped.
- Transparent padding differs between frames (causes jitter in game).

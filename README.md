# Tarot Wizard

An arcane card game rendered on an HTML canvas. Walk the celestial ley-line and
fulfill your destiny before your sanity collapses.

## Running the game
The game is a single self-contained file: **`index.html`**. Open it in any modern
browser — there's nothing to install, build, or serve. All game logic, styling, and
markup live inside that one file (the earlier `game.js` + `styles.css` split is no
longer used).

## Objective
- Reach **100 Destiny** before your turns run out.
- Keep **Sanity** above `0`.
- You have **18 turns**.

## Controls
- `Enter`: Start run / return after an ending
- `Space`: Draw a card (or click anywhere on the table)
- `U`: Choose Upright (stable)
- `R`: Choose Reversed (volatile)
- `F`: Toggle fullscreen

You can also play entirely with the mouse: click to start, click anywhere to draw,
and click the Upright/Reversed runes to choose.

## Stats
Four values are tracked in the HUD, each with its own gauge:
- **Destiny (D)** — progress toward the 100 goal; also drives the seeker along the path.
- **Sanity (S)** — your mental reserve, clamped to `0–100`. If it hits `0`, the run ends.
  The HUD flashes a warning and the screen edges glow red when Sanity drops to `20` or below.
- **Momentum (M)** — accumulates from certain cards, clamped to `0–20`, and is shown in the HUD.
- **Turns Left** — counts down from 18; flashes a warning at `3` or fewer.

## Scoring Rules
Each card applies exact values to `Destiny` (D), `Sanity` (S), and `Momentum` (M).

### Minor Arcana (fixed values)
- **Coins**
  - Upright: `+6 D, +0 S, +0 M`
  - Reversed: `+12 D, -3 S, +0 M`
- **Swords**
  - Upright: `+4 D, -6 S, +0 M`
  - Reversed: `+10 D, -12 S, +0 M`
- **Cups**
  - Upright: `+2 D, +8 S, +0 M`
  - Reversed: `+6 D, +12 S, +0 M`
- **Wands**
  - Upright: `+5 D, -1 S, +2 M`
  - Reversed: `+9 D, -3 S, +4 M`

### Major Arcana (fixed values except Wheel)
- **The Fool**
  - Upright: `+7 D, +2 S, +1 M`
  - Reversed: `+11 D, -3 S, +2 M`
- **The Magician**
  - Upright: `+9 D, +0 S, +2 M`
  - Reversed: `+13 D, -4 S, +3 M`
- **The High Priestess**
  - Upright: `+6 D, +5 S, +1 M`
  - Reversed: `+10 D, +1 S, +2 M`
- **The Empress**
  - Upright: `+8 D, +6 S, +1 M`
  - Reversed: `+12 D, +2 S, +2 M`
- **The Emperor**
  - Upright: `+10 D, -1 S, +1 M`
  - Reversed: `+14 D, -5 S, +2 M`
- **The Hierophant**
  - Upright: `+7 D, +4 S, +1 M`
  - Reversed: `+11 D, -2 S, +2 M`
- **The Lovers**
  - Upright: `+9 D, +3 S, +1 M`
  - Reversed: `+13 D, -4 S, +2 M`
- **The Chariot**
  - Upright: `+11 D, -2 S, +2 M`
  - Reversed: `+15 D, -6 S, +3 M`
- **Strength**
  - Upright: `+8 D, +4 S, +2 M`
  - Reversed: `+12 D, -3 S, +3 M`
- **The Hermit**
  - Upright: `+6 D, +6 S, +0 M`
  - Reversed: `+10 D, -1 S, +1 M`
- **Wheel of Fortune** (range-based)
  - Upright: `D -10..+14, S -6..+6, M +0`
  - Reversed: `D -16..+20, S -10..+8, M +0`
- **Justice**
  - Upright: `+9 D, +0 S, +1 M`
  - Reversed: `+13 D, -5 S, +2 M`
- **The Hanged Man**
  - Upright: `+5 D, +7 S, +0 M`
  - Reversed: `+9 D, -2 S, +1 M`
- **Death**
  - Upright: `+10 D, -3 S, +1 M`
  - Reversed: `+15 D, -8 S, +2 M`
- **Temperance**
  - Upright: `+7 D, +6 S, +1 M`
  - Reversed: `+11 D, -1 S, +2 M`
- **The Devil**
  - Upright: `+12 D, -7 S, +2 M`
  - Reversed: `+18 D, -12 S, +3 M`
- **The Tower**
  - Upright: `+8 D, -10 S, +0 M`
  - Reversed: `+18 D, -18 S, +0 M`
- **The Star**
  - Upright: `+4 D, +10 S, +0 M`
  - Reversed: `+8 D, +16 S, +0 M`
- **The Moon**
  - Upright: `+7 D, -4 S, +1 M`
  - Reversed: `+12 D, -9 S, +2 M`
- **The Sun**
  - Upright: `+11 D, +5 S, +1 M`
  - Reversed: `+16 D, -1 S, +2 M`
- **Judgement**
  - Upright: `+10 D, +2 S, +1 M`
  - Reversed: `+14 D, -4 S, +2 M`
- **The World**
  - Upright: `+12 D, +4 S, +2 M`
  - Reversed: `+17 D, -2 S, +3 M`

A drawn card is 35% likely to be a Major Arcanum and 65% likely to be a Minor
Arcanum (random suit, rank `1–14`). Each card's exact Upright/Reversed outcome is
previewed on its two rune buttons before you choose, color-coded so risk reads at a
glance (Destiny gains in green, Sanity gains in blue, Sanity losses in red).

## End Reading System
When the run ends, the game delivers a specific tarot reading based on how you finished:
- **Win + high sanity (45+)**: clear-mind victory reading
- **Win + mid sanity (20–44)**: victory with recovery warning
- **Win + low sanity (<20)**: costly victory reading
- **Lose by sanity at high destiny (70+)**: near-summit collapse reading
- **Lose by sanity at lower destiny**: rebuild-and-heal reading
- **Lose by turns with high destiny (90+)**: near-miss reading
- **Lose by turns otherwise**: preparation reading

## Presentation
The interface is themed around arcane sorcery, in amethyst and gold over a deep
midnight-violet void.

- **Background**: a twinkling starfield laced with faint constellation lines, drifting
  motes of magical light, and soft nebula glows.
- **Spell circle**: a great circle sits behind the destiny path, with two
  counter-rotating rings of procedurally generated runes and an inscribed hexagram.
- **The path**: a glowing ley-line marked with numbered nodes from `0` to `100`. Your
  seeker is a luminous orb wrapped in a spinning rune ring and a dashed astral halo,
  trailing a comet of light as it advances.
- **The Scrying Mirror**: the right-hand panel where the active card appears. Cards
  fade and scale in on draw, framed with filigree corners and a border of small runes,
  and glow in an accent color (gold for Major Arcana, a suit color for Minor Arcana).
- **Choice runes**: the Upright and Reversed options are rune-stone buttons that glow
  and lift on hover and show their color-coded outcome preview.
- **Overlays**: the menu, win, and lose screens are framed by a large rotating
  summoning circle behind an ornamented arcane plate, with a final-score summary on
  the end screens.

### Card art
- Each drawn card includes an illustrated symbol panel.
- Minor Arcana use suit symbols (coin, sword, cup, wand).
- Major Arcana use unique symbols for The Tower, The Star, and Wheel of Fortune, with
  a distinct sigil for the rest.

## Accessibility
The game honors the `prefers-reduced-motion` setting: when it's on, the title shimmer,
rune-ring rotations, drifting motes, and pulsing animations are stilled while the game
remains fully playable.

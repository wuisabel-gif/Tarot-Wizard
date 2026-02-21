# Tarot Wizard

Cross the mystical board and fulfill your destiny before your sanity collapses.

## Objective
- Reach **100 Destiny** before turns run out.
- Keep **Sanity** above `0`.
- You have **18 turns**.

## Controls
- `Enter`: Start run / return after ending
- `Space`: Draw card
- `U`: Choose Upright
- `R`: Choose Reversed
- `F`: Toggle fullscreen

## Scoring Rules
Each card applies exact values to:
- `Destiny` (D)
- `Sanity` (S)
- `Momentum` (M)

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

## End Reading System
When the run ends, the game gives a specific tarot reading:
- **Win + high sanity (45+)**: clear-mind victory reading
- **Win + mid sanity (20-44)**: victory with recovery warning
- **Win + low sanity (<20)**: costly victory reading
- **Lose by sanity at high destiny (70+)**: near-summit collapse reading
- **Lose by sanity at lower destiny**: rebuild-and-heal reading
- **Lose by turns with high destiny (90+)**: near-miss reading
- **Lose by turns otherwise**: preparation reading

## Visual Card Art
- Each drawn card now includes a picture panel in-game.
- Minor Arcana use suit symbols (coin, sword, cup, wand).
- Major Arcana use unique symbols for The Tower, The Star, and Wheel of Fortune, with a distinct major-card sigil for the rest.

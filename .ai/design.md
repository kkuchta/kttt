# Kriegspiel Tic Tac Toe – Visual Design Guide

A modern, mobile-first design for a two-player hidden-information tic-tac-toe variant.

---

## 🎯 Design Goals

- **Tone**: Strategic, mysterious, clean
- **Visual Style**: Abstract + symbolic, modern dark UI, subtle glow feedback
- **Audience**: Curious, logic-focused players (e.g., Reddit/HN crowd)
- **Platform**: Mobile-first web (but responsive for desktop)

---

## 🎨 Color Palette

| Name             | Hex       | Usage                               |
| ---------------- | --------- | ----------------------------------- |
| Background       | `#0e0e0e` | Main background                     |
| Grid Lines       | `#1a1a1a` | Board grid + UI frames              |
| Text (dim)       | `#666666` | Secondary text, placeholder symbols |
| X Accent (Teal)  | `#00ffe7` | Player X moves, glow, hover effects |
| O Accent (Coral) | `#ff5e78` | Player O moves, glow, hover effects |
| Rejection Red    | `#ff3c3c` | Invalid move flash                  |
| Success Green    | `#00ff99` | Flash feedback (optional)           |

Use glows sparingly (opacity 10–30%) and apply `box-shadow` or CSS filters for softness.

---

## 🔤 Fonts

| Role        | Font                      | Notes                                  |
| ----------- | ------------------------- | -------------------------------------- |
| UI / Labels | Inter (fallback: sans)    | Clean and legible                      |
| Symbols     | Space Grotesk or Rajdhani | Distinct but geometric X and O styling |

Use a distinct CSS class to style the X and O separately from UI text.

---

## 🧩 Layout

- **Centered board**, 3x3 grid with generous spacing
- **Top Bar** above board:
  - Game ID + Copy Link button
  - Back to Home
  - Optional: "How to Play" link (opens tooltip/modal)
- **Status messages** below board ("Your turn", "Move rejected", etc.)
- Minimalist chrome; no borders unless active/focused

Mobile-first with clean scaling: text/buttons never smaller than `14px`.

---

## 🧠 Component Styling

### Board Cells

| State             | Visual Treatment                            |
| ----------------- | ------------------------------------------- |
| Empty             | Dim grid cell, no content                   |
| Your Move         | Large X or O with colored glow              |
| Unknown Cell      | `?` or subtle noise effect, low contrast    |
| Rejected Move     | Flash red + shake + fade out                |
| Opponent Revealed | Symbol fades in with soft glow once visible |

### Buttons & Links

- Flat or soft-outline
- Hover/focus = glow (same color as player)
- Links: muted text with glow on hover

---

## ✨ Feedback & Animation

- **Symbol placement**: fade + scale + soft glow bloom (200–300ms)
- **Rejected move**: quick shake + red flash + fade
- **Hover** (if desktop): slight pulse or color glow
- **Game progress**:
  - Subtle board glow intensifies over time
  - Background noise/texture may increase slightly
- **Endgame**:
  - Hidden moves reveal in cascade (delay/stagger)
  - Full board briefly pulses or zooms before resetting

All transitions should feel **responsive but restrained**.

---

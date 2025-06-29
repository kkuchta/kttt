# Kriegspiel Tic Tac Toe – Visual Design Guide

A modern, mobile-first design for a two-player hidden-information tic-tac-toe variant with matchmaking and bot opponents.

---

## 🎯 Design Goals

- **Tone**: Strategic, mysterious, clean
- **Visual Style**: Abstract + symbolic, modern dark UI, subtle glow feedback
- **Audience**: Curious, logic-focused players (e.g., Reddit/HN crowd)
- **Platform**: Mobile-first web (but responsive for desktop)
- **Core Mechanic**: **Move rejection feedback is the primary interaction** - when players hit occupied cells

---

## 🎨 Color Palette

| Name             | Hex       | Usage                               |
| ---------------- | --------- | ----------------------------------- |
| Background       | `#0e0e0e` | Main background                     |
| Grid Lines       | `#1a1a1a` | Board grid + UI frames              |
| Text (dim)       | `#666666` | Secondary text, status messages     |
| X Accent (Teal)  | `#00ffe7` | Player X moves, glow, hover effects |
| O Accent (Coral) | `#ff5e78` | Player O moves, glow, hover effects |
| Rejection Red    | `#ff3c3c` | **Primary** - Move rejection flash  |
| Success Green    | `#00ff99` | Move accepted confirmation          |
| Bot Blue         | `#2196f3` | Bot game indicators and headers     |
| Queue Orange     | `#ffc107` | Matchmaking queue status            |

Use glows sparingly (opacity 10–30%) and apply `box-shadow` or CSS filters for softness.

---

## 🔤 Fonts

| Role        | Font                      | Notes                                  |
| ----------- | ------------------------- | -------------------------------------- |
| UI / Labels | Inter (fallback: sans)    | Clean and legible                      |
| Symbols     | Space Grotesk or Rajdhani | Distinct but geometric X and O styling |
| Status      | Inter Medium              | Bold for important game state messages |

Use a distinct CSS class to style the X and O separately from UI text. Status messages should use medium weight for visibility.

---

## 🧩 Layout & Navigation

### Home Page Layout

- **Hero section** with game title and description
- **Three primary actions** (equal visual weight):
  - "Create Game" - generates shareable link
  - "Quick Match" - joins matchmaking queue
  - "Join Game" - input field + join button
- **Connection status indicator** (prominent when disconnected)
- Minimalist chrome; no borders unless active/focused

### Game Page Layout

- **Top Bar** above board:
  - Game ID + Copy Link button (human games only)
  - Back to Home button
  - Connection status indicator
- **Game Type Header** (bot games):
  - "🤖 You (X) vs Random Bot (O)" with blue accent styling
- **Status Section** below header:
  - **Primary status**: "Your Turn" / "Bot Thinking..." / "Opponent's Turn"
  - **Secondary info**: Current player indicator with colored badge
- **Centered board** (3x3 grid with generous spacing)
- **Move rejection feedback overlay** (when needed)
- **Game sharing section** (human games when waiting for players)

Mobile-first with clean scaling: text/buttons never smaller than `14px`.

---

## 🧠 Component Styling

### Board Cells

| State                 | Visual Treatment                                            |
| --------------------- | ----------------------------------------------------------- |
| **Empty**             | Clean grid cell, no content - all empties look identical    |
| **Your Move**         | Large X or O with colored glow (teal/coral)                 |
| **Opponent Revealed** | Opponent symbol with subtle glow + "revealed" styling       |
| **Move Rejected**     | **PRIMARY INTERACTION** - Red flash + shake + error overlay |

**Critical**: No "unknown cell" or "?" symbols - empty cells must look identical to maintain hidden information.

### Status Messages & Indicators

| Status Type       | Visual Treatment                         |
| ----------------- | ---------------------------------------- |
| **Your Turn**     | Green badge with checkmark, prominent    |
| **Opponent Turn** | Gray badge with waiting indicator        |
| **Bot Thinking**  | Yellow/orange badge with robot emoji     |
| **Move Rejected** | **Large red overlay** with error message |
| **Game Over**     | Full-width colored banner with result    |

### Matchmaking Queue UI

- **Queue Status**: Large, centered "Looking for opponent..." with spinner
- **Wait Time**: "Searching for 0:15..." with live counter
- **Queue Actions**:
  - "Cancel" button (secondary styling)
  - "Play vs Bot Instead" button (prominent secondary action)
- **Bot game transition**: Smooth transition to game UI with bot indicators

### Bot Game Indicators

- **Game Type Header**: Blue-accented banner with robot emoji
- **Player Identification**: "You (X) vs Random Bot (O)" format
- **Bot Turn Status**: "🤖 Bot Thinking..." with animated dots
- **Post-Game Modal**: Three clear options with distinct styling
  - "Play Another Bot" (primary)
  - "Find Human Opponent" (secondary)
  - "Back to Home" (tertiary)

### Buttons & Links

- **Primary actions**: Solid background with hover glow
- **Secondary actions**: Outline style with glow on hover
- **Danger actions**: Red styling for destructive actions
- **Bot-related**: Blue accent styling to match bot theme
- Links: muted text with glow on hover

---

## ✨ Feedback & Animation Priorities

### 1. **Move Rejection** (Most Important)

- **Immediate red flash** covering rejected cell
- **Shake animation** on the cell (3-4 quick shakes)
- **Error message overlay**: "Cell occupied! Opponent piece revealed."
- **Fade to reveal** opponent's piece with subtle highlight
- **Turn indicator update** showing turn loss
- **Duration**: 1000-1500ms total for full sequence

### 2. **Successful Move Placement**

- **Quick scale + fade in** for placed symbol (200ms)
- **Soft glow bloom** in player color
- **Turn indicator smooth transition** to opponent

### 3. **Opponent Piece Revelation**

- **Gentle fade-in** with "revealed" styling distinction
- **Brief highlight glow** to draw attention
- **No dramatic effects** - keep focus on the rejection feedback

### 4. **Game State Changes**

- **Status message transitions**: Smooth color/text changes
- **Turn switching**: Clear badge state changes
- **Bot move delays**: 500ms pause before bot places (feels natural)

### 5. **Matchmaking & Connection**

- **Queue status**: Gentle pulsing on search indicator
- **Match found**: Quick success flash before redirect
- **Connection issues**: Prominent warning styling
- **Bot game start**: Smooth transition with bot header appearance

### 6. **Endgame Sequence**

- **Win/lose announcement**: Large modal or banner
- **Full board reveal**: Cascade effect showing all hidden pieces (staggered 100ms)
- **Post-game options**: Clear, distinct action buttons

All transitions should feel **responsive and purposeful** - every animation serves the core game mechanic of hidden information discovery.

---

## 🎮 Kriegspiel-Specific Design Principles

### Hidden Information Clarity

- **Empty cells must be visually identical** - no hints about content
- **Clear distinction between "yours", "revealed opponent", and "empty"**
- **Move rejection is the primary discovery mechanic** - give it the most visual emphasis

### Game Context Awareness

- **Human vs Human**: Focus on sharing, connection status, waiting states
- **Human vs Bot**: Clear bot indicators, immediate gameplay, post-game options
- **Matchmaking**: Prominent queue status, bot escape hatch

### Feedback Immediacy

- **Move rejection happens server-side** - UI must clearly show the failure
- **Turn loss is crucial** - players need to understand they lost their turn
- **Revelation is permanent** - revealed pieces should look distinctly different

### Progressive Disclosure

- **Start simple**: Basic game explanation on home page
- **Reveal complexity**: Game mechanics become clear through play
- **Context-sensitive help**: Different guidance for different game states

---

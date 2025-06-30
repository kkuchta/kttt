# Kriegspiel Tic Tac Toe – Visual Design System

A modern, mobile-first design system for a two-player hidden-information tic-tac-toe variant with matchmaking and bot opponents.

**Status: ✅ Implemented + 🚧 Board Reveal In Progress** | **Last Updated: 2024**

---

## 🎯 Design Goals

- **Tone**: Strategic, mysterious, clean
- **Visual Style**: Abstract + symbolic, modern dark UI, subtle glow feedback
- **Audience**: Curious, logic-focused players (e.g., Reddit/HN crowd)
- **Platform**: Mobile-first web (but responsive for desktop)
- **Core Mechanic**: **Move rejection feedback is the primary interaction** - when players hit occupied cells

---

## 🎨 Color Palette & Implementation

| Name             | Hex       | Usage                               | Implementation        |
| ---------------- | --------- | ----------------------------------- | --------------------- |
| Background       | `#0e0e0e` | Main background                     | `colors.background`   |
| Grid Lines       | `#1a1a1a` | Board grid + UI frames              | `colors.gridLines`    |
| Text (dim)       | `#666666` | Secondary text, status messages     | `colors.textDim`      |
| X Accent (Teal)  | `#00ffe7` | Player X moves, glow, hover effects | `colors.xAccent`      |
| O Accent (Coral) | `#ff5e78` | Player O moves, glow, hover effects | `colors.oAccent`      |
| Rejection Red    | `#ff3c3c` | **Primary** - Move rejection flash  | `colors.rejectionRed` |
| Success Green    | `#00ff99` | Move accepted confirmation          | `colors.successGreen` |
| Bot Blue         | `#2196f3` | Bot game indicators and headers     | `colors.botBlue`      |
| Queue Orange     | `#ffc107` | Matchmaking queue status            | `colors.queueOrange`  |

### Color Utility Functions

**Available in `src/shared/constants/colors.ts`:**

```typescript
// Get player-specific colors
getPlayerGlow(player: 'X' | 'O') // Returns appropriate accent color

// Create glow effects
createGlow(color: string, opacity: number) // Returns rgba() for glows

// Hover state colors
getHoverColor(baseColor: string) // Returns lighter version for hover

// Pre-computed glow effects
glows.xGlow, glows.oGlow, glows.rejectionGlow, etc.

// Box shadow utilities
boxShadows.xPiece, boxShadows.oPiece, boxShadows.rejection, etc.
```

**Usage Pattern:** Always use `colors.colorName` constants, never hardcode hex values.

---

## 🔤 Typography System

| Role               | Font                     | Implementation                           | Usage                                        |
| ------------------ | ------------------------ | ---------------------------------------- | -------------------------------------------- |
| **UI Text**        | Inter (400, 500, 600)    | `fontFamily: 'Inter, sans-serif'`        | All interface elements, labels, descriptions |
| **Game Symbols**   | Space Grotesk (500, 700) | `fontFamily: 'Space Grotesk, monospace'` | X/O symbols, Game IDs                        |
| **Status/Headers** | Inter Medium (500, 600)  | `fontWeight: '500'` or `'600'`           | Important status messages, headers           |

**Typography Hierarchy:**

- **Headers**: 28-36px, weight 700, Inter
- **Subheaders**: 18-24px, weight 600, Inter
- **Body**: 16px, weight 400, Inter
- **Secondary**: 14px, weight 400, Inter
- **Game Symbols**: 32px, weight 500, Space Grotesk

---

## 🏗️ Component Architecture

### Established Patterns

**Button Styling Pattern:**

```typescript
const buttonStyle: React.CSSProperties = {
  padding: '16px 20px',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: 'Inter, sans-serif',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  // Color-specific properties...
};
```

**Hover Effect Pattern:**

```typescript
onMouseOver={e => {
  e.currentTarget.style.backgroundColor = getHoverColor(baseColor);
  e.currentTarget.style.transform = 'translateY(-2px)';
  e.currentTarget.style.boxShadow = `0 0 25px ${createGlow(color, 0.3)}`;
}}
```

**Container Styling Pattern:**

```typescript
const containerStyle = {
  backgroundColor: colors.background,
  border: `2px solid ${colors.gridLines}`,
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
};
```

---

## 🧩 Layout & Navigation

### Home Page Layout ✅ Implemented

- **Hero section** with game title and description
- **Three primary actions** (equal visual weight):
  - "Create Game" - generates shareable link (Green)
  - "Quick Match" - joins matchmaking queue (Orange)
  - "Join Game" - input field + join button (Blue)
- **Connection status indicator** (Green/Red with glows)
- **Subtle gradient backgrounds** for visual depth

### Game Page Layout ✅ Implemented

- **Header Bar**: Game title, Game ID, Home button
- **Connection Status**: With color-coded status indicators
- **Invite Section**: For human games, with copy functionality
- **Game Type Headers**: Bot games with blue accent styling
- **Status Section**: Turn indicators with colored badges
- **Centered Board**: 3x3 grid with generous spacing and shadow
- **Rules Section**: Collapsible help text

---

## 🧠 Component Specifications

### Board Cells ✅ Implemented

| State                 | Visual Treatment                                | CSS Classes       |
| --------------------- | ----------------------------------------------- | ----------------- |
| **Empty**             | Dark background, grid borders - all identical   | `.cell-empty`     |
| **Your Move**         | Player color glow + scale(1.02) + bright symbol | `.cell-yours`     |
| **Opponent Revealed** | Dimmed styling + subtle glow + opacity 0.8      | `.cell-revealed`  |
| **Move Rejected**     | Red flash + shake animation + error tooltip     | `.cell-rejecting` |
| **Revealing**         | Fade-in animation + scale from 0.5 to 1.0       | `.cell-revealing` |

**Implementation Details:**

- Empty cells use `colors.background` with `colors.gridLines` borders
- Player pieces use `colors.xAccent`/`colors.oAccent` with corresponding glows
- Revealed pieces use `colors.textDim` with reduced opacity
- Rejection state triggers 1000ms animation (200ms if reduced motion)
- Revealing state uses `pieceReveal` animation with staggered timing for dramatic effect

### Status Indicators ✅ Implemented

| Status Type       | Color                 | Animation            | Implementation         |
| ----------------- | --------------------- | -------------------- | ---------------------- |
| **Your Turn**     | `colors.successGreen` | Glow effect          | Badge with checkmark ✓ |
| **Opponent Turn** | `colors.textDim`      | None                 | Gray badge with ⏳     |
| **Bot Thinking**  | `colors.queueOrange`  | Pulsing robot + dots | Animated badge with 🤖 |
| **Move Rejected** | `colors.rejectionRed` | Flash + shake        | Error overlay          |
| **Game Over**     | Result-dependent      | Result-specific glow | Large banner           |

### Button Hierarchy ✅ Implemented

1. **Primary**: Solid color + glow + hover transform
2. **Secondary**: Outline + hover fill
3. **Tertiary**: Text + subtle hover
4. **Danger**: Red variant of primary style

---

## ✨ Animation System

### Animation Principles ✅ Implemented

1. **Performance**: Use `transform` and `opacity` (GPU-accelerated)
2. **Accessibility**: Respect `prefers-reduced-motion: reduce`
3. **Purpose**: Every animation serves the game mechanic
4. **Timing**: Quick actions (200ms), feedback (1000ms), transitions (300ms)

### Key Animations ✅ Implemented

**Move Rejection (Critical):**

```css
@keyframes rejectionShake {
  0%,
  100% {
    transform: translateX(0) scale(1);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-3px) scale(1.05);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(3px) scale(1.05);
  }
}
```

**Bot Thinking:**

```css
@keyframes botThinking {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
```

**Queue Status:**

```css
@keyframes queuePulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.3);
  }
}
```

**Board Reveal (Coming Soon):**

```css
@keyframes pieceReveal {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
}

@keyframes winningLineGlow {
  0%,
  100% {
    box-shadow: 0 0 10px currentColor;
  }
  50% {
    box-shadow:
      0 0 25px currentColor,
      0 0 35px currentColor;
  }
}
```

---

## 🎮 Kriegspiel-Specific Design Principles

### Hidden Information Clarity ✅ Implemented

- **Empty cells are visually identical** - no hints about content
- **Four distinct cell states**: empty, yours, revealed, rejecting
- **Move rejection gets maximum visual emphasis** - red flash + shake
- **Revealed pieces look permanently different** - dimmed styling

### Accessibility & Usability ✅ Implemented

- **Reduced Motion Support**: Animations disabled for `prefers-reduced-motion: reduce`
- **Touch Targets**: Minimum 44px touch targets on mobile
- **Color Contrast**: All text meets WCAG AA standards
- **Screen Reader**: Proper ARIA labels and semantic markup
- **Keyboard Navigation**: All interactive elements accessible via keyboard

---

## 🔮 Future Development Guidelines

### Adding New Components

1. **Import colors**: Always use `import { colors } from '../../shared/constants/colors'`
2. **Follow button patterns**: Use established button style objects
3. **Add hover effects**: Use `getHoverColor()` and `createGlow()` utilities
4. **Respect accessibility**: Check `prefers-reduced-motion` for animations
5. **Use typography scale**: Stick to established font sizes and weights

### Adding New Colors

1. **Add to palette**: Update `colors` object in `constants/colors.ts`
2. **Create utilities**: Add corresponding glow and box-shadow utilities
3. **Document usage**: Update this design guide with usage guidelines
4. **Test contrast**: Ensure accessibility compliance

### Animation Guidelines

- **Duration**: 200ms (quick), 300ms (transitions), 1000ms (feedback)
- **Easing**: `ease-in-out` for most animations
- **Transforms**: Prefer `translateY(-2px)` for hover lifts
- **Always**: Check `prefers-reduced-motion` and provide fallbacks

### Performance Considerations

- **Use CSS-in-JS**: Maintain the inline styling approach for consistency
- **Minimize animations**: Only animate `transform`, `opacity`, and `box-shadow`
- **Batch DOM updates**: Use React state updates efficiently
- **Test on mobile**: Ensure 60fps animations on lower-end devices

---

## 📱 Responsive Design Patterns

### Breakpoints (Implicit)

- **Mobile First**: Base styles for 320px+
- **Tablet**: Media queries for 768px+ (if needed)
- **Desktop**: Hover effects only on `(hover: hover) and (pointer: fine)`

### Mobile Optimizations ✅ Implemented

- **Touch targets**: Minimum 44px for all interactive elements
- **Font scaling**: Never smaller than 14px
- **Hover effects**: Disabled on touch devices
- **Button spacing**: Adequate gap (15px+) between touch targets

---

This design system provides a solid foundation for maintaining visual consistency and implementing new features while preserving the strategic, mysterious atmosphere that makes Kriegspiel Tic Tac Toe engaging. 🎯

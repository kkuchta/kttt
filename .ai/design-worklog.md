# Design Implementation Worklog

UI transformation to match the Kriegspiel design guide. Organized by priority phases.

---

## 🎯 Current State Analysis

**✅ What we have:**

- All functional components working
- Clean component structure
- Inline styling approach (consistent)
- Bot game indicators basics
- Matchmaking queue UI

**❌ Major gaps:**

- Light theme (should be dark)
- Basic colors (should use design palette)
- Arial font (should be Inter + Space Grotesk)
- No animations or feedback effects
- **Missing move rejection animations** (the core mechanic!)
- No glows or visual emphasis
- Basic styling throughout

---

## 📋 Phase 1: Foundation & Typography

- [x] **Add fonts to `src/client/index.html`**

  - Load Inter and Space Grotesk from Google Fonts
  - Set dark body background (`#0e0e0e`)

- [x] **Create `src/shared/constants/colors.ts`** (DEPENDENCY for all other phases)

  - Design palette constants from design.md
  - Color functions for hover states and glows (`rgba()` with opacity for glows)
  - Export all design colors as constants
  - Include utility functions: `getPlayerGlow(player)`, `getHoverColor(baseColor)`
  - **Acceptance**: All colors available as named exports, used consistently

- [x] **Update `src/client/App.tsx`**
  - Add global dark background styles
  - Set base typography to Inter

---

## 📋 Phase 2: Core Game Mechanics Feedback ⚡ CRITICAL

- [x] **Create `src/client/hooks/useMoveRejection.ts`**

  - Custom hook to handle rejection feedback
  - Listen for socket `makeMove` responses with `success: false` and `revealedPosition`
  - Integrate with existing `useSocket` hook (don't duplicate event handling)
  - Trigger cell-specific animations via position coordinates
  - **Acceptance**: Animation triggers when you click occupied cell

- [x] **Transform `src/client/components/Cell.tsx`** (LARGE TASK - consider breaking down)

  - Add rejection animation state (red flash + shake + 1000ms duration)
  - Implement glow effects for player pieces (teal/coral with 20% opacity box-shadow)
  - Add "revealed" vs "yours" piece styling distinction
  - Use Space Grotesk font for X/O symbols (`fontFamily: 'Space Grotesk, monospace'`)
  - Empty cells must look identical (no visual hints about content)
  - Respect `prefers-reduced-motion` for accessibility
  - **Acceptance**: All 4 cell states visually distinct, animations smooth

- [x] **Integrate animations with game state updates**
  - Successful move: scale + fade in + glow bloom (200ms)
  - Rejected move: red flash + shake + error overlay + reveal (1000-1500ms)
  - Turn indicator smooth transitions in GameStatus component
  - Prevent animation conflicts with rapid clicking
  - **Acceptance**: Animations don't interfere with game logic or state updates

---

## 📋 Phase 3: Component Visual Upgrades

- [x] **Transform `src/client/components/GameBoard.tsx`**

  - Dark theme with `#1a1a1a` grid lines
  - Better spacing and layout
  - Centered design improvements

- [x] **Upgrade `src/client/components/GameStatus.tsx`**

  - Bot header with blue accent (`#2196f3`) and robot emoji
  - Status badges with design colors:
    - Your Turn: Green badge with checkmark
    - Opponent Turn: Gray badge
    - Bot Thinking: Orange badge with animated dots
  - Use Inter Medium for status messages

- [x] **Modernize `src/client/components/HomePage.tsx`**

  - Full dark theme conversion (`#0e0e0e` background)
  - Three primary actions with equal visual weight
  - Button styling with design palette
  - Connection status with proper colors
  - Hero section improvements

- [x] **Polish `src/client/components/QuickMatch.tsx`**

  - Queue status with orange accent (`#ffc107`)
  - "Looking for opponent..." with spinner animation
  - Wait time counter styling
  - "Play vs Bot Instead" prominent secondary action
  - Loading animations improvements

- [x] **Transform `src/client/components/GamePage.tsx`** ⚠️ **CRITICAL GAP ADDRESSED**
  - Dark theme conversion for main game layout
  - Header with proper typography and styling
  - Connection status with design palette colors
  - Invite section with blue accent and proper styling
  - Game display wrapper with dark theme
  - Loading state styling with design system

---

## 📋 Phase 4: Final Polish & Interactions

- [ ] **Enhance `src/client/components/PostBotGameOptions.tsx`**

  - Dark theme modal styling
  - Proper color usage for result banners
  - Button styling with design palette

- [ ] **Add hover effects and micro-interactions**

  - Button hover glows (player colors)
  - Cell hover effects (desktop)
  - Smooth color transitions throughout

- [ ] **Responsive polish and final adjustments**
  - Mobile-first scaling verification
  - Text never smaller than 14px
  - Touch target sizes
  - Final spacing and padding adjustments

---

## 🎨 Design Implementation Reference

### Color Palette Usage

| Color            | Hex       | Usage                               |
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

### Typography Usage

- **UI text**: Inter for all interface elements
- **Game symbols**: Space Grotesk for X/O (more geometric)
- **Status messages**: Inter Medium for emphasis

### Animation Priorities

1. **Move rejection** - Red flash + shake + reveal (1000-1500ms) - MOST IMPORTANT
2. **Successful moves** - Scale + glow + smooth transition (200ms)
3. **Status changes** - Badge color transitions
4. **Bot thinking** - Gentle pulse/dots animation

---

## 🔥 Critical Success Factors

- [ ] **Move rejection feedback is the #1 priority** - This is the core Kriegspiel mechanic
- [ ] **Empty cells must look identical** - No hints about hidden information
- [ ] **Player piece distinction** - Glows help identify yours vs revealed opponent pieces
- [ ] **Bot game clarity** - Clear visual indicators for bot vs human games
- [ ] **Dark theme transformation** - Matches strategic/mysterious game feel

---

## 🧪 Testing & Validation

**After each phase, verify:**

- [ ] **Visual regression testing** - Compare before/after screenshots
- [ ] **Animation performance** - No janky animations, smooth 60fps
- [ ] **Mobile responsiveness** - Test on actual mobile devices
- [ ] **Accessibility** - Screen reader compatibility, reduced motion support
- [ ] **Socket integration** - Animations don't break real-time updates
- [ ] **Cross-browser testing** - Chrome, Firefox, Safari (mobile)

**Critical test scenarios:**

- [ ] Move rejection sequence works correctly (Phase 2)
- [ ] Bot vs human games visually distinct (Phase 3)
- [ ] Queue flow animations smooth (Phase 3)
- [ ] All hover states work on desktop (Phase 4)

---

## ⚠️ Potential Risks

**Phase 2 Risks:**

- Animation state conflicts with game state updates
- Socket event timing issues causing desync
- Performance impact of CSS animations

**Phase 3 Risks:**

- Dark theme readability issues
- Color contrast accessibility problems
- Component refactoring breaking functionality

**Phase 4 Risks:**

- Hover effects interfering with mobile touch
- Over-animation causing distraction from gameplay

---

## 📝 Notes

- All styling uses inline styles (maintain current approach)
- Mobile-first design with responsive scaling
- Every animation serves the core game mechanic of hidden information discovery
- Focus on clarity over complexity - the game mechanics are complex enough
- **Consider breaking large tasks into smaller PRs for easier review**

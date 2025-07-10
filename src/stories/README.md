# Storybook Stories - Responsive Testing

This directory contains Storybook stories for testing UI components across different viewport sizes and device types.

## 🎯 Responsive Testing Setup

Our Storybook is configured with custom viewports that match the game's mobile-first design:

- **Mobile 320px** - Smallest mobile devices
- **Mobile 375px (iPhone)** - Standard iPhone size (default)
- **Mobile 414px (iPhone Plus)** - Large mobile devices
- **Tablet 768px** - Tablet portrait mode
- **Desktop 1024px** - Desktop/laptop screens
- **Desktop 1440px** - Large desktop screens

## 📱 How to Use

### 1. Start Storybook

```bash
make storybook
# or
npm run storybook
```

### 2. Viewport Testing

- Use the **viewport toolbar** in Storybook to switch between screen sizes
- **Default viewport** is Mobile 375px (iPhone) to match our mobile-first approach
- Stories with `_Mobile320`, `_iPhone`, `_Tablet`, etc. suffixes are locked to specific viewports

### 3. Key Stories

#### HomePage (Full Screen)

- **Connection states**: Default (connected), Connecting, ConnectionError
- **Queue states**: Default (idle), InMatchmakingQueue, MatchmakingError
- **Complete user flow**: Hero section, all three action buttons, responsive layout
- **Mobile-first**: Comprehensive testing across all viewport sizes

#### GameBoard Component

- **Basic states**: EmptyBoard, MidGame, OpponentTurn, GameCompleted
- **Mobile variants**: Test at 320px, 375px, 414px for touch target accuracy
- **Cross-device**: Compare mobile vs tablet vs desktop layouts

#### ConnectionIndicator Component

- **States**: Connected, Connecting, ConnectionFailed
- **Mobile positioning**: Test fixed positioning on small screens
- **Error message**: Test long error text wrapping

## 🎨 Story Naming Convention

```
ComponentName_State_ViewportSize
```

Examples:

- `GameBoard_EmptyBoard_Mobile320` - Empty board at 320px width
- `ConnectionIndicator_Connected_iPhone` - Connected state at iPhone size
- `GameBoard_MidGame_Tablet` - Mid-game state at tablet size

## 🔧 Touch Target Testing

The `TouchTargetTesting` story is specifically designed to verify:

- Minimum 44px touch targets (iOS requirement)
- Proper button spacing
- Cell accessibility on small screens
- No accidental touches between buttons

## 🎯 Critical Test Cases

1. **Home Page Layout** - Hero section, three action buttons, and responsive design on mobile
2. **Game Board Scaling** - Ensure 3x3 grid fits properly on 320px screens
3. **Button Hierarchy** - Test primary/secondary button sizing and touch targets
4. **Status Indicators** - Verify turn badges and connection status visibility
5. **Error Feedback** - Test move rejection animations on mobile
6. **Queue UI** - Matchmaking status display and bot options on small screens
7. **Connection States** - Test all connection and error states across devices

## 🚀 Best Practices

- **Start Mobile** - Always test mobile viewport first
- **Use Fullscreen** - Set `layout: 'fullscreen'` for page-level components
- **Test Interactions** - Click/tap components to test touch targets
- **Check Animations** - Verify animations work well on mobile
- **Accessibility** - Use the a11y addon to test screen reader compatibility

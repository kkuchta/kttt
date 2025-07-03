# Emoji Removal Analysis

This document catalogs all emoji usage in the user-facing parts of the application to consider removal and replacement strategies.

# Instructions

For each emoji, one at a time (no batching):

1. Identify where it is
2. Consider its context and what its purpose is
3. Identify what, if anything, we should replace it with. Consider the initial suggestions below, but think creatively here.
4. Execute the change for one emoji only.
5. Update the status for that emoji in the table below.

## User-Facing Emoji

| Emoji | File                    | Context                         | Purpose                          | Suggested Replacement                | Notes                              | Status |
| ----- | ----------------------- | ------------------------------- | -------------------------------- | ------------------------------------ | ---------------------------------- | ------ |
| ✨    | HomePage.tsx            | "✨ Start New Game" button      | Visual accent for primary action | Remove or replace with "Create Game" | Currently adds sparkle to main CTA | TODO   |
| ⚡    | HomePage.tsx            | "⚡ Quick Match" button         | Visual accent for quick action   | Remove or replace with "Quick Match" | Lightning suggests speed           | TODO   |
| ⚡    | QuickMatch.tsx          | `<span>⚡</span>` in UI         | Visual indicator for quick match | Remove or use CSS styling            | Redundant with text                | TODO   |
| 🤖    | QuickMatch.tsx          | `<span>🤖</span>` in bot option | Bot indicator                    | Replace with "Bot" text or icon      | Clear bot identifier               | TODO   |
| 🤖    | GameStatus.tsx          | Bot thinking indicator          | Shows bot is processing          | Replace with "Bot" text or spinner   | Multiple instances                 | TODO   |
| 🤖    | GameStatus.tsx          | Bot turn indicator              | Shows it's bot's turn            | Replace with "Bot's Turn" text       | Status clarity                     | TODO   |
| 🤖    | GameStatus.tsx          | Bot wins message                | Victory announcement             | Replace with "Bot Wins!"             | Result announcement                | TODO   |
| 🤖    | PostBotGameOptions.tsx  | Bot wins message                | Victory announcement             | Replace with "Bot Wins!"             | Result announcement                | TODO   |
| 🤖    | PostBotGameOptions.tsx  | Play another bot button         | Bot game option                  | Replace with "Bot" text              | Action button                      | TODO   |
| ✓     | GameStatus.tsx          | Your turn indicator             | Shows it's your turn             | Keep as checkmark or use text        | Common UI pattern                  | TODO   |
| ✓     | GamePage.tsx            | Connection success              | Connection status                | Keep as checkmark or use text        | Status indicator                   | TODO   |
| ⏳    | GameStatus.tsx          | Waiting indicator               | Shows waiting state              | Replace with "Waiting..." or spinner | Loading state                      | TODO   |
| ⏳    | GameStatus.tsx          | Waiting for players             | Shows waiting for join           | Replace with "Waiting..." or spinner | Loading state                      | TODO   |
| 🎭    | GameStatus.tsx          | Dramatic reveal header          | Shows reveal mode                | Replace with "Reveal" or remove      | Thematic but not essential         | TODO   |
| 🎉    | GameStatus.tsx          | Victory message                 | Celebration for win              | Replace with "You Won!"              | Victory announcement               | TODO   |
| 🎉    | GamePage.tsx            | Victory alert                   | Celebration for win              | Replace with "You Win!"              | Victory announcement               | TODO   |
| 🎉    | PostBotGameOptions.tsx  | Victory message                 | Celebration for win              | Replace with "Victory!"              | Victory announcement               | TODO   |
| 😔    | GameStatus.tsx          | Loss message                    | Shows defeat                     | Replace with "You Lost!"             | Loss announcement                  | TODO   |
| 😔    | GamePage.tsx            | Loss alert                      | Shows defeat                     | Replace with "You Lose!"             | Loss announcement                  | TODO   |
| 🤝    | GameStatus.tsx          | Draw message                    | Shows tie game                   | Replace with "Draw!"                 | Draw announcement                  | TODO   |
| 🤝    | GamePage.tsx            | Draw alert                      | Shows tie game                   | Replace with "Draw!"                 | Draw announcement                  | TODO   |
| 🤝    | PostBotGameOptions.tsx  | Draw message                    | Shows tie game                   | Replace with "Draw!"                 | Draw announcement                  | TODO   |
| 🎯    | AboutPage.tsx           | Section header                  | "🎯 What is Kriegspiel..."       | Remove, use text styling             | Section divider                    | TODO   |
| 🎯    | PostBotGameOptions.tsx  | Human opponent button           | Find human opponent              | Replace with "Find Player"           | Action button                      | TODO   |
| ⚡    | AboutPage.tsx           | Features section                | "⚡ Features"                    | Remove, use text styling             | Section divider                    | TODO   |
| ⚡    | AboutPage.tsx           | Quick Match feature             | "⚡ Quick Match"                 | Remove, use text styling             | Feature highlight                  | TODO   |
| 🎭    | AboutPage.tsx           | Dramatic reveals                | "🎭 Dramatic Reveals"            | Remove, use text styling             | Feature highlight                  | TODO   |
| 🎮    | AboutPage.tsx           | Start Playing CTA               | "🎮 Start Playing"               | Remove, use text styling             | Call to action                     | TODO   |
| 🎮    | GamePage.tsx            | Joining game status             | "🎮 Joining game..."             | Replace with "Joining..."            | Loading state                      | TODO   |
| ❌    | GamePage.tsx            | Connection error                | "❌ Unable to connect"           | Replace with "Connection Failed"     | Error state                        | TODO   |
| 🟢    | ConnectionIndicator.tsx | Connected state                 | Green dot for connected          | Replace with CSS green dot           | Connection status                  | TODO   |
| 🔴    | ConnectionIndicator.tsx | Disconnected state              | Red dot for disconnected         | Replace with CSS red dot             | Connection status                  | TODO   |
| 🔄    | ConnectionIndicator.tsx | Connecting state                | Spinning indicator               | Replace with CSS spinner             | Loading state                      | TODO   |
| 🔄    | GamePage.tsx            | Connecting status               | "🔄 Connecting to game..."       | Replace with "Connecting..."         | Loading state                      | TODO   |

## Debug/Console Emoji (Not User-Facing)

| Emoji | File          | Context      | Purpose                | Action                               | Status |
| ----- | ------------- | ------------ | ---------------------- | ------------------------------------ | ------ |
| 🎭    | GamePage.tsx  | Console logs | Debug reveal animation | Remove or replace with text prefixes | TODO   |
| 🎮    | GameBoard.tsx | Console logs | Debug game board       | Remove or replace with text prefixes | TODO   |

## Removal Strategy

### High Priority (Remove First)

- **Decorative emoji** in headers/buttons (✨, ⚡, 🎯, 🎮, 🎭) - these don't add functional value
- **Redundant emoji** where text already explains the action
- **Console debug emoji** - replace with text prefixes

### Medium Priority (Consider Replacement)

- **Status indicators** (✓, ⏳, 🔄) - could be replaced with proper icons or CSS
- **Connection indicators** (🟢, 🔴, 🔄) - replace with CSS styling
- **Bot indicators** (🤖) - replace with "Bot" text or proper icon

### Low Priority (Keep or Simple Text)

- **Result messages** (🎉, 😔, 🤝) - replace with clear text
- **Error states** (❌) - replace with clear text

## Replacement Principles

1. **Functional over decorative** - Remove purely decorative emoji
2. **Clear text over symbols** - Use descriptive text instead of emoji
3. **CSS over Unicode** - Use CSS styling for indicators and status
4. **Consistent typography** - Follow the established Inter/Space Grotesk system
5. **Accessibility** - Ensure all information is conveyed through text or proper ARIA labels

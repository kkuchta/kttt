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

| Emoji | File                    | Context                         | Priority | Purpose                          | Suggested Replacement                | Notes                              | Status |
| ----- | ----------------------- | ------------------------------- | -------- | -------------------------------- | ------------------------------------ | ---------------------------------- | ------ |
| ✨    | HomePage.tsx            | "✨ Start New Game" button      | High     | Visual accent for primary action | Remove or replace with "Create Game" | Currently adds sparkle to main CTA | TODO   |
| ⚡    | HomePage.tsx            | "⚡ Quick Match" button         | High     | Visual accent for quick action   | Remove or replace with "Quick Match" | Lightning suggests speed           | TODO   |
| ⚡    | QuickMatch.tsx          | `<span>⚡</span>` in UI         | Medium   | Visual indicator for quick match | Remove or use CSS styling            | Redundant with text                | TODO   |
| 🤖    | QuickMatch.tsx          | `<span>🤖</span>` in bot option | Medium   | Bot indicator                    | Replace with "Bot" text or icon      | Clear bot identifier               | TODO   |
| 🤖    | GameStatus.tsx          | Bot thinking indicator          | Medium   | Shows bot is processing          | Replace with "Bot" text or spinner   | Multiple instances                 | TODO   |
| 🤖    | GameStatus.tsx          | Bot turn indicator              | Medium   | Shows it's bot's turn            | Replace with "Bot's Turn" text       | Status clarity                     | TODO   |
| 🤖    | GameStatus.tsx          | Bot wins message                | Low      | Victory announcement             | Replace with "Bot Wins!"             | Result announcement                | TODO   |
| 🤖    | PostBotGameOptions.tsx  | Bot wins message                | Low      | Victory announcement             | Replace with "Bot Wins!"             | Result announcement                | TODO   |
| 🤖    | PostBotGameOptions.tsx  | Play another bot button         | Medium   | Bot game option                  | Replace with "Bot" text              | Action button                      | TODO   |
| ✓     | GameStatus.tsx          | Your turn indicator             | High     | Shows it's your turn             | Keep as checkmark or use text        | Common UI pattern                  | TODO   |
| ✓     | GamePage.tsx            | Connection success              | High     | Connection status                | Keep as checkmark or use text        | Status indicator                   | TODO   |
| ⏳    | GameStatus.tsx          | Waiting indicator               | Medium   | Shows waiting state              | Replace with "Waiting..." or spinner | Loading state                      | TODO   |
| ⏳    | GameStatus.tsx          | Waiting for players             | Medium   | Shows waiting for join           | Replace with "Waiting..." or spinner | Loading state                      | TODO   |
| 🎭    | GameStatus.tsx          | Dramatic reveal header          | Low      | Shows reveal mode                | Replace with "Reveal" or remove      | Thematic but not essential         | TODO   |
| 🎉    | GameStatus.tsx          | Victory message                 | Medium   | Celebration for win              | Replace with "You Won!"              | Victory announcement               | TODO   |
| 🎉    | GamePage.tsx            | Victory alert                   | Medium   | Celebration for win              | Replace with "You Win!"              | Victory announcement               | TODO   |
| 🎉    | PostBotGameOptions.tsx  | Victory message                 | Medium   | Celebration for win              | Replace with "Victory!"              | Victory announcement               | TODO   |
| 😔    | GameStatus.tsx          | Loss message                    | Medium   | Shows defeat                     | Replace with "You Lost!"             | Loss announcement                  | TODO   |
| 😔    | GamePage.tsx            | Loss alert                      | Medium   | Shows defeat                     | Replace with "You Lose!"             | Loss announcement                  | TODO   |
| 🤝    | GameStatus.tsx          | Draw message                    | Medium   | Shows tie game                   | Replace with "Draw!"                 | Draw announcement                  | TODO   |
| 🤝    | GamePage.tsx            | Draw alert                      | Medium   | Shows tie game                   | Replace with "Draw!"                 | Draw announcement                  | TODO   |
| 🤝    | PostBotGameOptions.tsx  | Draw message                    | Medium   | Shows tie game                   | Replace with "Draw!"                 | Draw announcement                  | TODO   |
| 🎯    | AboutPage.tsx           | Section header                  | Low      | "🎯 What is Kriegspiel..."       | Remove, use text styling             | Section divider                    | TODO   |
| 🎯    | PostBotGameOptions.tsx  | Human opponent button           | Medium   | Find human opponent              | Replace with "Find Player"           | Action button                      | TODO   |
| ⚡    | AboutPage.tsx           | Features section                | Low      | "⚡ Features"                    | Remove, use text styling             | Section divider                    | TODO   |
| ⚡    | AboutPage.tsx           | Quick Match feature             | Low      | "⚡ Quick Match"                 | Remove, use text styling             | Feature highlight                  | TODO   |
| 🎭    | AboutPage.tsx           | Dramatic reveals                | Low      | "🎭 Dramatic Reveals"            | Remove, use text styling             | Feature highlight                  | TODO   |
| 🎮    | AboutPage.tsx           | Start Playing CTA               | Low      | "🎮 Start Playing"               | Remove, use text styling             | Call to action                     | TODO   |
| 🎮    | GamePage.tsx            | Joining game status             | Medium   | "🎮 Joining game..."             | Replace with "Joining..."            | Loading state                      | TODO   |
| ❌    | GamePage.tsx            | Connection error                | High     | "❌ Unable to connect"           | Replace with "Connection Failed"     | Error state                        | TODO   |
| 🟢    | ConnectionIndicator.tsx | Connected state                 | High     | Green dot for connected          | Replace with CSS green dot           | Connection status                  | TODO   |
| 🔴    | ConnectionIndicator.tsx | Disconnected state              | High     | Red dot for disconnected         | Replace with CSS red dot             | Connection status                  | TODO   |
| 🔄    | ConnectionIndicator.tsx | Connecting state                | High     | Spinning indicator               | Replace with CSS spinner             | Loading state                      | TODO   |
| 🔄    | GamePage.tsx            | Connecting status               | High     | "🔄 Connecting to game..."       | Replace with "Connecting..."         | Loading state                      | TODO   |

## Debug/Console Emoji (Not User-Facing)

| Emoji | File          | Context      | Priority | Purpose                | Action                               | Status |
| ----- | ------------- | ------------ | -------- | ---------------------- | ------------------------------------ | ------ |
| 🎭    | GamePage.tsx  | Console logs | Lowest   | Debug reveal animation | Remove or replace with text prefixes | TODO   |
| 🎮    | GameBoard.tsx | Console logs | Lowest   | Debug game board       | Remove or replace with text prefixes | TODO   |

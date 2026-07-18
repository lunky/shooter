# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server
npm run build      # Production build (default: badminton mode)
npm run buildhockey  # Production build with hockey config (.env.hockey)
npm test           # Run all tests
npm test -- --testNamePattern="test name"  # Run a single test by name
npm run deploy     # Deploy to GitHub Pages (shooter.midworld.org)
```

Linting/formatting uses Biome (`biome.jsonc`): 120-char line width, spaces.

## Architecture

Single-page React PWA for real-time sports scorekeeping with two modes: **Hockey** and **Badminton**. Mode is controlled entirely via environment variables — no code branching between modes.

**Component tree:**
- `App.js` — class component, owns all game state (shots per period, goals, current period, team names). Persists state to localStorage on every update (`gameState` and `gamePrefs` keys). Handles vibration feedback via `navigator.vibrate()`.
- `BoxScore.js` — stateless child that renders the shot/goal table. Shows "birdie" (serving indicator) in badminton mode, hides totals/goals columns based on env flags.
- `EditText` (from `react-edit-text`) — inline editable team name fields.

**Environment-based customization** (`.env`, `.env.hockey`, `.env.badminton`):
- `REACT_APP_BadmintonMode` — toggles badminton vs hockey
- `REACT_APP_PeriodName` — label for periods (e.g., "Period" vs "Game")
- `REACT_APP_Flyers_name` / `REACT_APP_Badguy_name` — default team names
- `REACT_APP_Hide_goals` / `REACT_APP_Hide_totals` — UI visibility flags

Hockey uses 4 periods; badminton uses 2–3 periods (best of 3 games).

**CI/CD:** GitHub Actions auto-deploys to GitHub Pages on push to `main`.

https://drive.proton.me/urls/DH3B7AVEFW#PG1xvyHrEmOK
# STREAK — Don't Break The Chain

A single-file, offline-first habit tracker. No sign-up, no server, no accounts — everything lives in your browser's `localStorage`. Open `streak-clean.html` in any modern browser and it just works.

## Features

### Core habit tracking
- Add habits with a name, description, minimum version ("if you only have 5 minutes"), an if-then plan, an identity statement, and a category.
- Daily or "X times a week" schedules.
- One-tap check-in, a 30-day chain view you can click to backfill or correct any day, and a full-year calendar per habit.
- Automatic color assigned per habit (rotates through a fixed palette) — you can still recolor a habit from its **Edit** modal.

### Archive
- Habits you're pausing (not deleting) can be archived from the card's archive icon.
- Archived habits move to the **Archived** filter pill, keep their full history, and are excluded from your daily list, streak stats, dashboard, insights, and badge wall.
- Restore anytime from the Archived view, or delete permanently from there.

### Streaks, freezes & milestones
- Current streak, best streak, and an automatic "recovery" state with an encouraging nudge after a miss.
- Streak freeze tokens auto-protect a missed day.
- Badge wall with fixed milestones (3, 7, 14, 30, 50, 100, 200, 365) plus custom milestones you define in Settings.
- Confetti + quote celebration modal when you hit one.

### Categories & filtering
- Tag habits with a free-text category; filter the habit list by category, "Uncategorized," "All," or "Archived."

### Dashboard & insights
- 30-day consistency heatmap (click any day for a detail breakdown).
- Perfect-day count and perfect-day streak.
- Weekly insights: best/toughest day of the week, most common check-in time, most common miss reason, and a 6-week consistency trend chart.

### Reflection log (notes)
- A short daily note per day, searchable and filterable by date range or tag.
- `#hashtags` for general tags.
- `@HabitName` to link a note directly to a habit — start typing `@` and an autocomplete dropdown of your habits appears (arrow keys + Enter/Tab, or click, to insert).
- Export the whole log as text.

### Data management (Settings panel)
- **Export / Import backup** — full JSON snapshot of habits, notes, and milestones.
- **Export / Import CSV** — spreadsheet-friendly habit export/import.
- **Sync across devices** — generates a manual copy-paste code (no account needed) to move your data to another browser/device.
- **Erase all data** — full reset, requires typing a confirmation phrase.

### Personalization
- Light/dark theme toggle.
- Optional name, used in greetings and milestone messages.
- Sound on/off for check-ins and milestones.
- **Keyboard shortcuts** — remappable. Click a shortcut in Settings, press any key, and it's saved. Defaults: `S` opens Settings, `N` jumps to the reflection log, `Esc` closes any open modal (fixed).

## Getting started

1. Open the HTML file in a browser.
2. On first launch you'll get a short onboarding step to name yourself and pick a few starter habits (or add your own).
3. Check in daily. That's it.

## Data & privacy

Everything is stored only in your browser's `localStorage` — nothing is sent anywhere. Clearing your browser data or switching browsers/devices will lose your data unless you've exported a backup or used the Sync feature first. Back up regularly (the app will remind you if it's been a while).

## Browser support

Any modern evergreen browser (Chrome, Firefox, Safari, Edge). Uses `localStorage`, CSS `color-mix()`, and CSS `:has()` — very old browsers may render the archived-card styling slightly differently but the app will still function.

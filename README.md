# STREAK — Refactored

This project separates the original single-file STREAK app into HTML, CSS, and JavaScript.

## Structure
- `index.html` — UI structure and semantic content.
- `css/style.css` — all styling extracted from the original `<style>` block.
- `js/app.js` — application/UI behavior extracted from the original inline script, with small compatibility/data-loss fixes.
- `js/streak-core.js` — pure date and streak calculations. The original file referenced this dependency but did not include it in the supplied upload, so a compatible implementation is included here so the project is runnable.

## Run
Open `index.html` in a modern browser. For the smoothest localStorage/file behavior, a simple local server is recommended (for example VS Code Live Server).

## Improvements made
- Separated HTML, CSS, and JS.
- Supplied the missing `streak-core.js` dependency.
- Backup export now includes habits, preferences, and reflection notes while remaining backward-compatible with legacy backups.
- Full erase now also clears notes and preferences and returns to onboarding.
- WhatsApp SVG uses a filled icon style consistent with the existing social icons.
- HTML escaping now safely coerces non-string values before escaping.

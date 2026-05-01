---
name: agent-browser
always_loaded: true
description: Browser automation for UI verification
---

# agent-browser

UI work in this project goes through agent-browser. Never substitute Playwright,
Puppeteer, Selenium, or chromedriver.

## Capabilities

- Open a URL, capture a screenshot at multiple viewports.
- Click, type, scroll, wait for selector.
- Capture console logs and network responses.
- Read accessibility tree for assertion against ARIA roles.

## Verification recipe

1. Start dev server, wait for ready signal.
2. `agent-browser open <url>` — viewport 1440x900.
3. Screenshot, save to `.validation/ui-<slug>.png`.
4. Compare token swatches against `DESIGN.md`.

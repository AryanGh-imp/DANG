# DANG Design System

The maintainer-supplied engraving is the visual reference: a dark field, light engraved lines, DANG lettering, and restrained metallic detail. The interface takes inspiration from ancient Persian stone, bronze, lapis, and garden colors. The artwork appears in the ledger summary, repository README, application icons, and sharing image.

## Theme tokens

| Theme | Background | Accent | Role |
| --- | --- | --- | --- |
| Persepolis / Parseh | Warm stone `#f1eee5` | Bronze `#805b2b` | Primary light theme |
| Limestone | Greenish stone `#edeeea` | Slate green `#4c6256` | Alternative light theme |
| Imperial / Obsidian | Ink `#171715` | Gold `#d1b47c` | Primary dark theme |
| Lapis | Navy `#141d2b` | Gold `#d5b977` | Blue dark theme |
| Cedar | Green `#12241e` | Pale bronze `#c9ba85` | Green dark theme |
| Porphyry | Purple `#251e29` | Copper `#d2b190` | Purple dark theme |
| Automatic | Persepolis or Obsidian | Follows selected theme | Device appearance preference |

CSS custom properties in `assets/css/styles.css` define surfaces, text, borders, semantic colors, and accents. `themes.js` defines names, previews, and aliases for legacy theme settings. Changing a theme affects presentation, not financial data.

## Layout and interaction

- Desktop: a sidebar and separate areas for entry and the selected day's expenses.
- Tablet and mobile: fixed bottom navigation, safe-area spacing, and stacked panels on narrow screens.
- Every view exposes a globe language button in the header, labeled in the target language (**English** or **فارسی**). It has a 44-pixel touch target and stacks above the date control on narrow screens, so changing language never requires reading the Settings navigation first.
- Amount, category, and date are the primary entry fields. The form supports Enter, inline errors, and retaining drafts after failed writes.
- Editing uses a centered desktop dialog and a mobile bottom sheet. Focus is trapped inside, Escape closes it, and closing restores focus to the expense.
- Categories and themes have labels and selected states in addition to color. Calendar intensity is limited to preserve text contrast.
- The profile credit uses a compact capsule, an AG monogram, bronze accents, a two-line GitHub/handle label, and an external-link arrow. It has a touch-sized target, visible focus and safe new-tab attributes.
- Vazirmatn is self-hosted, with tabular numbers, variable weights, and local Arabic/Latin subsets. Runtime typography does not contact a font CDN.
- Reduced-motion preferences disable animations and transitions. Text can wrap across rows, totals, and summaries.

## Accessibility verification

Normal text targets a contrast ratio of at least 4.5:1. Main controls target at least 44 × 44 CSS pixels. Narrow calendar cells retain a height of at least 44 pixels and a width above the WCAG AA minimum of 24 pixels; neighboring targets must not overlap.

The automated design suite checks all seven theme choices across all four views with axe, plus the editing dialog. Responsive checks cover widths from 320 to 1440 pixels, landscape phones, RTL/LTR, long descriptions, long category names, and large amounts. Chromium and WebKit are tested independently. These checks supplement visual review; they do not constitute an exhaustive accessibility audit or hardware certification.

## Assets

`assets/branding/dang-emblem.png` preserves the supplied image. The WebP derivative reduces display payload; portrait crops are used for small application icons so the lettering does not become unreadable. The maskable variant pads the artwork within a safe area. `scripts/build-brand.py` regenerates derivatives using Python and Pillow.

Screenshots in `docs/previews/` are generated using synthetic data in independent browser contexts. Original artwork and font licensing are documented in [NOTICE](../NOTICE).

## Applied references

- [Anthropic frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md): project-specific visual identity, typography, composition, and screenshot critique.
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md): forms, keyboard interaction, navigation, safe areas, responsive behavior, and long content.
- [WCAG 2.2: Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- [WCAG 2.2: Target Size Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).
- [WCAG 2.2: Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- [Vazirmatn](https://github.com/rastikerdar/vazirmatn), distributed locally under SIL OFL 1.1.

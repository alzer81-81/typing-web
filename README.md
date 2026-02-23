# Typing Website IA (Audience-Based)

## Sitemap
- `/` Audience hub
- `/education/` Education page with in-page sections
- `/homeschool/` Homeschool page with in-page sections
- `/individuals/` Individuals page with in-page sections

Deprecated routes now redirect into audience sections:
- `/admin/` -> `/education/#for-district`
- `/teacher/` -> `/education/#for-teachers`
- `/curriculum/` -> `/education/#curriculum`
- `/standards/` -> `/education/#standards`
- `/accessibility/` -> `/education/#accessibility`
- `/plus/` -> `/education/#plus-edition`
- `/students/` -> `/individuals/`

## Navigation model
- Global nav is audience-first: `Education`, `Homeschool`, `Individuals`, `What's New`, `Log In`, `Sign Up`.
- Each audience page includes a secondary section nav (`[data-section-nav]`) that smooth-scrolls to anchor sections.
- Active section in the secondary nav is highlighted on scroll.

## Editing audience sections
- Add or rename sections by editing:
  - `/education/index.html`
  - `/homeschool/index.html`
  - `/individuals/index.html`
- Match section IDs with links inside each page's `.section-nav-inner`.

## Styling and behavior
- IA-specific styles are at the bottom of `assets/styles.css` under:
  - `/* IA Refresh: audience-based navigation + section pages */`
- Shared behavior (global nav normalization, auth modal, section scrolling, mobile nav, footer language selector) is in:
  - `assets/main.js`

## GitHub Pages
- `.nojekyll` is included so GitHub Pages serves this as a static site without Jekyll processing.

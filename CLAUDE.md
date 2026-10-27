# Harrison Moore portfolio site

Full spec: `BUILD-BRIEF.md` (read it before any non-trivial change). This file is the short version.

## Working with Harrison
- Harrison is non-technical. Do all technical work; explain each step in plain words.
- Commit and push to GitHub (`origin`, branch `main`) after each completed step, with clear messages.
- Ask before anything that needs his accounts (Vercel, domains, analytics, etc.).
- Section 9 items in the brief are his decisions: flag them, don't decide.
- Live site: https://harrison-portfolio-seven.vercel.app/ (Vercel deploys every push to `main`).
- To-do list (Claude Doc): https://claude.ai/artifact/VUn1RDR2RumFLXahMJbvby. Read it at the start of each session, tick build steps as they're done, and add new items Harrison needs to act on.

## Writing rules (anything visitors read)
- British English, sentence case, no em dashes.

## Stack
- Astro, static output, no client-side framework. Small plain JS only (filters, pop-ups, scroll covers, share, copy).
- Hosted on Vercel Hobby, deploys on every push.
- Archivo variable font self-hosted (`assets/fonts/archivo-variable.woff2` or `@fontsource-variable/archivo`). Never load Google Fonts.

## Sources of truth
- **Words: `content/copy.md`**, parsed at build time. Never hard-code copy that belongs there.
  - `## Section` / `## Project: <name>`, `###` sub-parts, `####` items, `Label: value` short fields, plain paragraphs for prose.
  - Unescape `\[` `\]`. Support `[text](url)` links in prose.
  - `[TO DO]` must render as a visible dashed-outline gap, never hidden.
  - Parse into typed data (sections, 6 projects, filters); fail the build loudly on missing required fields.
- **Look: `design/*.html`** (390px phone mock-ups). Reference only: rebuild as clean Astro components, no inline styles, ignore `{{...}}`.
- **Assets: `assets/`** (`images/`, `svg/`, `graphics/`, `fonts/`). Missing assets get visible placeholders.

## Page order
Sticky top bar, top of page, track record (3 figures), selected projects (filters + 6 cards), what I want to work on, how you can help (copy-message button), testimonials, contact and footer. Pop-ups: one per project, "Try it yourself", CV (last).

## Design tokens
- Colours only: ink #111111, paper #FAFAF7, white #FFFFFF, grey #4A4A46 (small labels only).
- Archivo, headings 800 weight at 62% width. Headline 58, pop-up title 72, section heading 56, card title/pull quote 40, sub-heading 28, body 17/1.55, labels 13/600. Shrink headings below 360px.
- Lines always 2px ink, straight or wavy (use provided SVGs). Star is the only filled mark.
- Radii: cards/images 20 (16 in pop-ups), thumbnails 10, sheet top 24, pill buttons. Touch targets 44px+, main buttons 52px.
- Spacing steps 4, 8, 14, 18, 22, 28, 40, multiplied by `--spacing-scale: 1.25` (Harrison wanted 25% more room). Use the `--space-*` tokens, never raw px for spacing. Gutter 20, card padding 18. Desktop: one centred column ~680–720px, never multi-column.
- Icons: 16px line icons, 1.5px stroke.

## Harrison's decisions (override the brief)
- Project cards have ONE action, "Read the case study". No evidence link on the card (evidence links live in the pop-up).
- Design proposal PDF: cover the sensitive details (old phone number, RCA email, Doc/Fest commissioner's email) with black boxes before publishing.

## Behaviour essentials
- Filters: `aria-pressed`, "All" active on load, URL kept in sync (`?filter=`).
- Card covers slide right (0 to 92%) and photo goes greyscale to colour with scroll; formula in brief section 5. Respect reduced motion. Never cover the portrait.
- Pop-ups: real dialogs, focus trap, close on button/Escape/back, own URL hash, restore scroll and focus.

## Quality bar
Semantic HTML, visible focus (2px ink outline with offset), 4.5:1 contrast, Lighthouse 90+ mobile, no layout shift, optimised responsive images. Check at 390px, 320px and desktop.

## Build order
Repo + Astro, copy.md + parser, then top bar, top of page, filters and cards, covers, pop-up, evidence gallery, remaining sections, CV pop-up, share card.

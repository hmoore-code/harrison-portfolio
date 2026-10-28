# Harrison Moore portfolio site

Full spec: `BUILD-BRIEF.md` (read it before any non-trivial change). This file is the short version.

## Working with Harrison
- Harrison is non-technical. Do all technical work; explain each step in plain words.
- Commit and push to GitHub (`origin`, branch `main`) after each completed step, with clear messages.
- Ask before anything that needs his accounts (Vercel, domains, analytics, etc.).
- Section 9 items in the brief are his decisions: flag them, don't decide.
- Live site: https://harrison-portfolio-seven.vercel.app/ (Vercel deploys every push to `main`).
  If a custom domain is added, update `site` in astro.config.mjs so share-card links stay correct.
- To-do list (Claude Doc): https://claude.ai/artifact/VUn1RDR2RumFLXahMJbvby. Read it at the start of each session, tick build steps as they're done, and add new items Harrison needs to act on.

## Writing rules (anything visitors read)
- British English, sentence case, no em dashes.

## Stack
- Astro, static output, no client-side framework. Small plain JS only (filters, pop-ups, scroll covers, share, copy).
- Hosted on Vercel Hobby, deploys on every push.
- Archivo variable font self-hosted (`assets/fonts/archivo-variable.woff2` or `@fontsource-variable/archivo`). Never load Google Fonts.

## Sources of truth
- **Words: `content/copy.md`**, parsed at build time. It is the single source of every word visitors read: never hard-code visitor-facing words (buttons, headings, confirmations included). If a word is missing, flag it and add a field.
  - Harrison edits copy.md directly in VS Code (he may also paste in a fresh export of his Live copy). Re-read it before any copy work, since he may have changed it.
  - A fresh export can bring back things he already decided against (dropped files, TO DO wrappers on confirmed links, missing image references). Restore those decisions in copy.md, keep his wording, and tell him what you restored.
  - "Publish my copy changes" = build, commit and push copy.md.
  - `## Section` / `## Project: <name>`, `###` sub-parts, `####` items, `Label: value` short fields, plain paragraphs for prose.
  - Unescape `\[` `\]`. Support `[text](url)` links, `**bold**` (strong, 800) and `*italics*` in prose.
  - `[TO DO]` must render as a visible dashed-outline gap, never hidden.
  - Parse into typed data (sections, 6 projects, filters); fail the build loudly on missing required fields.
- **Look: `design/*.html`** (390px phone mock-ups). Reference only: rebuild as clean Astro components, no inline styles, ignore `{{...}}`.
- **Assets: `assets/`** (`images/`, `svg/`, `graphics/`, `fonts/`). Missing assets get visible placeholders.

## Page order
Follows copy.md: sticky top bar, top of page ("Top B"), selected projects (filters + 6 cards in copy.md order), track record (3 figures), what I want to work on (with people I'd like to meet), testimonials, contact and footer. Pop-ups: one per project, "Try it yourself", CV (last).

## Top of page ("Top B")
Fields under `## Top of page`: Name, Headline, Subtitle, Main button, Second button, CV link, Contact email, plus `### Share this site with` (lead-in paragraph + bullets) and `### Closing line` (paragraph). Order: portrait (200px, 50% 28%, 2px border, radius 20, no cover), h1 headline (40/800/62%/0.92), subtitle (17/500/1.45, bold 800, italics), wavy-bordered share box (lead-in 22/800/62%/1, list 16/1.4), closing line (16/1.5), stacked buttons (10px gap): black share pill, outline "View projects" pill that smooth-scrolls to "Selected projects", centred underlined CV link. 20px gutter, 18px gaps; these are Harrison's exact px values, not scaled `--space-*` steps.

## Design tokens
- Colours only: ink #111111, paper #FAFAF7, white #FFFFFF, grey #4A4A46 (small labels only).
- Archivo, headings 800 weight at 62% width. Headline 58, pop-up title 72, section heading 56, card title/pull quote 40, sub-heading 28, body 17/1.55, labels 13/600. Shrink headings below 360px.
- Lines always 2px ink, straight or wavy (use provided SVGs). Star is the only filled mark.
- Radii: cards/images 20 (16 in pop-ups), thumbnails 10, sheet top 24, pill buttons. Touch targets 44px+, main buttons 52px.
- Spacing steps 4, 8, 14, 18, 22, 28, 40, multiplied by `--spacing-scale: 1.25` (Harrison wanted 25% more room). Use the `--space-*` tokens, never raw px for spacing. Gutter 20, card padding 18. Desktop: one centred column ~680–720px, never multi-column.
- Icons: 16px line icons, 1.5px stroke.

## Harrison's decisions (override the brief)
- Project cards have ONE action: the "Card button" from copy.md, which opens the case study. No evidence link on the card (evidence links live in the pop-up).
- Design proposal PDF: sensitive details are covered with black boxes and every page flattened to an image (no hidden text). Done; the unredacted original lives only in `originals/`.
- No pre-written forwarding message. The top of page's main button shares the portfolio link; people add their own words.
- Workshop lead image: Zoom name labels blurred, faces left as they are.
- Doc/Fest logo (`Logo:` field) shows small inside The Steel Core pop-up so it looks official.
- `originals/` holds full-size and private source files. It is git-ignored: never commit it.
- Asset files use lowercase-hyphen names. copy.md may name them with a different ending (.jpg vs .png); lookup ignores the ending.

## Behaviour essentials
- Filters: `aria-pressed`, "All" active on load, URL kept in sync (`?filter=`).
- Card covers slide right (0 to 92%) and photo goes greyscale to colour with scroll; formula in brief section 5. Respect reduced motion. Never cover the portrait.
- Pop-ups: real dialogs, focus trap, close on button/Escape/back, own URL hash, restore scroll and focus.

## Quality bar
Semantic HTML, visible focus (2px ink outline with offset), 4.5:1 contrast, Lighthouse 90+ mobile, no layout shift, optimised responsive images. Check at 390px, 320px and desktop.

## Build order
Repo + Astro, copy.md + parser, then top bar, top of page, filters and cards, covers, pop-up, evidence gallery, remaining sections, CV pop-up, share card.

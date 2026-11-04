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
- Astro, static output, no client-side framework. Small plain JS only (pop-ups, carousel, share, copy).
- Hosted on Vercel Hobby, deploys on every push.
- Archivo variable font self-hosted (`assets/fonts/archivo-variable.woff2` or `@fontsource-variable/archivo`). Never load Google Fonts.
- Quotes and testimonials: Instrument Serif italic 400 (`@fontsource/instrument-serif`, `--font-quote`).

## Sources of truth
- **Words: `content/copy.md`**, parsed at build time. It is the single source of every word visitors read: never hard-code visitor-facing words (buttons, headings, confirmations included). If a word is missing, flag it and add a field.
  - Harrison edits copy.md directly in VS Code (he may also paste in a fresh export of his Live copy). Re-read it before any copy work, since he may have changed it.
  - A fresh export can bring back things he already decided against (dropped files, TO DO wrappers on confirmed links, missing image references). Restore those decisions in copy.md, keep his wording, and tell him what you restored.
  - "Publish my copy changes" = build, commit and push copy.md.
  - `## Section` / `## Project: <name>`, `###` sub-parts, `####` items, `Label: value` short fields, plain paragraphs for prose.
  - Unescape `\[` `\]`. Support `[text](url)` links and `**bold**` (strong, 800) in prose. `*italics*` render as plain text: only quotes and testimonials are italic.
  - `[TO DO]` must render as a visible dashed-outline gap, never hidden.
  - Parse into typed data (sections, 6 projects, categories); fail the build loudly on missing required fields.
- **Look: `design/*.html`** (390px phone mock-ups). Reference only: rebuild as clean Astro components, no inline styles, ignore `{{...}}`.
- **Assets: `assets/`** (`images/`, `svg/`, `graphics/`, `fonts/`). Missing assets get visible placeholders.

## Page order
Follows copy.md (design/18-homepage.html): sticky top bar, top of page ("Top B"), selected projects (6 cards in copy.md order, no filters), "Help me find the right team" (#cv: heading, one paragraph, then the CV/Share/Contact buttons; no figures, share drawings or star divider), the testimonials carousel on a full-width blue band, then Back to top and the footer. All off-white except the blue band. No "What I want to work on" or "Contact me" sections. Pop-ups: one per project, "Try it yourself", CV (last, #my-cv).

## Top of page ("Top B")
Fields under `## Top of page`: Name, Headline, Mission, Values, Availability, Main button, Email button, CV link, Contact email, plus `### Share this site with` (lead-in paragraph + bullets) and `### Closing line` (paragraph). Order: portrait (200px, 50% 28%, 2px border, radius 20), h1 headline (40/800/62%/0.92), then body text: Mission, "My strengths are:" with the 5 strengths as a bold star-bulleted list (`### My strengths`), Values, Availability, wavy-bordered share box (28px subheading lead-in, then the 3 share drawings at 28px in a row, 13px labels), closing line (body). No buttons at the top of the page (Harrison, 4 November 2026). 20px gutter, 18px gaps; these are Harrison's exact px values, not scaled `--space-*` steps.

## Design tokens
- Colours only: ink #111111, paper #FAFAF7, white #FFFFFF, grey #4A4A46 (small labels only), plus Harrison's additions: blue #1F1FB3 (`--blue`: CV/Share/Contact buttons, top bar links, current testimonial chip), periwinkle #B0B9F0 (`--periwinkle`: testimonials band only, ink text on it) and #333333 (`--grey-dark`: testimonial roles). No yellow, diagonal pattern or grain.
- Type scale (tokens in global.css; use nothing else): pop-up title 65 (`--size-popup-title`), section heading 56, hero headline and card titles 40 (`--size-card-title`), subheading 28, all condensed (62%) 800; body 17/1.55/400 (`--size-body`); small 15 for names, links and buttons (`--size-small`); labels and captions 13 (`--size-label`); pull quotes 32 and carousel quote 24, Instrument Serif italic. Big stat numbers keep their own size. Section, card and subheading sizes shrink a little below 360px.
- Lines always 2px ink, straight or wavy (use provided SVGs). Star is the only filled mark.
- Radii: cards/images 20 (16 in pop-ups), thumbnails 10, sheet top 24, pill buttons. Touch targets 44px+, main buttons 52px.
- Spacing steps 4, 8, 14, 18, 22, 28, 40, multiplied by `--spacing-scale: 1.25` (Harrison wanted 25% more room). Use the `--space-*` tokens, never raw px for spacing. Gutter 20, card padding 18. Desktop: one centred column ~680–720px, never multi-column.
- Icons: 16px line icons, 1.5px stroke.

## Harrison's decisions (override the brief)
- Project cards show a plain, static, full-colour photo: no pattern covers or scroll effects (removed 4 November 2026). The pattern strip above each pop-up stays.
- No filters (removed 4 November 2026): all 6 cards always show. The category label (icon + text) stays on cards and pop-ups.
- Button rows: one row, equal widths, never stacked, all fitting on one line at 320px, 44px+ tall. "Help me find the right team" section: CV, Share, Contact (`ActionButtons`). Pop-ups: Share, Contact. These are blue pills (`pill--cta`); every other pill is an outline on white. Labels come from copy.md.
- Top bar: name, then CV (opens #my-cv), Share, Contact as blue text links, no icons, all on one line at 320px.
- CV pop-up shows only the "Message" from `## CV` and the close button, sized to its content (`compact` sheet), until the CV is ready.
- Share drawings live in `assets/share-icons/` (`SharePeople`), served as the original .svg files (never inlined or converted): 28px, in the top of page box only; empty alt text, 13px labels centred underneath.
- Project cards have ONE action: each project's own "Card button" from copy.md, which opens its pop-up. The card title is also a link to the pop-up (looks unchanged, underline on hover). Cards also show a 💎 skills line from the per-project "Skills" field. No evidence link on the card (evidence links live in the pop-up).
- Design proposal PDF: sensitive details are covered with black boxes and every page flattened to an image (no hidden text). Done; the unredacted original lives only in `originals/`.
- No pre-written forwarding message. The top of page's main button shares the portfolio link; people add their own words.
- Workshop lead image: Zoom name labels blurred, faces left as they are.
- DocFest logo (`Logo:` field, docfest-logo.svg) shows in The Steel Core pop-up's Organisation square in place of the name (screen readers still hear the name), so it looks official.
- `originals/` holds full-size and private source files. It is git-ignored: never commit it.
- Asset files use lowercase-hyphen names. copy.md may name them with a different ending (.jpg vs .png); lookup ignores the ending.

## Pop-up content
No "More details about this project" section any more. In the case study, `[... goes here]` places a graphic from `src/components/graphics/` (words under the `####` of the same name) and `[Text](link){button}` places an outline pill opening a link or PDF in a new tab. After the skills box, every pop-up ends with `NextProject` (6 stars + "Next: ..." button). CV, Share and Contact are the only filled (blue) buttons; all other pills are outlines. Colour only inside data graphics. Full rules in the brief (section 5, "Update, 30 October 2026").
## Behaviour essentials
- Pop-ups: real dialogs, focus trap, close on button/Escape/back, own URL hash, restore scroll and focus.

## Quality bar
Semantic HTML, visible focus (2px ink outline with offset), 4.5:1 contrast, Lighthouse 90+ mobile, no layout shift, optimised responsive images. Check at 390px, 320px and desktop.

## Build order
Repo + Astro, copy.md + parser, then top bar, top of page, cards, pop-up, evidence gallery, remaining sections, CV pop-up, share card.

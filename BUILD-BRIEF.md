# Build brief: Harrison Moore's portfolio site

For Claude Code. Written 26 October 2026. British English, sentence case and no em dashes in anything visitors read.

## 1. What this is
A single-page portfolio that helps Harrison Moore find his next role in learning and programme design, or user research and partnerships. 2 kinds of visitor: hiring managers who must "get" him in 30 seconds on a phone, and connectors who want something easy to forward. Phone first. Every claim on the site is backed by evidence (photos, PDFs, links).

## 2. Stack
- Astro, static output, no client-side framework. Small amounts of plain JavaScript for the filters, pop-ups, scroll-linked covers, share and copy buttons.
- GitHub repository, hosted on Vercel's free Hobby plan, deploying on every push.
- Self-host the Archivo variable font (use the `@fontsource-variable/archivo` package, the width axis version, or the file in `assets/fonts/`). Do not load Google Fonts at runtime.

## 3. Sources of truth
1. **Words: `content/copy.md`, the single source of every word visitors read.** Harrison edits it directly; there is no other copy to keep in step. The site reads this file at build time so copy changes never need code changes. Never hard-code visitor-facing words in components. Format:
   - `## Section` and `## Project: <name>` headings; `###` sub-parts (The problem or The challenge, What I did, What happened, What this shows, Evidence, Pull quote, Try it yourself, Further reading, Learn more, Exhibition list); `####` items inside a sub-part (the 3 forms in Try it yourself).
   - `Label: value` lines for short fields (Title, Organisation, Year, Role, Result, Filter, Image, Image alt text, Evidence link text, Evidence link, Button, Link, Quote, Credit and so on). Plain paragraphs for prose.
   - The export escapes square brackets as `\[` and `\]`: unescape them. Markdown links `[text](url)` may appear inside prose.
   - Anything marked `[TO DO]` must show on the site as a visible, styled gap (for example a dashed outline box with the TO DO text), never hidden.
   - Parse into typed data (sections, 6 projects, filters) and fail the build loudly if a required field is missing.
2. **Look: `design/` and the spec below.** `design/*.html` are the approved phone mock-ups (390px wide) exported from the design canvas. They are reference markup, not production code: copy their structure, sizes and styling, rebuild them as clean Astro components with CSS (no inline styles). `{{...}}` placeholders in them are from the design tool; ignore them. Open them in a browser to see them.
3. **Assets: `assets/`.** Images, SVG covers and rules, the star logo, the font, and the 2 Worker Feedback Club graphics as PNGs.

## 4. Page order
1. Sticky top bar.
2. Top of page ("Top B", see section 5).
3. Selected projects: heading, intro, filter row, 6 project cards in copy.md order. Each card opens its pop-up.
4. Track record (label, intro, 3 figures).
5. What I want to work on (3 causes, the closing ask, people I'd like to meet), then the top of page's 3 buttons again.
6. Testimonials (3 quotes).
7. Contact and footer, with "View my CV".
Sections follow the order of copy.md.
Pop-ups: one per project, "Try it yourself" (Full Cycle Writing Workshop), and the CV (with a download option, written last).

Sections 3 and 5 to 8 have no mock-up yet. Build them from the spec: same type scale, 2px ink lines, wavy rules as separators, pill buttons, and a star divider between sections.

**Star divider**: wherever the page or a pop-up has a divider, it is 3 stars in a row (18px each), evenly spaced and centred. Each star is its own element carrying its position (`--star-index` 0, 1, 2) so they can be animated separately later. All dividers come from one component (`StarDivider`).

## 5. Components and behaviour
**Sticky top bar** (design/01): 48px tall, paper background, 2px ink bottom rule. Left: the star (11px), then the Label from `## Top bar` in copy.md (13px, 600). Right, side by side: an "Email" link with a small envelope icon (Email button, mailto the Contact email), then a "Share" button with a share icon. Both plain, no outline, 14px, 700, at least 44px tall. Share calls `navigator.share` with the page title and URL; where that is unavailable, copy the URL and show a short "Link copied" message. Everything fits on one line at 390px; below 360px the buttons tighten and the label may wrap to 2 lines, but the icons never shrink.

**Top of page** ("Top B"): all words from `## Top of page` in copy.md (Name, Headline, Subtitle, Main button, Email button, CV link, Contact email, then `### Share this site with` with a lead-in paragraph and a bulleted list, and `### Closing line` with one paragraph). Phone first: 390px wide, 20px side gutter, 18px gap between items, in this order:
- Portrait (portrait-shed.jpg): full width, 200px tall, object-fit cover, object-position 50% 28%, 2px ink border, radius 20, no cover.
- Headline as the h1: 40px, 800, width 62%, line height 0.92.
- Subtitle: 17px, 500, line height 1.45. Markdown `**bold**` renders as `<strong>` (weight 800) and `*italics*` as `<em>`.
- Share box: wavy lines on all 4 sides (rule-wavy.svg top and bottom at 10px high, wave-v.svg left and right at 10px wide), 5px outer padding, inner padding 18px 18px 20px, 12px gap. Lead-in at 22px, 800, width 62%, line height 1; then the bulleted list at 16px, line height 1.4, 8px gap.
- Closing line: 16px, line height 1.5.
- Buttons stacked with a 10px gap: Main button, a black pill (52px, share icon, 17px, 700) using the same share function as the top bar; Email button ("Get in touch"), a 2px outline pill (52px, envelope icon) linking to the contact email; CV link, a centred underlined link (15px, 600, at least 44px tall) that opens the CV pop-up.
Then a centred star divider before "Selected projects". The sticky top bar stays as described above. The same 3 buttons appear again after "People I'd like to meet", before the testimonials.

**Contact**: the heading, then one black "Get in touch" pill (Email button under `## Contact and footer`, mailto the Email field), then 2 round 48px icon links (2px ink circles) to LinkedIn and Substack, opening in a new tab. No email address shown and no CV button here.

**Interface words**: every word a visitor reads, including button labels, headings and confirmations, comes from copy.md. If a component needs a word that copy.md doesn't have yet, flag it to Harrison and add a field rather than writing the word into the code.

**Filter row**: a small "Filter by" label above (Filter label under `## Projects` in copy.md; 13px, 600, grey #4A4A46), then 4 filter chips (All, Helping people learn, Building communication tools, Designing compelling experiences) that look like filters, not like the main pill buttons. Each chip: corner radius 8px, 2px ink border, white fill, at least 44px tall, 12px padding left and right, 8px gap between chips, wrapping onto more lines on a phone; text 14px, 600. Inside, in order: an icon (All: the star at 16px; the others: icon-learn.svg, icon-talk.svg, icon-experience-logo-star.svg at 18px tall in their own proportions), the label, then the number of projects under that filter (12px, 600, grey), counted from copy.md, never typed in. Chosen chip: solid ink fill, off-white text, star and icons off-white (icons via `filter: invert(1)`), count in off-white at 75% opacity. One chip chosen at a time; use `aria-pressed`. "All" is active on load. Filtering shows or hides cards without reloading; keep the URL in sync (for example `?filter=learning`).

**Project card** (design/02): white card, 2px ink border, radius 20, overflow hidden. Lead image 220px tall with a 2px bottom rule. Then the filter label (13px, 600), title (40px, 800, width 62%), result (17px), and 2 actions: "Read the case study" (black pill, opens the pop-up) and the evidence link text as an underlined link. No organisation, year or role squares on the card. Before the filter label sits that filter's icon from assets/svg (icon-learn.svg for Helping people learn, icon-talk.svg for Building communication tools, icon-experience-logo-star.svg for Designing compelling experiences): 20px tall, width following the icon's own proportions, 8px gap before the label, empty alt text because the label says what it is. The same icons, at the same size and gap, sit before the filter label at the top of each project pop-up. They do not appear on the filter buttons.

**Covers on card images** (design/03 is the working reference): each card image has a cover on top of it. The cover is the filter's SVG pattern (cover-straight.svg for Building communication tools, cover-wavy.svg for Helping people learn, cover-contour.svg for Designing compelling experiences) over a paper wash at 45% opacity, with a 2px ink left edge. As the card scrolls into view, the cover slides right in step with the scroll (translateX from 0% to 92%) and the photo goes from greyscale to full colour. Progress = clamp((scrollY + viewport height − image top − 120) / (viewport height × 0.55), 0, 1). Use `requestAnimationFrame` and passive scroll listeners, or CSS scroll-driven animations with a JavaScript fallback. With `prefers-reduced-motion: reduce`, show photos uncovered and in colour. Never cover the portrait.

**Project pop-up** (design/04): on a phone, a full-screen sheet sliding up over the page (radius 24 at the top, 2px ink top edge); on larger screens a centred sheet up to 720px wide over a dimmed page. Order: filter label and a round close button (48px); title (72px, 800, width 62%); result (21px, 500); organisation, year and role in 3 equal squares drawn entirely with wavy lines (rule-wavy.svg on top and bottom, wave-v.svg on both sides and between squares; labels 11px grey, values 12.5px, width 85%); lead image (radius 16, cover slides off as above); The problem or The challenge, What I did, What happened (28px sub-headings, 17px body); "What this shows" in a hand-drawn black panel with paper text and a paper star as an end mark (copy the SVG shape from design/04); pull quote (40px, 800, width 62%) with credit; a centred star divider; "Evidence" heading; then the evidence gallery and links; then any Further reading, Learn more or Try it yourself buttons from copy.md.
- Behaviour: opens from the card button, traps focus, closes on the close button, Escape and the browser back button. Each pop-up has its own URL hash (for example `#worker-feedback-club`) so it can be shared and opened directly. Restore scroll position and focus on close.

**Evidence gallery** (design/04): a large frame (radius 16, 2px ink, 260px image area, caption strip below) and a row of 4 square thumbnails (radius 10). Unselected thumbnails are greyscale under the project's cover pattern; tapping one lifts its cover, puts it in colour and shows it in the large frame. Line above: "Tap a picture to lift its cover." Use real buttons with labels. More than 4 images: let the row wrap.

**Evidence links** (design/04): full-width outline pills, label on the left, and on the right a small icon plus a type word: a document icon and "PDF" for PDFs, an arrow-out-of-a-box icon and "Link" for web links. PDFs are hosted on the site and open in a new tab.

**Share card**: set Open Graph and Twitter tags from copy.md (Page title, Share card title, Share card description, Share image, Share image alt text). Use the star as the favicon (black on paper).

## 6. Design spec
- **Colour**: ink #111111 (text, lines, buttons); paper #FAFAF7 (page); white #FFFFFF (cards); grey #4A4A46 (small labels only). No other colours. Photos bring the colour.
- **Type: Archivo** (variable: width 62 to 125, weight 100 to 900).
  - Headline 58px, 800, width 62%, line height 0.88.
  - Pop-up title 72px, 800, 62%, line height 0.86.
  - Section heading 56px, 800, 62%, line height 0.9.
  - Card title and pull quote 40px, 800, 62%, line height 0.92 to 0.95.
  - Sub-heading 28px, 800, 62%.
  - Roles 19px, 700, width 85%.
  - Lead and pitch 17 to 21px, 500, line height 1.35 to 1.45.
  - Body 17px, 400, line height 1.55.
  - Buttons and links 15 to 17px, 600 to 700.
  - Labels 13px, 600.
  - Fine print 11 to 12.5px, 500, width 85%.
  - Scale down headings slightly on very narrow screens (below 360px) rather than letting words overflow.
- **Lines**: always 2px ink, straight or wavy. Wavy rules use the SVGs provided.
- **Shapes**: cards and images radius 20 (16 inside pop-ups), thumbnails 10, pop-up sheet 24 at the top, buttons fully rounded pills, at least 44px tall (main buttons 52px).
- **Spacing**: steps of 4, 8, 14, 18, 22, 28 and 40px. Phone gutter 20px. Card padding 18px.
- **Layout on larger screens**: one centred column, about 680 to 720px wide, same components. No multi-column layouts.
- **Image style**: full colour inside a 2px ink frame with rounded corners, cropped to fill. Project images covered as described in section 5. Graphics and diagrams use only ink, paper, wavy lines and Archivo.
- **Icons**: simple line icons, 16px, 1.5px stroke. The star (assets/svg/star.svg) is the only filled mark. Its uses: active filter, top bar, section dividers, end marks.

## 7. Assets
Provided in `assets/`:
- images: portrait-shed.jpg, euston-presenting.jpg (Worker Feedback Club lead), winners-2017.jpg (The Steel Core lead), render.jpg, proposal-together.jpg, proposal-typeface.jpg.
- svg: cover-straight.svg, cover-wavy.svg, cover-contour.svg, rule-wavy.svg, wave-v.svg, star.svg.
- graphics: wfc-chart.png and wfc-anatomy.png (Worker Feedback Club evidence, 2x). Their HTML sources are design/10 and design/11. Rebuilding them as inline HTML/SVG is fine if it keeps them sharp and accessible.
- fonts: archivo-variable.woff2.

Harrison still needs to supply these. Use visible placeholders until he does:
- share-card.jpg (portrait cropped to 1200 by 630).
- tempr-home.jpg and notion-prompts.jpg.
- The 6 Worker Feedback Club product screens.
- The Full Cycle Writing Workshop lead image (Zoom cohort screenshot) and form-1-letter.jpg, form-2-listicle.jpg, form-3-dialogue.jpg.
- proposal-in-hand.jpg and proposal-technical-drawing.jpg.
- design-proposal-2017.pdf and docfest-2020-letter.pdf.
- Solo show images.
Optimise all images (responsive sizes, WebP or AVIF with JPEG fallback, width and height set, lazy-load below the fold).

## 8. Quality bar
- Accessible: semantic HTML, real buttons and links, visible focus states (2px ink outline with offset), alt text from copy.md, text contrast at least 4.5:1, touch targets at least 44px, pop-ups as proper dialogs, reduced motion respected.
- Fast: Lighthouse 90 or more on mobile for performance and accessibility. Minimal JavaScript, no layout shift.
- Check on a real phone (around 390px wide) at every step, as well as narrow (320px) and desktop.

## 9. Before publishing (flag to Harrison, don't decide)
- Any interface words still written into the code rather than copy.md (see "Interface words" in section 5).
- The design proposal PDF shows Harrison's old phone number and RCA email on every page, and the Doc/Fest commissioner's email on page 1. Strip or cover these, or show selected pages as images.
- Remaining `[TO DO]` gaps in copy.md (for example the Tempr NVC text and evidence, the Solo show images, the contact heading and footer, the CV).

## 10. Working method
Set up the repo and Astro project, add copy.md and the parser first, then build the page top to bottom in this order: top bar, top of page, filters and cards, covers, pop-up, evidence gallery, remaining sections, CV pop-up, share card. Commit small steps with clear messages. Deploy to Vercel early so Harrison can check each step on his phone.

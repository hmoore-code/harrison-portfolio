# Build brief: Harrison Moore's portfolio site

For Claude Code. Written 26 October 2026. British English, sentence case and no em dashes in anything visitors read.

## 1. What this is
A single-page portfolio that helps Harrison Moore find his next role in learning and programme design, or user research and partnerships. 2 kinds of visitor: hiring managers who must "get" him in 30 seconds on a phone, and connectors who want something easy to forward. Phone first. Every claim on the site is backed by evidence (photos, PDFs, links).

## 2. Stack
- Astro, static output, no client-side framework. Small amounts of plain JavaScript for the filters, pop-ups, scroll-linked covers, share and copy buttons.
- GitHub repository, hosted on Vercel's free Hobby plan, deploying on every push.
- Self-host the Archivo variable font (use the `@fontsource-variable/archivo` package, the width axis version, or the file in `assets/fonts/`). Do not load Google Fonts at runtime.

## 3. Sources of truth
1. **Words: `content/copy.md`.** An export of the "Live copy" tab of Harrison's Site copy doc. The site must read this file at build time so copy changes never need code changes. Format:
   - `## Section` and `## Project: <name>` headings; `###` sub-parts (The problem or The challenge, What I did, What happened, What this shows, Evidence, Pull quote, Try it yourself, Further reading, Learn more, Exhibition list); `####` items inside a sub-part (the 3 forms in Try it yourself).
   - `Label: value` lines for short fields (Title, Organisation, Year, Role, Result, Filter, Image, Image alt text, Evidence link text, Evidence link, Button, Link, Quote, Credit and so on). Plain paragraphs for prose.
   - The export escapes square brackets as `\[` and `\]`: unescape them. Markdown links `[text](url)` may appear inside prose.
   - Anything marked `[TO DO]` must show on the site as a visible, styled gap (for example a dashed outline box with the TO DO text), never hidden.
   - Parse into typed data (sections, 6 projects, filters) and fail the build loudly if a required field is missing.
2. **Look: `design/` and the spec below.** `design/*.html` are the approved phone mock-ups (390px wide) exported from the design canvas. They are reference markup, not production code: copy their structure, sizes and styling, rebuild them as clean Astro components with CSS (no inline styles). `{{...}}` placeholders in them are from the design tool; ignore them. Open them in a browser to see them.
3. **Assets: `assets/`.** Images, SVG covers and rules, the star logo, the font, and the 2 Worker Feedback Club graphics as PNGs.

## 4. Page order
1. Sticky top bar.
2. Top of page.
3. Track record ("My work in numbers", 3 figures).
4. Selected projects: heading, intro, filter row, 6 project cards. Each card opens its pop-up.
5. What I want to work on (3 causes and the closing ask).
6. How you can help: roles, sectors, people I'd like to meet, and the forwarding message with a "Copy this message" button.
7. Testimonials (3 quotes).
8. Contact and footer, with "View my CV".
Pop-ups: one per project, "Try it yourself" (Full Cycle Writing Workshop), and the CV (with a download option, written last).

Sections 3 and 5 to 8 have no mock-up yet. Build them from the spec: same type scale, 2px ink lines, wavy rules as separators, pill buttons, and the star as a small section divider.

## 5. Components and behaviour
**Sticky top bar** (design/01): 48px tall, paper background, 2px ink bottom rule. Left: "Portfolio", the star (11px), "Harrison Moore" (13px, 600). Right: a plain "Share" button with a share icon, no outline, at least 44px tall. Share calls `navigator.share` with the page title and URL; where that is unavailable, copy the URL and show a short "Link copied" message.

**Top of page** (design/01): portrait (portrait-shed.jpg, 200px tall, cropped to 50% 28%, no cover); headline "Harrison Moore is looking for his next role"; the 2 roles as lines with a wavy rule above, between and below (rule-wavy.svg); the pitch; "Email me" (black pill, mailto link) and "View my CV" (outline pill) side by side; "Know someone hiring? Here's how to help." linking to How you can help. Then a centred star divider before "Selected projects". Note: some of these words are not yet in copy.md (see section 9).

**Filter row** (design/02, design/05): 4 pill buttons (All, Helping people learn, Building communication tools, Designing compelling experiences), wrapping onto 2 lines on a phone. Inactive: paper fill, 2px ink border. Active: solid ink fill, paper text, the star (15px, paper colour) before the label. Use `aria-pressed`. "All" is active on load. Filtering shows or hides cards without reloading; keep the URL in sync (for example `?filter=learning`).

**Project card** (design/02): white card, 2px ink border, radius 20, overflow hidden. Lead image 220px tall with a 2px bottom rule. Then the filter label (13px, 600), title (40px, 800, width 62%), result (17px), and 2 actions: "Read the case study" (black pill, opens the pop-up) and the evidence link text as an underlined link. No organisation, year or role squares on the card.

**Covers on card images** (design/03 is the working reference): each card image has a cover on top of it. The cover is the filter's SVG pattern (cover-straight.svg for Building communication tools, cover-wavy.svg for Helping people learn, cover-contour.svg for Designing compelling experiences) over a paper wash at 45% opacity, with a 2px ink left edge. As the card scrolls into view, the cover slides right in step with the scroll (translateX from 0% to 92%) and the photo goes from greyscale to full colour. Progress = clamp((scrollY + viewport height − image top − 120) / (viewport height × 0.55), 0, 1). Use `requestAnimationFrame` and passive scroll listeners, or CSS scroll-driven animations with a JavaScript fallback. With `prefers-reduced-motion: reduce`, show photos uncovered and in colour. Never cover the portrait.

**Project pop-up** (design/04): on a phone, a full-screen sheet sliding up over the page (radius 24 at the top, 2px ink top edge); on larger screens a centred sheet up to 720px wide over a dimmed page. Order: filter label and a round close button (48px); title (72px, 800, width 62%); result (21px, 500); organisation, year and role in 3 equal squares drawn entirely with wavy lines (rule-wavy.svg on top and bottom, wave-v.svg on both sides and between squares; labels 11px grey, values 12.5px, width 85%); lead image (radius 16, cover slides off as above); The problem or The challenge, What I did, What happened (28px sub-headings, 17px body); "What this shows" in a hand-drawn black panel with paper text and a paper star as an end mark (copy the SVG shape from design/04); pull quote (40px, 800, width 62%) with credit; a centred star divider; "Evidence" heading; then the evidence gallery and links; then any Further reading, Learn more or Try it yourself buttons from copy.md.
- Behaviour: opens from the card button, traps focus, closes on the close button, Escape and the browser back button. Each pop-up has its own URL hash (for example `#worker-feedback-club`) so it can be shared and opened directly. Restore scroll position and focus on close.

**Evidence gallery** (design/04): a large frame (radius 16, 2px ink, 260px image area, caption strip below) and a row of 4 square thumbnails (radius 10). Unselected thumbnails are greyscale under the project's cover pattern; tapping one lifts its cover, puts it in colour and shows it in the large frame. Line above: "Tap a picture to lift its cover." Use real buttons with labels. More than 4 images: let the row wrap.

**Evidence links** (design/04): full-width outline pills, label on the left, and on the right a small icon plus a type word: a document icon and "PDF" for PDFs, an arrow-out-of-a-box icon and "Link" for web links. PDFs are hosted on the site and open in a new tab.

**How you can help**: the forwarding message sits in a card with a "Copy this message" pill that copies the message plus the site URL, then confirms "Copied".

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
- Add these to Live copy so they come from copy.md: "Portfolio · Harrison Moore" (top bar), "Share", the headline "Harrison Moore is looking for his next role" (currently the share card title), "Know someone hiring? Here's how to help." (replaces the purpose line), "Read the case study", "Tap a picture to lift its cover", "Copied" and "Link copied".
- The design proposal PDF shows Harrison's old phone number and RCA email on every page, and the Doc/Fest commissioner's email on page 1. Strip or cover these, or show selected pages as images.
- Remaining `[TO DO]` gaps in copy.md (for example the Tempr NVC text and evidence, the Solo show images, the contact heading and footer, the CV).

## 10. Working method
Set up the repo and Astro project, add copy.md and the parser first, then build the page top to bottom in this order: top bar, top of page, filters and cards, covers, pop-up, evidence gallery, remaining sections, CV pop-up, share card. Commit small steps with clear messages. Deploy to Vercel early so Harrison can check each step on his phone.

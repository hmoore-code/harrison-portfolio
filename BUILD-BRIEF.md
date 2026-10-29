# Build brief: Harrison Moore's portfolio site

For Claude Code. Written 26 October 2026. British English, sentence case and no em dashes in anything visitors read.

## 1. What this is
A single-page portfolio that helps Harrison Moore find his next role in learning and programme design, or user research and partnerships. 2 kinds of visitor: hiring managers who must "get" him in 30 seconds on a phone, and connectors who want something easy to forward. Phone first. Every claim on the site is backed by evidence (photos, PDFs, links).

## 2. Stack
- Astro, static output, no client-side framework. Small amounts of plain JavaScript for the filters, pop-ups, scroll-linked covers, share and copy buttons.
- GitHub repository, hosted on Vercel's free Hobby plan, deploying on every push.
- Self-host the Archivo variable font (use the `@fontsource-variable/archivo` package, the width axis version, or the file in `assets/fonts/`). Do not load Google Fonts at runtime. Every quote and testimonial (pop-up pull quotes, quotes in the evidence, the testimonials section) uses Instrument Serif italic, weight 400, self-hosted from `@fontsource/instrument-serif` (imported in the base layout, used through the `--font-quote` token): pull quotes 40px with line height 1.05, other quotes and testimonials 21px with line height 1.35.

## 3. Sources of truth
1. **Words: `content/copy.md`, the single source of every word visitors read.** Harrison edits it directly; there is no other copy to keep in step. The site reads this file at build time so copy changes never need code changes. Never hard-code visitor-facing words in components. Format:
   - `## Section` and `## Project: <name>` headings; `###` sub-parts (the case study parts, such as The challenge, What I did or What I built, What happened or The impact, which keep their own headings and order; The skills I could bring to your team, More details about this project, Pull quote, Try it yourself, Further reading, Learn more, Exhibition list); `####` items inside a sub-part (the 3 forms in Try it yourself).
   - `Label: value` lines for short fields (Title, Organisation, Year, Role, Result, Filter, Image, Image alt text, Pop-up image, Pop-up image alt text, Evidence link text, Evidence link, Button, Link, Quote, Credit and so on). Plain paragraphs for prose.
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

**Star divider**: wherever the main page has a divider, it is 3 stars in a row (18px each), evenly spaced and centred. Each star is its own element carrying its position (`--star-index` 0, 1, 2) so they can be animated separately later. All dividers come from one component (`StarDivider`). Pop-ups have no star dividers and no star end marks.

## 5. Components and behaviour
**Sticky top bar** (design/01): 48px tall, paper background, 2px ink bottom rule. Left: the Label from `## Top bar` in copy.md (13px, 600). Right, side by side: an "Email me" link with a small envelope icon (Email button, mailto the Contact email), then a "Share" button with a share icon. Both plain, no outline, 14px, 700, at least 44px tall. Share calls `navigator.share` with the page title and URL; where that is unavailable, copy the URL and show a short "Link copied" message. Everything fits on one line at 390px; below 360px the buttons tighten and the label may wrap to 2 lines, but the icons never shrink.

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

**Project card** (design/02): white card, 2px ink border, radius 20, overflow hidden. Lead image 220px tall with a 2px bottom rule. Then the filter label (13px, 600), title (Title field; 40px, 800, width 62%), subtitle (Result field; 17px), the skills line, and one action: the project's own Card button (black pill, for example "Try Tempr" or "See the trophies"), which always opens that project's pop-up. The title is also a link to the project's own #link and opens the pop-up the same way: it keeps its ink colour and no underline, shows an underline on hover (devices with a mouse only) and the usual 2px focus outline for keyboard users, and screen readers hear the title followed by the Card title hint under `## Projects` ("case study"). Title, Result, Skills and Card button are per-project fields in copy.md; Title also heads the pop-up; Result appears on the card only.
- Skills line: one line under the subtitle, the 💎 emoji then the Skills field as written, separated by commas (14px, 600).
- The 💎 glints every 4 seconds, using CSS animation only: a quick diagonal shine sweeps across it, it scales up slightly, and a small ink sparkle appears and fades, about 0.6s in all. Each card starts its glint at a different moment (0.7s apart) so they don't flash together. Under reduced motion there is no animation. No organisation, year or role squares on the card. Before the filter label sits that filter's icon from assets/svg (icon-learn.svg for Helping people learn, icon-talk.svg for Building communication tools, icon-experience-logo-star.svg for Designing compelling experiences): 20px tall, width following the icon's own proportions, 8px gap before the label, empty alt text because the label says what it is. The same icons, at the same size and gap, sit before the filter label at the top of each project pop-up. They do not appear on the filter buttons.

**Covers on card images** (design/03 is the working reference): each card image has a cover on top of it. The cover is the filter's SVG pattern (cover-straight.svg for Building communication tools, cover-wavy.svg for Helping people learn, cover-contour.svg for Designing compelling experiences) over a paper wash at 45% opacity, with a 2px ink left edge. As the card scrolls into view, the cover slides right in step with the scroll (translateX from 0% to 92%) and the photo goes from greyscale to full colour. Progress = clamp((scrollY + viewport height − image top − 120) / (viewport height × 0.55), 0, 1). Use `requestAnimationFrame` and passive scroll listeners, or CSS scroll-driven animations with a JavaScript fallback. With `prefers-reduced-motion: reduce`, show photos uncovered and in colour. Never cover the portrait.

**Project pop-up** (design/04): on a phone, a full-screen sheet sliding up over the page, with the project's cover pattern behind it (its filter's pattern, the same as its card: wavy, straight or contour; the Try it yourself and CV pop-ups keep straight diagonal lines) (radius 24 at the top, 2px ink top edge); on larger screens a centred sheet up to 720px wide over a dimmed page. Order: filter label and a round close button (48px); title (72px, 800, width 62%); no Result (that stays on the card); organisation, year and role in 3 equal squares drawn entirely with wavy lines (rule-wavy.svg on top and bottom, wave-v.svg on both sides and between squares; labels 11px grey, values 12.5px, width 85%); lead image from the "Pop-up image" field (with "Pop-up image alt text"), falling back to the card's Image and alt text when either is missing (radius 16, full colour, no cover: covers appear only on the project cards and the evidence gallery thumbnails); the case study parts in copy.md order with their own headings (28px sub-headings, 17px body); a paragraph that is only a Markdown image, `![alt text](file.jpg)`, shows that picture in place, square, cropped to fill, full text width, 2px ink border, radius 16; with a caption in quotes, `![alt text](file.jpg "Caption")`, the picture shows whole instead (not cropped, 8px above and below) with the caption under it (12px, grey, line height 1.4, 8px gap); `![alt text](file.png){16:9}` shows the picture whole at 16:9 (8px above and below); `{whole}` instead shows it whole in its own shape (full text width, no border); a bullet list in a case study part shows in its place among the paragraphs (17px, line height 1.55, 4px apart, 22px indent); a link written `[text](#project-link)` opens that project's pop-up; a paragraph that is only `[<name> goes here]` (for example `[NVC graphic goes here]`) shows that graphic, built in code (`src/components/graphics/`), with its words under a `#### <name>` placed at the end of the same case study part; pull quote (40px, Instrument Serif italic) with credit; "The skills I could bring to your team 🫵" (every project's heading ends with the 🫵) in a box drawn with the same wavy lines as the facts squares (rule-wavy.svg top and bottom, wave-v.svg on the sides), ink text on the paper background, paragraphs and an optional bullet list whose bullets are the star (assets/svg/star.svg, ink, 12px, centred on the first line of each item, 10px before the text; still a real list for screen readers via `role="list"`) then one closing sentence shared by every pop-up (Skills box closing line under `## Projects`; same 17px body text as the box, 14px above it), and, under that, 2 buttons stacked full width, 8px apart, 52px tall, 18px below the text: "Share this project" (Share project button under `## Projects`; black pill with the share icon, like "Share this site"), which shares a link to that pop-up's own #link via the share sheet, or copies it and shows "Link copied"; and "Get in touch" (Get in touch button under `## Projects`; outline pill with the envelope icon, mailto the Contact email). The "Link copied" message moves inside an open pop-up so it shows above it and screen readers announce it; then "More details about this project" (see its own section below); then any Further reading, Learn more or Try it yourself buttons from copy.md.
- Behaviour: opens from the card button, traps focus, closes on the close button, Escape and the browser back button. Each pop-up has its own URL hash (for example `#worker-feedback-club`) so it can be shared and opened directly. Restore scroll position and focus on close.

**Evidence gallery** (design/04; only in pop-ups whose "More details about this project" hasn't been redesigned yet): a large frame (radius 16, 2px ink, 260px image area, caption strip below) and a row of 4 square thumbnails (radius 10). Unselected thumbnails are greyscale under the project's cover pattern; tapping one lifts its cover, puts it in colour and shows it in the large frame. Line above: "Tap a picture to lift its cover." Use real buttons with labels. More than 4 images: let the row wrap.

**Evidence links** (design/04): full-width outline pills, label on the left, and on the right a small icon plus a type word: a document icon and "PDF" for PDFs, an arrow-out-of-a-box icon and "Link" for web links. PDFs are hosted on the site and open in a new tab.

**Share card**: set Open Graph and Twitter tags from copy.md (Page title, Share card title, Share card description, Share image, Share image alt text). Use the star as the favicon (black on paper).

### More details about this project

Rules for every project pop-up:

1. Every project pop-up ends with a section called "More details about this project" (36px, Archivo 800, width 62%, line height 0.95; 18px between the parts of the section). It replaces "Evidence" everywhere: in copy.md each project has `### More details about this project` where `### Evidence` used to be.
2. Each project's section is designed on its own, because every project is different. Never copy one project's section into another, and don't build a shared template for the content. Each one is its own component in `src/components/more-details/`, reading its own words from under that project's `### More details about this project` in copy.md, and stopping the build if any are missing. `ProjectDialog` lists which projects have their own component; the others still show their pictures, quotes and links from copy.md until they're redesigned.
3. Building blocks that stay the same across projects:
   - Subheadings: 28px, Archivo 800, width 62%. Body text: 16px.
   - A wavy line (rule-wavy.svg, `WavyRule`) between parts of the section.
   - Tabs: equal-width square-cornered buttons (8px corners, 2px ink border, 48px tall, 15px 700), like the filter chips. The chosen tab is solid ink with off-white text and the star (15px) before its label. Proper accessible tabs (`role="tablist"`, `tab`, `tabpanel`, `aria-selected`, only the chosen tab in the Tab order, Left and Right arrows, Home and End; `scripts/tabs.ts`, styles in global.css). A button elsewhere with `data-show-tab="<tab id>"` switches to that tab, moves focus to it and scrolls back up so the tabs sit just under the pop-up's top bar.
   - Links to Harrison's writing elsewhere (`ExternalLink`): underlined (2px, 4px offset), bold 16px, with the new-tab icon (a box with an arrow coming out of it), at least 44px tall, opening in a new tab, and announced to screen readers with the New tab hint under `## Projects` ("opens in a new tab"). The same hint is used for every other new-tab link on the site.
   - Colour is only used inside data graphics, where it carries meaning.
   - No star dividers inside pop-ups.
4. Remove the old image carousel and "Tap an image to view it" hint from any pop-up whose section has been redesigned.

**Construction site feedback platform** (Worker Feedback Club; design/12-wfc-more-details.html, sizes, spacing and colours exactly as there; `more-details/WorkerFeedbackClub.astro`). No image carousel and no Further reading button (the essay link replaces it). In copy.md, the 1st `####` is the engagement part and its `#####` parts are the 2 tabs; the 5 `######` parts under the method tab are the steps; the 2nd `####` is the reflections.

- Subheading "The anatomy of our platform's engagement" (6px extra space above), the intro, then 2 tabs, "Our method" and "What we found" (Tabs label "Research" for screen readers).
- Our method: 5 step cards (white, 2px ink, radius 20, 16px padding; a 52px column for the number, 52px 800 width 62%; 14px gap; title 24px 800 width 62%; text 15px, 1.45) in a numbered list, joined by 30px lengths of wave-v.svg. Step 2 lists the 3 ways of collecting feedback (15px, 600) with their own 24px ink icons copied from the design file. Then "What happened next" (4px extra space above, 10px under the heading, 16px text with bold phrases) and a black "See what we found" pill (52px, 16px 700, arrow after) that switches to the other tab and scrolls up to the tabs.
- What we found: heading (28px, line height 1), intro with the quote in bold, the scale line (13px, 600, grey), then 2 rating graphics (white, radius 20, 18px padding, 12px gaps, border and label 15px 700 in the graphic's colour; a row of 5 score boxes 48px tall, radius 10, 6px apart, with the chosen scores filled in that colour; the figure 44px 800 width 62% in that colour beside its result, 15px). Face to face in dark green #1E5631, anonymous app in dark red #8B1E1E. Each graphic is a single image to screen readers, described by its "description" field. The chosen scores come from copy.md ("4, 5" and "1"). Then a wavy line (4px extra space above), "What happened next" (6px under the heading, 17px text, line height 1.5) and an outline "Our method" pill on white (arrow before) that switches back and scrolls up.
- After both tabs: a wavy line (10px extra space above), "Business success and failure: my reflections" (line height 1), the sentence about the essay, and a "Read my essay" link to the essay with the new-tab icon.

**Angry words app** (Tempr; design/13-tempr-popup.html; `more-details/Tempr.astro`).

- Pop-up image tempr-on-phone.png, shown full width at 16:9 rather than the usual 236px height (Tempr only).
- The 4-part NVC framework graphic inside "What I did", between its 2 paragraphs (`graphics/NvcGraphic.astro`, words under `#### NVC graphic`: Title, Line 1 to Line 4, the blank to fill in written in [square brackets]). Real HTML, not an image, in Tempr's own cream and taupe: cream #F0E8DB outer card (2px ink border, radius 16, 18px 16px 16px padding, 14px gap, 8px above and below), inner card the same cream with a 1px #D9CDBB border (radius 18, 18px 14px padding, 14px between lines), all in Instrument Serif italic 400 with a 0.67px text stroke to make it slightly heavier (the font has no bolder weight). All text ink #111111. Title 26px; lines 19px, line height 1.15, each followed by a dotted taupe #B8A99B line (2px) filling the rest of the row; line 4 ends with "?". Screen readers hear it as one image whose label is the title and all 4 lines.
- More details: no carousel, user quotes, link pill or Learn more button. Each line under `### More details about this project` ("Try Tempr: https://...") becomes an `ExternalLink`, with a wavy line between them: "Try Tempr" and "Read more about NVC on Wikipedia".

**Writer's prompt library** (Clever constraints for writers; design/14-prompts-popup.html; `more-details/WritersPrompts.astro`).

- Pop-up image prompt.png at 16:9, like Tempr's, so the prompt's words aren't cut off. The card keeps notion-prompts.
- A swipe strip of the 30 six-word life stories inside "What I did" (`graphics/SixWordStories.astro`, placed with `[6-word stories goes here]`; words under `#### 6-word stories`: List label, Card number "{number} of {total}", then 1 story per line). A row of cards running edge to edge of the pop-up, scroll-snap to the text's left edge, 12px apart, the next card peeking in. Each card 328px wide (narrower on small screens: the strip's width less 22px), at least 240px tall, #DDFFF7, radius 16, padding 22; the story in curly speech marks, Instrument Serif italic 34px, line height 1.1, #71A9F7; "N of 30" below in 16px bold #71A9F7. Only those 2 colours. A real list (`role="list"`) with the List label, focusable so arrow keys scroll it.
- Corina's tapestry (tapestry.jpg) shown whole with its caption, after the paragraph about it. "writing workshop" in The impact opens the workshop pop-up.
- More details: one black pill, "View all writing prompts" (52px, 17px 700, new-tab icon after), opening the Notion library in a new tab.

**Cohort-based writing workshop** (Full Cycle Writing Workshop; design/15-workshop-popup.html; `more-details/Workshop.astro`). No Try it yourself pop-up or button any more, and no link pills.

- Pop-up image full-cycle-writing.png at 16:9; aunt-sarah.png and dialogue.png whole at 16:9 inside "What I did", with the 3 questions as a bullet list between them. The card is unchanged (workshop-cohort.png).
- Words under `### More details about this project`: Writeup button and Writeup link; `#### Try a whole *library* of forms` (its paragraph, Benefits label, Example label, Button, then a `#####` per library form: emoji and name as the heading, the description, Benefits, and optionally Example with its Example link). The forms come from Harrison's Datawrapper table; Sir Ken Robinson's example links to the talk.
- Subheadings 24px, 800, width 62%, line height 1.
- Straight after the section heading: the library heading (*library* in italics) and its line. No form tiles (removed at Harrison's request).
- Library card: white, 2px ink, radius 16, 6px 6px hard ink shadow; the form at the top (22px 20px 20px padding, 14px gaps), then a wavy line and the button strip. Emoji and name in Instrument Serif 44px, upright (not italic); description 16px; "Benefits" and "Example" labels 12px 700 uppercase grey with 0.04em letter spacing, values 15px; the example is an underlined link with a 14px new-tab icon. No Example when a form has none. Never show how many forms there are. Starts on the 3rd form.
- "✨ Generate a new form" is the bottom strip of the card, the whole strip being the button: full width, #EEF57A, at least 60px tall, 20px padding, 17px 800 ink, words on the left and a 24px ink right arrow on the right. It swaps in a random form, never the same twice in a row. Only the form above it is a polite live region, so screen readers read the new form.
- "Read my post-workshop writeup (10 mins)": black pill with the new-tab icon.

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
- **Icons**: simple line icons, 16px, 1.5px stroke. The star (assets/svg/star.svg) is the only filled mark. Its uses: active filter, top bar, section dividers on the main page, end marks outside pop-ups.

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
- Remaining `[TO DO]` gaps in copy.md (for example the Solo show images, the contact heading and footer, the CV).

## 10. Working method
Set up the repo and Astro project, add copy.md and the parser first, then build the page top to bottom in this order: top bar, top of page, filters and cards, covers, pop-up, evidence gallery, remaining sections, CV pop-up, share card. Commit small steps with clear messages. Deploy to Vercel early so Harrison can check each step on his phone.

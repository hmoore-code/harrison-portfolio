// Reads content/copy.md at build time and turns it into typed site data.
// Missing required fields stop the build with a list of what to fix.

import source from '../../content/copy.md?raw';
import { parseTree, type Block, type Bullet, type MdNode } from './markdown-tree';

export type { Block, MdNode };

export interface Todo {
  todo: string;
}
export type Text = string | Todo;

export interface FileRef {
  file: string;
  note?: string;
}

export type Target =
  | { kind: 'url'; href: string }
  | { kind: 'files'; files: FileRef[] }
  | { kind: 'project'; slug: string }
  | { kind: 'quotes'; quotes: { name: string; quote: string }[] }
  | Todo;

export interface Filter {
  id: string;
  label: string;
  cover: 'wavy' | 'straight' | 'contour';
}

export interface EvidenceItem {
  label: string;
  target: Target;
}

export interface Story {
  heading: string;
  // Paragraphs and bullet lists in copy.md order.
  blocks: Block[];
  // "####" parts under the heading, e.g. the words for a graphic placed with "[NVC graphic goes here]".
  parts: MdNode[];
}

// A paragraph that is only a Markdown image, "![alt text](file.jpg)", shows as a picture.
// An optional caption in quotes, ![alt text](file.jpg "Caption"), shows under it.
// "{16:9}" straight after, ![alt text](file.png){16:9}, shows it whole at 16:9 instead of square;
// "{whole}" shows it whole in its own shape.
export function imageIn(
  paragraph: string,
): { image: FileRef; alt: string; caption?: string; shape?: '16:9' | 'whole' } | undefined {
  const match = paragraph.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)(?:\{(16:9|whole)\})?$/);
  return match
    ? { image: { file: match[2] }, alt: match[1], caption: match[3], shape: match[4] as '16:9' | 'whole' | undefined }
    : undefined;
}

// A paragraph that is only "[NVC graphic goes here]" shows the graphic whose words are under "#### NVC graphic".
export function graphicIn(paragraph: string): string | undefined {
  return paragraph.match(/^\[(.+) goes here\]$/i)?.[1];
}

export interface ExtraLink {
  heading: string;
  button: string;
  link?: Target;
  text?: Text;
}

export interface TryItYourself {
  heading: string;
  button: string;
  images: FileRef[];
  paragraphs: string[];
  forms: { heading: string; paragraphs: string[]; rules: string[] }[];
}

export interface Project {
  slug: string;
  name: string;
  filter: Filter;
  title: string;
  organisation: string;
  year: string;
  role: string;
  result: string;
  skills: string;
  cardButton: string;
  nextButton: string;
  evidenceLinkText: Text;
  evidenceLink: Target;
  image: FileRef | Todo;
  imageAlt: string;
  popupImage: FileRef | Todo;
  popupImageAlt: string;
  logo?: FileRef;
  story: Story[];
  skillsBox: { heading: string; paragraphs: string[]; bullets: string[] };
  headings: { moreDetails: string };
  // The project's "### More details about this project" as written, for a project whose
  // section has its own component (each project's section is designed on its own).
  moreDetails: MdNode;
  evidence: EvidenceItem[];
  pullQuote: { quote: string; credit: string };
  extras: ExtraLink[];
  tryItYourself?: TryItYourself;
  exhibitionList?: { heading: string; intro: string; items: string[] };
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const isTodo = (value: unknown): value is Todo =>
  typeof value === 'object' && value !== null && 'todo' in value;

// ---------- helpers ----------

const errors: string[] = [];

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function child(node: MdNode, heading: string | RegExp): MdNode | undefined {
  return node.children.find((c) =>
    typeof heading === 'string' ? c.heading.toLowerCase() === heading.toLowerCase() : heading.test(c.heading),
  );
}

function section(node: MdNode, heading: string): MdNode {
  const found = child(node, heading);
  if (!found) {
    errors.push(`Missing section "${heading}"`);
    return { heading, level: 0, bullets: [], paragraphs: [], blocks: [], children: [] };
  }
  return found;
}

export function optional(node: MdNode, label: string): string | undefined {
  return node.bullets.find((b) => b.label?.toLowerCase() === label.toLowerCase())?.value;
}

function required(node: MdNode, label: string): string {
  const value = optional(node, label);
  if (!value) {
    errors.push(`"${node.heading}" is missing "${label}: ..."`);
    return '';
  }
  return value;
}

// The prose under a heading, e.g. "### Closing line".
function prose(node: MdNode): string {
  if (!node.paragraphs.length) errors.push(`"${node.heading}" is missing its text`);
  return node.paragraphs.join(' ');
}

function list(node: MdNode): string[] {
  if (!node.bullets.length) errors.push(`"${node.heading}" is missing its bulleted list`);
  return node.bullets.map((b) => b.raw);
}

function unlabelled(node: MdNode, knownLabels: string[] = []): string[] {
  const known = knownLabels.map((l) => l.toLowerCase());
  return node.bullets.filter((b) => !b.label || !known.includes(b.label.toLowerCase())).map((b) => b.raw);
}

// "[TO DO: ...]" or a bracketed note becomes a visible gap; "[https://...]" is just the link.
function asText(value: string): Text {
  const bracketed = value.match(/^\[(.*)\]$/s);
  if (/\[TO DO/i.test(value)) return { todo: (bracketed ? bracketed[1] : value).trim() || 'TO DO' };
  if (bracketed) {
    if (/^https?:\/\/\S+$/.test(bracketed[1])) return bracketed[1];
    return { todo: `TO DO: ${bracketed[1]}` };
  }
  return value;
}

const FILE_PATTERN = /[\w\-/.*]+\.(?:jpe?g|png|webp|avif|gif|svg|pdf|mp4|webm|mov)\b/gi;

function filesIn(text: string): string[] {
  return text.match(FILE_PATTERN) ?? [];
}

function noteIn(text: string): string | undefined {
  const paren = text.match(/\(([^)]*)\)/);
  if (paren && filesIn(paren[1]).length === 0) return paren[1].trim();
  return undefined;
}

// Reads the value of an "Image:" line.
function asImage(value: string): FileRef | Todo {
  const text = asText(value);
  if (isTodo(text)) return text;
  const files = filesIn(text);
  if (!files.length) return { todo: `TO DO: ${text}` };
  return { file: files[0], note: noteIn(text) };
}

// Reads anything a link or evidence line can point at. Returns null for plain words.
interface TargetContext {
  knownFiles: string[];
  // Finds the project an evidence label names, e.g. "Writing Workshop case study".
  findProject: (label: string) => string | undefined;
}

function asTarget(value: string, ctx: TargetContext): Target | null {
  const text = asText(value);
  if (isTodo(text)) return text;
  if (/^https?:\/\//.test(text)) return { kind: 'url', href: text.split(/\s/)[0] };
  // "(links to the project above)": which project is worked out from the label in asEvidence.
  if (/^\(links to .*project.*\)/i.test(text)) return { kind: 'project', slug: '' };
  const files = filesIn(text);
  if (!files.length) return null;
  const note = noteIn(text);
  const expanded = files.flatMap((file) => {
    if (!file.includes('*')) return [file];
    const pattern = new RegExp('^' + basename(file).replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    const matches = ctx.knownFiles.filter((f) => pattern.test(basename(f)));
    return matches.length ? matches : [];
  });
  if (!expanded.length) return { todo: `TO DO: files for ${files.join(', ')}` };
  return { kind: 'files', files: [...new Set(expanded)].map((file) => ({ file, note })) };
}

export const basename = (file: string) => file.split('/').pop() ?? file;

// "Label: target", splitting at the last colon that leaves a real target on the right.
function asEvidence(raw: string, ctx: TargetContext, fallback: Target): EvidenceItem {
  // Only split at colons outside [brackets], so "[TO DO: https://...]" stays whole.
  const splits: number[] = [];
  let depth = 0;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '[') depth++;
    else if (raw[i] === ']') depth = Math.max(0, depth - 1);
    else if (raw[i] === ':' && depth === 0 && /\s/.test(raw[i + 1] ?? '')) splits.unshift(i);
  }
  for (const at of splits) {
    const target = asTarget(raw.slice(at).replace(/^:\s+/, ''), ctx);
    if (!target) continue;
    const label = raw.slice(0, at).trim();
    if ('kind' in target && target.kind === 'project' && !target.slug) {
      const slug = ctx.findProject(label);
      return { label, target: slug ? { kind: 'project', slug } : { todo: `TO DO: which project "${label}" links to` } };
    }
    return { label, target };
  }
  return { label: raw, target: fallback };
}

// Quotes under "#### Name" headings, each followed by the quote.
function quotesFrom(nodes: MdNode[]) {
  return nodes.map((n) => ({ name: n.heading, quote: n.paragraphs.join(' ').replace(/^["“]|["”]$/g, '') }));
}

// A bullet ending in ":" with indented "#### Name" + quote lines under it.
function asQuotes(bullet: Bullet): EvidenceItem {
  const quotes: { name: string; quote: string }[] = [];
  for (const line of bullet.nested ?? []) {
    const name = line.match(/^#{1,6}\s+(.+)$/);
    if (name) quotes.push({ name: name[1].trim(), quote: '' });
    else if (!/^#+\s*$/.test(line) && quotes.length) {
      const last = quotes[quotes.length - 1];
      last.quote = `${last.quote} ${line}`.trim();
    }
  }
  for (const q of quotes) q.quote = q.quote.replace(/^["“]|["”]$/g, '');
  return { label: bullet.raw.replace(/:\s*$/, ''), target: { kind: 'quotes', quotes } };
}

// ---------- page sections ----------

const tree = parseTree(source);
const live = child(tree, 'Live copy') ?? tree;

const metaNode = section(live, 'Page title and share card');
export const meta = {
  pageTitle: required(metaNode, 'Page title'),
  shareTitle: required(metaNode, 'Share card title'),
  shareDescription: required(metaNode, 'Share card description'),
  shareImage: asImage(required(metaNode, 'Share image')),
  shareImageAlt: required(metaNode, 'Share image alt text'),
};

const topBarNode = section(live, 'Top bar');
export const topBar = {
  label: required(topBarNode, 'Label'),
  shareButton: required(topBarNode, 'Share button'),
  emailButton: required(topBarNode, 'Email button'),
  shareConfirmation: required(topBarNode, 'Share confirmation'),
};

const heroNode = section(live, 'Top of page');
const shareWithNode = section(heroNode, 'Share this site with');
export const hero = {
  name: required(heroNode, 'Name'),
  headline: required(heroNode, 'Headline'),
  // May hold **bold** and *italics*: render with inline().
  subtitle: required(heroNode, 'Subtitle'),
  mainButton: required(heroNode, 'Main button'),
  emailButton: required(heroNode, 'Email button'),
  cvLink: required(heroNode, 'CV link'),
  email: required(heroNode, 'Contact email'),
  shareWith: { leadIn: prose(shareWithNode), people: list(shareWithNode) },
  closingLine: prose(section(heroNode, 'Closing line')),
};

const recordNode = section(live, 'Track record');
const recordShareNode = child(recordNode, 'Share this site with');
export const trackRecord = {
  label: required(recordNode, 'Label'),
  intro: optional(recordNode, 'Intro'),
  closingLine: required(recordNode, 'Closing line'),
  // "Share this site with:" and the 3 kinds of people, each with an icon to come.
  shareWith: {
    leadIn: recordShareNode?.paragraphs[0] ?? '',
    people: recordShareNode ? list(recordShareNode) : [],
  },
  figures: recordNode.children
    .filter((c) => /^Figure/i.test(c.heading))
    .map((figure) => ({
      number: required(figure, 'Number'),
      label: required(figure, 'Label'),
      linkText: optional(figure, 'Link text'),
      link: optional(figure, 'Link'),
    })),
};
if (trackRecord.figures.length !== 3) errors.push(`Track record needs 3 figures, found ${trackRecord.figures.length}`);
if (!trackRecord.shareWith.leadIn || trackRecord.shareWith.people.length !== 3)
  errors.push('Track record needs "### Share this site with" with its lead-in line and 3 kinds of people');

const projectsNode = section(live, 'Projects');
const filtersNode = section(projectsNode, 'Filters');
const FILTER_IDS = ['learning', 'tools', 'experiences'] as const;
const FILTER_COVERS = ['wavy', 'straight', 'contour'] as const;

export const filters: Filter[] = FILTER_IDS.map((id, i) => ({
  id,
  label: required(filtersNode, `Filter ${i + 1}`),
  cover: FILTER_COVERS[i],
}));

export const projectsIntro = {
  heading: required(projectsNode, 'Heading'),
  intro: required(projectsNode, 'Intro'),
  galleryHint: required(projectsNode, 'Evidence gallery hint'),
  allFilter: required(filtersNode, 'All'),
  filterLabel: required(projectsNode, 'Filter label'),
  shareProjectButton: required(projectsNode, 'Share project button'),
  getInTouchButton: required(projectsNode, 'Get in touch button'),
  // Read out after a card's title link, so screen readers say where it goes.
  cardTitleHint: required(projectsNode, 'Card title hint'),
  // Read out after links that open in a new tab.
  newTabHint: required(projectsNode, 'New tab hint'),
  skillsBoxClosingLine: required(projectsNode, 'Skills box closing line'),
  // The row of 6 stars and "Next" button at the foot of each pop-up and of the page.
  navLabel: required(projectsNode, 'Projects nav label'),
  starLabel: required(projectsNode, 'Star label'),
  projectCount: required(projectsNode, 'Project count'),
  checkOutProjectsButton: required(projectsNode, 'Check out projects button'),
};

const projectNodes = live.children.filter((c) => /^Project:/i.test(c.heading));
const projectNames = projectNodes.map((node) => node.heading.replace(/^Project:\s*/i, ''));

// The other project sharing the most words (4+ letters) with the label.
function findProjectByName(label: string, ownSlug: string): string | undefined {
  const words = (text: string) => text.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  const labelWords = new Set(words(label));
  let best: { slug: string; score: number } | undefined;
  for (const name of projectNames) {
    const slug = slugify(name);
    const score = words(name).filter((w) => labelWords.has(w)).length;
    if (slug !== ownSlug && score > 0 && (!best || score > best.score)) best = { slug, score };
  }
  return best?.slug;
}

export const projects: Project[] = projectNodes.map((node, index) => {
  const name = projectNames[index];
  const slug = slugify(name);
  const where = `Project "${name}"`;

  const filterLabel = required(node, 'Filter');
  const filter = filters.find((f) => f.label.toLowerCase() === filterLabel.toLowerCase());
  if (!filter) errors.push(`${where} has filter "${filterLabel}", which is not one of the 3 filters`);

  const knownFiles = node.bullets
    .concat(node.children.flatMap((c) => c.bullets))
    .flatMap((b) => filesIn(b.raw))
    .filter((file) => !file.includes('*'));
  const ctx: TargetContext = { knownFiles, findProject: (label) => findProjectByName(label, slug) };

  const evidenceLinkValue = required(node, 'Evidence link');
  const evidenceLink: Target = asTarget(evidenceLinkValue, ctx) ?? { todo: `TO DO: ${evidenceLinkValue}` };

  // The case study is every "###" part that isn't one of the named parts below, in copy.md order,
  // so each project can use its own headings ("What I did" or "What I built", and so on).
  const namedParts = /^(The skills I could bring|More details about this project|Pull quote|Further reading|Learn more|Try it yourself|Exhibition list)/i;
  const story = node.children
    .filter((part) => !namedParts.test(part.heading) && part.paragraphs.length)
    .map((part) => ({ heading: part.heading, blocks: part.blocks, parts: part.children }));
  if (!story.length) errors.push(`${where} is missing its case study ("### The challenge" and so on)`);

  const skillsNode = child(node, /^The skills I could bring/i);
  if (!skillsNode || !(skillsNode.paragraphs.length || skillsNode.bullets.length))
    errors.push(`${where} is missing "### The skills I could bring to your team"`);

  const evidenceNode = child(node, 'More details about this project');
  if (!evidenceNode || !(evidenceNode.bullets.length || evidenceNode.children.length))
    errors.push(`${where} is missing "### More details about this project"`);
  const evidence = (evidenceNode?.bullets ?? []).map((b) =>
    b.nested?.length ? asQuotes(b) : asEvidence(b.raw, ctx, evidenceLink),
  );
  // "Feedback from 3 users:" followed by "#### Name" headings, each with its quote.
  if (evidenceNode?.children.length && evidenceNode.paragraphs.length) {
    const label = evidenceNode.paragraphs.at(-1)?.replace(/:\s*$/, '') ?? '';
    evidence.push({ label, target: { kind: 'quotes', quotes: quotesFrom(evidenceNode.children) } });
  }

  const quoteNode = child(node, 'Pull quote');
  if (!quoteNode) errors.push(`${where} is missing "### Pull quote"`);
  const pullQuote = quoteNode
    ? { quote: required(quoteNode, 'Quote'), credit: required(quoteNode, 'Credit') }
    : { quote: '', credit: '' };

  const extras: ExtraLink[] = ['Further reading', 'Learn more'].flatMap((heading) => {
    const part = child(node, heading);
    if (!part) return [];
    const link = optional(part, 'Link');
    const text = optional(part, 'Text') ? asText(optional(part, 'Text')!) : undefined;
    // A "Text:" that is just a web address works as the button's link.
    const textIsLink = typeof text === 'string' && /^https?:\/\/\S+$/.test(text);
    return [
      {
        heading,
        button: required(part, 'Button'),
        link: link
          ? (asTarget(link, ctx) ?? { todo: `TO DO: ${link}` })
          : textIsLink
            ? { kind: 'url', href: text }
            : undefined,
        text: textIsLink ? undefined : text,
      },
    ];
  });

  const tryNode = child(node, 'Try it yourself');
  const tryItYourself: TryItYourself | undefined = tryNode && {
    heading: tryNode.heading,
    button: required(tryNode, 'Button'),
    images: filesIn(optional(tryNode, 'Image') ?? '').map((file) => ({ file })),
    paragraphs: tryNode.paragraphs,
    forms: tryNode.children.map((form) => ({
      heading: form.heading,
      paragraphs: form.paragraphs,
      rules: form.bullets.map((b) => b.raw),
    })),
  };

  const exhibitionNode = child(node, 'Exhibition list');
  const exhibitionList = exhibitionNode && {
    heading: exhibitionNode.heading,
    intro: optional(exhibitionNode, 'Intro') ?? '',
    items: unlabelled(exhibitionNode, ['Intro']),
  };

  return {
    slug,
    name,
    filter: filter ?? filters[0],
    title: required(node, 'Title'),
    organisation: required(node, 'Organisation'),
    year: required(node, 'Year'),
    role: required(node, 'Role'),
    result: required(node, 'Result'),
    skills: required(node, 'Skills'),
    cardButton: required(node, 'Card button'),
    nextButton: required(node, 'Next button'),
    evidenceLinkText: asText(required(node, 'Evidence link text')),
    evidenceLink,
    image: asImage(required(node, 'Image')),
    imageAlt: required(node, 'Image alt text'),
    // Falls back to the card image until a pop-up image is chosen.
    popupImage: asImage(optional(node, 'Pop-up image') ?? required(node, 'Image')),
    popupImageAlt: optional(node, 'Pop-up image alt text') ?? required(node, 'Image alt text'),
    logo: filesIn(optional(node, 'Logo') ?? '').map((file) => ({ file }))[0],
    story,
    skillsBox: {
      heading: skillsNode?.heading ?? '',
      paragraphs: skillsNode?.paragraphs ?? [],
      bullets: (skillsNode?.bullets ?? []).map((b) => b.raw),
    },
    headings: { moreDetails: evidenceNode?.heading ?? '' },
    moreDetails: evidenceNode ?? { heading: '', level: 0, bullets: [], paragraphs: [], blocks: [], children: [] },
    evidence,
    pullQuote,
    extras,
    tryItYourself,
    exhibitionList,
  };
});
if (projects.length !== 6) errors.push(`Expected 6 projects, found ${projects.length}`);

const quotesNode = section(live, 'Quotes');
// Each "### Name" under "## Quotes" is one testimonial: its Role and the quote as a paragraph.
export const testimonials = {
  heading: required(quotesNode, 'Heading'),
  carouselDescription: required(quotesNode, 'Carousel description'),
  namesLabel: required(quotesNode, 'Names label'),
  quotes: quotesNode.children.map((node): Testimonial => {
    const quote = node.paragraphs.join(' ');
    if (!quote) errors.push(`Testimonial "${node.heading}" has no quote`);
    return { quote, name: node.heading, role: required(node, 'Role') };
  }),
};
if (!testimonials.quotes.length) errors.push('"## Quotes" has no testimonials ("### Name", "- Role: ..." and the quote)');

const contactNode = section(live, 'Contact and footer');
export const contact = {
  email: required(contactNode, 'Email'),
  backToTop: required(contactNode, 'Back to top'),
  footer: asText(required(contactNode, 'Footer')),
};

const cvNode = section(live, 'CV');
export const cv = {
  heading: cvNode.heading,
  body: cvNode.bullets.map((b) => asText(b.raw)).concat(cvNode.paragraphs.map(asText)),
  downloadButton: optional(cvNode, 'Download button'),
};

if (errors.length) {
  throw new Error(
    `\n\ncontent/copy.md has ${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join('\n') + '\n',
  );
}

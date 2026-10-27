// Reads content/copy.md at build time and turns it into typed site data.
// Missing required fields stop the build with a list of what to fix.

import source from '../../content/copy.md?raw';
import { parseTree, type Bullet, type MdNode } from './markdown-tree';

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
  paragraphs: string[];
}

export interface ExtraLink {
  heading: string;
  button: string;
  link?: Target;
  text?: Text;
}

export interface TryItYourself {
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
  evidenceLinkText: Text;
  evidenceLink: Target;
  image: FileRef | Todo;
  imageAlt: string;
  logo?: FileRef;
  story: Story[];
  whatThisShows: string;
  evidence: EvidenceItem[];
  pullQuote: { quote: string; credit: string };
  extras: ExtraLink[];
  tryItYourself?: TryItYourself;
  exhibitionList?: { intro: string; items: string[] };
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

function child(node: MdNode, heading: string | RegExp): MdNode | undefined {
  return node.children.find((c) =>
    typeof heading === 'string' ? c.heading.toLowerCase() === heading.toLowerCase() : heading.test(c.heading),
  );
}

function section(node: MdNode, heading: string): MdNode {
  const found = child(node, heading);
  if (!found) {
    errors.push(`Missing section "${heading}"`);
    return { heading, level: 0, bullets: [], paragraphs: [], children: [] };
  }
  return found;
}

function optional(node: MdNode, label: string): string | undefined {
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

const FILE_PATTERN = /[\w\-/.*]+\.(?:jpe?g|png|webp|avif|gif|pdf|mp4|webm|mov)\b/gi;

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
  label: required(topBarNode, 'Label')
    .split('·')
    .map((part) => part.trim()),
  shareButton: required(topBarNode, 'Share button'),
  shareConfirmation: required(topBarNode, 'Share confirmation'),
};

const heroNode = section(live, 'Top of page');
export const hero = {
  name: required(heroNode, 'Name'),
  headline: required(heroNode, 'Headline'),
  roles: required(heroNode, 'Roles')
    .split('·')
    .map((role) => role.trim()),
  pitch: required(heroNode, 'Pitch'),
  purposeLine: required(heroNode, 'Purpose line'),
  contactButton: required(heroNode, 'Contact button'),
  email: required(heroNode, 'Contact email'),
  cvButton: required(heroNode, 'CV button'),
};

const recordNode = section(live, 'Track record');
export const trackRecord = {
  label: required(recordNode, 'Label'),
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
  cardButton: required(projectsNode, 'Card button'),
  galleryHint: required(projectsNode, 'Evidence gallery hint'),
  allFilter: required(filtersNode, 'All'),
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

  const story = [/^The (problem|challenge)$/i, /^What I did$/i, /^What happened$/i].map((heading) => {
    const part = child(node, heading);
    if (!part || !part.paragraphs.length) errors.push(`${where} is missing "### ${heading.source.replace(/[\^$\/i]/g, '')}"`);
    return { heading: part?.heading ?? '', paragraphs: part?.paragraphs ?? [] };
  });

  const shows = child(node, 'What this shows');
  if (!shows?.paragraphs.length) errors.push(`${where} is missing "### What this shows"`);

  const evidenceNode = child(node, 'Evidence');
  if (!evidenceNode?.bullets.length) errors.push(`${where} is missing "### Evidence"`);
  const evidence = (evidenceNode?.bullets ?? []).map((b) =>
    b.nested?.length ? asQuotes(b) : asEvidence(b.raw, ctx, evidenceLink),
  );

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
    evidenceLinkText: asText(required(node, 'Evidence link text')),
    evidenceLink,
    image: asImage(required(node, 'Image')),
    imageAlt: required(node, 'Image alt text'),
    logo: filesIn(optional(node, 'Logo') ?? '').map((file) => ({ file }))[0],
    story,
    whatThisShows: shows?.paragraphs.join(' ') ?? '',
    evidence,
    pullQuote,
    extras,
    tryItYourself,
    exhibitionList,
  };
});
if (projects.length !== 6) errors.push(`Expected 6 projects, found ${projects.length}`);

const causesNode = section(live, 'What I want to work on');
const causeLabels = ['Heading', 'Intro', 'Closing ask'];
export const causes = {
  heading: required(causesNode, 'Heading'),
  intro: required(causesNode, 'Intro'),
  items: unlabelled(causesNode, causeLabels),
  closingAsk: required(causesNode, 'Closing ask'),
};

const helpNode = section(live, 'How you can help');
const sharingNode = section(helpNode, 'Sharing');
export const help = {
  heading: required(helpNode, 'Heading'),
  lists: ['Roles', 'Sectors', "People I'd like to meet"].map((heading) => ({
    heading,
    items: section(helpNode, heading).bullets.map((b) => b.raw),
  })),
  share: {
    leadIn: required(sharingNode, 'Lead-in'),
    button: required(sharingNode, 'Share button'),
    confirmation: required(sharingNode, 'Share confirmation'),
  },
};

const quotesNode = section(live, 'Quotes');
export const testimonials = {
  heading: required(quotesNode, 'Heading'),
  quotes: quotesNode.bullets
    .filter((b) => /^Quote \d+$/i.test(b.label ?? ''))
    .map((b): Testimonial => {
      const match = b.value!.match(/^[“"](.*)[”"]\s*[–—-]\s*(.+)$/s);
      if (!match) {
        errors.push(`Testimonial "${b.label}" should look like “quote” – Name, Role`);
        return { quote: b.value!, name: '', role: '' };
      }
      // "Name, Role" or "Name - Role": split at the first comma or dash.
      const [, name, role = ''] = match[2].match(/^(.+?)(?:,\s+|\s+[-–—]\s+)(.+)$/) ?? [, match[2]];
      return { quote: match[1].trim(), name: name!.trim(), role: role.trim() };
    }),
};

const contactNode = section(live, 'Contact and footer');
export const contact = {
  heading: asText(required(contactNode, 'Heading')),
  line: optional(contactNode, 'Contact line') ? asText(optional(contactNode, 'Contact line')!) : undefined,
  email: required(contactNode, 'Email'),
  linkedin: asText(required(contactNode, 'LinkedIn')),
  substack: asText(required(contactNode, 'Substack')),
  cvButton: required(contactNode, 'CV button'),
  footer: asText(required(contactNode, 'Footer')),
};

const cvNode = section(live, 'CV');
export const cv = {
  body: cvNode.bullets.map((b) => asText(b.raw)).concat(cvNode.paragraphs.map(asText)),
};

if (errors.length) {
  throw new Error(
    `\n\ncontent/copy.md has ${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join('\n') + '\n',
  );
}

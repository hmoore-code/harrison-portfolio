// Turns copy.md into a tree of headings, each holding its bullets and paragraphs.
// Knows nothing about the site: content.ts gives the tree its meaning.

export interface Bullet {
  raw: string;
  label?: string;
  value?: string;
  // Indented lines under the bullet, e.g. quotes nested under "Feedback from 3 users:".
  nested?: string[];
}

export interface MdNode {
  heading: string;
  level: number;
  bullets: Bullet[];
  paragraphs: string[];
  children: MdNode[];
}

// Undo the escaping the Docs export adds, and unwrap <https://...> autolinks.
export function unescapeExport(text: string): string {
  return text
    .replace(/&#91;/g, '[')
    .replace(/&#93;/g, ']')
    .replace(/\\([\[\]*_()#.!`~>-])/g, '$1')
    .replace(/<(https?:\/\/[^>\s]+)>/g, '$1')
    .trim();
}

function toBullet(raw: string): Bullet {
  const match = raw.match(/^([^:]{1,60}?):\s+(.+)$/);
  if (!match || /^https?$/i.test(match[1])) return { raw };
  return { raw, label: match[1].trim(), value: match[2].trim() };
}

export function parseTree(source: string): MdNode {
  const root: MdNode = { heading: '', level: 0, bullets: [], paragraphs: [], children: [] };
  const stack: MdNode[] = [root];
  let paragraph: string[] = [];
  let lastBullet: Bullet | undefined;

  const current = () => stack[stack.length - 1];
  const flush = () => {
    if (paragraph.length) current().paragraphs.push(unescapeExport(paragraph.join(' ')));
    paragraph = [];
  };

  for (const line of source.split(/\r?\n/)) {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    const indented = line.match(/^\s{2,}(\S.*)$/);

    if (heading) {
      flush();
      lastBullet = undefined;
      const level = heading[1].length;
      while (current().level >= level) stack.pop();
      const node: MdNode = {
        heading: unescapeExport(heading[2]),
        level,
        bullets: [],
        paragraphs: [],
        children: [],
      };
      current().children.push(node);
      stack.push(node);
    } else if (indented && lastBullet) {
      flush();
      (lastBullet.nested ??= []).push(unescapeExport(indented[1]));
    } else if (bullet) {
      flush();
      lastBullet = toBullet(unescapeExport(bullet[1]));
      current().bullets.push(lastBullet);
    } else if (line.trim() === '') {
      flush();
    } else {
      lastBullet = undefined;
      paragraph.push(line.trim());
    }
  }
  flush();
  return root;
}

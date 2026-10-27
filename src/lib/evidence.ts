// Sorts a project's evidence lines into what the pop-up shows:
// gallery pictures, videos, sets of quotes, links (web, PDF, other projects) and TO DO gaps.

import { isTodo, type FileRef, type Project } from './content';
import { findPdf, isPdf, isVideo } from './assets';

export interface EvidenceLink {
  label: string;
  href: string;
  type: 'pdf' | 'link' | 'popup';
  dialog?: string;
}

export interface SortedEvidence {
  gallery: { ref: FileRef; caption: string }[];
  videos: { ref: FileRef; caption: string }[];
  quotes: { label: string; quotes: { name: string; quote: string }[] }[];
  links: EvidenceLink[];
  todos: { label: string; text: string }[];
}

export function sortEvidence(project: Project): SortedEvidence {
  const sorted: SortedEvidence = { gallery: [], videos: [], quotes: [], links: [], todos: [] };

  for (const { label, target } of project.evidence) {
    if (isTodo(target)) {
      sorted.todos.push({ label, text: target.todo });
    } else if (target.kind === 'url') {
      sorted.links.push({ label, href: target.href, type: 'link' });
    } else if (target.kind === 'project') {
      sorted.links.push({ label, href: `#${target.slug}`, type: 'popup', dialog: target.slug });
    } else if (target.kind === 'quotes') {
      sorted.quotes.push({ label, quotes: target.quotes });
    } else {
      for (const ref of target.files) {
        if (isPdf(ref)) {
          const href = findPdf(ref);
          if (href) sorted.links.push({ label, href, type: 'pdf' });
          else sorted.todos.push({ label, text: `PDF needed: ${ref.file}` });
        } else if (isVideo(ref)) {
          sorted.videos.push({ ref, caption: label });
        } else {
          sorted.gallery.push({ ref, caption: label });
        }
      }
    }
  }
  return sorted;
}

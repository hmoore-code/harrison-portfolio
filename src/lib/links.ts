// Where a link from copy.md should go on the page.
import { isTodo, type Target } from './content';
import { findPdf, isPdf } from './assets';

export interface ResolvedLink {
  href: string;
  external: boolean;
  type: 'link' | 'pdf' | 'popup';
}

export function resolveTarget(target: Target, ownSlug: string): ResolvedLink | null {
  if (isTodo(target)) return null;
  if (target.kind === 'url') return { href: target.href, external: true, type: 'link' };
  if (target.kind === 'project') return { href: `#${target.slug}`, external: false, type: 'popup' };
  const pdf = target.files.find(isPdf);
  const pdfUrl = pdf && findPdf(pdf);
  if (pdfUrl) return { href: pdfUrl, external: true, type: 'pdf' };
  return { href: `#${ownSlug}`, external: false, type: 'popup' };
}

// Prose from copy.md to safe HTML: escapes everything, then allows [text](url) links,
// [text](#project-link) links that open that project's pop-up, [text](mailto:...) email links,
// **bold**, and turns any [TO DO ...] into a visible gap. *Italics* show as plain text: only quotes
// and testimonials are ever in italics.

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\[([^\]]+)\]\(#([a-z0-9-]+)\)/g, '<a href="#$2" data-open-dialog="$2">$1</a>')
    .replace(/\[([^\]]+)\]\((mailto:[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(\S(?:.*?\S)?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(\S(?:.*?\S)?)\*/g, '$1')
    .replace(/\[(TO DO[^\]]*)\]/g, '<span class="todo">$1</span>');
}

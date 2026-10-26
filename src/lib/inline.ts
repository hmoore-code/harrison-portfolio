// Prose from copy.md to safe HTML: escapes everything, then allows [text](url) links
// and turns any [TO DO ...] into a visible gap.

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\[(TO DO[^\]]*)\]/g, '<span class="todo">$1</span>');
}

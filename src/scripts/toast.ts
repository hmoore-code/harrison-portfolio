// One shared status message ("Link copied", "Copied"), announced to screen readers.
let timer: number | undefined;

export function showToast(message: string) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

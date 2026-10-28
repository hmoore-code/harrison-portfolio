// One shared status message ("Link copied", "Copied"), announced to screen readers.
let timer: number | undefined;

export function showToast(message: string) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  // An open pop-up covers the rest of the page and hides it from screen readers,
  // so the message moves inside the open pop-up (or back to the page).
  const host = document.querySelector('dialog[open]') ?? document.body;
  if (toast.parentElement !== host) host.append(toast);
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

// Opens pop-ups from [data-open-dialog] links, gives each its own URL hash (#worker-feedback-club),
// closes them with the close button, Escape, a tap outside or the back button,
// and puts scroll position and focus back where they were.

const dialogs = new Map<string, HTMLDialogElement>();
document.querySelectorAll<HTMLDialogElement>('dialog[data-dialog]').forEach((d) => dialogs.set(d.id, d));

let returnFocus: HTMLElement | null = null;
let returnScroll = 0;
let switching = false;

const openDialog = () => [...dialogs.values()].find((d) => d.open);
const pageUrl = () => window.location.pathname + window.location.search;

function show(id: string) {
  const dialog = dialogs.get(id);
  if (!dialog || dialog.open) return;
  const current = openDialog();
  if (current) {
    switching = true;
    current.close();
    switching = false;
  } else {
    returnFocus = document.activeElement as HTMLElement | null;
    returnScroll = window.scrollY;
  }
  dialog.showModal();
  dialog.scrollTop = 0;
  dialog.querySelector<HTMLElement>('[data-close-dialog]')?.focus();
  requestAnimationFrame(() => document.dispatchEvent(new Event('covers:refresh')));
}

// Close via history when we added the entry, so the back button and close button agree.
function requestClose() {
  if (history.state?.dialog) history.back();
  else {
    openDialog()?.close();
    history.replaceState(null, '', pageUrl());
  }
}

dialogs.forEach((dialog) => {
  dialog.addEventListener('close', () => {
    if (switching) return;
    window.scrollTo({ top: returnScroll, behavior: 'instant' });
    returnFocus?.focus({ preventScroll: true });
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    requestClose();
  });
  dialog.addEventListener('click', (event) => {
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (event.target === dialog && outside) requestClose();
  });
  dialog.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', requestClose));
});

document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLElement>('[data-open-dialog]');
  const id = link?.dataset.openDialog;
  if (!id || !dialogs.has(id)) return;
  event.preventDefault();
  if (openDialog()) history.replaceState({ dialog: id }, '', `#${id}`);
  else history.pushState({ dialog: id }, '', `#${id}`);
  show(id);
});

window.addEventListener('popstate', () => {
  const id = window.location.hash.slice(1);
  if (dialogs.has(id)) show(id);
  else openDialog()?.close();
});

// Opened directly from a shared link: put the page underneath, so back closes the pop-up.
const initial = window.location.hash.slice(1);
if (dialogs.has(initial)) {
  history.replaceState(null, '', pageUrl());
  history.pushState({ dialog: initial }, '', `#${initial}`);
  show(initial);
}

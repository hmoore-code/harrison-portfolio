// Accessible tabs: a [role=tablist] of [role=tab] buttons, each controlling its [role=tabpanel].
// Tap or click a tab to show its panel; arrow keys, Home and End move between tabs.
// A [data-show-tab="<tab id>"] button elsewhere switches to that tab and scrolls back up to the tabs.

function select(tab: HTMLElement) {
  tab
    .closest('[role=tablist]')
    ?.querySelectorAll<HTMLElement>('[role=tab]')
    .forEach((t) => {
      const chosen = t === tab;
      t.setAttribute('aria-selected', String(chosen));
      t.tabIndex = chosen ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
      if (panel) panel.hidden = !chosen;
    });
}

document.querySelectorAll<HTMLElement>('[role=tablist]').forEach((list) => {
  const tabs = [...list.querySelectorAll<HTMLElement>('[role=tab]')];
  list.addEventListener('click', (event) => {
    const tab = (event.target as Element).closest<HTMLElement>('[role=tab]');
    if (tab) select(tab);
  });
  list.addEventListener('keydown', (event) => {
    const i = tabs.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (i < 0 || !(event.key in moves)) return;
    event.preventDefault();
    const next = tabs[(moves[event.key] + tabs.length) % tabs.length];
    select(next);
    next.focus();
  });
});

document.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-show-tab]');
  const tab = button && document.getElementById(button.dataset.showTab ?? '');
  if (!tab) return;
  select(tab);
  tab.focus({ preventScroll: true });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  tab.closest('[role=tablist]')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
});

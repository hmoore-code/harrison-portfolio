// Slides each cover right and brings its photo into colour as it scrolls into view,
// on the page or inside a pop-up (scroll is listened for on every scrolling element).
// progress = clamp((scrollY + viewport height - image top - 120) / (viewport height * 0.55), 0, 1)

let started = false;

export function watchCovers() {
  if (started) return;
  started = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const viewport = window.innerHeight;
    document.querySelectorAll<HTMLElement>('[data-cover]').forEach((el) => {
      if (el.dataset.coverLifted !== undefined) return;
      const top = el.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, (viewport - top - 120) / (viewport * 0.55)));
      el.style.setProperty('--progress', progress.toFixed(3));
    });
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  document.addEventListener('scroll', request, { passive: true, capture: true });
  window.addEventListener('resize', request, { passive: true });
  document.addEventListener('covers:refresh', request);
  update();
}

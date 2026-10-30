import { gsap, reducedMotion, ScrollTrigger } from './motion';

const root = document.querySelector<HTMLElement>('[data-how]');

if (root) {
  const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  let current = -1;

  function show(index: number) {
    if (index === current) return;
    const previous = screens[current];
    const next = screens[index];
    current = index;
    steps.forEach((step, position) => step.toggleAttribute('data-active', position === index));

    if (reducedMotion) {
      screens.forEach((screen) => gsap.set(screen, { visibility: screen === next ? 'visible' : 'hidden' }));
      return;
    }
    if (previous) gsap.to(previous, { autoAlpha: 0, duration: 0.25, overwrite: 'auto' });
    gsap.fromTo(next, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' });
    gsap.fromTo(
      next.querySelectorAll('[data-in]'),
      { y: 16, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05, delay: 0.08, ease: 'power2.out', overwrite: 'auto' },
    );
  }

  show(0);
  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => show(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
  });
}
